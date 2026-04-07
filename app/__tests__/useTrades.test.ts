import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockUseQuery = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("../lib/hooks/useMarket", () => ({
  useMarket: () => ({ marketId: 1, setMarketId: vi.fn() }),
}));

vi.mock("../lib/apiClient", () => ({
  getTrades: vi.fn(),
}));

import { useTrades } from "../lib/hooks/useTrades";
import type { ApiTrade } from "../lib/apiTypes";

beforeEach(() => {
  mockUseQuery.mockReset();
});

const mockApiTrade: ApiTrade = {
  id: 1,
  market_id: 1,
  timestamp: 1712345678,
  maker_order_id: 1,
  taker_order_id: 2,
  maker_account_id: 1,
  taker_account_id: 2,
  price: "1085600000000000000",
  quantity: "125000000000",
  maker_side: "Buy",
};

describe("useTrades", () => {
  it("returns loading state", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const { result } = renderHook(() => useTrades());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.trades).toEqual([]);
  });

  it("returns error state", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const { result } = renderHook(() => useTrades());

    expect(result.current.isError).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.trades).toEqual([]);
  });

  it("returns empty trades when data has no trades", () => {
    mockUseQuery.mockReturnValue({
      data: { market_id: 1, trades: [] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useTrades());

    expect(result.current.trades).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("maps API trades correctly with decoded price and quantity", () => {
    mockUseQuery.mockReturnValue({
      data: { market_id: 1, trades: [mockApiTrade] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useTrades());

    expect(result.current.trades).toHaveLength(1);
    const trade = result.current.trades[0];
    // price: 1085600000000000000 / 1e18 = 1.0856
    expect(trade.price).toBeCloseTo(1.0856, 4);
    // quantity: 125000000000 / 1e6 = 125000
    expect(trade.size).toBe(125000);
    expect(trade.pair).toBe("EUR/USD");
  });

  it("formats size correctly with K suffix for large amounts", () => {
    mockUseQuery.mockReturnValue({
      data: { market_id: 1, trades: [mockApiTrade] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useTrades());

    const trade = result.current.trades[0];
    // 125000 >= 1000 so should format as "€125K"
    expect(trade.sizeFormatted).toBe("€125K");
  });

  it("formats size without K suffix for small amounts", () => {
    const smallTrade: ApiTrade = {
      ...mockApiTrade,
      quantity: "500000000", // 500 (6 decimals)
    };

    mockUseQuery.mockReturnValue({
      data: { market_id: 1, trades: [smallTrade] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useTrades());

    const trade = result.current.trades[0];
    expect(trade.size).toBe(500);
    expect(trade.sizeFormatted).toBe("€500");
  });

  it("maps side to lowercase", () => {
    mockUseQuery.mockReturnValue({
      data: { market_id: 1, trades: [mockApiTrade] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useTrades());

    expect(result.current.trades[0].side).toBe("buy");

    // Test Sell side
    const sellTrade: ApiTrade = { ...mockApiTrade, maker_side: "Sell" };
    mockUseQuery.mockReturnValue({
      data: { market_id: 1, trades: [sellTrade] },
      isLoading: false,
      isError: false,
    });

    const { result: result2 } = renderHook(() => useTrades());

    expect(result2.current.trades[0].side).toBe("sell");
  });

  it("formats time from unix timestamp", () => {
    mockUseQuery.mockReturnValue({
      data: { market_id: 1, trades: [mockApiTrade] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useTrades());

    const trade = result.current.trades[0];
    // timestamp 1712345678 * 1000 → Date → toLocaleTimeString with hour12: false
    const expected = new Date(1712345678 * 1000).toLocaleTimeString("en-US", {
      hour12: false,
    });
    expect(trade.time).toBe(expected);
  });

  it("handles unknown market ID", () => {
    const unknownMarketTrade: ApiTrade = { ...mockApiTrade, market_id: 99 };

    mockUseQuery.mockReturnValue({
      data: { market_id: 99, trades: [unknownMarketTrade] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useTrades());

    expect(result.current.trades[0].pair).toBe("Market 99");
  });

  it("passes correct query key and options to useQuery", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderHook(() => useTrades());

    const queryConfig = mockUseQuery.mock.calls[0][0];
    expect(queryConfig.queryKey).toEqual(["trades", 1]);
    expect(queryConfig.refetchInterval).toBe(5000);
    expect(typeof queryConfig.queryFn).toBe("function");
  });
});
