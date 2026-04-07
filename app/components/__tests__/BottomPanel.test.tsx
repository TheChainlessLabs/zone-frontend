import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import BottomPanel from "@/components/BottomPanel";

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

afterEach(cleanup);

describe("BottomPanel", () => {
  it("renders skeleton rows in Positions tab when isLoading is true", () => {
    const { container } = render(<BottomPanel isLoading={true} />);
    const skeletonRows = container.querySelectorAll("[data-testid='skeleton-row']");
    expect(skeletonRows.length).toBe(3);
  });

  it("does not show skeleton rows in Orders tab when isLoading is true", () => {
    const { container } = render(<BottomPanel isLoading={true} />);
    fireEvent.click(screen.getByText("Orders"));
    const skeletonRows = container.querySelectorAll("[data-testid='skeleton-row']");
    expect(skeletonRows.length).toBe(0);
  });

  it("renders real positions when isLoading is false", () => {
    render(<BottomPanel isLoading={false} />);
    expect(screen.getByText("EUR/USD")).toBeInTheDocument();
  });

  it("wraps loaded positions in animate-fadeIn", () => {
    const { container } = render(<BottomPanel isLoading={false} />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).not.toBeNull();
  });

  it("renders Trade History tab with empty state from hook", () => {
    render(<BottomPanel isLoading={false} />);
    fireEvent.click(screen.getByText("Trade History"));
    expect(screen.getByText("No trades yet")).toBeInTheDocument();
  });

  it("renders Orders tab with empty state when no open orders", () => {
    render(<BottomPanel isLoading={false} />);
    fireEvent.click(screen.getByText("Orders"));
    expect(screen.getByText("No open orders")).toBeInTheDocument();
  });
});
