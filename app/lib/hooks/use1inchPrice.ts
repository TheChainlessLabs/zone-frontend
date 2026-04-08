"use client";

import { useQuery } from "@tanstack/react-query";

interface OneInchPriceResponse {
  usdc_usd: number;
  usdt_usd: number;
  usdt_usdc_rate: number;
  source: string;
  timestamp: number;
}

async function fetch1inchPrice(): Promise<OneInchPriceResponse> {
  const res = await fetch("/api/prices/1inch");
  if (!res.ok) throw new Error("Failed to fetch 1inch price");
  return res.json();
}

export function use1inchPrice() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["1inchPrice"],
    queryFn: fetch1inchPrice,
    refetchInterval: 30_000,
  });

  return {
    rate: data?.usdt_usdc_rate ?? null,
    source: data?.source ?? null,
    isLoading,
    isError,
  };
}
