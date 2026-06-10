import { formatUnits, type Address, type Hex } from "viem";

import type {
  DepositFixture,
  FillFixture,
  OrderFixture,
  PortfolioFixture,
  WithdrawalFixture,
} from "@/lib/view-types";

import { OMEGA_ZONE_ADDRESSES } from "./config";
import {
  getZoneMyFills,
  getZoneMyOrders,
  getZoneMyTransfers,
  type ZoneFill,
  type ZoneOrder,
  type ZoneTransfer,
  type ZoneWithdrawalStatus,
  type ZoneWithdrawalStatusValue,
} from "./rpc";

export interface OmegaZoneActivity {
  orders: OrderFixture[];
  fills: FillFixture[];
  deposits: DepositFixture[];
  withdrawals: WithdrawalFixture[];
}

const EMPTY_ACTIVITY: OmegaZoneActivity = {
  orders: [],
  fills: [],
  deposits: [],
  withdrawals: [],
};

const optimisticActivity = new Map<string, OmegaZoneActivity>();

export function readOmegaZoneActivity(account?: Address): OmegaZoneActivity {
  if (!account) return EMPTY_ACTIVITY;
  return cloneActivity(optimisticActivity.get(activityKey(account)) ?? EMPTY_ACTIVITY);
}

export function writeOmegaZoneActivity(
  account: Address,
  activity: OmegaZoneActivity,
) {
  optimisticActivity.set(activityKey(account), trimActivity(activity));
}

export function mergeOmegaZoneActivity(
  account: Address,
  patch: Partial<OmegaZoneActivity>,
): OmegaZoneActivity {
  const current = readOmegaZoneActivity(account);
  const next = trimActivity({
    orders: mergeById(patch.orders, current.orders),
    fills: mergeById(patch.fills, current.fills),
    deposits: mergeById(patch.deposits, current.deposits),
    withdrawals: mergeById(patch.withdrawals, current.withdrawals),
  });
  optimisticActivity.set(activityKey(account), next);
  return cloneActivity(next);
}

export async function fetchOmegaZoneActivity({
  authToken,
  account,
}: {
  authToken: Hex;
  account: Address;
}): Promise<OmegaZoneActivity> {
  const [orders, fills, transfers] = await Promise.all([
    getZoneMyOrders(authToken, account, { limit: 50 }),
    getZoneMyFills(authToken, account, { limit: 50 }),
    getZoneMyTransfers(authToken, account, { limit: 50 }),
  ]);
  return activityFromZoneHistory({
    orders: orders.items,
    fills: fills.items,
    transfers: transfers.items,
  });
}

export function activityFromZoneHistory({
  orders,
  fills,
  transfers,
}: {
  orders: readonly ZoneOrder[];
  fills: readonly ZoneFill[];
  transfers: readonly ZoneTransfer[];
}): OmegaZoneActivity {
  const mappedOrders = orders
    .filter((order) => order.status === "open" || order.status === "partiallyFilled")
    .map(zoneOrderToFixture);
  const mappedFills = fills.map((fill) =>
    zoneFillToFixture(fill, mappedOrders),
  );
  const deposits: DepositFixture[] = [];
  const withdrawals: WithdrawalFixture[] = [];

  for (const transfer of transfers) {
    if (transfer.direction === "in") {
      deposits.push(zoneTransferToDeposit(transfer));
    } else {
      withdrawals.push(zoneTransferToWithdrawal(transfer));
    }
  }

  return trimActivity({
    orders: mappedOrders,
    fills: mappedFills,
    deposits,
    withdrawals,
  });
}

export function zoneWithdrawalStatusToFixture(
  status: ZoneWithdrawalStatus,
): WithdrawalFixture {
  return {
    id: `w-${status.withdrawalIndex}`,
    token: tokenSymbol(status.token),
    amount: formatRawToken(status.amount),
    status: withdrawalStatusToFixture(status.status),
    initiatedAt: blockTimeIso(status.zoneBlockNumber),
    txHash: status.zoneTxHash,
  };
}

function zoneOrderToFixture(order: ZoneOrder): OrderFixture {
  return {
    id: `o-${rawToBigInt(order.orderId).toString()}`,
    pair: pairFor(order.baseToken, order.quoteToken),
    side: order.side === "bid" ? "buy" : "sell",
    type: "limit",
    amount: formatRawToken(order.amount),
    price: formatRawPrice(order.price),
    filledPercent: fillPercent(order.amount, order.filled),
    status: orderStatusToFixture(order.status),
    submittedAt: blockTimeIso(order.createdAtBlock),
  };
}

