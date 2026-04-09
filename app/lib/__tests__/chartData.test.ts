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
});
