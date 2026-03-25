"use client";

import { useQuery } from "@tanstack/react-query";
import { getTrades } from "@/lib/apiClient";
import { decodePrice, decodeQuantity } from "@/lib/priceUtils";
import { useMarket } from "./useMarket";
import type { Trade } from "@/lib/types";
import type { ApiTrade } from "@/lib/apiTypes";

const MARKET_NAMES: Record<number, string> = {
  1: "EUR/USD",
};

function mapTrade(t: ApiTrade): Trade {
  const size = decodeQuantity(t.quantity, 6);
  return {
    time: new Date(t.timestamp * 1000).toLocaleTimeString("en-US", { hour12: false }),
    pair: MARKET_NAMES[t.market_id] ?? `Market ${t.market_id}`,
    price: decodePrice(t.price),
    size,
    sizeFormatted: `€${size >= 1000 ? `${(size / 1000).toFixed(0)}K` : size.toLocaleString()}`,
    side: t.maker_side.toLowerCase() as Trade["side"],
  };
}

export function useTrades() {
  const { marketId } = useMarket();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trades", marketId],
    queryFn: () => getTrades(marketId),
    refetchInterval: 5000,
  });

  return {
    trades: data?.trades.map(mapTrade) ?? [],
    isLoading,
    isError,
  };
}
