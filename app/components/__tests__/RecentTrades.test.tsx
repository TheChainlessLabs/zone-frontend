import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import RecentTrades from "@/components/RecentTrades";

vi.mock("@/lib/hooks/useTrades", () => ({
  useTrades: vi.fn(),
}));

import { useTrades } from "@/lib/hooks/useTrades";
const mockUseTrades = vi.mocked(useTrades);

afterEach(cleanup);

describe("RecentTrades", () => {
  it("renders skeleton rows when loading", () => {
    mockUseTrades.mockReturnValue({ trades: [], isLoading: true, isError: false });
    const { container } = render(<RecentTrades />);
    const skeletonRows = container.querySelectorAll("[data-testid='skeleton-row']");
    expect(skeletonRows.length).toBe(15);
  });

  it("renders 45 skeleton cells when loading (15 rows x 3 columns)", () => {
    mockUseTrades.mockReturnValue({ trades: [], isLoading: true, isError: false });
    const { container } = render(<RecentTrades />);
    const skeletonCells = container.querySelectorAll("[class*='animate-pulse']");
    expect(skeletonCells.length).toBe(45);
  });

  it("renders error state when isError is true", () => {
    mockUseTrades.mockReturnValue({ trades: [], isLoading: false, isError: true });
    render(<RecentTrades />);
    expect(screen.getByText("Data unavailable")).toBeInTheDocument();
  });

  it("renders empty state when no trades", () => {
    mockUseTrades.mockReturnValue({ trades: [], isLoading: false, isError: false });
    render(<RecentTrades />);
    expect(screen.getByText("No trades yet")).toBeInTheDocument();
  });

  it("renders trade data when loaded", () => {
    mockUseTrades.mockReturnValue({
      trades: [
        { time: "14:32:05", timestamp: 1710000000, pair: "EUR/USD", price: 1.0856, size: 125000, sizeFormatted: "€125K", side: "buy" as const },
        { time: "14:32:17", timestamp: 1710000012, pair: "EUR/USD", price: 1.0854, size: 250000, sizeFormatted: "€250K", side: "sell" as const },
      ],
      isLoading: false,
      isError: false,
    });
    render(<RecentTrades />);
    expect(screen.getByText("1.0856")).toBeInTheDocument();
    expect(screen.getByText("€125K")).toBeInTheDocument();
  });

  it("wraps loaded content in animate-fadeIn", () => {
    mockUseTrades.mockReturnValue({
      trades: [{ time: "14:32:05", timestamp: 1710000000, pair: "EUR/USD", price: 1.0856, size: 125000, side: "buy" as const }],
      isLoading: false,
      isError: false,
    });
    const { container } = render(<RecentTrades />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).not.toBeNull();
  });

  it("does not show animate-fadeIn when loading", () => {
    mockUseTrades.mockReturnValue({ trades: [], isLoading: true, isError: false });
    const { container } = render(<RecentTrades />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).toBeNull();
  });

  it("keeps the title bar visible during loading", () => {
    mockUseTrades.mockReturnValue({ trades: [], isLoading: true, isError: false });
    render(<RecentTrades />);
    expect(screen.getByText("Recent Fills")).toBeInTheDocument();
  });
});
