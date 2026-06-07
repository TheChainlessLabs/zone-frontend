import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type * as React from "react";

let currentPathname = "/trade";
let currentAddress: string | undefined =
  "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/shell/WalletStateProvider", () => ({
  useWalletState: () => ({ address: currentAddress }),
  truncateAddress: (address: string) =>
    address.length < 10
      ? address
      : `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`,
}));

import { MobileTabBar } from "@/components/shell/MobileTabBar";

afterEach(() => {
  cleanup();
  currentPathname = "/trade";
  currentAddress = "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853";
});

describe("MobileTabBar", () => {
  it("renders an accessible tab link for every primary route", () => {
    render(<MobileTabBar />);

    expect(screen.getByRole("link", { name: "Trade" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Portfolio" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Batches" })).toBeDefined();
  });

  it("renders every route label at all times, with the active one marked current", () => {
    currentPathname = "/batches/settled";
    render(<MobileTabBar />);

    // Design-kit nav register: all labels stay visible; the active fill
    // (not label collapse) signals the current tab. The active route carries
    // aria-current="page"; the others do not.
    expect(screen.getByText("Trade")).toBeDefined();
    expect(screen.getByText("Portfolio")).toBeDefined();
    expect(screen.getByText("Batches")).toBeDefined();

    expect(
      screen.getByRole("link", { name: "Batches" }).getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen.getByRole("link", { name: "Trade" }).getAttribute("aria-current"),
    ).toBeNull();
    expect(
      screen.getByRole("link", { name: "Portfolio" }).getAttribute("aria-current"),
    ).toBeNull();
  });
});
