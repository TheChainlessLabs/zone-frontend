/**
 * /account — Settings surface (kit design).
 *
 * Design-codifying tests updated to the kit's Settings design.
 * Functional tests (wiring, a11y, fixture fallback) stay green.
 */
import { expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/components/shell/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const disconnect = vi.fn();
const useWalletState = vi.fn();

vi.mock("@/components/shell/WalletStateProvider", () => ({
  useWalletState: () => useWalletState(),
  truncateAddress: (address: string) =>
    `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`,
}));

import AccountPage from "@/app/(app)/account/page";

afterEach(() => {
  cleanup();
  disconnect.mockReset();
  useWalletState.mockReset();
});

/* ── kit design assertions ── */

it("renders the kit page header (Settings h1 + subtitle)", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Omega Local Zone",
    connector: "Tempo Wallet",
    disconnect,
  });

  render(<AccountPage />);

  expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeDefined();
  expect(
    screen.getByText("Account, preferences, and privacy for this session."),
  ).toBeDefined();
});

it("renders the Tempo Wallet identity panel with truncated address", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Omega Local Zone",
    connector: "Tempo Wallet",
    disconnect,
  });

  render(<AccountPage />);

  // Wallet label in panel
  expect(screen.getByText(/Tempo Wallet/)).toBeDefined();
  // Truncated address rendered by truncateAddress mock
  expect(screen.getByText("0xa513…C853")).toBeDefined();
  // Copy and Explorer actions
  expect(screen.getByRole("button", { name: /Copy address/ })).toBeDefined();
  expect(screen.getByRole("link", { name: "View on Tempo Explorer" })).toBeDefined();
});

it("renders all four kit sections: Preferences, Trading, Privacy, Notifications", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Ethereum L1",
    connector: "Tempo Wallet",
    disconnect,
  });

  render(<AccountPage />);

  expect(screen.getByRole("heading", { name: /Preferences/i })).toBeDefined();
  expect(screen.getByRole("heading", { name: /Trading/i })).toBeDefined();
  expect(screen.getByRole("heading", { name: /Privacy/i })).toBeDefined();
  expect(screen.getByRole("heading", { name: /Notifications/i })).toBeDefined();
});

it("renders theme segmented control (Dark / Light)", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Omega Local Zone",
    connector: "Tempo Wallet",
    disconnect,
  });

  render(<AccountPage />);

  // Segmented uses role="radio" for each option
  const darkBtn = screen.getByRole("radio", { name: "Dark" });
  const lightBtn = screen.getByRole("radio", { name: "Light" });
  expect(darkBtn).toBeDefined();
  expect(lightBtn).toBeDefined();
});

it("renders kit toggle rows: confirm signing, hide balances, fill alerts, proof verified", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Omega Local Zone",
    connector: "Tempo Wallet",
    disconnect,
  });

  render(<AccountPage />);

  expect(
    screen.getByRole("switch", { name: "Confirm before signing" }),
  ).toBeDefined();
  expect(screen.getByRole("switch", { name: "Hide balances" })).toBeDefined();
  expect(screen.getByRole("switch", { name: "Fill alerts" })).toBeDefined();
  expect(screen.getByRole("switch", { name: "Proof verified" })).toBeDefined();
});

it("renders the Omega Zone connection panel — real status, no demo balances", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Omega Local Zone",
    connector: "Tempo Wallet",
    disconnect,
  });

  render(<AccountPage />);

  // Real connection status only; balances live on /portfolio.
  expect(screen.getByText("Connected")).toBeDefined();
  expect(screen.getByRole("link", { name: "Portfolio" })).toBeDefined();
  // The fabricated demo balances are gone.
  expect(screen.queryByText(/48,250/)).toBeNull();
  expect(screen.queryByText(/12,500/)).toBeNull();
  expect(screen.queryByText("Private RPC authorized")).toBeNull();
});

it("renders the kit Sign out button and calls wallet.disconnect", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Omega Local Zone",
    connector: "Tempo Wallet",
    disconnect,
  });

  render(<AccountPage />);

  const signOutBtn = screen.getByRole("button", { name: /Sign out/ });
  expect(signOutBtn).toBeDefined();
  signOutBtn.click();
  expect(disconnect).toHaveBeenCalledTimes(1);
});

/* ── wiring / fallback ── */

it("shows 'Not connected' when the wallet address is absent (no demo fallback)", () => {
  useWalletState.mockReturnValue({
    state: "disconnected",
    address: undefined,
    chainName: undefined,
    connector: undefined,
    disconnect,
  });

  render(<AccountPage />);

  // No fabricated fallback address — identity + zone panel read "Not connected".
  expect(screen.getAllByText("Not connected").length).toBeGreaterThan(0);
  expect(screen.queryByText("0x9A9f…63AE")).toBeNull();
});

/* ── negative assertions — old design elements gone ── */

it("does not render old design sections: Closed testnet · Private alpha, NFT pass, Preferences subsection, Reduce motion", () => {
  useWalletState.mockReturnValue({
    state: "connected",
    address: "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853",
    chainName: "Omega Local Zone",
    connector: "Tempo Wallet",
    disconnect,
  });

  render(<AccountPage />);

  expect(screen.queryByText("Closed testnet · Private alpha")).toBeNull();
  expect(screen.queryByText("NFT pass")).toBeNull();
  expect(screen.queryByText("Reduce motion")).toBeNull();
  expect(screen.queryByText("Show advanced order types")).toBeNull();
  // Old section titles are gone
  expect(screen.queryByText("Gas preference")).toBeNull();
});
