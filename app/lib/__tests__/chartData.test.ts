import { describe, it, expect } from "vitest";
import {
  TIMEFRAMES,
  TIMEFRAME_WINDOW_SEC,
  filterByTimeframe,
  tradesToPoints,
  type ChartPoint,
} from "../chartData";

// Fixed reference time for deterministic cutoffs.
const NOW_SEC = 1_800_000_000; // 2027-01-15T08:00:00Z ish — any fixed epoch works.
const HOUR = 60 * 60;
const DAY = 24 * HOUR;

describe("tradesToPoints", () => {
  it("returns an empty array for empty input", () => {
    expect(tradesToPoints([])).toEqual([]);
  });

  it("sorts trades ascending by timestamp", () => {
    const out = tradesToPoints([
      { timestamp: NOW_SEC, price: 1.09 },
      { timestamp: NOW_SEC - HOUR, price: 1.08 },
      { timestamp: NOW_SEC - 2 * HOUR, price: 1.07 },
    ]);
    expect(out).toEqual([
      { time: NOW_SEC - 2 * HOUR, value: 1.07 },
      { time: NOW_SEC - HOUR, value: 1.08 },
      { time: NOW_SEC, value: 1.09 },
    ]);
  });

  it("dedupes by timestamp, keeping the last price for each second", () => {
    const out = tradesToPoints([
      { timestamp: NOW_SEC, price: 1.08 },
      { timestamp: NOW_SEC, price: 1.085 },
      { timestamp: NOW_SEC, price: 1.09 },
    ]);
    expect(out).toEqual([{ time: NOW_SEC, value: 1.09 }]);
  });

  it("preserves distinct timestamps after dedupe", () => {
    const out = tradesToPoints([
      { timestamp: NOW_SEC - 60, price: 1.08 },
      { timestamp: NOW_SEC - 60, price: 1.081 }, // dedupes
      { timestamp: NOW_SEC, price: 1.09 },
    ]);
    expect(out).toEqual([
      { time: NOW_SEC - 60, value: 1.081 },
      { time: NOW_SEC, value: 1.09 },
    ]);
  });
});

describe("filterByTimeframe", () => {
  const makePoints = (offsetsSec: number[]): ChartPoint[] =>
    offsetsSec.map((off) => ({ time: NOW_SEC - off, value: 1.0 + off / 1e6 }));

  it("returns an empty array when input is empty", () => {
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

  it("exposes consistent window lengths", () => {
    expect(TIMEFRAME_WINDOW_SEC["1H"]).toBe(3600);
    expect(TIMEFRAME_WINDOW_SEC["4H"]).toBe(14_400);
    expect(TIMEFRAME_WINDOW_SEC["1D"]).toBe(86_400);
    expect(TIMEFRAME_WINDOW_SEC["1W"]).toBe(604_800);
    expect(TIMEFRAME_WINDOW_SEC["1M"]).toBe(2_592_000);
  });

  // These tests cover the hybrid anchor logic that reconciles two facts:
  //  1. The Omega backend ships trade `timestamp` as a monotonic sequencer
  //     counter (e.g. 1, 2, 3…), not Unix seconds — see
  //     omega-markets/crates/engine/src/sequencer.rs `next_timestamp`.
  //  2. If the backend ever adopts real Unix epochs, timeframes should mean
  //     "last hour / last day" in actual wall-clock time.
  // `filterByTimeframe` picks the right anchor automatically based on
  // whether the newest point >= UNIX_EPOCH_THRESHOLD_SEC (~2001-09-09 UTC).
  describe("default reference (no explicit referenceSec)", () => {
    describe("monotonic counter path (newest < threshold)", () => {
      it("anchors to the newest counter value, not wall clock", () => {
        // Without the monotonic branch, `Date.now()/1000 - 3600` (~1.8e9) would
        // exceed every time value and drop the whole dataset.
        const points: ChartPoint[] = [
          { time: 1, value: 1.08 },
          { time: 2, value: 1.085 },
          { time: 3, value: 1.09 },
        ];
        const out = filterByTimeframe(points, "1H");
        expect(out).toHaveLength(3);
        expect(out.map((p) => p.time)).toEqual([1, 2, 3]);
      });

      it("drops points older than (newest - window) when counter-based", () => {
        // Newest is 10_000. 1H window = 3600. Cutoff = 6400.
        const points: ChartPoint[] = [
          { time: 1_000, value: 1.0 }, // out
          { time: 6_399, value: 1.0 }, // out
          { time: 6_400, value: 1.0 }, // in (boundary)
          { time: 8_000, value: 1.0 }, // in
          { time: 10_000, value: 1.0 }, // in (newest)
        ];
        const out = filterByTimeframe(points, "1H");
        expect(out.map((p) => p.time)).toEqual([6_400, 8_000, 10_000]);
      });

      it("finds the newest counter even when input is not sorted ascending", () => {
        const points: ChartPoint[] = [
          { time: 10_000, value: 1.0 }, // newest
          { time: 1_000, value: 1.0 }, // oldest (out)
          { time: 8_000, value: 1.0 }, // in
        ];
        const out = filterByTimeframe(points, "1H");
        expect(out).toHaveLength(2);
        expect(out.map((p) => p.time).sort((a, b) => a - b)).toEqual([
          8_000, 10_000,
        ]);
      });
    });

    describe("unix epoch path (newest >= threshold)", () => {
      it("anchors to wall clock so quiet markets filter out stale trades", () => {
        // All points are real Unix epochs from 10 years ago — should be
        // filtered out when using a 1H window because `Date.now()` is much
        // later than these points.
        const tenYearsAgo = 1_500_000_000; // 2017-07-14 UTC
        const points: ChartPoint[] = [
          { time: tenYearsAgo, value: 1.0 },
          { time: tenYearsAgo + 60, value: 1.0 },
          { time: tenYearsAgo + 120, value: 1.0 },
        ];
        const out = filterByTimeframe(points, "1H");
        expect(
          out,
          "stale unix-epoch trades should be excluded from 1H window",
        ).toHaveLength(0);
      });

      it("includes recent unix-epoch points within the window", () => {
        const now = Math.floor(Date.now() / 1000);
        const points: ChartPoint[] = [
          { time: now - 10 * 60, value: 1.0 }, // 10 min ago — in 1H
          { time: now - 30 * 60, value: 1.0 }, // 30 min ago — in 1H
          { time: now - 2 * 60 * 60, value: 1.0 }, // 2 hours ago — out of 1H
        ];
        const out = filterByTimeframe(points, "1H");
        expect(out).toHaveLength(2);
      });
    });

    it("returns an empty array when input is empty (no anchor available)", () => {
      expect(filterByTimeframe([], "1D")).toEqual([]);
    });
  });
});
