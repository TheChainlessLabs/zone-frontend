/**
 * Pure utilities for the price chart. No lightweight-charts import — safe to
 * consume from tests running in jsdom without touching the canvas library.
 *
 * The chart is fed by {@link ./hooks/useMidpointHistory} which stamps every
 * observation with `Math.floor(Date.now() / 1000)`, so all times in this
 * module are guaranteed to be real Unix epoch seconds. That lets
 * `filterByTimeframe` do plain wall-clock filtering without any backend-
 * format heuristics.
 */

export type Timeframe = "1H" | "4H" | "1D";

/**
 * Exposed timeframe tabs. We deliberately stop at 1D for now:
 * `useMidpointHistory` stores at most `MAX_BUFFER_POINTS` observations
 * (one per 5 s poll), which bounds real-time retention to a little over
 * a day. Longer windows (1W, 1M) would silently truncate and mislead
 * the user — they can be added once the chart has a server-side
 * historical source to back them.
 */
export const TIMEFRAMES: readonly Timeframe[] = ["1H", "4H", "1D"] as const;

/** Rolling window length in seconds for each timeframe. */
export const TIMEFRAME_WINDOW_SEC: Record<Timeframe, number> = {
  "1H": 60 * 60,
  "4H": 4 * 60 * 60,
  "1D": 24 * 60 * 60,
};

/**
 * A single point on the price chart.
 * Shape matches lightweight-charts `LineData<UTCTimestamp>` so we can pass
 * instances directly into `series.setData()` without a mapping layer.
 */
export interface ChartPoint {
  /** Unix timestamp in seconds (lightweight-charts UTCTimestamp). */
  time: number;
  /** Price value in display units. */
  value: number;
}

/**
 * Keep only points within the rolling timeframe window ending at `nowSec`.
 *
 * `nowSec` defaults to the current wall clock. Tests can pin it for
 * deterministic results. This is plain wall-clock filtering because the
 * only caller (`useMidpointHistory`) always produces real Unix epoch
 * seconds — see that hook's JSDoc for the rationale.
 */
export function filterByTimeframe(
  points: ChartPoint[],
  timeframe: Timeframe,
  nowSec: number = Math.floor(Date.now() / 1000),
): ChartPoint[] {
  if (points.length === 0) return [];
  const cutoff = nowSec - TIMEFRAME_WINDOW_SEC[timeframe];
  return points.filter((p) => p.time >= cutoff);
}
