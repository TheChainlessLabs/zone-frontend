import { expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/components/shell/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/shell/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PageSection: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: React.ReactNode;
  }) => (
    <section>
      <div>{title}</div>
      {children}
    </section>
  ),
}));

vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <div>Theme toggle</div>,
}));

const disconnect = vi.fn();
const useWalletState = vi.fn();

vi.mock("@/components/shell/WalletStateProvider", () => ({
  useWalletState: () => useWalletState(),
  truncateAddress: (address: string) => `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`,
}));

import AccountPage from "@/app/account/page";

afterEach(() => {
  cleanup();
  disconnect.mockReset();
  useWalletState.mockReset();
});

it("renders the provider email, closed-alpha badge, and server-managed trading copy", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    email: "alpha@omegamarkets.com",
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Ethereum",
    connector: "Browser wallet",
    disconnect,
  });

  render(<AccountPage />);

  expect(screen.getByText("Email")).toBeDefined();
  expect(screen.getByText("alpha@omegamarkets.com")).toBeDefined();
  expect(screen.getByText("Trading address (server-managed)")).toBeDefined();
  expect(
    screen.getByText(
      "This address holds your seeded testnet balance during the closed alpha. You don't manage its keys.",
    ),
  ).toBeDefined();
  expect(screen.getByText("Closed testnet · Private alpha")).toBeDefined();
  expect(
    screen.getByText(
      "Your seeded balance and order history remain - sign back in with your email any time.",
    ),
  ).toBeDefined();
  expect(screen.queryByText("Gas preference")).toBeNull();
  expect(screen.queryByText("Preferences")).toBeNull();
  expect(screen.queryByText("NFT pass")).toBeNull();
  expect(screen.queryByText("Reduce motion")).toBeNull();
  expect(screen.queryByText("Show advanced order types")).toBeNull();
});

it("falls back to the account fixture email when the provider email is absent", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    email: undefined,
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Ethereum",
    connector: "Browser wallet",
    disconnect,
  });

  render(<AccountPage />);

  expect(screen.getByText("trader@omegamarkets.com")).toBeDefined();
});
