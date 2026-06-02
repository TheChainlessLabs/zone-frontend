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

vi.mock("@/components/omega-zone/OmegaZoneStatus", () => ({
  OmegaZoneStatus: () => <div>Omega zone status</div>,
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

it("renders the Tempo account, closed-alpha badge, and wallet-session copy", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Omega Local Zone",
    connector: "Tempo Wallet",
    disconnect,
  });

  render(<AccountPage />);

  expect(screen.getByText("Tempo account")).toBeDefined();
  expect(
    screen.getByText(
      "This Tempo account signs private-alpha testnet actions and holds seeded testnet balances.",
    ),
  ).toBeDefined();
  expect(screen.getByText("Closed testnet · Private alpha")).toBeDefined();
  expect(
    screen.getByText(
      "Your seeded balance and order history remain - sign back in with Tempo Wallet any time.",
    ),
  ).toBeDefined();
  expect(screen.queryByText("Gas preference")).toBeNull();
  expect(screen.queryByText("Preferences")).toBeNull();
  expect(screen.queryByText("NFT pass")).toBeNull();
  expect(screen.queryByText("Reduce motion")).toBeNull();
  expect(screen.queryByText("Show advanced order types")).toBeNull();
});

it("falls back to the account fixture address when the provider address is absent", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    address: undefined,
    chainName: "Omega Local Zone",
    connector: "Tempo Wallet",
    disconnect,
  });

  render(<AccountPage />);

  expect(screen.getByText("0x9A9f…63AE")).toBeDefined();
});
