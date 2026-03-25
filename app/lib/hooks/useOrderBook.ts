"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrderBook } from "@/lib/apiClient";
import { decodePrice } from "@/lib/priceUtils";
import { useMarket } from "./useMarket";
import type { OrderBookResponse } from "@/lib/apiTypes";

export function useOrderBook() {
  const { marketId } = useMarket();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["book", marketId],
    queryFn: () => getOrderBook(marketId),
    refetchInterval: 5000,
  });

  const midpoint = computeMidpoint(data);

  return {
    book: data,
    midpoint,
    isLoading,
    isError,
  };
}

function computeMidpoint(book: OrderBookResponse | undefined): number | null {
  if (!book || book.bids.length === 0 || book.asks.length === 0) return null;
  const bestBid = decodePrice(book.bids[0].price);
  const bestAsk = decodePrice(book.asks[0].price);
  return (bestBid + bestAsk) / 2;
}
