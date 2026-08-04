import { decodeFunctionData, formatUnits, type Address, type Hex } from "viem";

import type {
  DepositFixture,
  FillFixture,
  OrderFixture,
  PortfolioFixture,
  WithdrawalFixture,
} from "@/lib/view-types";

import { OMEGA_ZONE_ADDRESSES } from "./config";
import {
  getZoneMyActivity,
  type ZoneActivityEntry,
  type ZoneFill,
  type ZoneOrder,
  type ZonePageEnvelope,
  type ZoneTransfer,
  type ZoneWithdrawalStatus,
  type ZoneWithdrawalStatusValue,
} from "./rpc";
import { DARKPOOL_PARSED_ABI } from "./abi";

export interface OmegaZoneActivity {
  orders: OrderFixture[];
  orderHistory: OrderFixture[];
  fills: FillFixture[];
  deposits: DepositFixture[];
  withdrawals: WithdrawalFixture[];
}

const EMPTY_ACTIVITY: OmegaZoneActivity = {
  orders: [],
  orderHistory: [],
  fills: [],
  deposits: [],
  withdrawals: [],
};

const optimisticActivity = new Map<string, OmegaZoneActivity>();

type FillIntent = Pick<FillFixture, "side" | "type">;

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

export interface MergeActivityOptions {
  /**
   * Treat `patch.orders` as the authoritative, complete set of resting orders
   * (e.g. from `zone_getMyOrders`) and REPLACE the cached order list rather than
   * merging by id. Orders are not append-only history — once an order fills or
   * is cancelled it leaves the open set, so an authoritative snapshot must be
   * able to drop stale entries (including optimistic place-time "pending" rows).
   * Fills/withdrawals remain append-only and always merge.
   */
  ordersAuthoritative?: boolean;
  /**
   * Treat `patch.deposits` as the backend-indexed deposit snapshot. Keep local
   * pending rows that are not present yet, but let backend rows replace local
   * queued/credited rows even when the L1 hash differs from the zone transfer
   * hash.
   */
  depositsAuthoritative?: boolean;
}

export function mergeOmegaZoneActivity(
  account: Address,
  patch: Partial<OmegaZoneActivity>,
  options: MergeActivityOptions = {},
): OmegaZoneActivity {
  const current = readOmegaZoneActivity(account);
  const mergedOrders =
    options.ordersAuthoritative && patch.orders !== undefined
      ? mergeAuthoritativeOrders(patch.orders, current.orders, patch.fills)
      : mergeById(patch.orders, current.orders);
  const orders = reconcileFilledOrders(
    mergedOrders,
    patch.orders,
    patch.fills,
  );
  const orderHistory = mergeOrderHistory(
    patch.orderHistory ?? patch.orders,
    current.orderHistory,
  );
  const deposits =
    options.depositsAuthoritative && patch.deposits !== undefined
      ? mergeAuthoritativeDeposits(patch.deposits, current.deposits)
      : mergeDeposits(patch.deposits, current.deposits);
  const next = trimActivity({
    orders,
    orderHistory,
    fills: mergeFills(patch.fills, current.fills),
    deposits,
    withdrawals: mergeWithdrawals(patch.withdrawals, current.withdrawals),
  });
  optimisticActivity.set(activityKey(account), next);
  return cloneActivity(next);
}

export async function fetchOmegaZoneActivity({
  authToken,
}: {
  authToken: Hex;
}): Promise<OmegaZoneActivity> {
  const entries = await fetchAllActivityPages((cursor) =>
    getZoneMyActivity(authToken, { cursor, limit: 500 }),
  );
  return activityFromUnifiedZoneHistory(entries);
}

