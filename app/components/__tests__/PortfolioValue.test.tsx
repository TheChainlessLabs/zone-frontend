import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

// Mocks must be declared before importing the component under test.
const useWalletMock = vi.fn();
const useAccountBalancesMock = vi.fn();
const useOrderBookMock = vi.fn();

vi.mock("@/lib/wallet", () => ({
  useWallet: () => useWalletMock(),
}));

vi.mock("@/lib/hooks/useAccountBalances", () => ({
  useAccountBalances: (accountId: number | null) => useAccountBalancesMock(accountId),
}));

vi.mock("@/lib/hooks/useOrderBook", () => ({
  useOrderBook: () => useOrderBookMock(),
}));

import PortfolioValue from "@/components/PortfolioValue";
import type { FormattedBalance } from "@/lib/hooks/useAccountBalances";

function makeBalance(partial: Partial<FormattedBalance>): FormattedBalance {
  return {
    tokenId: 1,
    symbol: "USDC",
    color: "#2775CA",
    available: 0,
    collateral: 0,
    total: 0,
    ...partial,
  };
}

beforeEach(() => {
  useWalletMock.mockReset();
  useAccountBalancesMock.mockReset();
  useOrderBookMock.mockReset();
  useOrderBookMock.mockReturnValue({ midpoint: null, isLoading: false, isError: false });
});

afterEach(cleanup);

describe("PortfolioValue", () => {
  it("shows $0.00 for an empty account", () => {
    useWalletMock.mockReturnValue({ accountId: null });
    useAccountBalancesMock.mockReturnValue({
      balances: [],
      isLoading: false,
      isError: false,
    });

    render(<PortfolioValue />);

    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("shows the real USD total for a funded account at current midpoint", () => {
    useWalletMock.mockReturnValue({ accountId: 42 });
    useAccountBalancesMock.mockReturnValue({
      balances: [
        makeBalance({ tokenId: 1, symbol: "USDC", total: 10_000 }),
        makeBalance({ tokenId: 3, symbol: "EURC", total: 1_000 }),
      ],
      isLoading: false,
      isError: false,
    });
    // 10,000 USDC (1:1) + 1,000 EURC * 1.10 midpoint = 11,100.00
    useOrderBookMock.mockReturnValue({ midpoint: 1.1, isLoading: false, isError: false });

    render(<PortfolioValue />);

    expect(screen.getByText("$11,100.00")).toBeInTheDocument();
  });

  it("shows a skeleton when EURC is held but midpoint has not resolved yet", () => {
    useWalletMock.mockReturnValue({ accountId: 42 });
    useAccountBalancesMock.mockReturnValue({
      balances: [makeBalance({ tokenId: 3, symbol: "EURC", total: 1_000 })],
      isLoading: false,
      isError: false,
    });
    useOrderBookMock.mockReturnValue({ midpoint: null, isLoading: true, isError: false });

    const { container } = render(<PortfolioValue />);

    expect(screen.queryByText(/^\$/)).not.toBeInTheDocument();
    expect(container.querySelector("[class*='animate-pulse']")).not.toBeNull();
  });

  it("does not underreport EURC balances when midpoint is null without isLoading (thin book)", () => {
    // A one-sided or empty book can yield midpoint === null even after the
    // query resolves (isLoading === false). We must not silently drop EURC
    // from the total — keep the skeleton instead.
    useWalletMock.mockReturnValue({ accountId: 42 });
    useAccountBalancesMock.mockReturnValue({
      balances: [makeBalance({ tokenId: 3, symbol: "EURC", total: 1_000 })],
      isLoading: false,
      isError: false,
    });
    useOrderBookMock.mockReturnValue({ midpoint: null, isLoading: false, isError: false });

    const { container } = render(<PortfolioValue />);

    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
    expect(screen.queryByText(/^\$/)).not.toBeInTheDocument();
    expect(container.querySelector("[class*='animate-pulse']")).not.toBeNull();
  });

  it("renders the error state when the order book errors and EURC is held", () => {
    useWalletMock.mockReturnValue({ accountId: 42 });
    useAccountBalancesMock.mockReturnValue({
      balances: [makeBalance({ tokenId: 3, symbol: "EURC", total: 1_000 })],
      isLoading: false,
      isError: false,
    });
    useOrderBookMock.mockReturnValue({ midpoint: null, isLoading: false, isError: true });

    render(<PortfolioValue />);

    expect(screen.getByText("Failed to load portfolio data.")).toBeInTheDocument();
  });

  it("still shows $0.00 immediately for a pure-USDC portfolio even if midpoint is loading", () => {
    useWalletMock.mockReturnValue({ accountId: 42 });
    useAccountBalancesMock.mockReturnValue({
      balances: [makeBalance({ tokenId: 1, symbol: "USDC", total: 0 })],
      isLoading: false,
      isError: false,
    });
    useOrderBookMock.mockReturnValue({ midpoint: null, isLoading: true, isError: false });

    render(<PortfolioValue />);

    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("does not render a P&L card", () => {
    useWalletMock.mockReturnValue({ accountId: null });
    useAccountBalancesMock.mockReturnValue({
      balances: [],
      isLoading: false,
      isError: false,
    });

    render(<PortfolioValue />);

    expect(screen.queryByText(/P&L/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PnL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Profit/i)).not.toBeInTheDocument();
  });
});
