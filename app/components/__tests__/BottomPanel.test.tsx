import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import BottomPanel from "@/components/BottomPanel";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(createElement(QueryClientProvider, { client: queryClient }, ui));
}

vi.mock("@/lib/hooks/useTrades", () => ({
  useTrades: vi.fn().mockReturnValue({ trades: [], isLoading: false, isError: false }),
}));

vi.mock("@/lib/hooks/useUserOrders", () => ({
  useUserOrders: vi.fn().mockReturnValue({ orders: [], openOrders: [], isLoading: false, isError: false }),
}));

vi.mock("@/lib/wallet", () => ({
  useWallet: () => ({ accountId: 1 }),
}));

vi.mock("@/lib/hooks/useMarket", () => ({
  useMarket: () => ({ marketId: 1, setMarketId: vi.fn() }),
}));

vi.mock("@/lib/hooks/useOrderSigning", () => ({
  useOrderSigning: () => ({
    signCancel: vi.fn(),
    signLimitOrder: vi.fn(),
    signMarketOrder: vi.fn(),
    signFlipOrder: vi.fn(),
  }),
}));

vi.mock("@/lib/apiClient", () => ({
  cancelOrder: vi.fn(),
  getMarketOrders: vi.fn(),
  getOrderBook: vi.fn(),
  getTrades: vi.fn(),
}));

vi.mock("@/lib/useToast", () => ({
  useToast: () => ({ addToast: vi.fn(), removeToast: vi.fn(), toasts: [] }),
}));

afterEach(cleanup);

describe("BottomPanel", () => {
  it("renders skeleton rows in Positions tab when isLoading is true", () => {
    const { container } = renderWithProviders(<BottomPanel isLoading={true} />);
    const skeletonRows = container.querySelectorAll("[data-testid='skeleton-row']");
    expect(skeletonRows.length).toBe(3);
  });

  it("does not show skeleton rows in Orders tab when isLoading is true", () => {
    const { container } = renderWithProviders(<BottomPanel isLoading={true} />);
    fireEvent.click(screen.getByText("Orders"));
    const skeletonRows = container.querySelectorAll("[data-testid='skeleton-row']");
    expect(skeletonRows.length).toBe(0);
  });

  it("renders real positions when isLoading is false", () => {
    renderWithProviders(<BottomPanel isLoading={false} />);
    const matches = screen.getAllByText("EUR/USD");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("wraps loaded positions in animate-fadeIn", () => {
    const { container } = renderWithProviders(<BottomPanel isLoading={false} />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).not.toBeNull();
  });

  it("renders Trade History tab with empty state from hook", () => {
    renderWithProviders(<BottomPanel isLoading={false} />);
    fireEvent.click(screen.getByText("Trade History"));
    const matches = screen.getAllByText("No trades yet");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders Orders tab with empty state when no open orders", () => {
    renderWithProviders(<BottomPanel isLoading={false} />);
    fireEvent.click(screen.getByText("Orders"));
    const matches = screen.getAllByText("No orders yet");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