export function activityFromUnifiedZoneHistory(
  entries: readonly ZoneActivityEntry[],
): OmegaZoneActivity {
  const activity: OmegaZoneActivity = {
    orders: [],
    orderHistory: [],
    fills: [],
    deposits: [],
    withdrawals: [],
  };

  for (const entry of entries) {
    if (entry.kind !== entry.payload.type) {
      throw new Error(
        `Omega Zone activity kind mismatch: ${entry.kind}/${entry.payload.type}.`,
      );
    }
    const occurredAt = rpcTimestampIso(entry.occurredAt);

    switch (entry.payload.type) {
      case "order": {
        const { details } = entry.payload;
        const order: OrderFixture = {
          id: `o-${rawToBigInt(details.orderId).toString()}`,
          pair: pairFor(details.baseToken, details.quoteToken),
          side: details.side,
          type: details.orderType,
          amount: formatRawToken(details.amount),
          amountRaw: rawToBigInt(details.amount).toString(),
          price: formatRawPrice(details.price),
          filledPercent: fillPercent(details.amount, details.filled),
          status: orderStatusToFixture(details.status),
          submittedAt: occurredAt,
          txHash: entry.source.txHash,
        };
        activity.orderHistory.push(order);
        if (
          details.status === "open" ||
          details.status === "partiallyFilled"
        ) {
          activity.orders.push(order);
        }
        break;
      }
      case "fill": {
        const { details } = entry.payload;
        const logIndex = rawToBigInt(entry.source.logIndex).toString();
        const orderId = details.orderId
          ? `o-${rawToBigInt(details.orderId).toString()}`
          : `o-${entry.source.txHash.slice(2, 10)}`;
        activity.fills.push({
          id: zoneFillIdentity(
            entry.source.txHash,
            logIndex,
            details.role,
          ),
          orderId,
          pair: pairFor(details.baseToken, details.quoteToken),
          side: details.side,
          type: details.orderType,
          amount: formatRawToken(details.amountFilled),
          amountRaw: rawToBigInt(details.amountFilled).toString(),
          price: formatRawPrice(details.price),
          matchedAt: occurredAt,
          status: "matched",
          txHash: entry.source.txHash,
        });
        break;
      }
      case "deposit": {
        const { details } = entry.payload;
        const txHash =
          details.l1TxHash ??
          (entry.source.chain === "tempo"
            ? entry.source.txHash
            : details.zoneTxHash ?? entry.source.txHash);
        activity.deposits.push({
          id: `d-${details.depositHash.slice(2)}`,
          token: tokenSymbol(details.token),
          amount: formatRawToken(details.amount),
          status:
            details.status === "processed"
              ? "credited"
              : details.status === "failed"
                ? "failed"
                : "pending",
          initiatedAt: occurredAt,
          txHash,
        });
        break;
      }
      case "withdrawal": {
        const { details } = entry.payload;
        activity.withdrawals.push({
          id: `w-${rawToBigInt(details.withdrawalIndex).toString()}`,
          token: tokenSymbol(details.token),
          amount: formatRawToken(details.amount),
          status: withdrawalStatusToFixture(details.status),
          initiatedAt: occurredAt,
          txHash: details.zoneTxHash,
          l1SettlementTxHash:
            details.l1ProcessWithdrawalTxHash ??
            details.l1SubmitBatchTxHash ??
            null,
        });
        break;
      }
      case "transfer":
        // Generic transfers remain distinct from deposits and withdrawals and
        // do not have a corresponding portfolio fixture collection.
        break;
    }
  }

  return trimActivity(activity);
}

