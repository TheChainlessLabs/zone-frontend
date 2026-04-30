/**
 * LifecyclePip tests — M4.9.
 *
 * Verifies:
 *   1. Stage progression paints reached / current / future correctly
 *      for every canonical status (queued / sealed / proven / settled).
 *   2. Failed status flips the current stage to the destructive tone
 *      while leaving prior reached stages tinted.
 *   3. Compact mode shrinks the dots without changing the progression
 *      semantics.
 *   4. Tooltip + aria-describedby wiring matches the M4.10 contract so
 *      sighted hover and assistive-tech surfaces speak the same string.
 */
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { LifecyclePip } from "@/components/portfolio/lifecycle-pip";

afterEach(cleanup);

function dotStates(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("[data-stage]")).map(
    (el) => el.getAttribute("data-state") ?? "",
  );
}

it("queued → only the first dot is current; rest are future", () => {
  const { container } = render(<LifecyclePip status="queued" />);
  expect(dotStates(container)).toEqual([
    "current",
    "future",
    "future",
    "future",
  ]);
});

it("sealed → queued reached, sealed current, proven/settled future", () => {
  const { container } = render(<LifecyclePip status="sealed" />);
  expect(dotStates(container)).toEqual([
    "reached",
    "current",
    "future",
    "future",
  ]);
});

it("matched (legacy fill alias for sealed) maps to the same progression", () => {
  const { container } = render(<LifecyclePip status="matched" />);
  expect(dotStates(container)).toEqual([
    "reached",
    "current",
    "future",
    "future",
  ]);
});

it("proven → first two reached, proven current, settled future", () => {
  const { container } = render(<LifecyclePip status="proven" />);
  expect(dotStates(container)).toEqual([
    "reached",
    "reached",
    "current",
    "future",
  ]);
});

it("settled → first three reached, settled current", () => {
  const { container } = render(<LifecyclePip status="settled" />);
  expect(dotStates(container)).toEqual([
    "reached",
    "reached",
    "reached",
    "current",
  ]);
});

it("verified (batch-detail end state) maps to settled", () => {
  const { container } = render(<LifecyclePip status="verified" />);
  expect(dotStates(container)).toEqual([
    "reached",
    "reached",
    "reached",
    "current",
  ]);
});

it("failed → prior reached stages stay tinted, failed dot flips destructive", () => {
  const { container } = render(<LifecyclePip status="failed" />);
  expect(dotStates(container)).toEqual([
    "reached",
    "reached",
    "reached",
    "failed",
  ]);
});

it("compact mode renders smaller dots while preserving stage states", () => {
  const { container } = render(<LifecyclePip status="proven" compact />);
  const dots = container.querySelectorAll(
    "[data-stage]",
  ) as NodeListOf<HTMLElement>;
  expect(dots.length).toBe(4);
  // Compact dots are 4px; default is 6px. Read back from inline style.
  for (const dot of dots) {
    expect(dot.style.width).toBe("4px");
    expect(dot.style.height).toBe("4px");
  }
  expect(dotStates(container)).toEqual([
    "reached",
    "reached",
    "current",
    "future",
  ]);
});

it("default mode renders 6px dots", () => {
  const { container } = render(<LifecyclePip status="settled" />);
  const dots = container.querySelectorAll(
    "[data-stage]",
  ) as NodeListOf<HTMLElement>;
  for (const dot of dots) {
    expect(dot.style.width).toBe("6px");
    expect(dot.style.height).toBe("6px");
  }
});

it("wires aria-describedby to the tooltip content id", () => {
  render(<LifecyclePip status="settled" />);
  const trigger = screen.getByRole("img");
  const describedBy = trigger.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  expect(describedBy).toMatch(/^lifecycle-pip-tooltip-/);
});

it("ariaLabel override replaces the default progression sentence", () => {
  render(
    <LifecyclePip
      status="proven"
      ariaLabel="Custom lifecycle label for the row"
    />,
  );
  const trigger = screen.getByRole("img");
  expect(trigger.getAttribute("aria-label")).toBe(
    "Custom lifecycle label for the row",
  );
});

it("default aria-label includes the canonical stage label and ordinal", () => {
  render(<LifecyclePip status="proven" />);
  const trigger = screen.getByRole("img");
  const label = trigger.getAttribute("aria-label") ?? "";
  expect(label).toContain("Proven");
  expect(label).toContain("3 of 4");
});

it("failed aria-label calls out the failure", () => {
  render(<LifecyclePip status="failed" />);
  const trigger = screen.getByRole("img");
  const label = trigger.getAttribute("aria-label") ?? "";
  expect(label.toLowerCase()).toContain("failed");
});
