import { render, screen, cleanup, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import TradeContent from "@/components/TradeContent";

vi.mock("@/components/Navbar", () => ({
  default: () => <div data-testid="navbar" />,
}));
vi.mock("@/components/BBOMarquee", () => ({
  default: () => <div data-testid="bbo-marquee" />,
}));
vi.mock("@/components/PairSelector", () => ({
  default: () => <div data-testid="pair-selector" />,
}));
vi.mock("@/components/PairList", () => ({
  default: () => <div data-testid="pair-list" />,
}));
vi.mock("@/components/PriceChart", () => ({
  default: () => <div data-testid="price-chart" />,
}));
vi.mock("@/components/StatusBar", () => ({
  default: () => <div data-testid="status-bar" />,
}));

afterEach(cleanup);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TradeContent", () => {
  it("renders skeletons in initial loading state", () => {
    const { container } = render(<TradeContent />);
    const skeletonRows = container.querySelectorAll(
      "[data-testid='skeleton-row']"
    );
    // 15 RecentTrades + 3 BottomPanel Positions = 18 skeleton rows
    expect(skeletonRows.length).toBe(18);
  });

  it("renders OrderForm skeleton blocks in initial loading state", () => {
    const { container } = render(<TradeContent />);
    const pulseElements = container.querySelectorAll(
      "[class*='animate-pulse']"
    );
    // Skeleton rows (18 rows × inner pulse elements) + OrderForm skeleton blocks
    expect(pulseElements.length).toBeGreaterThan(18);
  });

  it("does not show Buy/Sell buttons during initial load", () => {
    render(<TradeContent />);
    expect(screen.queryByText("Buy")).toBeNull();
    expect(screen.queryByText("Sell")).toBeNull();
  });

  it("transitions to loaded content after 1500ms", () => {
    const { container } = render(<TradeContent />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Skeletons should be gone
    const skeletonRows = container.querySelectorAll(
      "[data-testid='skeleton-row']"
    );
    expect(skeletonRows.length).toBe(0);

    // Real content should be visible
    expect(screen.getByText("Recent Fills")).toBeInTheDocument();
    expect(screen.getByText("Buy")).toBeInTheDocument();
    expect(screen.getByText("Sell")).toBeInTheDocument();
  });

  it("applies animate-fadeIn to loaded content", () => {
    const { container } = render(<TradeContent />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const fadeInElements = container.querySelectorAll(
      "[class*='animate-fadeIn']"
    );
    // RecentTrades, BottomPanel Positions, and OrderForm all wrap loaded content in animate-fadeIn
    expect(fadeInElements.length).toBe(3);
  });

  it("still shows skeletons before 1500ms elapses", () => {
    const { container } = render(<TradeContent />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should still be loading
    const skeletonRows = container.querySelectorAll(
      "[data-testid='skeleton-row']"
    );
    expect(skeletonRows.length).toBe(18);
  });
});
