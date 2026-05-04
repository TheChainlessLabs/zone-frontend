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

  it("only renders the active route label visibly", () => {
    currentPathname = "/batches/settled";
    render(<MobileTabBar />);

    expect(screen.getByText("Batches")).toBeDefined();
    expect(screen.queryByText("Trade")).toBeNull();
    expect(screen.queryByText("Portfolio")).toBeNull();
    expect(screen.queryByText("Account")).toBeNull();
  });
});
