/**
 * Pure utilities for the price chart. No lightweight-charts import — safe to
 * consume from tests running in jsdom without touching the canvas library.
 */

export type Timeframe = "1H" | "4H" | "1D" | "1W" | "1M";

export const TIMEFRAMES: readonly Timeframe[] = ["1H", "4H", "1D", "1W", "1M"] as const;

/** Rolling window length in seconds for each timeframe. */
export const TIMEFRAME_WINDOW_SEC: Record<Timeframe, number> = {
  "1H": 60 * 60,
  "4H": 4 * 60 * 60,
  "1D": 24 * 60 * 60,
  "1W": 7 * 24 * 60 * 60,
  "1M": 30 * 24 * 60 * 60,
};

/**
 * A single point on the price chart.
 * Shape matches lightweight-charts `LineData<UTCTimestamp>` so we can pass
 * instances directly into `series.setData()` without a mapping layer.
 */
export interface ChartPoint {
  /** Unix timestamp in seconds (lightweight-charts UTCTimestamp). */
  time: number;
  /** Price value in display units (already decoded from u128). */
  value: number;
}

export interface RawTradeForChart {
  /** Unix timestamp in seconds. */
  timestamp: number;
  /** Decoded price. */
  price: number;
}

/**
 * Transform raw trades into chart points. Sorts ascending by timestamp and
 * dedupes by second, keeping the last price for each second (lightweight-charts
 * rejects duplicate timestamps).
 */
export function tradesToPoints(trades: RawTradeForChart[]): ChartPoint[] {
  if (trades.length === 0) return [];

  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const byTime = new Map<number, number>();
  for (const t of sorted) {
    byTime.set(t.timestamp, t.price);
  }

  return Array.from(byTime.entries())
    .map(([time, value]) => ({ time, value }))
    .sort((a, b) => a.time - b.time);
}

/**
 * Any value >= this threshold (2001-09-09 UTC) is treated as a real Unix
 * epoch timestamp. Anything smaller is interpreted as a monotonic sequencer
 * counter. See `filterByTimeframe` below for why this distinction matters.
 */
export const UNIX_EPOCH_THRESHOLD_SEC = 1_000_000_000;

/**
 * Keep only points within the timeframe window ending at the chosen anchor.
 *
 * ### Anchor selection
 * - If the caller passes `referenceSec`, that value is used directly (tests).
 * - Otherwise, the anchor depends on whether the newest point "looks like" a
 *   Unix epoch (`>= UNIX_EPOCH_THRESHOLD_SEC`):
 *   - **Unix epoch path**: anchor to `Math.floor(Date.now() / 1000)`.
 *     "1H" means the last hour of wall-clock time, so quiet markets
 *     correctly show an empty window when no recent trades exist.
 *   - **Monotonic counter path**: anchor to the newest point in the dataset.
 *     The Omega backend's trade `timestamp` field is a sequencer counter
 *     (see `omega-markets/crates/engine/src/sequencer.rs` `next_timestamp`
 *     — a plain `AtomicU64::fetch_add(1)`) rather than Unix seconds,
 *     because the deterministic state machine deliberately has no wall
 *     clock. Without this branch `Date.now()` would compare the web
 *     client's real time against small counter values (1, 2, 3 …) and
 *     drop every point.
 *
 * This hybrid keeps the chart visually functional on the current backend
 * while also giving correct "last hour / last day" semantics if the backend
 * is ever migrated to Unix timestamps, with zero config changes required.
 */
export function filterByTimeframe(
  points: ChartPoint[],
  timeframe: Timeframe,
  referenceSec?: number,
): ChartPoint[] {
  if (points.length === 0) return [];
  const windowSec = TIMEFRAME_WINDOW_SEC[timeframe];

  // Compute the newest point defensively so unsorted input still works.
  const newest = points.reduce(
    (max, p) => (p.time > max ? p.time : max),
    -Infinity,
  );

  let anchor: number;
  if (referenceSec !== undefined) {
    anchor = referenceSec;
  } else if (newest >= UNIX_EPOCH_THRESHOLD_SEC) {
    // Real Unix epoch — anchor to wall clock so "1H" = last hour.
    anchor = Math.floor(Date.now() / 1000);
  } else {
    // Monotonic sequencer counter — anchor to the newest counter value.
    anchor = newest;
  }

  const cutoff = anchor - windowSec;
  return points.filter((p) => p.time >= cutoff);
}
