import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { Badge } from "@/components/ui/badge";
import {
  Status,
  STATE_SPECS,
  type StatusState,
} from "@/components/ui/status";

afterEach(cleanup);

const BADGE_VARIANTS = [
  "default",
  "outline",
  "success",
  "destructive",
  "glass",
] as const;

it.each(BADGE_VARIANTS)("Badge renders the %s variant", (variant) => {
  render(<Badge variant={variant}>{variant}</Badge>);
  expect(screen.getByText(variant)).toBeDefined();
});

it("Badge.Dot renders inside a Badge and forwards attrs", () => {
  render(
    <Badge variant="success" className="font-mono" data-testid="b">
      <Badge.Dot data-testid="dot" />
      Connected
    </Badge>
  );
  const root = screen.getByTestId("b");
  expect(screen.getByTestId("dot")).toBeDefined();
  expect(root.textContent).toContain("Connected");
  expect(root.className).toContain("font-mono");
});

const STATES = Object.keys(STATE_SPECS) as StatusState[];

it.each(STATES)("Status state=%s renders its canonical label", (state) => {
  const { label } = STATE_SPECS[state];
  render(<Status state={state} data-testid={`s-${state}`} />);
  // Label is split across nodes by the Animate wrapper; assert via the
  // root data attribute and full text content.
  const el = screen.getByTestId(`s-${state}`);
  expect(el.getAttribute("data-status")).toBe(state);
  expect(el.textContent ?? "").toContain(label);
});

it("Status accepts a label override", () => {
  render(<Status state="settled" label="Settled onchain" data-testid="s" />);
  expect(screen.getByTestId("s").textContent ?? "").toContain("Settled onchain");
});

it("Status glass prop swaps the badge variant", () => {
  // Asserting the .glass-pill class keeps this resilient to inner markup.
  render(<Status state="connected" glass data-testid="s" />);
  expect(screen.getByTestId("s").className).toContain("glass-pill");
});
