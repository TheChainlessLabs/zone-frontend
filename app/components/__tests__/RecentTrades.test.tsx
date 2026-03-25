import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import RecentTrades from "@/components/RecentTrades";

afterEach(cleanup);

describe("RecentTrades", () => {
  it("renders skeleton rows when isLoading is true", () => {
    const { container } = render(<RecentTrades isLoading={true} />);
    const skeletonRows = container.querySelectorAll("[class*='animate-pulse']");
    // 15 rows × 3 columns = 45 skeleton cells
    expect(skeletonRows.length).toBe(45);
  });

  it("renders exactly 15 skeleton rows when loading", () => {
    const { container } = render(<RecentTrades isLoading={true} />);
    // Each skeleton row has data-testid="skeleton-row"
    const rows = container.querySelectorAll("[data-testid='skeleton-row']");
    expect(rows.length).toBe(15);
  });

  it("renders real data when isLoading is false", () => {
    render(<RecentTrades isLoading={false} />);
    // Should show actual trade prices (the mock data has prices around 1.08xx)
    const priceElements = screen.getAllByText(/1\.08\d+/);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it("wraps loaded content in animate-fadeIn", () => {
    const { container } = render(<RecentTrades isLoading={false} />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).not.toBeNull();
  });

  it("does not show animate-fadeIn when loading", () => {
    const { container } = render(<RecentTrades isLoading={true} />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).toBeNull();
  });

  it("keeps the title bar visible during loading", () => {
    render(<RecentTrades isLoading={true} />);
    expect(screen.getByText("Recent Fills")).toBeInTheDocument();
  });
});
