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
 * Keep only points within the timeframe window ending at `nowSec`.
 * `nowSec` defaults to the current wall clock so tests can pin it.
 */
export function filterByTimeframe(
  points: ChartPoint[],
  timeframe: Timeframe,
  nowSec: number = Math.floor(Date.now() / 1000),
): ChartPoint[] {
  const windowSec = TIMEFRAME_WINDOW_SEC[timeframe];
  const cutoff = nowSec - windowSec;
  return points.filter((p) => p.time >= cutoff);
}
