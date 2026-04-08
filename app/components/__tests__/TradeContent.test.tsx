import { render, screen, cleanup, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import TradeContent from "@/components/TradeContent";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(createElement(QueryClientProvider, { client: queryClient }, ui));
}

vi.mock("@/components/Navbar", () => ({
  default: () => <div data-testid="navbar" />,
}));
vi.mock("@/components/BBOMarquee", () => ({
  default: () => <div data-testid="bbo-marquee" />,
}));
vi.mock("@/components/PairDropdown", () => ({
  default: () => <div data-testid="pair-dropdown" />,
}));
vi.mock("@/components/PriceChart", () => ({
  default: () => <div data-testid="price-chart" />,
}));
vi.mock("@/components/PriceComparisonPanel", () => ({
  default: () => <div data-testid="price-comparison-panel" />,
}));
vi.mock("@/components/StatusBar", () => ({
  default: () => <div data-testid="status-bar" />,
}));
vi.mock("@/components/RecentTrades", () => ({
  default: () => <div data-testid="recent-trades">Recent Fills</div>,
}));
vi.mock("@/components/ProtectedPage", () => ({
  default: ({ children, shellClassName }: { children: React.ReactNode; shellClassName: string }) => (
    <div className={shellClassName} data-testid="protected-page">{children}</div>
  ),
}));
vi.mock("@/lib/hooks/useTrades", () => ({
  useTrades: vi.fn().mockReturnValue({ trades: [], isLoading: false, isError: false }),
}));
vi.mock("@/lib/wallet", () => ({
  useWallet: () => ({ accountId: 1, address: undefined, isConnected: false }),
}));
vi.mock("@/lib/hooks/useAccountBalances", () => ({
  useAccountBalances: () => ({ balances: [], isLoading: false, isError: false }),
}));
vi.mock("@/lib/hooks/useUserOrders", () => ({
  useUserOrders: vi.fn().mockReturnValue({ orders: [], openOrders: [], isLoading: false, isError: false }),
}));
vi.mock("@/lib/hooks/useMarket", () => ({
  useMarket: () => ({ marketId: 1, setMarketId: vi.fn() }),
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
vi.mock("@/lib/hooks/useNonce", () => ({
  useNonce: () => ({ next: vi.fn(() => 0), increment: vi.fn(), resync: vi.fn(), isReady: true }),
}));
vi.mock("@/lib/useToast", () => ({
  useToast: () => ({ toasts: [], addToast: vi.fn(), removeToast: vi.fn() }),
}));
vi.mock("@/lib/useNotifications", () => ({
  useNotifications: () => ({ notifications: [], unreadCount: 0, addNotification: vi.fn(), markAllRead: vi.fn() }),
}));
vi.mock("@/lib/apiClient", () => ({
  createOrder: vi.fn(),
}));
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

afterEach(cleanup);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TradeContent", () => {
  it("renders skeletons in initial loading state", () => {
    const { container } = renderWithProviders(<TradeContent />);
    const skeletonRows = container.querySelectorAll(
      "[data-testid='skeleton-row']"
    );
    // 3 BottomPanel Positions skeleton rows
    expect(skeletonRows.length).toBe(3);
  });

  it("renders OrderForm skeleton blocks in initial loading state", () => {
    const { container } = renderWithProviders(<TradeContent />);
    const pulseElements = container.querySelectorAll(
      "[class*='animate-pulse']"
    );
    // Skeleton rows (3 rows × inner pulse elements) + OrderForm skeleton blocks
    expect(pulseElements.length).toBeGreaterThan(3);
  });

  it("does not show Buy/Sell buttons during initial load", () => {
    renderWithProviders(<TradeContent />);
    expect(screen.queryByText("Buy")).toBeNull();
    expect(screen.queryByText("Sell")).toBeNull();
  });

  it("transitions to loaded content after 1500ms", () => {
    const { container } = renderWithProviders(<TradeContent />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Skeletons should be gone
    const skeletonRows = container.querySelectorAll(
      "[data-testid='skeleton-row']"
    );
    expect(skeletonRows.length).toBe(0);

    // Real content should be visible
    expect(screen.getByText("Recent Fills")).toBeInTheDocument();
    expect(screen.getByText("Buy")).toBeInTheDocument();
    expect(screen.getByText("Sell")).toBeInTheDocument();
  });

  it("applies animate-fadeIn to loaded content", () => {
    const { container } = renderWithProviders(<TradeContent />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const fadeInElements = container.querySelectorAll(
      "[class*='animate-fadeIn']"
    );
    // BottomPanel Positions (desktop + mobile) and OrderForm wrap loaded content in animate-fadeIn
    expect(fadeInElements.length).toBeGreaterThanOrEqual(2);
  });

  it("still shows skeletons before 1500ms elapses", () => {
    const { container } = renderWithProviders(<TradeContent />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should still be loading
    const skeletonRows = container.querySelectorAll(
      "[data-testid='skeleton-row']"
    );
    expect(skeletonRows.length).toBe(3);
  });
});
