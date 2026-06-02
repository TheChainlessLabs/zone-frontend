import type { Address, Hex } from "viem";

import { OMEGA_ZONE_ADDRESSES } from "./config";
import {
  getZoneAuthorizationTokenInfo,
  getZoneDepositStatus,
  getZoneInfo,
  readPrivateBestAsk,
  readPrivateBestBid,
  readPrivateDarkpoolBalance,
  readPrivateZoneOalphaBalance,
  readPrivateZonePathUsdBalance,
  tempoL1Client,
  type PriceLevel,
  type ZoneRpcFetchOptions,
} from "./rpc";
import { TIP20_PARSED_ABI } from "./abi";

export interface OmegaZoneClientOptions extends ZoneRpcFetchOptions {
  authToken: Hex;
  account: Address;
}

export interface OmegaZoneBalances {
  l1PathUsd: bigint;
  zonePathUsd: bigint;
  zoneOalpha: bigint;
  darkpoolPathUsd: bigint;
  darkpoolOalpha: bigint;
}

export interface OmegaZoneTopOfBook {
  bestBid: PriceLevel;
  bestAsk: PriceLevel;
}

export async function getOmegaZoneMetadata({
  authToken,
  ...options
}: {
  authToken: Hex;
} & ZoneRpcFetchOptions) {
  const [authorization, zone] = await Promise.all([
    getZoneAuthorizationTokenInfo(authToken, options),
    getZoneInfo(authToken, options),
  ]);
  return { authorization, zone };
}

export async function getOmegaZoneBalances({
  authToken,
  account,
  ...options
}: OmegaZoneClientOptions): Promise<OmegaZoneBalances> {
  const [l1PathUsd, zonePathUsd, zoneOalpha, darkpoolPathUsd, darkpoolOalpha] =
    await Promise.all([
    tempoL1Client.readContract({
      address: OMEGA_ZONE_ADDRESSES.pathUsd,
      abi: TIP20_PARSED_ABI,
      functionName: "balanceOf",
      args: [account],
    }) as Promise<bigint>,
    readPrivateZonePathUsdBalance(authToken, account, options),
    readPrivateZoneOalphaBalance(authToken, account, options),
    readPrivateDarkpoolBalance(authToken, account, undefined, options),
    readPrivateDarkpoolBalance(
      authToken,
      account,
      OMEGA_ZONE_ADDRESSES.oalpha,
      options,
    ),
  ]);

  return { l1PathUsd, zonePathUsd, zoneOalpha, darkpoolPathUsd, darkpoolOalpha };
}

export async function getOmegaZoneTopOfBook({
  authToken,
  account,
  base = OMEGA_ZONE_ADDRESSES.oalpha,
  ...options
}: OmegaZoneClientOptions & {
  base?: Address;
}): Promise<OmegaZoneTopOfBook> {
  const [bestBid, bestAsk] = await Promise.all([
    readPrivateBestBid(authToken, account, base, options),
    readPrivateBestAsk(authToken, account, base, options),
  ]);
  return { bestBid, bestAsk };
}

export async function waitForOmegaZoneDeposit({
  authToken,
  tempoBlockNumber,
  account,
  timeoutMs = 60_000,
  pollIntervalMs = 2_000,
}: {
  authToken: Hex;
  tempoBlockNumber: bigint;
  account: Address;
  timeoutMs?: number;
  pollIntervalMs?: number;
}) {
  const startedAt = Date.now();
  let lastZoneBalance = await readPrivateZonePathUsdBalance(authToken, account);

  while (Date.now() - startedAt < timeoutMs) {
    const status = await getZoneDepositStatus(authToken, tempoBlockNumber);
    const nextZoneBalance = await readPrivateZonePathUsdBalance(
      authToken,
      account,
    );
    if (
      nextZoneBalance > lastZoneBalance ||
      status.processed ||
      status.deposits.some((deposit) => deposit.status === "processed")
    ) {
      return {
        status,
        zonePathUsdBalance: nextZoneBalance,
      };
    }
    lastZoneBalance = nextZoneBalance;
    await delay(pollIntervalMs);
  }

  throw new Error("Deposit is still pending in Omega Zone. Refresh in a moment.");
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
