import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import BottomPanel from "@/components/BottomPanel";

afterEach(cleanup);

describe("BottomPanel", () => {
  it("renders skeleton rows in Positions tab when isLoading is true", () => {
    const { container } = render(<BottomPanel isLoading={true} />);
    const skeletonRows = container.querySelectorAll("[data-testid='skeleton-row']");
    expect(skeletonRows.length).toBe(3);
  });

  it("does not show skeleton rows in Orders tab when isLoading is true", () => {
    const { container } = render(<BottomPanel isLoading={true} />);
    // Switch to Orders tab
    fireEvent.click(screen.getByText("Orders"));
    const skeletonRows = container.querySelectorAll("[data-testid='skeleton-row']");
    expect(skeletonRows.length).toBe(0);
  });

  it("does not show skeleton rows in Trade History tab when isLoading is true", () => {
    const { container } = render(<BottomPanel isLoading={true} />);
    // Switch to Trade History tab
    fireEvent.click(screen.getByText("Trade History"));
    const skeletonRows = container.querySelectorAll("[data-testid='skeleton-row']");
    expect(skeletonRows.length).toBe(0);
  });

  it("renders real positions when isLoading is false", () => {
    render(<BottomPanel isLoading={false} />);
    // Should show actual position data
    expect(screen.getByText("EUR/USD")).toBeInTheDocument();
  });

  it("wraps loaded positions in animate-fadeIn", () => {
    const { container } = render(<BottomPanel isLoading={false} />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).not.toBeNull();
  });
});
