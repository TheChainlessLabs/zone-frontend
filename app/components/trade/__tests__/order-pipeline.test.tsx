import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { OrderPipeline } from "@/components/trade";

afterEach(cleanup);

const STAGES = ["sign", "queued", "matched", "settling", "settled"] as const;

function lozengeState(stage: string): string | null {
  return (
    document.querySelector(`[data-stage="${stage}"]`)?.getAttribute("data-state") ?? null
  );
}

it("renders the Order pipeline · idle caption when stage=idle", () => {
  render(<OrderPipeline stage="idle" />);
  expect(screen.getByText("Order pipeline · idle")).toBeDefined();
  // Every stage carries data-state="idle".
  STAGES.forEach((s) => {
    expect(lozengeState(s)).toBe("idle");
  });
});

it("marks completed stages and the current stage when stage=matched", () => {
  render(<OrderPipeline stage="matched" />);
  expect(screen.queryByText("Order pipeline · idle")).toBeNull();
  expect(lozengeState("sign")).toBe("completed");
  expect(lozengeState("queued")).toBe("completed");
  expect(lozengeState("matched")).toBe("current");
  expect(lozengeState("settling")).toBe("future");
  expect(lozengeState("settled")).toBe("future");
});

it("marks the failed stage and stops the rail when stage=failed/failedAt=settling", () => {
  render(<OrderPipeline stage="failed" failedAt="settling" />);
  expect(lozengeState("sign")).toBe("completed");
  expect(lozengeState("queued")).toBe("completed");
  expect(lozengeState("matched")).toBe("completed");
  expect(lozengeState("settling")).toBe("failed");
  expect(lozengeState("settled")).toBe("future");
});

it("treats stage=sign as the first current step with no prior completions", () => {
  render(<OrderPipeline stage="sign" />);
  expect(lozengeState("sign")).toBe("current");
  expect(lozengeState("queued")).toBe("future");
});

it("each stage lozenge is keyboard-focusable and exposes lifecycle copy via aria-label", () => {
  render(<OrderPipeline stage="idle" />);
  STAGES.forEach((s) => {
    const node = document.querySelector(
      `[data-stage="${s}"]`,
    ) as HTMLButtonElement | null;
    expect(node).not.toBeNull();
    expect(node!.tabIndex).toBeGreaterThanOrEqual(0);
    // aria-label is "<Label> stage" — short, unique, doesn't collide with
    // the form's "Submit ·" CTA label. Tooltip text is exposed via Radix's
    // aria-describedby, not folded into the label.
    expect(node!.getAttribute("aria-label")).toMatch(/^[A-Z][a-z]+ stage$/);
  });
});

it("matches the snapshot for each canonical state", () => {
  // Idle.
  const { container: cIdle } = render(<OrderPipeline stage="idle" />);
  expect(cIdle.firstChild).toMatchSnapshot("idle");
  cleanup();

  // Current = sign.
  const { container: cSign } = render(<OrderPipeline stage="sign" />);
  expect(cSign.firstChild).toMatchSnapshot("current-sign");
  cleanup();

  // Current = matched (two completed behind it).
  const { container: cMatched } = render(<OrderPipeline stage="matched" />);
  expect(cMatched.firstChild).toMatchSnapshot("current-matched");
  cleanup();

  // Failed at settling.
  const { container: cFail } = render(
    <OrderPipeline stage="failed" failedAt="settling" />,
  );
  expect(cFail.firstChild).toMatchSnapshot("failed-at-settling");
});
