"use client";

import { useEffect, useMemo, useState } from "react";
import { useOrderBook } from "./useOrderBook";
import { useMarket } from "./useMarket";
import {
  filterByTimeframe,
  type ChartPoint,
  type Timeframe,
} from "@/lib/chartData";

/**
 * Chart data source for the /trade and /trade/pair pages.
 *
 * **Why midpoint instead of backend trades?**
 * The Omega sequencer is a deterministic state machine with no wall clock,
 * so `trade.timestamp` is a monotonic counter (`AtomicU64::fetch_add(1)` in
 * `omega-markets/crates/engine/src/sequencer.rs`) rather than Unix epoch
 * seconds. Feeding those values to `lightweight-charts` — which interprets
 * them as `UTCTimestamp` — would render axis labels in the 1970 era and
 * break "last hour / last day" filtering entirely. Backend trades are
 * also absent on quiet or freshly-seeded markets, which would leave the
 * chart blank forever.
 *
 * Instead, we derive price history from the live midpoint that
 * `useOrderBook()` already polls every 5 s, stamping each observation
 * with `Math.floor(Date.now() / 1000)` on the client. This guarantees:
 *
 *   1. Real Unix epoch timestamps → correct wall-clock filtering and axis labels
 *   2. Always-available data — the chart is populated as soon as the
 *      order book returns a valid midpoint, not only after a trade fills
 *   3. Continuity across navigation within a tab via `sessionStorage`
 *
 * Each market has its own buffer; switching markets loads the previously
 * observed history for that market (if any). The buffer is capped at
 * `MAX_POINTS_PER_MARKET` to bound memory.
 */

// At 5 s polling, 20_000 observations covers ~27.8 hours — comfortably more
// than the longest exposed timeframe (1D = 24 h) so filterByTimeframe
// always has enough history. Storage footprint: ~800 KB per market in
// JSON form, well under the 5 MB sessionStorage budget most browsers
// enforce. If a longer timeframe (1W, 1M) is ever exposed, this cap must
// either scale with it or the buffer needs downsampling of older data.
const MAX_POINTS_PER_MARKET = 20_000;
const STORAGE_VERSION = 2;

function storageKey(marketId: number): string {
  return `omega:chart:midpoint-history:v${STORAGE_VERSION}:${marketId}`;
}

function loadHistory(marketId: number): ChartPoint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(storageKey(marketId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is ChartPoint =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as ChartPoint).time === "number" &&
        typeof (p as ChartPoint).value === "number",
    );
  } catch {
    return [];
  }
}

function saveHistory(marketId: number, points: ChartPoint[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey(marketId), JSON.stringify(points));
  } catch {
    // Quota exceeded or storage unavailable — not fatal, the chart still
    // works in-memory for the current mount.
  }
}

export function useMidpointHistory(timeframe: Timeframe): {
  points: ChartPoint[];
  isLoading: boolean;
  isError: boolean;
} {
  const { marketId } = useMarket();
  const { midpoint, isLoading, isError } = useOrderBook();

  // Reload buffer whenever the active market changes.
  const [history, setHistory] = useState<ChartPoint[]>(() =>
    loadHistory(marketId),
  );
  useEffect(() => {
    setHistory(loadHistory(marketId));
  }, [marketId]);

  // Append a new observation each time the midpoint changes. Dedupe by
  // second (to stay monotonic in lightweight-charts) and by identical value
  // (to avoid an ever-growing buffer when nothing is moving).
  useEffect(() => {
    if (midpoint == null || !Number.isFinite(midpoint)) return;
    setHistory((prev) => {
      const now = Math.floor(Date.now() / 1000);
      const last = prev[prev.length - 1];
      if (last && last.time === now) {
        // Same-second update — overwrite the latest value so the chart
        // tracks the most recent midpoint within each second bucket.
        if (last.value === midpoint) return prev;
        const next = prev.slice(0, -1);
        next.push({ time: now, value: midpoint });
        saveHistory(marketId, next);
        return next;
      }
      if (last && last.value === midpoint && now - last.time < 1) {
        return prev;
      }
      const next = [...prev, { time: now, value: midpoint }];
      const trimmed =
        next.length > MAX_POINTS_PER_MARKET
          ? next.slice(-MAX_POINTS_PER_MARKET)
          : next;
      saveHistory(marketId, trimmed);
      return trimmed;
    });
  }, [midpoint, marketId]);

  const points = useMemo(
    () => filterByTimeframe(history, timeframe),
    [history, timeframe],
  );

  return { points, isLoading, isError };
}
