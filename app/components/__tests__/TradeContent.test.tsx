import { render, screen, cleanup, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

// Component-shadow mocks. Heavy modules (chart canvas, wallet wiring,
// notification center) get stubbed to keep this test about TradeContent's
// composition, not its descendants.
vi.mock("@/components/Navbar", () => ({
  default: () => <div data-testid="navbar" />,
}));
vi.mock("@/components/PairDropdown", () => ({
  default: () => <div data-testid="pair-dropdown" />,
}));
vi.mock("@/components/StatusBar", () => ({
  default: () => <div data-testid="status-bar" />,
}));
vi.mock("@/components/ExecutionContextStrip", () => ({
  default: () => <div data-testid="execution-context-strip" />,
}));
vi.mock("@/components/ProtectedPage", () => ({
  default: ({ children, shellClassName }: { children: React.ReactNode; shellClassName: string }) => (
    <div className={shellClassName} data-testid="protected-page">{children}</div>
  ),
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
vi.mock("@/lib/hooks/useOrderFillDetector", () => ({
  useOrderFillDetector: vi.fn(),
}));
vi.mock("@/lib/hooks/useMarket", () => ({
  useMarket: () => ({ marketId: 1, setMarketId: vi.fn() }),
}));
vi.mock("@/lib/hooks/useOrderBook", () => ({
  useOrderBook: () => ({ book: null, midpoint: 1.0856, isLoading: false, isError: false, dataUpdatedAt: 0 }),
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

import TradeContent from "@/components/TradeContent";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(createElement(QueryClientProvider, { client: queryClient }, ui));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("TradeContent — V1 action-first execution model", () => {
  it("renders the centred swap card layout in Market mode", () => {
    renderWithProviders(<TradeContent />);
    expect(screen.getByTestId("pair-dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("execution-context-strip")).toBeInTheDocument();
    expect(screen.getByTestId("status-bar")).toBeInTheDocument();
  });

  it("does not render any public-orderbook surface", () => {
    renderWithProviders(<TradeContent />);
    expect(screen.queryByTestId("order-book")).toBeNull();
  });

  it("does not render the BBO marquee on /trade", () => {
    renderWithProviders(<TradeContent />);
    expect(screen.queryByTestId("bbo-marquee")).toBeNull();
  });

  it("does not render a global recent-trades feed on /trade", () => {
    renderWithProviders(<TradeContent />);
    expect(screen.queryByTestId("recent-trades")).toBeNull();
    expect(screen.queryByText("Recent Fills")).toBeNull();
  });

  it("does not render a price chart in Market mode", () => {
    renderWithProviders(<TradeContent />);
    expect(screen.queryByTestId("price-chart")).toBeNull();
  });

  it("shows OrderForm skeleton during the initial 1500ms warmup", () => {
    const { container } = renderWithProviders(<TradeContent />);
    expect(screen.queryByText("Buy")).toBeNull();
    expect(screen.queryByText("Sell")).toBeNull();
    const pulseElements = container.querySelectorAll("[class*='animate-pulse']");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("transitions to the loaded OrderForm after 1500ms", () => {
    renderWithProviders(<TradeContent />);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText("Buy")).toBeInTheDocument();
    expect(screen.getByText("Sell")).toBeInTheDocument();
  });
});
