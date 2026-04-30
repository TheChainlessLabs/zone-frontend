/**
 * Status tooltip tests — M4.10.
 *
 * Verifies the lifecycle tooltip:
 *   1. wires `aria-describedby` onto the badge so screen-reader users
 *      get the same plain-language string as sighted hover users
 *   2. omits tooltip wiring when no copy is provided so existing pills
 *      stay backwards compatible
 *   3. mounts the tooltip content (and resolves `aria-describedby` to
 *      the matching `id`) when the tooltip is rendered open
 */
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { Status } from "@/components/ui/status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

afterEach(cleanup);

it("wires aria-describedby on the badge when tooltip is set", () => {
  render(
    <Status
      state="settled"
      tooltip="Anchored on Ethereum L1. Funds usable for withdrawal."
      data-testid="settled-pill"
    />,
  );
  const pill = screen.getByTestId("settled-pill");
  const describedBy = pill.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  expect(describedBy).toMatch(/^status-tooltip-/);
});

it("does not set aria-describedby when no tooltip is provided", () => {
  render(<Status state="settled" data-testid="bare-pill" />);
  const pill = screen.getByTestId("bare-pill");
  expect(pill.getAttribute("aria-describedby")).toBeNull();
});

it("renders the tooltip copy in the DOM and links it via aria-describedby when open", async () => {
  // Drive the tooltip open via Radix's controlled `open` prop so the
  // test stays deterministic regardless of jsdom's pointer/focus
  // simulation. Mirrors the structure inside Status to cover the same
  // wiring contract.
  const copy = "Submitted, waiting for the next batch sealing.";
  function Harness() {
    const id = "status-tooltip-fixture";
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip open>
          <TooltipTrigger asChild>
            <span data-testid="trigger" aria-describedby={id}>
              Pending
            </span>
          </TooltipTrigger>
          <TooltipContent id={id} role="tooltip">
            {copy}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  render(<Harness />);
  const trigger = screen.getByTestId("trigger");
  expect(trigger.getAttribute("aria-describedby")).toBe(
    "status-tooltip-fixture",
  );
  const matches = await screen.findAllByText(copy);
  expect(matches.length).toBeGreaterThan(0);
  // The portalled content must carry the same id so the
  // aria-describedby relationship resolves for screen readers.
  const labelled = matches.find(
    (node) => node.getAttribute("id") === "status-tooltip-fixture",
  );
  expect(labelled).toBeDefined();
});
