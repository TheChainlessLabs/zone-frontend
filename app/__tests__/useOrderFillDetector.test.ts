import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockAddNotification = vi.fn();

vi.mock("../lib/useNotifications", () => ({
  useNotifications: () => ({
    addNotification: mockAddNotification,
    notifications: [],
    unreadCount: 0,
    markAllRead: vi.fn(),
  }),
}));

import { useOrderFillDetector } from "../lib/hooks/useOrderFillDetector";
import type { UserOrder } from "../lib/hooks/useUserOrders";

function makeOrder(overrides: Partial<UserOrder> = {}): UserOrder {
  return {
    id: 1,
    pair: "EUR/USD",
    side: "buy",
    type: "limit",
    amount: 100,
    remaining: 0,
    price: 1.0856,
    filledPercent: 0,
    status: "open",
    time: "12:00:00",
    ...overrides,
  };
}

beforeEach(() => {
  mockAddNotification.mockClear();
});

describe("useOrderFillDetector", () => {
  it("does not notify on initial render with existing fills", () => {
    const orders = [makeOrder({ id: 1, status: "filled" })];
    renderHook(() => useOrderFillDetector(orders));

    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it("notifies when an order transitions from open to filled", () => {
    const openOrders = [makeOrder({ id: 1, status: "open" })];
    const { rerender } = renderHook(
      ({ orders }) => useOrderFillDetector(orders),
      { initialProps: { orders: openOrders } },
    );

    const filledOrders = [makeOrder({ id: 1, status: "filled" })];
    rerender({ orders: filledOrders });

    expect(mockAddNotification).toHaveBeenCalledTimes(1);
    expect(mockAddNotification).toHaveBeenCalledWith(
      "order_filled",
      "Order Filled",
      "buy 100 EUR/USD @ 1.0856",
    );
  });

  it("does not notify when order stays open", () => {
    const openOrders = [makeOrder({ id: 1, status: "open" })];
    const { rerender } = renderHook(
      ({ orders }) => useOrderFillDetector(orders),
      { initialProps: { orders: openOrders } },
    );

    rerender({ orders: [makeOrder({ id: 1, status: "open" })] });

    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it("does not notify for new orders that appear already filled", () => {
    const openOrders = [makeOrder({ id: 1, status: "open" })];
    const { rerender } = renderHook(
      ({ orders }) => useOrderFillDetector(orders),
      { initialProps: { orders: openOrders } },
    );

    // A new order (id=2) appears already filled — no prev status tracked
    rerender({
      orders: [
        makeOrder({ id: 1, status: "open" }),
        makeOrder({ id: 2, status: "filled" }),
      ],
    });

    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it("notifies for multiple fills in one update", () => {
    const openOrders = [
      makeOrder({ id: 1, status: "open" }),
      makeOrder({ id: 2, status: "open", side: "sell", price: 1.09 }),
    ];
    const { rerender } = renderHook(
      ({ orders }) => useOrderFillDetector(orders),
      { initialProps: { orders: openOrders } },
    );

    const filledOrders = [
      makeOrder({ id: 1, status: "filled" }),
      makeOrder({ id: 2, status: "filled", side: "sell", price: 1.09 }),
    ];
    rerender({ orders: filledOrders });

    expect(mockAddNotification).toHaveBeenCalledTimes(2);
  });

  it("does not notify when orders array is empty", () => {
    renderHook(() => useOrderFillDetector([]));
    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it("fires browser Notification when permission is granted", () => {
    const mockNotification = vi.fn();
    vi.stubGlobal("Notification", mockNotification);
    Object.defineProperty(mockNotification, "permission", {
      value: "granted",
      writable: true,
    });

    const openOrders = [makeOrder({ id: 1, status: "open" })];
    const { rerender } = renderHook(
      ({ orders }) => useOrderFillDetector(orders),
      { initialProps: { orders: openOrders } },
    );

    rerender({ orders: [makeOrder({ id: 1, status: "filled" })] });

    expect(mockNotification).toHaveBeenCalledWith("Omega: Order Filled", {
      body: "buy 100 @ 1.0856",
    });

    vi.unstubAllGlobals();
  });
});
