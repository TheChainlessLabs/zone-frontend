import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/components/ProtectedPage", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-page">{children}</div>
  ),
}));
vi.mock("@/components/PortfolioValue", () => ({
  default: () => <div data-testid="portfolio-value" />,
}));
vi.mock("@/components/PortfolioBalances", () => ({
  default: () => <div data-testid="portfolio-balances" />,
}));
vi.mock("@/components/OpenPositions", () => ({
  default: () => <div data-testid="open-positions" />,
}));
vi.mock("@/components/DepositModal", () => ({
  default: () => <div data-testid="deposit-modal" />,
}));
vi.mock("@/components/WithdrawModal", () => ({
  default: () => <div data-testid="withdraw-modal" />,
}));
vi.mock("@/lib/wallet", () => ({
  useWallet: () => ({ accountId: 1 }),
}));
vi.mock("@/lib/useToast", () => ({
  useToast: () => ({ toasts: [], addToast: vi.fn(), removeToast: vi.fn() }),
}));
vi.mock("@/lib/apiClient", () => ({
  mockFund: vi.fn(),
}));

const originalDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE;

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(createElement(QueryClientProvider, { client }, ui));
}

async function loadPage() {
  vi.resetModules();
  const mod = await import("@/app/portfolio/page");
  return mod.default;
}

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_DEMO_MODE;
});

afterEach(() => {
  cleanup();
  if (originalDemoMode === undefined) {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
  } else {
    process.env.NEXT_PUBLIC_DEMO_MODE = originalDemoMode;
  }
});

describe("PortfolioPage Get Demo Funds button", () => {
  it("renders the button when NEXT_PUBLIC_DEMO_MODE is 'true'", async () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "true";
    const PortfolioPage = await loadPage();
    renderWithProviders(<PortfolioPage />);
    expect(screen.getByRole("button", { name: /get demo funds/i })).toBeInTheDocument();
  });

  it("does not render the button when NEXT_PUBLIC_DEMO_MODE is unset", async () => {
    const PortfolioPage = await loadPage();
    renderWithProviders(<PortfolioPage />);
    expect(screen.queryByRole("button", { name: /get demo funds/i })).toBeNull();
  });
});
