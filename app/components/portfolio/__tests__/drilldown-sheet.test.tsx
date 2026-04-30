/**
 * PortfolioDrilldownSheet tests — M4.17.
 *
 * Verifies:
 *   1. With `open={false}` and no payload, nothing renders.
 *   2. With a payload + `open=true`, the desktop Sheet (Radix Dialog) opens
 *      with role=dialog and the right title.
 *   3. The receipt body for an open-position payload renders the metadata
 *      and the four numbered actions (Sign / Queue / Match / Settle).
 *   4. Fill payload renders the four-step lifecycle with Notional / Fee /
 *      Net totals + the Etherscan footer when txHash exists.
 *   5. Failed-order payload tints the Settle action destructive and
 *      surfaces the muted "Settlement reverted" note.
 *   6. Esc closes the dialog (Radix Dialog default).
 *   7. `aria-label` is attached to SheetContent.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import {
  PortfolioDrilldownSheet,
  type PortfolioDrilldownPayload,
} from "@/components/portfolio/drilldown-sheet";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// Radix Dialog uses ResizeObserver / hasPointerCapture in some code paths.
// jsdom doesn't ship them — stub before each render.
function stubDomGlobals() {
  if (!("ResizeObserver" in globalThis)) {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}

const ORDER_PAYLOAD: PortfolioDrilldownPayload = {
  kind: "order",
  order: {
    id: "o-9482",
    pair: "USDC/EURC",
    side: "sell",
    type: "limit",
    amount: "5000.00",
    price: "0.9215",
    filledPercent: 30,
    status: "matched",
    submittedAt: "2026-04-20T12:30:00.000Z",
  },
};

const FAILED_ORDER_PAYLOAD: PortfolioDrilldownPayload = {
  kind: "order",
  order: {
    id: "o-1111",
    pair: "USDC/EURC",
    side: "sell",
    type: "limit",
    amount: "5000.00",
    price: "0.9215",
    filledPercent: 30,
    status: "failed",
    submittedAt: "2026-04-20T12:30:00.000Z",
  },
};

const FILL_PAYLOAD: PortfolioDrilldownPayload = {
  kind: "fill",
  fill: {
    id: "f-7301",
    orderId: "o-9482",
    pair: "USDC/EURC",
    side: "sell",
    amount: "1500.00",
    price: "0.9215",
    matchedAt: "2026-04-20T12:35:00.000Z",
    status: "settled",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
};

describe("PortfolioDrilldownSheet", () => {
  it("renders nothing when no payload has ever been provided", () => {
    stubDomGlobals();
    const { container } = render(
      <PortfolioDrilldownSheet
        open={false}
        onOpenChange={() => {}}
        payload={null}
      />,
    );
    expect(container.querySelector("[role=dialog]")).toBeNull();
  });

  it("opens with role=dialog, the canonical title, and an aria-label", () => {
    stubDomGlobals();
    render(
      <PortfolioDrilldownSheet
        open
        onOpenChange={() => {}}
        payload={ORDER_PAYLOAD}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-label")).toBe(
      "open order o-9482 receipt",
    );
    // Appears in both the SheetTitle and the receipt's Header label —
    // both are intentional. Just confirm at least one renders.
    expect(screen.getAllByText("OPEN ORDER o-9482").length).toBeGreaterThan(0);
  });

  it("renders the four numbered actions for an order receipt", () => {
    stubDomGlobals();
    render(
      <PortfolioDrilldownSheet
        open
        onOpenChange={() => {}}
        payload={ORDER_PAYLOAD}
      />,
    );
    expect(screen.getByText("Sign")).toBeDefined();
    expect(screen.getByText("Queue")).toBeDefined();
    expect(screen.getByText("Match")).toBeDefined();
    expect(screen.getByText("Settle")).toBeDefined();
  });

  it("renders Notional / Fee / Net totals + the Etherscan footer for a fill receipt with txHash", () => {
    stubDomGlobals();
    render(
      <PortfolioDrilldownSheet
        open
        onOpenChange={() => {}}
        payload={FILL_PAYLOAD}
      />,
    );
    expect(screen.getByText("Notional")).toBeDefined();
    expect(screen.getByText("Fee")).toBeDefined();
    expect(screen.getByText("Net")).toBeDefined();
    const footer = screen.getByRole("link", { name: /view on etherscan/i });
    expect(footer.getAttribute("href")).toContain(
      "0x1234567890abcdef",
    );
  });

  it("paints the Settle action destructive and shows the reverted note for a failed order", () => {
    stubDomGlobals();
    render(
      <PortfolioDrilldownSheet
        open
        onOpenChange={() => {}}
        payload={FAILED_ORDER_PAYLOAD}
      />,
    );
    const settle = screen.getByText("Settle").closest("li");
    expect(settle?.getAttribute("data-state")).toBe("failed");
    expect(
      screen.getByText(/Settlement reverted on L1/),
    ).toBeDefined();
  });

  it("Esc fires onOpenChange(false) — Radix Dialog default", () => {
    stubDomGlobals();
    const onOpenChange = vi.fn();
    render(
      <PortfolioDrilldownSheet
        open
        onOpenChange={onOpenChange}
        payload={ORDER_PAYLOAD}
      />,
    );
    fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
