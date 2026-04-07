"use client";

import { useReadContract } from "wagmi";
import { erc20Abi } from "@/lib/abis/erc20Abi";
import type { Address } from "viem";

export function useTokenBalance(
  tokenAddress: Address | undefined,
  walletAddress: Address | undefined,
  decimals: number = 6,
) {
  const { data, isLoading, isError, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!walletAddress,
      refetchInterval: 15000,
    },
  });

  const raw = data as bigint | undefined;
  const formatted = raw !== undefined ? Number(raw) / 10 ** decimals : 0;

  return { balance: raw ?? BigInt(0), formatted, isLoading, isError, refetch };
}
