"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
 * ## Known limitation — history is session-local
 *
 * This hook builds the price series from the client's own poll
 * observations and caches it in `sessionStorage`. A fresh tab / hard
 * reload / private window starts with an empty buffer, so the 1H / 4H /
 * 1D tabs can only show whatever has been observed **since this browser
 * session began**. They are not a query against a historical archive.
 *
 * This is a deliberate tradeoff driven by the current backend surface:
 * Omega's sequencer does not expose a historical price series (there is
 * no `/markets/{id}/history` endpoint, and `trade.timestamp` is a
 * monotonic sequencer counter rather than Unix seconds — see
 * `omega-markets/crates/engine/src/sequencer.rs`). The alternatives were
 * worse: keep the TradingView iframe (which showed external
 * FX:EURUSD data, not Omega's own market), or block the PR entirely on
 * a backend change.
 *
 * Users are told what the chart represents via the "Collecting midpoint
 * history…" empty state. A real historical backfill is tracked in
 * `TODO_ISSUES.md` under FE-055 and will replace the seed path in
 * `loadHistory()` once a backend endpoint exists.
 *
 * ## Why a reference price instead of backend trades?
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

// Demo-seed constants. When NEXT_PUBLIC_CHART_SEED_DEMO === 'true' AND the
// per-market sessionStorage buffer is empty, the hook synthesises a back-
// history so demos / fresh tabs land on a populated chart instead of the
// "collecting midpoint history…" empty state.
//
// 288 points at 5-minute cadence covers 287 × 300 s = 23h55m ending at
// `now` — i.e. effectively the whole 1D rolling window, with the first
// five minutes of the window reserved for real observations as they
// arrive. Each step is a uniform ±0.3 % random walk around the prior
// value (not drawn from a Gaussian — demo data, not a simulation).
const SEED_POINT_COUNT = 288;
const SEED_INTERVAL_SEC = 5 * 60; // 5 minutes
const SEED_WALK_MAGNITUDE = 0.003; // ±0.3 %

/**
 * Fallback seed price for the synth path when no midpoint is observable
 * yet. Picked to match EUR/USD — the only live market at time of writing
 * (see `app/lib/marketIds.ts`). If the book produces a real midpoint
 * before the synth fires we prefer that instead.
 */
const SEED_FALLBACK_PRICE = 1.0858;

function isSeedDemoEnabled(): boolean {
  // `process.env.NEXT_PUBLIC_*` is statically inlined by Next at build time
  // for client bundles; for Vitest we read it dynamically so the test can
  // flip the flag with `vi.stubEnv`.
  //
  // Intentionally off in production so a misconfigured prod build cannot
  // ship synthetic price history to real users — mirrors the dev-only
  // gate on `isDevWalletEnabled` in `app/lib/devWallet.ts`.
  if (process.env.NODE_ENV === "production") return false;
  return process.env.NEXT_PUBLIC_CHART_SEED_DEMO === "true";
}

/**
 * Synthesise a 24 h back-history terminating at `endSec` as a random walk
 * around `basePrice`. Returns exactly {@link SEED_POINT_COUNT} points in
 * ascending time order at {@link SEED_INTERVAL_SEC} cadence, so callers
 * filtering to the 1D window see the chart populated on first render.
 */
function synthesiseSeedHistory(
  basePrice: number,
  endSec: number,
): ChartPoint[] {
  const points: ChartPoint[] = new Array(SEED_POINT_COUNT);
  let value = basePrice;
  // Walk forward from the oldest point so adjacent candles stay correlated.
  const startSec =
    endSec - (SEED_POINT_COUNT - 1) * SEED_INTERVAL_SEC;
  for (let i = 0; i < SEED_POINT_COUNT; i++) {
    // Uniform ±SEED_WALK_MAGNITUDE step. Math.random is fine here — this
    // is demo data, determinism is not required.
    const step = (Math.random() * 2 - 1) * SEED_WALK_MAGNITUDE;
    value = value * (1 + step);
    points[i] = {
      time: startSec + i * SEED_INTERVAL_SEC,
      value,
    };
  }
  return points;
}

function storageKey(marketId: number): string {
  return `omega:chart:midpoint-history:v${STORAGE_VERSION}:${marketId}`;
}

/**
 * Sidecar key carrying provenance metadata for the seed-demo path. Kept
 * separate from the main history key so the v2 schema of `storageKey()`
 * is unchanged — legacy buffers persisted by pre-seed builds still load
 * correctly (as `hasReal=false`), and the chart-seed feature can be
 * removed later by deleting this sidecar without touching the main
 * history payload.
 */
function metaKey(marketId: number): string {
  return `omega:chart:midpoint-history-meta:v1:${marketId}`;
}

interface PersistedBuffer {
  points: ChartPoint[];
  /**
   * True once at least one real order-book observation has been folded
   * into `points`. Distinguishes a pure synth buffer from a mixed or
   * fully-real one, so the error-suppression path in `useMidpointHistory`
   * survives across remounts. Loaded from the sidecar `metaKey` —
   * defaults to `false` when absent, which is safe: a legacy buffer
   * that pre-dates the seed feature has never been synthesised, so a
   * misclassification only impacts the dev-only demo-error path.
   */
  hasReal: boolean;
}

function loadHistory(marketId: number): PersistedBuffer {
  const empty: PersistedBuffer = { points: [], hasReal: false };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.sessionStorage.getItem(storageKey(marketId));
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return empty;
    const points = parsed.filter(
      (p): p is ChartPoint =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as ChartPoint).time === "number" &&
        typeof (p as ChartPoint).value === "number",
    );
    // A pre-seed-feature buffer has no sidecar meta. Treat absence of
    // meta as `hasReal = true` so legacy observation-based history is
    // not misclassified as synthetic and dropped on a transient error.
    // Our own seed writes *always* pair points with a meta sidecar —
    // if a seed buffer persisted points successfully and the meta
    // write rarely fails, misclassifying that edge as "real" is
    // preferable to the inverse (dropping users' real cached history).
    let hasReal = true;
    try {
      const metaRaw = window.sessionStorage.getItem(metaKey(marketId));
      if (metaRaw) {
        const meta = JSON.parse(metaRaw) as { hasReal?: unknown };
        hasReal = meta.hasReal === true;
      }
    } catch {
      hasReal = true;
    }
    return { points, hasReal };
  } catch {
    return empty;
  }
}

