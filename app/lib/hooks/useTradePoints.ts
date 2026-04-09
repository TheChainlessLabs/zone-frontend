"use client";

import { useMemo } from "react";
import { useTrades } from "./useTrades";
import {
  tradesToPoints,
  filterByTimeframe,
  type ChartPoint,
  type Timeframe,
} from "@/lib/chartData";

/**
 * Returns chart-ready points for the currently active market, filtered to a
 * timeframe window. Wraps `useTrades()` so consumers don't have to rebuild the
 * transform themselves.
 */
export function useTradePoints(timeframe: Timeframe): {
  points: ChartPoint[];
  isLoading: boolean;
  isError: boolean;
} {
  const { trades, isLoading, isError } = useTrades();

  const points = useMemo(() => {
    const all = tradesToPoints(
      trades.map((t) => ({ timestamp: t.timestamp, price: t.price })),
    );
    return filterByTimeframe(all, timeframe);
  }, [trades, timeframe]);

  return { points, isLoading, isError };
}
