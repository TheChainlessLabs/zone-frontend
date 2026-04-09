"use client";

import { useEffect, useMemo, useState } from "react";
import { useOrderBook } from "./useOrderBook";
import { useMarket } from "./useMarket";
import { decodePrice } from "@/lib/priceUtils";
import type { OrderBookResponse } from "@/lib/apiTypes";
import {
  filterByTimeframe,
  type ChartPoint,
  type Timeframe,
} from "@/lib/chartData";

/**
 * Chart data source for the /trade and /trade/pair pages.
 *
 * **Why a reference price instead of backend trades?**
 * The Omega sequencer is a deterministic state machine with no wall clock,
 * so `trade.timestamp` is a monotonic counter (`AtomicU64::fetch_add(1)` in
 * `omega-markets/crates/engine/src/sequencer.rs`) rather than Unix epoch
 * seconds. Feeding those values to `lightweight-charts` — which interprets
 * them as `UTCTimestamp` — would render axis labels in the 1970 era and
 * break "last hour / last day" filtering entirely. Backend trades are
 * also absent on quiet or freshly-seeded markets, which would leave the
 * chart blank forever.
 *
 * Instead we derive price history from the live order book that
 * `useOrderBook()` already polls every 5 s, stamping each observation
 * with `Math.floor(Date.now() / 1000)` on the client.
 *
 * The observed value is a **reference price** computed via
 * {@link computeReferencePrice}: the bid/ask midpoint when both sides
 * exist, otherwise the single available side. This handles the
 * freshly-seeded / low-liquidity case where only bids or only asks
 * are present in the book — without the fallback the chart would be
 * stuck on its empty state until both sides filled.
 *
 * Guarantees:
 *   1. Real Unix epoch timestamps → correct wall-clock filtering and axis labels
 *   2. Always-available data — the chart populates as soon as the book
 *      has **any** orders on either side, not only when a trade fills
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

/**
 * Compute a reference price from the order book with a graceful fallback
 * for one-sided books:
 *
 *   - Both sides present → mid of best bid and best ask (classic midpoint)
 *   - Only bids present  → best bid (the highest price anyone wants to buy at)
 *   - Only asks present  → best ask (the lowest price anyone wants to sell at)
 *   - Book empty         → null (chart stays in its "collecting" state)
 *
 * Falling back to one-sided data keeps the chart alive on freshly seeded
 * or low-liquidity markets where one side of the book hasn't populated
 * yet. Without this, `useOrderBook()` returns `midpoint === null` whenever
 * either side is missing and the chart would be stuck on the empty state
 * indefinitely.
 */
function computeReferencePrice(
  book: OrderBookResponse | undefined,
): number | null {
  if (!book) return null;
  const bestBidEntry = book.bids[0];
  const bestAskEntry = book.asks[0];
  const bestBid = bestBidEntry ? decodePrice(bestBidEntry.price) : null;
  const bestAsk = bestAskEntry ? decodePrice(bestAskEntry.price) : null;
  if (bestBid != null && bestAsk != null) return (bestBid + bestAsk) / 2;
  if (bestBid != null) return bestBid;
  if (bestAsk != null) return bestAsk;
  return null;
}

export function useMidpointHistory(timeframe: Timeframe): {
  points: ChartPoint[];
  isLoading: boolean;
  isError: boolean;
} {
  const { marketId } = useMarket();
  const { book, isLoading, isError, dataUpdatedAt } = useOrderBook();
  const referencePrice = useMemo(() => computeReferencePrice(book), [book]);

  // Reload buffer whenever the active market changes.
  const [history, setHistory] = useState<ChartPoint[]>(() =>
    loadHistory(marketId),
  );
  useEffect(() => {
    setHistory(loadHistory(marketId));
  }, [marketId]);

  // Append a new observation on **every successful poll**, not only when
  // the reference price changes — a flat market would otherwise yield a
  // single point that ages out of the selected window, and long unchanged
  // segments would be missing from the series. We depend on
  // `dataUpdatedAt` (which react-query bumps on every refetch) so this
  // effect fires once per poll regardless of whether the book moved.
  //
  // Same-second observations collapse into one point (the chart requires
  // monotonically increasing timestamps) by overwriting the last entry if
  // its time key matches, so two rapid re-renders within the same second
  // never produce duplicate timestamps.
  useEffect(() => {
    if (dataUpdatedAt === 0) return; // no successful fetch yet
    if (referencePrice == null || !Number.isFinite(referencePrice)) return;
    setHistory((prev) => {
      const nowSec = Math.floor(dataUpdatedAt / 1000);
      const last = prev[prev.length - 1];
      if (last && last.time === nowSec) {
        // Same-second observation — overwrite so the series stays
        // strictly monotonic in time.
        if (last.value === referencePrice) return prev;
        const next = prev.slice(0, -1);
        next.push({ time: nowSec, value: referencePrice });
        saveHistory(marketId, next);
        return next;
      }
      const next = [...prev, { time: nowSec, value: referencePrice }];
      const trimmed =
        next.length > MAX_POINTS_PER_MARKET
          ? next.slice(-MAX_POINTS_PER_MARKET)
          : next;
      saveHistory(marketId, trimmed);
      return trimmed;
    });
  }, [dataUpdatedAt, referencePrice, marketId]);

  const points = useMemo(
    () => filterByTimeframe(history, timeframe),
    [history, timeframe],
  );

  return { points, isLoading, isError };
}
