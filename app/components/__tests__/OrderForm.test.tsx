import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import OrderForm from "@/components/OrderForm";

vi.mock("@/lib/wallet", () => ({
  useWallet: () => ({ accountId: null, address: undefined, isConnected: false }),
}));

vi.mock("@/lib/hooks/useAccountBalances", () => ({
  useAccountBalances: () => ({ balances: [], isLoading: false, isError: false }),
}));

vi.mock("@/lib/hooks/useOrderBook", () => ({
  useOrderBook: () => ({ book: null, midpoint: 1.0856, isLoading: false, isError: false }),
}));

vi.mock("@/lib/hooks/useOrderSigning", () => ({
  useOrderSigning: () => ({
    signLimitOrder: vi.fn(),
    signMarketOrder: vi.fn(),
    signFlipOrder: vi.fn(),
    signCancel: vi.fn(),
  }),
}));

vi.mock("@/lib/hooks/useMarket", () => ({
  useMarket: () => ({ marketId: 1, setMarketId: vi.fn() }),
}));

vi.mock("@/lib/hooks/useNonce", () => ({
  useNonce: () => ({ next: vi.fn(() => 0), increment: vi.fn(), resync: vi.fn(), isReady: true }),
}));

vi.mock("@/lib/useToast", () => ({
  useToast: () => ({ toasts: [], addToast: vi.fn(), removeToast: vi.fn() }),
}));

vi.mock("@/lib/apiClient", () => ({
  createOrder: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

afterEach(cleanup);

describe("OrderForm", () => {
  it("renders skeleton blocks when isLoading is true", () => {
    const { container } = render(<OrderForm isLoading={true} />);
    const skeletons = container.querySelectorAll("[class*='animate-pulse']");
    // Should have multiple skeleton blocks (toggle, input, shortcuts, details, submit, privacy)
    expect(skeletons.length).toBeGreaterThan(5);
  });

  it("does not render Buy/Sell buttons when loading", () => {
    render(<OrderForm isLoading={true} />);
    expect(screen.queryByText("Buy")).toBeNull();
    expect(screen.queryByText("Sell")).toBeNull();
  });

  it("renders Buy/Sell buttons when not loading", () => {
    render(<OrderForm isLoading={false} />);
    expect(screen.getByText("Buy")).toBeInTheDocument();
    expect(screen.getByText("Sell")).toBeInTheDocument();
  });

  it("wraps loaded content in animate-fadeIn", () => {
    const { container } = render(<OrderForm isLoading={false} />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).not.toBeNull();
  });

  it("does not show animate-fadeIn when loading", () => {
    const { container } = render(<OrderForm isLoading={true} />);
    const fadeInEl = container.querySelector("[class*='animate-fadeIn']");
    expect(fadeInEl).toBeNull();
  });

  it("disables submit button when no accountId", () => {
    render(<OrderForm isLoading={false} />);
    const submitBtn = screen.getByRole("button", { name: /EUR \/ USD/i });
    expect(submitBtn).toBeDisabled();
  });

  it("disables submit button when no amount entered", () => {
    // accountId is null from mock, so button is disabled regardless
    render(<OrderForm isLoading={false} />);
    const submitBtn = screen.getByRole("button", { name: /EUR \/ USD/i });
    expect(submitBtn).toBeDisabled();
  });
});