function saveHistory(
  marketId: number,
  points: ChartPoint[],
  hasReal: boolean,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey(marketId), JSON.stringify(points));
    window.sessionStorage.setItem(
      metaKey(marketId),
      JSON.stringify({ hasReal }),
    );
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

  // Reload buffer whenever the active market changes. When the demo seed
  // flag is on AND the persisted buffer is empty, synthesise a back-
  // history spanning the 1D window so the chart is never blank on a
  // fresh tab. Real ticks arriving via the append effect below extend —
  // never overwrite — this synth range, matching the acceptance
  // criterion.
  //
  // Kept pure — no sessionStorage writes during render. Persistence of
  // the synth is handled by a committed effect so aborted / strict-mode
  // renders never leak synthetic history into storage.
  //
  // `seedMeta` tracks whether the current buffer was anchored on a live
  // reference price, on the fallback, or is plain observed data. A
  // fallback-anchored synth is *provisional* and must be realigned once
  // a real midpoint arrives — and is never persisted, to avoid locking
  // in a wrong price. `hasReal` is folded into persistence so the error-
  // suppression path survives across remounts.
  type SeedAnchor = "none" | "fallback" | "live";
  interface SeedMeta {
    marketId: number;
    anchor: SeedAnchor;
    hasReal: boolean;
  }
  const buildInitialBuffer = (
    mid: number,
    livePrice: number | null,
  ): {
    buffer: ChartPoint[];
    anchor: SeedAnchor;
    hasReal: boolean;
  } => {
    const persisted = loadHistory(mid);
    if (persisted.points.length > 0) {
      // A persisted buffer with `hasReal === false` is a stored live-
      // anchored synth from a prior mount that never saw a real tick.
      // Preserve that provenance so the error-suppression path still
      // recognises it as synthetic on this mount.
      return {
        buffer: persisted.points,
        anchor: persisted.hasReal ? "none" : "live",
        hasReal: persisted.hasReal,
      };
    }
    if (!isSeedDemoEnabled()) {
      return { buffer: persisted.points, anchor: "none", hasReal: false };
    }
    if (livePrice != null && Number.isFinite(livePrice)) {
      return {
        buffer: synthesiseSeedHistory(
          livePrice,
          Math.floor(Date.now() / 1000),
        ),
        anchor: "live",
        hasReal: false,
      };
    }
    return {
      buffer: synthesiseSeedHistory(
        SEED_FALLBACK_PRICE,
        Math.floor(Date.now() / 1000),
      ),
      anchor: "fallback",
      hasReal: false,
    };
  };

  const initial = useRef<{
    buffer: ChartPoint[];
    anchor: SeedAnchor;
    hasReal: boolean;
  } | null>(null);
  if (initial.current === null) {
    initial.current = buildInitialBuffer(marketId, referencePrice);
  }

  const [history, setHistory] = useState<ChartPoint[]>(
    () => initial.current!.buffer,
  );
  const seedMetaRef = useRef<SeedMeta>({
    marketId,
    anchor: initial.current.anchor,
    hasReal: initial.current.hasReal,
  });

  // Market switch: rebuild buffer for the new marketId. Guard against the
  // cross-market persistence race that `useEffect(..., [marketId])` would
  // otherwise create — the previous render's `history` still belongs to
  // the *old* marketId, so we update `seedMetaRef` and persist inline
  // here (before the persist effect below can fire with a stale closure
  // over the old buffer).
  const prevMarketIdRef = useRef(marketId);
  useEffect(() => {
    if (prevMarketIdRef.current === marketId) return;
    prevMarketIdRef.current = marketId;
    const rebuilt = buildInitialBuffer(marketId, referencePrice);
    seedMetaRef.current = {
      marketId,
      anchor: rebuilt.anchor,
      hasReal: rebuilt.hasReal,
    };
    // Persist the freshly-synthesised buffer *here*, not in the persist
    // effect below — the persist effect closes over the previous render's
    // `history`, which belongs to the old market. If we let it run on
    // this commit it would write the old buffer into the new market's
    // storage key.
    if (
      typeof window !== "undefined" &&
      rebuilt.buffer.length === SEED_POINT_COUNT &&
      rebuilt.anchor === "live" &&
      !rebuilt.hasReal
    ) {
      const existing = loadHistory(marketId);
      if (existing.points.length === 0) {
        saveHistory(marketId, rebuilt.buffer, false);
      }
    }
    setHistory(rebuilt.buffer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketId]);

  // Realignment: when a fallback-anchored synth sees its first live
  // reference price AND no real ticks have appended yet, regenerate the
  // synth around the live price. This is the fix for the real fresh-tab
  // case — `useOrderBook()` starts with `data === undefined` until its
  // query resolves, so the initial synth is almost always fallback-
  // anchored; we replace it in-place once the book lands.
  useEffect(() => {
    if (referencePrice == null || !Number.isFinite(referencePrice)) return;
    const meta = seedMetaRef.current;
    if (meta.marketId !== marketId) return;
    if (meta.anchor !== "fallback") return;
    if (meta.hasReal) return;
    if (history.length !== SEED_POINT_COUNT) return;
    const realigned = synthesiseSeedHistory(
      referencePrice,
      Math.floor(Date.now() / 1000),
    );
    seedMetaRef.current = { marketId, anchor: "live", hasReal: false };
    setHistory(realigned);
  }, [referencePrice, marketId, history.length]);

  // Persist only live-anchored synth buffers, and only for the current
  // marketId. A fallback synth is provisional — if the tab is closed
  // before the book lands, the next session rolls a fresh walk rather
  // than locking in a wrong price.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (history.length !== SEED_POINT_COUNT) return;
    const meta = seedMetaRef.current;
    if (meta.marketId !== marketId) return;
    if (meta.anchor !== "live") return;
    if (meta.hasReal) return;
    // Cross-market race guard: after a market switch, `history` still
    // points at the previous market's buffer for one commit (the
    // `setHistory` inside the market-switch effect hasn't been applied
    // yet). Refuse to persist when the current buffer and the current
    // market's persisted buffer disagree on identity — the market-
    // switch effect already did any needed write inline.
    const existing = loadHistory(marketId);
    if (existing.points.length > 0) return;
    saveHistory(marketId, history, false);
  }, [history, marketId]);

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
  // Latest-observation ref so the append effect can read the current
  // buffer without re-firing every time `history` changes. Updated
  // inside the effect; also refreshed whenever `setHistory` is called
  // elsewhere via the dedicated sync effect below.
  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    if (dataUpdatedAt === 0) return; // no successful fetch yet
    if (referencePrice == null || !Number.isFinite(referencePrice)) return;
    const nowSec = Math.floor(dataUpdatedAt / 1000);
    const prev = historyRef.current;
    const last = prev[prev.length - 1];

    // Compute the next buffer *outside* setHistory so the updater can
    // stay pure — React may re-invoke state updaters in dev /
    // StrictMode, and side effects (storage writes, ref mutation) must
    // not depend on that scheduler behaviour.
    let next: ChartPoint[];
    if (last && last.time === nowSec) {
      // Same-second observation — overwrite so the series stays
      // strictly monotonic in time. Same-value same-second is still
      // a real observation for provenance; just skip the array copy.
      if (last.value === referencePrice) {
        next = prev;
      } else {
        next = prev.slice(0, -1);
        next.push({ time: nowSec, value: referencePrice });
      }
    } else if (last && last.time > nowSec) {
      // Observation older than the current tail — can happen when the
      // synthetic seed terminates at wall-clock `now` and a freshly-
      // resolved react-query `dataUpdatedAt` is a few ms behind. Drop
      // the stale point; appending it would break the monotonic-time
      // contract that lightweight-charts requires. Do NOT mark
      // `hasReal` yet since no observation made it into the buffer.
      return;
    } else {
      const appended = [...prev, { time: nowSec, value: referencePrice }];
      next =
        appended.length > MAX_POINTS_PER_MARKET
          ? appended.slice(-MAX_POINTS_PER_MARKET)
          : appended;
    }

    seedMetaRef.current = { ...seedMetaRef.current, hasReal: true };
    saveHistory(marketId, next, true);
    if (next !== prev) {
      historyRef.current = next;
      setHistory(next);
    }
  }, [dataUpdatedAt, referencePrice, marketId]);

  // Wall-clock tick for the timeframe filter. Without this, the `points`
  // memo below would only recompute when `history` or `timeframe` change,
  // so if polling stalls — backend down, tab backgrounded, laptop asleep
  // — the selected window stops aging and the 1H/4H/1D tabs keep showing
  // datapoints that are already outside the advertised window. Ticking
  // every 30 s gives ~120-step resolution against the shortest window
  // (1H = 3600 s) without churning renders.
  const [nowTick, setNowTick] = useState(() =>
    Math.floor(Date.now() / 1000),
  );
  useEffect(() => {
    const id = window.setInterval(() => {
      setNowTick(Math.floor(Date.now() / 1000));
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);

  // When the book errors out before any real tick has folded into the
  // buffer, suppress the synth so the consumer's existing "Chart
  // unavailable" error path can render. Without this, a seeded tab with
  // a failing backend would silently show fabricated prices. Once at
  // least one real observation has landed — tracked explicitly on the
  // seed meta so same-second overwrites still count — we keep serving
  // the buffer even on transient errors; dropping real observed data on
  // every error blink is worse than tolerating a brief stale tail.
  const suppressSeedOnError =
    isError &&
    seedMetaRef.current.anchor !== "none" &&
    !seedMetaRef.current.hasReal;

  const points = useMemo(
    () =>
      suppressSeedOnError
        ? []
        : filterByTimeframe(history, timeframe, nowTick),
    [history, timeframe, nowTick, suppressSeedOnError],
  );

  return { points, isLoading, isError };
}
