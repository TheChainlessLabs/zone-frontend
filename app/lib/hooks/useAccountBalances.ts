"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccountBalances } from "@/lib/apiClient";
import { getTokenMeta, formatTokenAmount } from "@/lib/tokens";

export interface FormattedBalance {
  tokenId: number;
  symbol: string;
  color: string;
  available: number;
  collateral: number;
  total: number;
}

export function useAccountBalances(accountId: number | null) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["balances", accountId],
    queryFn: () => getAccountBalances(accountId!),
    enabled: !!accountId,
    refetchInterval: 5000,
  });

  const balances: FormattedBalance[] = (data?.balances ?? []).map((b) => {
    const meta = getTokenMeta(b.token_id);
    return {
      tokenId: b.token_id,
      symbol: meta.symbol,
      color: meta.color,
      available: formatTokenAmount(b.available, meta.decimals),
      collateral: formatTokenAmount(b.collateral, meta.decimals),
      total: formatTokenAmount(b.total, meta.decimals),
    };
  });

  return {
    balances,
    isLoading: accountId !== null && isLoading,
    isError,
  };
}
