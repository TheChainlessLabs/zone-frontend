import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import { createElement } from "react";
import type { OrderBookResponse } from "@/lib/apiTypes";

// Mock deps before importing the hook under test. We keep controllable
// references so individual tests can mutate the mocked market id and
// order-book state per render.
const marketState = { marketId: 1 };
const bookState: {
  book: OrderBookResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  dataUpdatedAt: number;
} = {
  book: undefined,
  isLoading: false,
  isError: false,
  dataUpdatedAt: 0,
};

vi.mock("@/lib/hooks/useMarket", () => ({
  useMarket: () => ({ marketId: marketState.marketId, setMarketId: vi.fn() }),
}));

vi.mock("@/lib/hooks/useOrderBook", () => ({
  useOrderBook: () => ({
    book: bookState.book,
    midpoint: null,
    isLoading: bookState.isLoading,
    isError: bookState.isError,
    dataUpdatedAt: bookState.dataUpdatedAt,
  }),
}));

import { useMidpointHistory } from "@/lib/hooks/useMidpointHistory";

function setBook(bestBid: string, bestAsk: string, marketId = 1) {
  bookState.book = {
    market_id: marketId,
    bids: [
      {
        id: 1,
        owner_account_id: 1,
        side: "Buy",
        kind: "Limit",
        price: bestBid,
        remaining_quantity: "100000000",
      },
    ],
    asks: [
      {
        id: 2,
        owner_account_id: 2,
        side: "Sell",
        kind: "Limit",
        price: bestAsk,
        remaining_quantity: "100000000",
      },
    ],
  };
}

function resetBook() {
  bookState.book = undefined;
  bookState.isLoading = false;
  bookState.isError = false;
  bookState.dataUpdatedAt = 0;
}

// Deterministic LCG so ±0.3 % walks produce the same series on every
// test run. Tests that assert on value bands must not be flaky under
// random walks over 287 steps.
function seedRandom() {
  let state = 0xdeadbeef;
  vi.spyOn(Math, "random").mockImplementation(() => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  });
}

