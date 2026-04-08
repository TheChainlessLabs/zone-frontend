import { render, screen, cleanup, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

vi.mock("@/lib/hooks/useOrderBook", () => ({
  useOrderBook: vi.fn().mockReturnValue({
    book: null,
    midpoint: null,
    isLoading: false,
    isError: false,
  }),
}));

import StatusBar from "@/components/StatusBar";
import { useOrderBook } from "@/lib/hooks/useOrderBook";

const mockUseOrderBook = useOrderBook as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  mockUseOrderBook.mockReturnValue({
    book: null,
    midpoint: null,
    isLoading: false,
    isError: false,
  });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("StatusBar", () => {
  it("renders TEE Connected when API is healthy", () => {
    render(<StatusBar />);
    expect(screen.getByText("TEE Connected")).toBeInTheDocument();
  });

  it("renders the last update timestamp", () => {
    render(<StatusBar />);
    expect(screen.getByText(/Last update/)).toBeInTheDocument();
  });

  it("shows elapsed time counting up", () => {
    render(<StatusBar />);
    expect(screen.getByText(/Last update 0s ago/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/Last update 5s ago/)).toBeInTheDocument();
  });

  it("shows Reconnecting on API error", () => {
    mockUseOrderBook.mockReturnValue({
      book: null,
      midpoint: null,
      isLoading: false,
      isError: true,
    });

    render(<StatusBar />);
    expect(screen.getByText("Reconnecting")).toBeInTheDocument();
  });

  it("shows Disconnected after sustained error (15s threshold)", () => {
    mockUseOrderBook.mockReturnValue({
      book: null,
      midpoint: null,
      isLoading: false,
      isError: true,
    });

    render(<StatusBar />);
    expect(screen.getByText("Reconnecting")).toBeInTheDocument();

    // Advance past the 15s disconnect threshold
    act(() => {
      vi.advanceTimersByTime(16_000);
    });

    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });

  it("recovers to Connected when error clears", () => {
    mockUseOrderBook.mockReturnValue({
      book: null,
      midpoint: null,
      isLoading: false,
      isError: true,
    });

    const { rerender } = render(<StatusBar />);
    expect(screen.getByText("Reconnecting")).toBeInTheDocument();

    mockUseOrderBook.mockReturnValue({
      book: null,
      midpoint: null,
      isLoading: false,
      isError: false,
    });
    rerender(<StatusBar />);
    expect(screen.getByText("TEE Connected")).toBeInTheDocument();
  });

  it("renders batch info", () => {
    render(<StatusBar />);
    expect(screen.getByText("Batch #1247")).toBeInTheDocument();
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });
});
