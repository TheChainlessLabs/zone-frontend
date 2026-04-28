import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { PairSwitcher } from "@/components/trade";

afterEach(cleanup);

it("renders the selected pair + midpoint on the trigger", () => {
  render(
    <PairSwitcher
      value="USDC/EURC"
      onChange={() => {}}
      midpoint="0.9213"
    />,
  );
  expect(screen.getByText("USDC/EURC")).toBeDefined();
  expect(screen.getByText("0.9213")).toBeDefined();
});

it("falls back to em-dash when no midpoint is provided", () => {
  render(<PairSwitcher value="USDC/EURC" onChange={() => {}} />);
  expect(screen.getByText("—")).toBeDefined();
});

it("exposes the trigger via aria-label naming the active pair", () => {
  render(
    <PairSwitcher
      value="USDC/USDT"
      onChange={() => {}}
      midpoint="1.0001"
    />,
  );
  expect(
    screen.getByRole("button", { name: /Pair: USDC\/USDT/ }),
  ).toBeDefined();
});

it("renders the trigger as a non-disabled button — Radix DropdownMenu portal coverage lives in modal.test", () => {
  // The DropdownMenu open/select interactions rely on Radix pointer-event
  // semantics that jsdom doesn't fully simulate. Trigger surface coverage
  // here; menu coverage is captured by Storybook visual regression in M2.
  render(
    <PairSwitcher
      value="USDC/EURC"
      onChange={() => {}}
      midpoint="0.9213"
    />,
  );
  const trigger = screen.getByRole("button", { name: /Pair: USDC\/EURC/ });
  expect(trigger.hasAttribute("disabled")).toBe(false);
});