beforeEach(() => {
  window.sessionStorage.clear();
  marketState.marketId = 1;
  resetBook();
  seedRandom();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("useMidpointHistory — chart seed demo", () => {
  it("returns 288 synthesised candles on 1D when flag on and cache empty", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");

    const { result } = renderHook(() => useMidpointHistory("1D"));

    expect(result.current.points).toHaveLength(288);
    for (const p of result.current.points) {
      expect(Number.isFinite(p.time)).toBe(true);
      expect(Number.isFinite(p.value)).toBe(true);
    }
    // Synth cadence is 5 minutes between adjacent points.
    const pts = result.current.points;
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].time - pts[i - 1].time).toBe(5 * 60);
    }
  });

  it("returns no points when flag is off and cache is empty", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "false");

    const { result } = renderHook(() => useMidpointHistory("1D"));

    expect(result.current.points).toHaveLength(0);
  });

  it("returns no points when flag is unset and cache is empty", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "");

    const { result } = renderHook(() => useMidpointHistory("1D"));

    expect(result.current.points).toHaveLength(0);
  });

  it("does not seed in production even when the flag is on", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    vi.stubEnv("NODE_ENV", "production");

    const { result } = renderHook(() => useMidpointHistory("1D"));

    expect(result.current.points).toHaveLength(0);
  });

  it("seeds around the live reference price when the order book has both sides", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    // Best bid 2.0000, best ask 2.0200 → midpoint 2.0100.
    setBook("2000000000000000000", "2020000000000000000");

    const { result } = renderHook(() => useMidpointHistory("1D"));

    expect(result.current.points).toHaveLength(288);
    // ±0.3 % walk over 287 steps can drift ~10-15 %, so we check the
    // overall band rather than a tight window. The key property is
    // that values sit around 2.01, not near the EUR/USD fallback
    // (~1.09).
    const values = result.current.points.map((p) => p.value);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    expect(avg).toBeGreaterThan(1.7);
    expect(avg).toBeLessThan(2.4);
    for (const v of values) {
      expect(v).toBeGreaterThan(1.3);
    }
  });

  it("realigns a fallback-anchored synth once the live midpoint arrives", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    // Book starts undefined (query still pending) → synth built from
    // the EUR/USD fallback. The values should be in the 1.07–1.10 band.
    const { result, rerender } = renderHook(() => useMidpointHistory("1D"));
    const fallbackSample = result.current.points[287].value;
    expect(fallbackSample).toBeGreaterThan(1.05);
    expect(fallbackSample).toBeLessThan(1.15);

    // Real book lands. The hook must regenerate the synth around the
    // live midpoint rather than keeping a stale fallback series.
    act(() => {
      setBook("2500000000000000000", "2510000000000000000");
      rerender();
    });

    expect(result.current.points).toHaveLength(288);
    // Check several points rather than just the tail — a ±0.3 % walk
    // over 287 steps can occasionally drift further than ~15 %, but
    // every point must still be unambiguously in market 2's band
    // (≈2.5), never the EUR/USD fallback (≈1.09).
    const liveValues = result.current.points.map((p) => p.value);
    const avg =
      liveValues.reduce((sum, v) => sum + v, 0) / liveValues.length;
    expect(avg).toBeGreaterThan(2.0);
    expect(avg).toBeLessThan(3.0);
    for (const v of liveValues) {
      expect(v).toBeGreaterThan(1.5);
    }
  });

  it("appends a real midpoint tick onto the synthesised history", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    setBook("1085000000000000000", "1086000000000000000");

    const { result, rerender } = renderHook(() => useMidpointHistory("1D"));
    expect(result.current.points).toHaveLength(288);
    const synthLast = result.current.points[287];

    // Simulate a real order-book poll one second after the synth
    // terminus. The append effect should add exactly one point keyed
    // by `dataUpdatedAt`.
    act(() => {
      setBook("1090000000000000000", "1091000000000000000");
      bookState.dataUpdatedAt = (synthLast.time + 1) * 1000;
      rerender();
    });

    expect(result.current.points.length).toBe(289);
    const appended = result.current.points[288];
    expect(appended.time).toBeGreaterThan(synthLast.time);
    expect(appended.value).toBeCloseTo(1.0905, 6);
  });

  it("persists a live-anchored synth so a remount reuses it", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    setBook("1500000000000000000", "1502000000000000000");

    const { result: first, unmount } = renderHook(() =>
      useMidpointHistory("1D"),
    );
    const firstSeries = first.current.points;
    expect(firstSeries).toHaveLength(288);
    unmount();

    const { result: second } = renderHook(() => useMidpointHistory("1D"));
    expect(second.current.points).toHaveLength(288);
    expect(second.current.points[0].value).toBe(firstSeries[0].value);
    expect(second.current.points[287].value).toBe(firstSeries[287].value);
  });

  it("does not persist a fallback-anchored synth", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    // Book undefined → fallback anchor. Provisional synth must not be
    // committed to sessionStorage, so the next session can roll a
    // fresh series rather than locking in a wrong price.
    const { unmount } = renderHook(() => useMidpointHistory("1D"));
    unmount();

    const storageKey = "omega:chart:midpoint-history:v2:1";
    expect(window.sessionStorage.getItem(storageKey)).toBeNull();
  });

  it("drops a stale real tick whose dataUpdatedAt precedes the synth tail", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    setBook("1085000000000000000", "1086000000000000000");

    const { result, rerender } = renderHook(() => useMidpointHistory("1D"));
    expect(result.current.points).toHaveLength(288);
    const synthLast = result.current.points[287];
    const originalTailValue = synthLast.value;

    // Simulate react-query landing `dataUpdatedAt` a couple of seconds
    // before the synth terminus (cached fetch, clock skew, etc.). The
    // append effect must drop the stale observation rather than
    // insert it out of order and violate the monotonic-time contract.
    act(() => {
      bookState.dataUpdatedAt = (synthLast.time - 2) * 1000;
      rerender();
    });

    expect(result.current.points).toHaveLength(288);
    expect(result.current.points[287].time).toBe(synthLast.time);
    expect(result.current.points[287].value).toBe(originalTailValue);
    // Adjacency check — if a stale point had been inserted the gap would
    // be negative somewhere.
    for (let i = 1; i < result.current.points.length; i++) {
      expect(
        result.current.points[i].time - result.current.points[i - 1].time,
      ).toBeGreaterThan(0);
    }
  });

  it("suppresses the seed when the book errors before any real tick arrives", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    // isError=true with no real observations → hook must return an
    // empty series so the consumer's "Chart unavailable" path can
    // render. Otherwise a failing backend on a seeded tab would
    // silently show fabricated prices.
    bookState.isError = true;

    const { result } = renderHook(() => useMidpointHistory("1D"));

    expect(result.current.isError).toBe(true);
    expect(result.current.points).toHaveLength(0);
  });

  it("reads a legacy v2 plain-array buffer without the meta sidecar", () => {
    // Pre-seed-feature sessionStorage schema: a bare JSON array of
    // ChartPoints under `omega:chart:midpoint-history:v2:<id>`, no
    // sidecar meta key. Must still load — otherwise the seed feature
    // would silently drop existing users' observed history.
    const now = Math.floor(Date.now() / 1000);
    const legacyPoints = [
      { time: now - 120, value: 1.1 },
      { time: now - 60, value: 1.11 },
    ];
    window.sessionStorage.setItem(
      "omega:chart:midpoint-history:v2:1",
      JSON.stringify(legacyPoints),
    );
    // No meta sidecar written — must default to treating it as real.
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "false");

    const { result } = renderHook(() => useMidpointHistory("1D"));
    expect(result.current.points).toEqual(legacyPoints);
  });

  it("appends exactly one point under StrictMode double-invocation", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    setBook("1085000000000000000", "1086000000000000000");

    const StrictWrapper = ({ children }: { children: ReactNode }) =>
      createElement(StrictMode, null, children);

    const { result, rerender } = renderHook(
      () => useMidpointHistory("1D"),
      { wrapper: StrictWrapper },
    );
    expect(result.current.points).toHaveLength(288);
    const synthLast = result.current.points[287];

    // Under StrictMode React re-invokes state updaters and re-runs
    // effects in dev. The append path must be idempotent — the
    // side-effect side (saveHistory, seedMetaRef mutation) lives
    // outside the setHistory updater, so a replayed updater cannot
    // double-write storage or mis-mark provenance.
    act(() => {
      setBook("1090000000000000000", "1091000000000000000");
      bookState.dataUpdatedAt = (synthLast.time + 1) * 1000;
      rerender();
    });

    expect(result.current.points).toHaveLength(289);
    const appended = result.current.points[288];
    expect(appended.value).toBeCloseTo(1.0905, 6);
    // Adjacency check — no duplicate or out-of-order entries.
    for (let i = 1; i < result.current.points.length; i++) {
      expect(
        result.current.points[i].time - result.current.points[i - 1].time,
      ).toBeGreaterThan(0);
    }
  });

  it("keeps a legacy buffer on a transient error instead of suppressing it", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    // A pre-seed-feature buffer carrying real observations has no
    // sidecar meta. When the book errors, the hook MUST NOT
    // misclassify it as synthetic and drop it — that would be a prod
    // regression for users upgrading with sessionStorage carryover.
    const now = Math.floor(Date.now() / 1000);
    const legacyPoints = [
      { time: now - 300, value: 1.09 },
      { time: now - 60, value: 1.1 },
    ];
    window.sessionStorage.setItem(
      "omega:chart:midpoint-history:v2:1",
      JSON.stringify(legacyPoints),
    );
    bookState.isError = true;

    const { result } = renderHook(() => useMidpointHistory("1D"));
    expect(result.current.isError).toBe(true);
    expect(result.current.points).toEqual(legacyPoints);
  });

  it("suppresses a persisted synth on remount when the first fetch errors", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    // First mount with a healthy book: persists a live-anchored synth
    // to sessionStorage (but no real tick is ever appended).
    setBook("1500000000000000000", "1502000000000000000");
    const { unmount } = renderHook(() => useMidpointHistory("1D"));
    unmount();
    expect(
      window.sessionStorage.getItem("omega:chart:midpoint-history:v2:1"),
    ).not.toBeNull();
    expect(
      window.sessionStorage.getItem("omega:chart:midpoint-history-meta:v1:1"),
    ).toBe(JSON.stringify({ hasReal: false }));

    // Second mount: the book fails before any real tick lands. The
    // persisted buffer is still synthetic; provenance (`hasReal=false`)
    // must survive the storage round-trip so the error path wins.
    resetBook();
    bookState.isError = true;
    const { result } = renderHook(() => useMidpointHistory("1D"));

    expect(result.current.isError).toBe(true);
    expect(result.current.points).toHaveLength(0);
  });

  it("keeps serving the buffer on a post-tick error even if the tick collapsed into same-second", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    setBook("1085000000000000000", "1086000000000000000");

    const { result, rerender } = renderHook(() => useMidpointHistory("1D"));
    const synthLast = result.current.points[287];
    expect(result.current.points).toHaveLength(288);

    // Real tick arrives in the exact same second as the synth tail —
    // same-second overwrite path. Length stays at 288, but the buffer
    // now holds a real observation.
    act(() => {
      setBook("1090000000000000000", "1091000000000000000");
      bookState.dataUpdatedAt = synthLast.time * 1000;
      rerender();
    });
    expect(result.current.points).toHaveLength(288);

    // Now the book errors on the next poll. Buffer must still render
    // because `hasReal=true` survived the same-second overwrite — the
    // alternative would drop real observed data on every error blink.
    act(() => {
      bookState.isError = true;
      rerender();
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.points).toHaveLength(288);
  });

  it("re-seeds per-market when the active market changes without cross-contaminating storage", () => {
    vi.stubEnv("NEXT_PUBLIC_CHART_SEED_DEMO", "true");
    setBook("1500000000000000000", "1502000000000000000", 1);

    const { result, rerender, unmount } = renderHook(() =>
      useMidpointHistory("1D"),
    );
    expect(result.current.points).toHaveLength(288);
    const marketOneStorageKey = "omega:chart:midpoint-history:v2:1";
    const marketTwoStorageKey = "omega:chart:midpoint-history:v2:2";
    const marketOneStored = window.sessionStorage.getItem(marketOneStorageKey);
    expect(marketOneStored).not.toBeNull();
    const marketOneValues = (
      JSON.parse(marketOneStored as string) as Array<{ value: number }>
    ).map((p) => p.value);

    // Swap to market 2 with a completely different price level.
    act(() => {
      marketState.marketId = 2;
      setBook("3000000000000000000", "3010000000000000000", 2);
      rerender();
    });

    expect(result.current.points).toHaveLength(288);
    // Market 2's live values must sit around 3.00, not market 1's
    // ~1.50. Allow ±15 % drift from the ±0.3 % walk × 287 steps.
    const marketTwoAvg =
      result.current.points.reduce((s, p) => s + p.value, 0) /
      result.current.points.length;
    expect(marketTwoAvg).toBeGreaterThan(2.5);
    expect(marketTwoAvg).toBeLessThan(3.5);
    for (const p of result.current.points) {
      expect(p.value).toBeGreaterThan(2.2);
    }

    // Market 1's persisted buffer must still hold its own series —
    // the market-switch path must not overwrite it with market 2's
    // synth or the other way around.
    const marketOneStoredAfter =
      window.sessionStorage.getItem(marketOneStorageKey);
    expect(marketOneStoredAfter).not.toBeNull();
    const marketOneValuesAfter = (
      JSON.parse(marketOneStoredAfter as string) as Array<{ value: number }>
    ).map((p) => p.value);
    expect(marketOneValuesAfter).toEqual(marketOneValues);
    // Sanity: they are clearly not market 2 values.
    for (const v of marketOneValuesAfter) {
      expect(v).toBeLessThan(2);
    }

    // Market 2's persisted buffer must be its *own* synth, not a stale
    // copy of market 1's. This locks down the cross-market persistence
    // race: the previous-render history belongs to market 1 but the
    // post-switch saveHistory call must only ever write market 2's
    // freshly-built buffer under market 2's key.
    const marketTwoStored = window.sessionStorage.getItem(marketTwoStorageKey);
    expect(marketTwoStored).not.toBeNull();
    const marketTwoValues = (
      JSON.parse(marketTwoStored as string) as Array<{ value: number }>
    ).map((p) => p.value);
    const marketTwoStoredAvg =
      marketTwoValues.reduce((s, v) => s + v, 0) / marketTwoValues.length;
    expect(marketTwoStoredAvg).toBeGreaterThan(2.5);
    expect(marketTwoStoredAvg).toBeLessThan(3.5);
    for (const v of marketTwoValues) {
      expect(v).toBeGreaterThan(2.2);
    }

    // Round-trip: a remount on market 2 must read back market 2's
    // series, not a mixed or stale one.
    unmount();
    marketState.marketId = 2;
    setBook("3000000000000000000", "3010000000000000000", 2);
    const { result: remount } = renderHook(() => useMidpointHistory("1D"));
    expect(remount.current.points).toHaveLength(288);
    expect(remount.current.points.map((p) => p.value)).toEqual(
      marketTwoValues,
    );
  });
});
