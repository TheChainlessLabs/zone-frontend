import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockUseQuery = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("../lib/apiClient", () => ({
  getMarketOrders: vi.fn(),
}));

import { useUserOrders } from "../lib/hooks/useUserOrders";
import type { CurrentOrderView } from "../lib/apiTypes";

beforeEach(() => {
  mockUseQuery.mockReset();
});

function makeOrder(overrides: Partial<CurrentOrderView> = {}): CurrentOrderView {
  return {
    id: 1,
    owner_account_id: 1,
    side: "Buy",
    kind: "Limit",
    price: 1085600000000000000,
    original_quantity: 100000000,
    remaining_quantity: 0,
    status: "Open",
    last_state_change_timestamp: 1712345678,
    ...overrides,
  };
}

describe("useUserOrders", () => {
  it("returns loading state", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.orders).toEqual([]);
    expect(result.current.openOrders).toEqual([]);
  });

  it("filters orders by accountId", () => {
    const orders = [
      makeOrder({ id: 1, owner_account_id: 1 }),
      makeOrder({ id: 2, owner_account_id: 2 }),
      makeOrder({ id: 3, owner_account_id: 1 }),
    ];

    mockUseQuery.mockReturnValue({
      data: { market_id: 1, orders },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    expect(result.current.orders).toHaveLength(2);
    expect(result.current.orders.map((o) => o.id)).toEqual([1, 3]);
  });

  it("decodes price from 18-decimal fixed-point", () => {
    mockUseQuery.mockReturnValue({
      data: { market_id: 1, orders: [makeOrder({ price: 1085600000000000000 })] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    expect(result.current.orders[0].price).toBeCloseTo(1.0856, 4);
  });

  it("decodes quantity from 6-decimal", () => {
    mockUseQuery.mockReturnValue({
      data: {
        market_id: 1,
        orders: [makeOrder({ original_quantity: 100000000, remaining_quantity: 50000000 })],
      },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    expect(result.current.orders[0].amount).toBe(100);
    expect(result.current.orders[0].remaining).toBe(50);
  });

  it("computes filledPercent correctly", () => {
    mockUseQuery.mockReturnValue({
      data: {
        market_id: 1,
        orders: [makeOrder({ original_quantity: 100000000, remaining_quantity: 25000000 })],
      },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    expect(result.current.orders[0].filledPercent).toBe(75);
  });

  it("maps status to lowercase", () => {
    const orders = [
      makeOrder({ id: 1, status: "Open" }),
      makeOrder({ id: 2, status: "Filled" }),
      makeOrder({ id: 3, status: "Cancelled" }),
    ];

    mockUseQuery.mockReturnValue({
      data: { market_id: 1, orders },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    expect(result.current.orders.map((o) => o.status)).toEqual([
      "open",
      "filled",
      "cancelled",
    ]);
  });

  it("returns empty state when no orders match", () => {
    mockUseQuery.mockReturnValue({
      data: { market_id: 1, orders: [makeOrder({ owner_account_id: 99 })] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    expect(result.current.orders).toEqual([]);
    expect(result.current.openOrders).toEqual([]);
  });

  it("openOrders filters to status open only", () => {
    const orders = [
      makeOrder({ id: 1, status: "Open" }),
      makeOrder({ id: 2, status: "Filled" }),
      makeOrder({ id: 3, status: "Open" }),
      makeOrder({ id: 4, status: "Cancelled" }),
    ];

    mockUseQuery.mockReturnValue({
      data: { market_id: 1, orders },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    expect(result.current.openOrders).toHaveLength(2);
    expect(result.current.openOrders.map((o) => o.id)).toEqual([1, 3]);
  });

  it("maps side and kind to lowercase", () => {
    mockUseQuery.mockReturnValue({
      data: {
        market_id: 1,
        orders: [makeOrder({ side: "Sell", kind: "Market" })],
      },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    expect(result.current.orders[0].side).toBe("sell");
    expect(result.current.orders[0].type).toBe("market");
  });

  it("maps pair name from market ID", () => {
    mockUseQuery.mockReturnValue({
      data: { market_id: 1, orders: [makeOrder()] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    expect(result.current.orders[0].pair).toBe("EUR/USD");
  });

  it("formats time from unix timestamp", () => {
    mockUseQuery.mockReturnValue({
      data: { market_id: 1, orders: [makeOrder({ last_state_change_timestamp: 1712345678 })] },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useUserOrders(1, 1));

    const expected = new Date(1712345678 * 1000).toLocaleTimeString("en-US", {
      hour12: false,
    });
    expect(result.current.orders[0].time).toBe(expected);
  });

  it("passes correct query options to useQuery", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderHook(() => useUserOrders(1, 1));

    const queryConfig = mockUseQuery.mock.calls[0][0];
    expect(queryConfig.queryKey).toEqual(["orders", 1]);
    expect(queryConfig.refetchInterval).toBe(5000);
    expect(queryConfig.enabled).toBe(true);
    expect(typeof queryConfig.queryFn).toBe("function");
  });

  it("disables query when accountId is null", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    renderHook(() => useUserOrders(null, 1));

    const queryConfig = mockUseQuery.mock.calls[0][0];
    expect(queryConfig.enabled).toBe(false);
  });
});
