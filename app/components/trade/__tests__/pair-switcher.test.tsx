import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { PairSwitcher } from "@/components/trade";

afterEach(cleanup);

it("renders the selected pair + a live rolling midpoint on the trigger", () => {
  render(
    <PairSwitcher
      value="USDC/EURC"
      onChange={() => {}}
      midpoint="0.9213"
    />,
  );
  expect(screen.getByText("USDC/EURC")).toBeDefined();
  // The kit renders the midpoint via the rolling-digit NumberTicker: each
  // numeral becomes a vertical 0–9 strip and the non-digit separator renders
  // flat. Assert the ticker is mounted (one "." separator span + a digit strip
  // per numeral) rather than expecting a single "0.9213" text node.
  const trigger = screen.getByRole("button", { name: /Pair: USDC\/EURC/ });
  const dotSpans = Array.from(trigger.querySelectorAll("span")).filter(
    (s) => s.textContent === ".",
  );
  expect(dotSpans.length).toBe(1);
  const digitStrips = Array.from(trigger.querySelectorAll("span")).filter(
    (s) => s.textContent === "0123456789",
  );
  // "0.9213" has five numerals, each rendered as a rolling 0–9 strip.
  expect(digitStrips.length).toBeGreaterThanOrEqual(5);
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
