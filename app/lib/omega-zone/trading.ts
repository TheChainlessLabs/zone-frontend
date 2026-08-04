import { formatUnits, type Address, type Hex } from "viem";

import {
  isZoneAuthError,
  readPrivateDarkpoolAvailableBalance,
  readPrivateZoneTokenBalance,
  signAndSendPrivateZoneContractWrite,
  waitForZoneTransactionReceipt,
  type ZoneRpcFetchOptions,
  type ZoneTransactionSigner,
} from "./rpc";
import { darkpoolCancelOrderRequest } from "./requests";

type ZoneTokenBalanceReader = (
  authToken: Hex,
  account: Address,
  token: Address,
  options?: ZoneRpcFetchOptions,
) => Promise<bigint>;

export function parseZoneOrderFixtureId(id: string): bigint {
  const match = /^o-(\d+)$/.exec(id);
  if (!match) {
    throw new Error(
      "This order is still being indexed. Wait a moment and retry.",
    );
  }
  return BigInt(match[1]);
}

interface CancelPrivateZoneOrderOptions {
  orderFixtureId: string;
  account: Address;
  signer: ZoneTransactionSigner;
  getAuthToken: (options?: { forceRefresh?: boolean }) => Promise<Hex>;
  refresh: (authToken: Hex) => Promise<void>;
  sendTransaction?: typeof signAndSendPrivateZoneContractWrite;
  waitForReceipt?: (
    hash: Hex,
    options: { authToken: Hex },
  ) => Promise<{ status: unknown }>;
}

export async function cancelPrivateZoneOrder({
  orderFixtureId,
  account,
  signer,
  getAuthToken,
  refresh,
  sendTransaction = signAndSendPrivateZoneContractWrite,
  waitForReceipt = waitForZoneTransactionReceipt,
}: CancelPrivateZoneOrderOptions): Promise<Hex> {
  const orderId = parseZoneOrderFixtureId(orderFixtureId);
  let authToken = await getAuthToken();
  const submitWith = (token: Hex) =>
    sendTransaction({
      authToken: token,
      signer,
      account,
      request: darkpoolCancelOrderRequest(orderId),
    });

  let txHash: Hex;
  try {
    txHash = await submitWith(authToken);
  } catch (error) {
    if (!isZoneAuthError(error)) throw error;
    authToken = await getAuthToken({ forceRefresh: true });
    txHash = await submitWith(authToken);
  }

  let receipt;
  try {
    receipt = await waitForReceipt(txHash, { authToken });
  } catch (error) {
    if (!isZoneAuthError(error)) throw error;
    authToken = await getAuthToken({ forceRefresh: true });
    receipt = await waitForReceipt(txHash, { authToken });
  }
  if (!zoneReceiptSucceeded(receipt.status)) {
    throw new Error("Order cancellation reverted on the Omega Zone.");
  }

  await refresh(authToken);
  return txHash;
}

function zoneReceiptSucceeded(status: unknown): boolean {
  const normalized = String(status ?? "");
  return normalized === "success" || normalized === "0x1";
}

export async function readPrivateZoneTradeBalance(
  authToken: Hex,
  account: Address,
  token: Address,
  options?: ZoneRpcFetchOptions,
): Promise<bigint> {
  const [zoneBalance, darkpoolAvailable] = await Promise.all([
    readPrivateZoneTokenBalance(authToken, account, token, options),
    readPrivateDarkpoolAvailableBalance(authToken, account, token, options),
  ]);
  return zoneBalance + darkpoolAvailable;
}

export async function ensurePrivateZoneTradeBalance({
  account,
  authToken,
  token,
  requiredAmount,
  tokenLabel,
  options,
  readBalance = readPrivateZoneTradeBalance,
}: {
  account: Address;
  authToken: Hex;
  token: Address;
  requiredAmount: bigint;
  tokenLabel: string;
  options?: ZoneRpcFetchOptions;
  readBalance?: ZoneTokenBalanceReader;
}) {
  const currentBalance = await readBalance(authToken, account, token, options);

  if (currentBalance < requiredAmount) {
    const current = formatZoneTradeAmount(currentBalance);
    const required = formatZoneTradeAmount(requiredAmount);
    throw new Error(
      [
        `Not enough zone ${tokenLabel}.`,
        `You have ${current} available to trade; need ${required}.`,
        "Deposit more or cancel resting orders to free escrow.",
      ].join(" "),
    );
  }

  return currentBalance;
}

function formatZoneTradeAmount(value: bigint): string {
  const formatted = formatUnits(value, 6);
  const [whole, fraction = ""] = formatted.split(".");
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const cents = fraction.padEnd(2, "0").slice(0, 2);
  return `${groupedWhole}.${cents}`;
}
