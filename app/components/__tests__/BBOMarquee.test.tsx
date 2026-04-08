import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

vi.mock("@/lib/hooks/useOrderBook", () => ({
  useOrderBook: vi.fn().mockReturnValue({
    book: null,
    midpoint: null,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/lib/hooks/useVenueRates", () => ({
  useVenueRates: vi.fn().mockReturnValue({
    venues: null,
    isLoading: false,
    isError: false,
  }),
}));

import BBOMarquee from "@/components/BBOMarquee";
import { useOrderBook } from "@/lib/hooks/useOrderBook";
import { useVenueRates } from "@/lib/hooks/useVenueRates";

const mockUseOrderBook = useOrderBook as ReturnType<typeof vi.fn>;
const mockUseVenueRates = useVenueRates as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockUseOrderBook.mockReturnValue({
    book: null,
    midpoint: null,
    isLoading: false,
    isError: false,
  });
  mockUseVenueRates.mockReturnValue({
    venues: null,
    isLoading: false,
    isError: false,
  });
});

afterEach(() => {
  cleanup();
});

describe("BBOMarquee", () => {
  it("renders all four venue names", () => {
    render(<BBOMarquee />);
    expect(screen.getByText("Wise")).toBeInTheDocument();
    expect(screen.getByText("OFX")).toBeInTheDocument();
    expect(screen.getByText("Revolut")).toBeInTheDocument();
    expect(screen.getByText("Omega")).toBeInTheDocument();
  });

  it("shows LIVE indicator when venue data is available", () => {
    mockUseVenueRates.mockReturnValue({
      venues: { wise: 1.0856, ofx: 1.0842, revolut: 1.0838 },
      isLoading: false,
      isError: false,
    });

    render(<BBOMarquee />);
    const liveLabels = screen.getAllByText("Live");
    expect(liveLabels.length).toBe(3);
  });

  it("shows Best Price badge for Omega when midpoint is available", () => {
    mockUseOrderBook.mockReturnValue({
      book: null,
      midpoint: 1.0849,
      isLoading: false,
      isError: false,
    });
    mockUseVenueRates.mockReturnValue({
      venues: { wise: 1.0856, ofx: 1.0842, revolut: 1.0838 },
      isLoading: false,
      isError: false,
    });

    render(<BBOMarquee />);
    expect(screen.getByText("Best Price")).toBeInTheDocument();
  });

  it("does not show Best Price badge when Omega midpoint is unavailable", () => {
    mockUseOrderBook.mockReturnValue({
      book: null,
      midpoint: null,
      isLoading: false,
      isError: false,
    });
    mockUseVenueRates.mockReturnValue({
      venues: null,
      isLoading: false,
      isError: false,
    });

    render(<BBOMarquee />);
    expect(screen.queryByText("Best Price")).not.toBeInTheDocument();
  });

  it("shows venue prices when data is loaded", () => {
    mockUseVenueRates.mockReturnValue({
      venues: { wise: 1.0856, ofx: 1.0842, revolut: 1.0838 },
      isLoading: false,
      isError: false,
    });
    mockUseOrderBook.mockReturnValue({
      book: null,
      midpoint: 1.0849,
      isLoading: false,
      isError: false,
    });

    render(<BBOMarquee />);
    expect(screen.getByText("1.0856")).toBeInTheDocument();
    expect(screen.getByText("1.0842")).toBeInTheDocument();
    expect(screen.getByText("1.0838")).toBeInTheDocument();
    expect(screen.getByText("1.0849")).toBeInTheDocument();
  });

  it("shows dash for venue prices on error", () => {
    mockUseVenueRates.mockReturnValue({
      venues: null,
      isLoading: false,
      isError: true,
    });

    render(<BBOMarquee />);
    const dashes = screen.getAllByText("—");
    // 3 external venues + Omega (midpoint null) = 4
    expect(dashes.length).toBe(4);
  });

  it("does not show LIVE label for error state venues", () => {
    mockUseVenueRates.mockReturnValue({
      venues: null,
      isLoading: false,
      isError: true,
    });

    render(<BBOMarquee />);
    expect(screen.queryByText("Live")).not.toBeInTheDocument();
  });
});
