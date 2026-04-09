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
 * Keep only points within the timeframe window ending at `referenceSec`.
 *
 * When `referenceSec` is omitted, the window is anchored to the **newest
 * point in the dataset** rather than wall-clock time. This is deliberate:
 * the Omega backend's trade timestamps are a monotonic sequencer counter
 * rather than Unix seconds (see `omega-markets/crates/core`), so using
 * `Date.now()` would compare values from two different clocks and drop
 * every point. Anchoring to the newest trade gives correct behavior
 * regardless of whether the backend emits real Unix epochs or a
 * monotonic tick — in both cases "1H" means "the last `windowSec`
 * units of clock the trade stream itself is using".
 *
 * Pass `referenceSec` explicitly in tests that want a deterministic cutoff.
 */
export function filterByTimeframe(
  points: ChartPoint[],
  timeframe: Timeframe,
  referenceSec?: number,
): ChartPoint[] {
  if (points.length === 0) return [];
  const windowSec = TIMEFRAME_WINDOW_SEC[timeframe];
  // Use the newest point in the dataset as the anchor when no explicit
  // reference is provided. Compute via reduce so unsorted input still works.
  const newest =
    referenceSec ??
    points.reduce((max, p) => (p.time > max ? p.time : max), -Infinity);
  const cutoff = newest - windowSec;
  return points.filter((p) => p.time >= cutoff);
}
