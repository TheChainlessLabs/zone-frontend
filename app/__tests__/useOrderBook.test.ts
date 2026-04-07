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
  getOrderBook: vi.fn(),
}));

import { useOrderBook } from "../lib/hooks/useOrderBook";
import type { OrderBookResponse } from "../lib/apiTypes";

const mockBook: OrderBookResponse = {
  market_id: 1,
  bids: [
    {
      id: 1,
      owner_account_id: 1,
      side: "Buy",
      kind: "Limit",
      price: "1085600000000000000",
      remaining_quantity: "100000000",
    },
  ],
  asks: [
    {
      id: 2,
      owner_account_id: 2,
      side: "Sell",
      kind: "Limit",
      price: "1086000000000000000",
      remaining_quantity: "100000000",
    },
  ],
};

beforeEach(() => {
  mockUseQuery.mockReset();
});

describe("useOrderBook", () => {
  it("returns loading state", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const { result } = renderHook(() => useOrderBook());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.book).toBeUndefined();
    expect(result.current.midpoint).toBeNull();
  });

  it("returns error state", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const { result } = renderHook(() => useOrderBook());

    expect(result.current.isError).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.book).toBeUndefined();
    expect(result.current.midpoint).toBeNull();
  });

  it("returns empty book with null midpoint", () => {
    const emptyBook: OrderBookResponse = {
      market_id: 1,
      bids: [],
      asks: [],
    };
    mockUseQuery.mockReturnValue({
      data: emptyBook,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useOrderBook());

    expect(result.current.book).toEqual(emptyBook);
    expect(result.current.midpoint).toBeNull();
  });

  it("computes midpoint correctly from bids and asks", () => {
    mockUseQuery.mockReturnValue({
      data: mockBook,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useOrderBook());

    // (1.0856 + 1.0860) / 2 = 1.0858
    expect(result.current.midpoint).toBeCloseTo(1.0858, 6);
  });

  it("returns null midpoint when no bids", () => {
    const noBids: OrderBookResponse = {
      market_id: 1,
      bids: [],
      asks: mockBook.asks,
    };
    mockUseQuery.mockReturnValue({
      data: noBids,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useOrderBook());

    expect(result.current.midpoint).toBeNull();
  });

  it("returns null midpoint when no asks", () => {
    const noAsks: OrderBookResponse = {
      market_id: 1,
      bids: mockBook.bids,
      asks: [],
    };
    mockUseQuery.mockReturnValue({
      data: noAsks,
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useOrderBook());

    expect(result.current.midpoint).toBeNull();
  });

  it("passes correct query key and refetch interval", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderHook(() => useOrderBook());

    const queryConfig = mockUseQuery.mock.calls[0][0];
    expect(queryConfig.queryKey).toEqual(["book", 1]);
    expect(queryConfig.refetchInterval).toBe(5000);
  });
});
