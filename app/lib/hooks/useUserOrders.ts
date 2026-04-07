"use client";

import { useQuery } from "@tanstack/react-query";
import { getMarketOrders } from "@/lib/apiClient";
import { decodePrice, decodeQuantity } from "@/lib/priceUtils";
import type { CurrentOrderView } from "@/lib/apiTypes";

export interface UserOrder {
  id: number;
  pair: string;
  side: "buy" | "sell";
  type: string;
  amount: number;
  remaining: number;
  price: number;
  filledPercent: number;
  status: "open" | "filled" | "cancelled";
  time: string;
}

const MARKET_NAMES: Record<number, string> = {
  1: "EUR/USD",
};

function mapOrder(o: CurrentOrderView, marketId: number): UserOrder {
  const originalQty = decodeQuantity(o.original_quantity, 6);
  const remainingQty = decodeQuantity(o.remaining_quantity, 6);
  const filledPercent =
    originalQty > 0
      ? Math.round(((originalQty - remainingQty) / originalQty) * 100)
      : 0;

  return {
    id: o.id,
    pair: MARKET_NAMES[marketId] ?? `Market ${marketId}`,
    side: o.side.toLowerCase() as "buy" | "sell",
    type: o.kind.toLowerCase(),
    amount: originalQty,
    remaining: remainingQty,
    price: decodePrice(o.price),
    filledPercent,
    status: o.status.toLowerCase() as "open" | "filled" | "cancelled",
    time: new Date(o.last_state_change_timestamp * 1000).toLocaleTimeString(
      "en-US",
      { hour12: false },
    ),
  };
}

export function useUserOrders(accountId: number | null, marketId: number) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", marketId],
    queryFn: () => getMarketOrders(marketId),
    enabled: !!accountId,
    refetchInterval: 5000,
  });

  const allOrders =
    data?.orders
      .filter((o) => o.owner_account_id === accountId)
      .map((o) => mapOrder(o, marketId)) ?? [];

  const openOrders = allOrders.filter((o) => o.status === "open");

  return {
    orders: allOrders,
    openOrders,
    isLoading,
    isError,
  };
}