function zoneFillToFixture(
  fill: ZoneFill,
  orders: readonly OrderFixture[],
): FillFixture {
  const orderId = fill.orderId ? `o-${rawToBigInt(fill.orderId).toString()}` : "";
  const matchingOrder = orderId
    ? orders.find((order) => order.id === orderId)
    : undefined;
  return {
    id: `f-${orderId || fill.txHash.slice(2, 10)}-${rawToBigInt(fill.blockNumber).toString()}`,
    orderId: orderId || `o-${fill.txHash.slice(2, 10)}`,
    pair: pairFor(fill.baseToken, fill.quoteToken),
    side: matchingOrder?.side ?? "buy",
    amount: formatRawToken(fill.amountFilled),
    price: formatRawPrice(fill.price),
    matchedAt: blockTimeIso(fill.blockNumber),
    status: "matched",
    txHash: fill.txHash,
  };
}

function zoneTransferToDeposit(transfer: ZoneTransfer): DepositFixture {
  return {
    id: `d-${transfer.txHash.slice(2, 10)}-${rawToBigInt(transfer.logIndex).toString()}`,
    token: tokenSymbol(transfer.token),
    amount: formatRawToken(transfer.amount),
    status: "settled",
    initiatedAt: blockTimeIso(transfer.blockNumber),
    txHash: transfer.txHash,
  };
}

function zoneTransferToWithdrawal(transfer: ZoneTransfer): WithdrawalFixture {
  return {
    id: `w-${transfer.txHash.slice(2, 10)}-${rawToBigInt(transfer.logIndex).toString()}`,
    token: tokenSymbol(transfer.token),
    amount: formatRawToken(transfer.amount),
    status: "pending",
    initiatedAt: blockTimeIso(transfer.blockNumber),
    txHash: transfer.txHash,
  };
}

function orderStatusToFixture(status: ZoneOrder["status"]): OrderFixture["status"] {
  if (status === "cancelled") return "cancelled";
  if (status === "filled") return "matched";
  return "pending";
}

function withdrawalStatusToFixture(
  status: ZoneWithdrawalStatusValue,
): WithdrawalFixture["status"] {
  if (status === "processed") return "settled";
  if (status === "failed" || status === "bounced") return "failed";
  return "pending";
}

function fillPercent(amount: string, filled: string) {
  const total = rawToBigInt(amount);
  if (total <= BigInt(0)) return 0;
  const done = rawToBigInt(filled);
  return Math.min(100, Number((done * BigInt(10_000)) / total) / 100);
}

function pairFor(base: Address, quote: Address): PortfolioFixture["recentFills"][number]["pair"] {
  const baseSymbol = tokenSymbol(base);
  const quoteSymbol = tokenSymbol(quote);
  if (baseSymbol === "OALPHA" && quoteSymbol === "PATH.USD") {
    return "OALPHA/PATH.USD";
  }
  return "OALPHA/PATH.USD";
}

function tokenSymbol(address: Address): "PATH.USD" | "OALPHA" {
  if (address.toLowerCase() === OMEGA_ZONE_ADDRESSES.oalpha.toLowerCase()) {
    return "OALPHA";
  }
  return "PATH.USD";
}

function formatRawToken(value: unknown): string {
  const formatted = formatUnits(rawToBigInt(value), 6);
  const [whole, fraction = ""] = formatted.split(".");
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimals = fraction.padEnd(2, "0").slice(0, 2);
  return `${groupedWhole}.${decimals}`;
}

function formatRawPrice(value: unknown): string {
  return `${rawToBigInt(value).toString()}.000000`;
}

function rawToBigInt(value: unknown): bigint {
  try {
    if (typeof value === "bigint") return value;
    if (typeof value === "number") return BigInt(value);
    if (typeof value === "string" && value.length > 0) return BigInt(value);
  } catch {
    return BigInt(0);
  }
  return BigInt(0);
}

function blockTimeIso(_blockNumber: unknown): string {
  return new Date().toISOString();
}

function activityKey(account: Address): string {
  return account.toLowerCase();
}

function trimActivity(activity: OmegaZoneActivity): OmegaZoneActivity {
  return {
    orders: activity.orders.slice(0, 50),
    fills: activity.fills.slice(0, 50),
    deposits: activity.deposits.slice(0, 50),
    withdrawals: activity.withdrawals.slice(0, 50),
  };
}

function cloneActivity(activity: OmegaZoneActivity): OmegaZoneActivity {
  return {
    orders: [...activity.orders],
    fills: [...activity.fills],
    deposits: [...activity.deposits],
    withdrawals: [...activity.withdrawals],
  };
}

function mergeById<T extends { id: string }>(
  incoming: T[] | undefined,
  current: T[],
): T[] {
  if (!incoming || incoming.length === 0) return current;
  const seen = new Set<string>();
  const merged: T[] = [];
  for (const item of [...incoming, ...current]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged.slice(0, 50);
}
