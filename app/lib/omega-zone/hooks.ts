"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address, Hex } from "viem";

import { readOmegaZoneActivity } from "./activity-cache";
import {
  getOmegaZoneBalances,
  getOmegaZoneMetadata,
  getOmegaZoneTopOfBook,
} from "./client";

export function useOmegaZoneInfo(authToken: Hex | null | undefined) {
  return useQuery({
    queryKey: ["omega-zone", "info", authToken],
    queryFn: () => getOmegaZoneMetadata({ authToken: authToken as Hex }),
    enabled: Boolean(authToken),
    staleTime: 15_000,
  });
}

export function useOmegaZoneBalances({
  authToken,
  account,
}: {
  authToken: Hex | null | undefined;
  account: Address | undefined;
}) {
  return useQuery({
    queryKey: ["omega-zone", "balances", authToken, account],
    queryFn: () =>
      getOmegaZoneBalances({
        authToken: authToken as Hex,
        account: account as Address,
      }),
    enabled: Boolean(authToken && account),
    refetchInterval: 10_000,
  });
}

export function useOmegaZoneTopOfBook({
  authToken,
  account,
  base,
}: {
  authToken: Hex | null | undefined;
  account: Address | undefined;
  base?: Address;
}) {
  return useQuery({
    queryKey: ["omega-zone", "top-of-book", authToken, account, base],
    queryFn: () =>
      getOmegaZoneTopOfBook({
        authToken: authToken as Hex,
        account: account as Address,
        base,
      }),
    enabled: Boolean(authToken && account),
    refetchInterval: 10_000,
  });
}

export function useOmegaZoneOrders(account: Address | undefined) {
  return useQuery({
    queryKey: ["omega-zone", "orders", account],
    queryFn: () => readOmegaZoneActivity(account).orders,
    enabled: Boolean(account),
  });
}

export function useOmegaZoneDeposits(account: Address | undefined) {
  return useQuery({
    queryKey: ["omega-zone", "deposits", account],
    queryFn: () => readOmegaZoneActivity(account).deposits,
    enabled: Boolean(account),
  });
}