async function fetchAllActivityPages<T>(
  fetchPage: (cursor?: string) => Promise<ZonePageEnvelope<T>>,
): Promise<T[]> {
  const items: T[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  do {
    const page = await fetchPage(cursor);
    items.push(...page.items);
    cursor = page.nextCursor ?? undefined;
    if (!cursor || seenCursors.has(cursor)) break;
    seenCursors.add(cursor);
  } while (true);

  return items;
}

export function activityFromZoneHistory({
  orders,
  fills,
  transfers,
  withdrawalStatuses = [],
  transactionInputs = {},
  knownFillIntents = {},
}: {
  orders: readonly ZoneOrder[];
  fills: readonly ZoneFill[];
  transfers: readonly ZoneTransfer[];
  withdrawalStatuses?: readonly ZoneWithdrawalStatus[];
  transactionInputs?: Readonly<Record<string, Hex>>;
  knownFillIntents?: Readonly<Record<string, FillIntent>>;
}): OmegaZoneActivity {
  const ordersById = new Map(
    orders.map((order) => [rawToBigInt(order.orderId).toString(), order]),
  );
  const orderHistory = orders.map(zoneOrderToFixture);
  const mappedOrders = orderHistory.filter(
    (_, index) =>
      orders[index]?.status === "open" ||
      orders[index]?.status === "partiallyFilled",
  );
  const fillIntents = resolveZoneFillIntents(
    fills,
    ordersById,
    transactionInputs,
    knownFillIntents,
  );
  const mappedFills = fills.flatMap((fill) => {
    const intent = fillIntents.get(zoneFillId(fill));
    return intent ? [zoneFillToFixture(fill, intent)] : [];
  });
  const deposits: DepositFixture[] = [];
  const seenDepositTxHashes = new Set<string>();

  for (const transfer of [...transfers].sort(compareZoneTransfersNewestFirst)) {
    const txHash = transfer.txHash.toLowerCase();
    if (
      transfer.direction === "in" &&
      transfer.counterparty.toLowerCase() ===
        "0x0000000000000000000000000000000000000000" &&
      !seenDepositTxHashes.has(txHash)
    ) {
      seenDepositTxHashes.add(txHash);
      deposits.push(zoneTransferToDeposit(transfer));
    }
  }
  const withdrawals = withdrawalStatuses.map(zoneWithdrawalStatusToFixture);

  return trimActivity({
    orders: mappedOrders,
    orderHistory,
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
    withdrawalBatchIndex: status.withdrawalBatchIndex,
    l1SettlementTxHash:
      status.l1ProcessWithdrawalTxHash ?? status.l1SubmitBatchTxHash ?? null,
  };
}

function zoneOrderToFixture(order: ZoneOrder): OrderFixture {
  return {
    id: `o-${rawToBigInt(order.orderId).toString()}`,
    pair: pairFor(order.baseToken, order.quoteToken),
    side: order.side === "bid" ? "buy" : "sell",
    type: "limit",
    amount: formatRawToken(order.amount),
    amountRaw: rawToBigInt(order.amount).toString(),
    price: formatRawPrice(order.price),
    filledPercent: fillPercent(order.amount, order.filled),
    status: orderStatusToFixture(order.status),
    submittedAt: blockTimeIso(order.createdAtBlock),
    txHash: order.createdTxHash,
  };
}

function zoneFillToFixture(
  fill: ZoneFill,
  intent: FillIntent,
): FillFixture {
  const rawOrderId = fill.orderId
    ? rawToBigInt(fill.orderId).toString()
    : undefined;
  const logIndex = rawToBigInt(fill.logIndex).toString();
  return {
    id: zoneFillIdentity(fill.txHash, logIndex, fill.role),
    orderId: rawOrderId ? `o-${rawOrderId}` : `o-${fill.txHash.slice(2, 10)}`,
    pair: pairFor(fill.baseToken, fill.quoteToken),
    side: intent.side,
    type: intent.type,
    amount: formatRawToken(fill.amountFilled),
    amountRaw: rawToBigInt(fill.amountFilled).toString(),
    price: formatRawPrice(fill.price),
    matchedAt: blockTimeIso(fill.blockNumber),
    status: "matched",
    txHash: fill.txHash,
  };
}

function resolveZoneFillIntents(
  fills: readonly ZoneFill[],
  ordersById: ReadonlyMap<string, ZoneOrder>,
  transactionInputs: Readonly<Record<string, Hex>>,
  knownFillIntents: Readonly<Record<string, FillIntent>>,
): ReadonlyMap<string, FillIntent> {
  const intents = new Map<string, FillIntent>();

  for (const fill of fills) {
    const id = zoneFillId(fill);
    const rawOrderId = fill.orderId
      ? rawToBigInt(fill.orderId).toString()
      : undefined;
    const matchingOrder = rawOrderId ? ordersById.get(rawOrderId) : undefined;
    const intent = matchingOrder
      ? {
          side:
            matchingOrder.side === "bid"
              ? ("buy" as const)
              : ("sell" as const),
          type: "limit" as const,
        }
      : decodeDarkpoolOrderIntent(
          transactionInputs[fill.txHash.toLowerCase()],
        ) ?? knownFillIntents[id];
    if (intent) intents.set(id, intent);
  }

  for (const fill of fills) {
    const id = zoneFillId(fill);
    if (intents.has(id) || fill.role !== "taker" || fill.orderId) continue;
    const makerIntent = intents.get(
      zoneFillIdentity(
        fill.txHash,
        rawToBigInt(fill.logIndex).toString(),
        "maker",
      ),
    );
    if (!makerIntent) continue;
    intents.set(id, {
      side: makerIntent.side === "buy" ? "sell" : "buy",
      type: "market",
    });
  }

  return intents;
}

function zoneFillId(fill: ZoneFill): string {
  return zoneFillIdentity(
    fill.txHash,
    rawToBigInt(fill.logIndex).toString(),
    fill.role,
  );
}

export function decodeDarkpoolOrderIntent(data?: Hex): {
  side: "buy" | "sell";
  type: "limit" | "market";
} | null {
  if (!data || data === "0x") return null;
  try {
    const decoded = decodeFunctionData({
      abi: DARKPOOL_PARSED_ABI,
      data,
    });
    if (decoded.functionName === "marketBuy") {
      return { side: "buy", type: "market" };
    }
    if (decoded.functionName === "marketSell") {
      return { side: "sell", type: "market" };
    }
    if (decoded.functionName === "place") {
      return {
        side: decoded.args[3] ? "buy" : "sell",
        type: "limit",
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function zoneFillIdentity(
  txHash: Hex,
  logIndex: string | number,
  role: ZoneFill["role"],
): string {
  return `f-${txHash.slice(2)}-${logIndex}-${role}`;
}

function zoneTransferToDeposit(transfer: ZoneTransfer): DepositFixture {
  return {
    id: `d-${transfer.txHash.slice(2, 10)}-${rawToBigInt(transfer.logIndex).toString()}`,
    token: tokenSymbol(transfer.token),
    amount: formatRawToken(transfer.amount),
    status: "credited",
    initiatedAt: blockTimeIso(transfer.blockNumber),
    txHash: transfer.txHash,
  };
}

function compareZoneTransfersNewestFirst(
  a: ZoneTransfer,
  b: ZoneTransfer,
): number {
  const blockDelta = rawToBigInt(b.blockNumber) - rawToBigInt(a.blockNumber);
  if (blockDelta !== BigInt(0)) return blockDelta > BigInt(0) ? 1 : -1;
  return b.logIndex - a.logIndex;
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
  if (baseSymbol === "ALPHAUSD" && quoteSymbol === "PATH.USD") {
    return "ALPHAUSD/PATH.USD";
  }
  return "ALPHAUSD/PATH.USD";
}

function tokenSymbol(address: Address): "PATH.USD" | "ALPHAUSD" {
  if (address.toLowerCase() === OMEGA_ZONE_ADDRESSES.alphaUsd.toLowerCase()) {
    return "ALPHAUSD";
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

function rpcTimestampIso(value: Hex): string {
  const seconds = rawToBigInt(value);
  const milliseconds = Number(seconds * BigInt(1_000));
  const date = new Date(milliseconds);
  if (!Number.isSafeInteger(milliseconds) || Number.isNaN(date.getTime())) {
    throw new Error(`Invalid Omega Zone activity timestamp: ${value}.`);
  }
  return date.toISOString();
}

function activityKey(account: Address): string {
  return account.toLowerCase();
}

function trimActivity(activity: OmegaZoneActivity): OmegaZoneActivity {
  return {
    orders: activity.orders,
    orderHistory: activity.orderHistory,
    fills: activity.fills,
    deposits: activity.deposits,
    withdrawals: activity.withdrawals,
  };
}

function cloneActivity(activity: OmegaZoneActivity): OmegaZoneActivity {
  return {
    orders: [...activity.orders],
    orderHistory: [...activity.orderHistory],
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
  return merged;
}

function mergeOrderHistory(
  incoming: OrderFixture[] | undefined,
  current: OrderFixture[],
): OrderFixture[] {
  if (!incoming || incoming.length === 0) return current;
  const incomingTxs = normalizedTxHashes(incoming);
  const retainedCurrent = current.filter(
    (order) =>
      !(
        order.txHash &&
        order.id === `o-${order.txHash.slice(2, 10)}` &&
        incomingTxs.has(order.txHash.toLowerCase())
      ),
  );
  return mergeById(incoming, retainedCurrent);
}

function mergeFills(
  incoming: FillFixture[] | undefined,
  current: FillFixture[],
): FillFixture[] {
  if (!incoming || incoming.length === 0) return current;
  const incomingTxs = normalizedTxHashes(incoming);
  const retainedCurrent = current.filter(
    (fill) =>
      !(
        fill.txHash &&
        fill.id === `f-${fill.txHash.slice(2, 10)}` &&
        incomingTxs.has(fill.txHash.toLowerCase())
      ),
  );
  return mergeById(incoming, retainedCurrent);
}

function mergeWithdrawals(
  incoming: WithdrawalFixture[] | undefined,
  current: WithdrawalFixture[],
): WithdrawalFixture[] {
  if (!incoming || incoming.length === 0) return current;
  const incomingTxs = normalizedTxHashes(incoming);
  const retainedCurrent = current.filter(
    (withdrawal) =>
      !(
        withdrawal.txHash &&
        withdrawal.id === `w-${withdrawal.txHash.slice(2, 10)}` &&
        incomingTxs.has(withdrawal.txHash.toLowerCase())
      ),
  );
  return mergeById(incoming, retainedCurrent);
}

function normalizedTxHashes(
  items: readonly { txHash?: `0x${string}` | null }[],
): Set<string> {
  return new Set(
    items
      .map((item) => item.txHash?.toLowerCase())
      .filter((txHash): txHash is string => Boolean(txHash)),
  );
}

function mergeAuthoritativeOrders(
  incoming: OrderFixture[],
  current: OrderFixture[],
  incomingFills: FillFixture[] | undefined,
): OrderFixture[] {
  const incomingOrderTxs = new Set(
    incoming.map((order) => order.txHash?.toLowerCase()).filter(Boolean),
  );
  const incomingFillTxs = new Set(
    (incomingFills ?? [])
      .map((fill) => fill.txHash?.toLowerCase())
      .filter(Boolean),
  );
  const pendingCurrent = current.filter(
    (order) =>
      order.status === "pending" &&
      order.txHash &&
      order.id === `o-${order.txHash.slice(2, 10)}` &&
      !incomingOrderTxs.has(order.txHash.toLowerCase()) &&
      !incomingFillTxs.has(order.txHash.toLowerCase()),
  );
  return mergeById(incoming, pendingCurrent);
}

function reconcileFilledOrders(
  orders: OrderFixture[],
  incomingOrders: OrderFixture[] | undefined,
  incomingFills: FillFixture[] | undefined,
): OrderFixture[] {
  if (
    (!incomingOrders || incomingOrders.length === 0) &&
    (!incomingFills || incomingFills.length === 0)
  ) {
    return orders;
  }
  const incomingOrderIds = new Set((incomingOrders ?? []).map((order) => order.id));
  const incomingOrderTxs = new Set(
    (incomingOrders ?? [])
      .map((order) => order.txHash?.toLowerCase())
      .filter(Boolean),
  );
  const incomingFillTxs = new Set(
    (incomingFills ?? [])
      .map((fill) => fill.txHash?.toLowerCase())
      .filter(Boolean),
  );
  const filledByOrderId = filledAmountsByOrderId(incomingFills ?? []);

  return orders.filter((order) => {
    if (
      order.txHash &&
      incomingOrderTxs.has(order.txHash.toLowerCase()) &&
      !incomingOrderIds.has(order.id)
    ) {
      return false;
    }

    if (
      order.txHash &&
      incomingFillTxs.has(order.txHash.toLowerCase()) &&
      !incomingOrderTxs.has(order.txHash.toLowerCase())
    ) {
      return false;
    }

    const filledAmount = filledByOrderId.get(order.id);
    const orderAmount = fixtureAmountToRaw(order);
    if (filledAmount !== undefined && orderAmount !== null) {
      return filledAmount < orderAmount;
    }

    return true;
  });
}

function filledAmountsByOrderId(fills: readonly FillFixture[]) {
  const amounts = new Map<string, bigint>();
  for (const fill of fills) {
    const amount = fixtureAmountToRaw(fill);
    if (amount === null) continue;
    amounts.set(fill.orderId, (amounts.get(fill.orderId) ?? BigInt(0)) + amount);
  }
  return amounts;
}

function fixtureAmountToRaw({
  amount,
  amountRaw,
}: Pick<OrderFixture, "amount" | "amountRaw">): bigint | null {
  if (amountRaw && /^\d+$/.test(amountRaw)) return BigInt(amountRaw);
  const normalized = amount.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,6})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  return (
    BigInt(whole) * BigInt(1_000_000) +
    BigInt(fraction.padEnd(6, "0").slice(0, 6))
  );
}

function mergeDeposits(
  incoming: DepositFixture[] | undefined,
  current: DepositFixture[],
): DepositFixture[] {
  if (!incoming || incoming.length === 0) return current;
  const seen = new Set<string>();
  const merged: DepositFixture[] = [];
  for (const item of [...incoming, ...current]) {
    const key = depositMergeKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

function depositMergeKey(deposit: DepositFixture): string {
  return deposit.txHash.toLowerCase();
}

function mergeAuthoritativeDeposits(
  incoming: DepositFixture[],
  current: DepositFixture[],
): DepositFixture[] {
  const pendingCurrent = current.filter(
    (deposit) =>
      deposit.status === "pending" &&
      !incoming.some((backendDeposit) =>
        depositsLikelyRepresentSameCredit(deposit, backendDeposit),
      ),
  );
  return mergeDeposits(incoming, pendingCurrent);
}

function depositsLikelyRepresentSameCredit(
  optimisticDeposit: DepositFixture,
  backendDeposit: DepositFixture,
): boolean {
  if (optimisticDeposit.txHash.toLowerCase() === backendDeposit.txHash.toLowerCase()) {
    return true;
  }
  return (
    optimisticDeposit.token === backendDeposit.token &&
    optimisticDeposit.amount === backendDeposit.amount &&
    backendDeposit.status === "credited"
  );
}
