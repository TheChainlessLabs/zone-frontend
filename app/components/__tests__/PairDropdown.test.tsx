import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";

const mockSetMarketId = vi.fn();

vi.mock("@/lib/hooks/useMarket", () => ({
  useMarket: () => ({ marketId: 1, setMarketId: mockSetMarketId }),
}));

vi.mock("@/lib/marketIds", () => ({
  PAIR_MARKET_IDS: { "EUR/USD": 1 } as Record<string, number>,
}));

vi.mock("@/lib/mockData", () => ({
  mockPairs: [
    { pair: "EUR/USD", base: "EUR", quote: "USD", price: 1.0856, change: 0.42, fullName: "Euro / US Dollar" },
    { pair: "GBP/USD", base: "GBP", quote: "USD", price: 1.2645, change: -0.18, fullName: "British Pound / US Dollar" },
    { pair: "USD/JPY", base: "USD", quote: "JPY", price: 149.85, change: 0.31, fullName: "US Dollar / Japanese Yen" },
  ],
}));

import PairDropdown from "@/components/PairDropdown";

afterEach(() => {
  cleanup();
  mockSetMarketId.mockClear();
});

describe("PairDropdown", () => {
  it("renders selected pair name", () => {
    render(<PairDropdown />);
    expect(screen.getByText("EUR / USD")).toBeInTheDocument();
  });

  it("opens dropdown on click", () => {
    render(<PairDropdown />);
    expect(screen.queryByRole("listbox")).toBeNull();

    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows all pair options when open", () => {
    render(<PairDropdown />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    expect(screen.getByText("EUR/USD")).toBeInTheDocument();
    expect(screen.getByText("GBP/USD")).toBeInTheDocument();
    expect(screen.getByText("USD/JPY")).toBeInTheDocument();
  });

  it("closes on selection", async () => {
    render(<PairDropdown />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    // EUR/USD is the only available pair (has a market ID)
    const eurOption = screen.getByRole("option", { selected: true });
    fireEvent.click(eurOption);

    expect(mockSetMarketId).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  it("closes on outside click", async () => {
    render(<PairDropdown />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });
});
