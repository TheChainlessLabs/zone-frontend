import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import StaleDataOverlay from "../StaleDataOverlay";

describe("StaleDataOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders nothing when data is fresh", () => {
    const now = Date.now();
    const { container } = render(
      <StaleDataOverlay lastUpdated={now} thresholdMs={10_000} criticalMs={30_000} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when lastUpdated is null", () => {
    const { container } = render(<StaleDataOverlay lastUpdated={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows warning when data is stale beyond threshold", () => {
    const now = Date.now();
    render(
      <StaleDataOverlay lastUpdated={now - 15_000} thresholdMs={10_000} criticalMs={30_000} />
    );
    expect(screen.getByText("Data may be stale")).toBeInTheDocument();
  });

  it("shows critical state when data exceeds critical threshold", () => {
    const now = Date.now();
    render(
      <StaleDataOverlay lastUpdated={now - 35_000} thresholdMs={10_000} criticalMs={30_000} />
    );
    expect(screen.getByText("Connection lost")).toBeInTheDocument();
  });

  it("shows retry button in critical state when onRetry provided", () => {
    const now = Date.now();
    const onRetry = vi.fn();
    render(
      <StaleDataOverlay
        lastUpdated={now - 35_000}
        thresholdMs={10_000}
        criticalMs={30_000}
        onRetry={onRetry}
      />
    );
    const retryButton = screen.getByRole("button", { name: "Retry" });
    expect(retryButton).toBeInTheDocument();
    retryButton.click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not show retry button when onRetry is not provided", () => {
    const now = Date.now();
    render(
      <StaleDataOverlay lastUpdated={now - 35_000} thresholdMs={10_000} criticalMs={30_000} />
    );
    expect(screen.getByText("Connection lost")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });

  it("transitions from fresh to warning as time passes", () => {
    const now = Date.now();
    const { container } = render(
      <StaleDataOverlay lastUpdated={now} thresholdMs={10_000} criticalMs={30_000} />
    );
    expect(container.innerHTML).toBe("");

    // Advance time past warning threshold
    act(() => {
      vi.advanceTimersByTime(11_000);
    });
    expect(screen.getByText("Data may be stale")).toBeInTheDocument();
  });

  it("transitions from warning to critical as time passes", () => {
    const now = Date.now();
    render(
      <StaleDataOverlay lastUpdated={now - 15_000} thresholdMs={10_000} criticalMs={30_000} />
    );
    expect(screen.getByText("Data may be stale")).toBeInTheDocument();

    // Advance time past critical threshold
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(screen.getByText("Connection lost")).toBeInTheDocument();
  });

  it("overlay does not block pointer events on text", () => {
    const now = Date.now();
    render(
      <StaleDataOverlay lastUpdated={now - 15_000} thresholdMs={10_000} criticalMs={30_000} />
    );
    const overlay = screen.getByTestId("stale-overlay");
    expect(overlay.style.pointerEvents).toBe("none");
  });
});
