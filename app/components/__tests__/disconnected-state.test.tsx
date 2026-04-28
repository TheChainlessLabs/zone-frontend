import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { DisconnectedState } from "@/components/DisconnectedState";
import { Icon } from "@/lib/icons";

afterEach(cleanup);

it("renders the default copy + CTA when no props are passed", () => {
  render(<DisconnectedState onAction={() => {}} />);
  expect(
    screen.getByText("Anonymous spot FX. On-chain settlement."),
  ).toBeDefined();
  expect(
    screen.getByText("Connect a wallet to access trading and account screens."),
  ).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Connect Wallet" }),
  ).toBeDefined();
});

it("invokes onAction when the CTA is clicked", () => {
  const onAction = vi.fn();
  render(<DisconnectedState onAction={onAction} />);
  fireEvent.click(screen.getByRole("button", { name: "Connect Wallet" }));
  expect(onAction).toHaveBeenCalledOnce();
});

it("supports the wrong-network variant via props", () => {
  render(
    <DisconnectedState
      title="Unsupported network"
      description="Switch to Ethereum to continue."
      actionLabel="Switch network"
      icon={Icon.Warning}
      onAction={() => {}}
    />,
  );
  expect(screen.getByText("Unsupported network")).toBeDefined();
  expect(screen.getByText("Switch to Ethereum to continue.")).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Switch network" }),
  ).toBeDefined();
});

it("exposes role=status so AT announces the surface", () => {
  render(<DisconnectedState onAction={() => {}} data-testid="ds" />);
  expect(screen.getByTestId("ds").getAttribute("role")).toBe("status");
});
