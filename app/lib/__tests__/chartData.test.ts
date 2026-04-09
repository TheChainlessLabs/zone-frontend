import { describe, it, expect } from "vitest";
import {
  TIMEFRAMES,
  TIMEFRAME_WINDOW_SEC,
  filterByTimeframe,
  type ChartPoint,
} from "../chartData";

// Fixed reference time for deterministic cutoffs. The exact value doesn't
// matter — these tests pin `nowSec` explicitly so there's no dependency on
// wall clock.
const NOW_SEC = 1_800_000_000; // ~2027-01-15
const HOUR = 60 * 60;
const DAY = 24 * HOUR;

const makePoints = (offsetsSec: number[]): ChartPoint[] =>
  offsetsSec.map((off) => ({ time: NOW_SEC - off, value: 1.0 + off / 1e6 }));

describe("filterByTimeframe", () => {
  it("returns an empty array for empty input", () => {
    expect(filterByTimeframe([], "1H", NOW_SEC)).toEqual([]);
  });

  it("keeps every point when all are within the window", () => {
    const points = makePoints([0, 60, 600, 3500]);
    const out = filterByTimeframe(points, "1H", NOW_SEC);
    expect(out).toHaveLength(4);
    // filterByTimeframe preserves input order — it's a pure filter.
    expect(out.map((p) => NOW_SEC - p.time).sort((a, b) => a - b)).toEqual([
      0, 60, 600, 3500,
    ]);
  });

  it("drops points older than the cutoff for 1H", () => {
    const points = makePoints([
      0, // now
      1800, // 30m ago — in
      3599, // just in
      3601, // just out
      HOUR * 2, // way out
    ]);
    const out = filterByTimeframe(points, "1H", NOW_SEC);
    expect(out.map((p) => NOW_SEC - p.time)).toEqual([0, 1800, 3599]);
  });

  it("applies the correct window for every declared timeframe", () => {
    for (const tf of TIMEFRAMES) {
      const windowSec = TIMEFRAME_WINDOW_SEC[tf];
      const points = makePoints([0, windowSec - 1, windowSec + 1]);
      const out = filterByTimeframe(points, tf, NOW_SEC);
      expect(out.map((p) => NOW_SEC - p.time)).toEqual([0, windowSec - 1]);
    }
  });

  it("includes a point exactly at the cutoff boundary", () => {
    const points = makePoints([DAY]); // exactly 1 day old
    const out = filterByTimeframe(points, "1D", NOW_SEC);
    // cutoff = NOW - DAY, and point.time = NOW - DAY, so point.time >= cutoff → included.
    expect(out).toHaveLength(1);
  });

  it("preserves input order of kept points (does not sort)", () => {
    const points: ChartPoint[] = [
      { time: NOW_SEC - 10, value: 1.0 },
      { time: NOW_SEC - 30, value: 1.0 },
      { time: NOW_SEC - 20, value: 1.0 },
    ];
    const out = filterByTimeframe(points, "1H", NOW_SEC);
    expect(out.map((p) => p.time)).toEqual([
      NOW_SEC - 10,
      NOW_SEC - 30,
      NOW_SEC - 20,
    ]);
  });

  it("drops stale Unix-epoch points from a quiet market in the 1H window", () => {
    // Simulates Codex's concern: a market that hasn't traded in 10 years
    // should not fill up the 1H tab with decade-old points.
    const tenYearsAgo = NOW_SEC - 10 * 365 * DAY;
    const points: ChartPoint[] = [
      { time: tenYearsAgo, value: 1.0 },
      { time: tenYearsAgo + 60, value: 1.0 },
      { time: tenYearsAgo + 3500, value: 1.0 },
    ];
    const out = filterByTimeframe(points, "1H", NOW_SEC);
    expect(out).toHaveLength(0);
  });

  it("exposes consistent window lengths", () => {
    expect(TIMEFRAME_WINDOW_SEC["1H"]).toBe(3600);
    expect(TIMEFRAME_WINDOW_SEC["4H"]).toBe(14_400);
    expect(TIMEFRAME_WINDOW_SEC["1D"]).toBe(86_400);
  });

  it("exposes exactly three timeframes (1H, 4H, 1D)", () => {
    // Longer windows are intentionally withheld until the chart has a
    // server-side history source — see useMidpointHistory.ts JSDoc.
    expect([...TIMEFRAMES]).toEqual(["1H", "4H", "1D"]);
  });
});
