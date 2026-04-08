import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

vi.mock("@/lib/hooks/use1inchPrice", () => ({
  use1inchPrice: vi.fn().mockReturnValue({
    rate: null,
    source: null,
    isLoading: false,
    isError: false,
  }),
}));

import PriceComparisonPanel from "@/components/PriceComparisonPanel";
import { useOrderBook } from "@/lib/hooks/useOrderBook";
import { useVenueRates } from "@/lib/hooks/useVenueRates";
import { use1inchPrice } from "@/lib/hooks/use1inchPrice";

const mockUseOrderBook = useOrderBook as ReturnType<typeof vi.fn>;
const mockUseVenueRates = useVenueRates as ReturnType<typeof vi.fn>;
const mockUse1inchPrice = use1inchPrice as ReturnType<typeof vi.fn>;

beforeEach(() => {
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
  mockUse1inchPrice.mockReturnValue({
    rate: 0.9998,
    source: "mock",
    isLoading: false,
    isError: false,
  });
});

afterEach(() => {
  cleanup();
});

describe("PriceComparisonPanel", () => {
  it("renders all venue names", () => {
    render(<PriceComparisonPanel />);
    expect(screen.getByText("Omega Midpoint")).toBeInTheDocument();
    expect(screen.getByText("1inch (USDT/USDC)")).toBeInTheDocument();
    expect(screen.getByText("Wise")).toBeInTheDocument();
    expect(screen.getByText("Revolut")).toBeInTheDocument();
    expect(screen.getByText("OFX")).toBeInTheDocument();
  });

  it("shows correct prices", () => {
    render(<PriceComparisonPanel />);
    expect(screen.getByText("1.0849")).toBeInTheDocument();
    expect(screen.getByText("0.9998")).toBeInTheDocument();
    expect(screen.getByText("1.0856")).toBeInTheDocument();
    expect(screen.getByText("1.0838")).toBeInTheDocument();
    expect(screen.getByText("1.0842")).toBeInTheDocument();
  });

  it("shows dashes when prices are unavailable", () => {
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
    mockUse1inchPrice.mockReturnValue({
      rate: null,
      source: null,
      isLoading: false,
      isError: false,
    });

    render(<PriceComparisonPanel />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(5);
  });

  it("checkboxes toggle venue visibility", () => {
    render(<PriceComparisonPanel />);

    const omegaToggle = screen.getByLabelText("Toggle Omega Midpoint");
    expect(omegaToggle).toBeChecked();

    fireEvent.click(omegaToggle);
    expect(omegaToggle).not.toBeChecked();

    fireEvent.click(omegaToggle);
    expect(omegaToggle).toBeChecked();
  });

  it("renders the heading", () => {
    render(<PriceComparisonPanel />);
    expect(screen.getByText("Venue Comparison")).toBeInTheDocument();
  });
});
