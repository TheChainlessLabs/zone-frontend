import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

// next/navigation's `useSearchParams` is mocked at module scope so the
// in-ticket execution rail's `?simulateFailure=true` branch can be exercised.
let currentParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => currentParams,
}));

import { OrderForm } from "@/components/trade";
import { DEFAULT_PAIR } from "@/lib/fixtures/pairs";

afterEach(() => {
  cleanup();
  currentParams = new URLSearchParams();
  vi.useRealTimers();
});

beforeEach(() => {
  currentParams = new URLSearchParams();
});

it("renders Market mode by default with Buy/Sell + percentage shortcuts", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  expect(screen.getByRole("tab", { name: "Market" })).toBeDefined();
  expect(screen.getByRole("tab", { name: "Limit" })).toBeDefined();
  expect(screen.getByRole("radio", { name: /Buy/ })).toBeDefined();
  expect(screen.getByRole("radio", { name: /Sell/ })).toBeDefined();
  // Percentage shortcuts (4 outline buttons).
  expect(screen.getByRole("button", { name: "25" })).toBeDefined();
  expect(screen.getByRole("button", { name: "50" })).toBeDefined();
  expect(screen.getByRole("button", { name: "75" })).toBeDefined();
  expect(screen.getByRole("button", { name: "MAX" })).toBeDefined();
});

it("renders the top-line execution summary with side, pair, midpoint, and available balance", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  const summary = screen.getByLabelText("Order summary");
  // Default side is Buy.
  expect(summary.textContent).toContain("BUY");
  expect(summary.textContent).toContain(`${DEFAULT_PAIR.base}/${DEFAULT_PAIR.quote}`);
  expect(summary.textContent).toContain("0.9213");
  expect(summary.textContent).toContain("Available");
  expect(summary.textContent).toContain(`10,000.00 ${DEFAULT_PAIR.base}`);
});

it("top-line summary flips to SELL tone when Sell is selected", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  fireEvent.click(screen.getByRole("radio", { name: /Sell/ }));
  expect(screen.getByLabelText("Order summary").textContent).toContain("SELL");
});

it("Limit mode reveals the Limit price input", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="limit"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  expect(screen.getByLabelText("Limit price")).toBeDefined();
});

it("CTA falls back to a generic verb+base when amount is empty (Buy)", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  // Fallback label: `Buy USDC` (no amount entered yet).
  expect(
    screen.getByRole("button", { name: new RegExp(`Buy ${DEFAULT_PAIR.base}`) }),
  ).toBeDefined();
});

it("CTA carries the order summary with privacy claim once amount is valid (Buy)", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  fireEvent.change(screen.getByLabelText("Amount"), {
    target: { value: "1000" },
  });
  // CTA: `Submit · Buy 1,000.00 USDC at 0.9213 EURC · privately matched`.
  const cta = screen.getByRole("button", { name: /Submit/ });
  expect(cta.textContent).toContain("Submit");
  expect(cta.textContent).toContain(`Buy 1,000.00 ${DEFAULT_PAIR.base}`);
  expect(cta.textContent).toContain(`0.9213 ${DEFAULT_PAIR.quote}`);
  expect(cta.textContent).toContain("privately matched");
});

it("CTA shows the Sell-side summary copy after toggling to Sell", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  fireEvent.click(screen.getByRole("radio", { name: /Sell/ }));
  fireEvent.change(screen.getByLabelText("Amount"), {
    target: { value: "500" },
  });
  const cta = screen.getByRole("button", { name: /Submit/ });
  expect(cta.textContent).toContain(`Sell 500.00 ${DEFAULT_PAIR.base}`);
  expect(cta.textContent).toContain("privately matched");
});

it("submits the form with the entered amount + side", () => {
  const onSubmit = vi.fn();
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
      onSubmit={onSubmit}
    />,
  );
  fireEvent.change(screen.getByLabelText("Amount"), {
    target: { value: "100" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Submit/ }));
  expect(onSubmit).toHaveBeenCalledOnce();
  expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
    mode: "market",
    side: "buy",
    amount: "100",
  });
});

it("renders error tile in place of the CTA when errorMessage is set", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint=""
      errorMessage="Market data unavailable. Retry in a moment."
    />,
  );
  expect(
    screen.getByText("Market data unavailable. Retry in a moment."),
  ).toBeDefined();
  expect(screen.queryByRole("button", { name: /Submit/ })).toBeNull();
  expect(screen.queryByRole("button", { name: /Buy USDC/ })).toBeNull();
});

it("disables submit when amount is zero/empty", () => {
  const onSubmit = vi.fn();
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
      onSubmit={onSubmit}
    />,
  );
  // Fallback CTA label is `Buy USDC` when amount is empty.
  const cta = screen.getByRole("button", {
    name: new RegExp(`Buy ${DEFAULT_PAIR.base}`),
  });
  expect(cta.hasAttribute("disabled")).toBe(true);
  fireEvent.click(cta);
  expect(onSubmit).not.toHaveBeenCalled();
});

it("does not render the legacy 11px privacy footer line", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  // M4.11: privacy claim moved into CTA copy.
  expect(
    screen.queryByText("Orders match privately at midpoint."),
  ).toBeNull();
});

it("does not render the in-form Type/Fee/Est. receive strip", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  // M4.8: removed; that data lives in <ExecutionContextStrip /> below the form.
  expect(screen.queryByText("Type")).toBeNull();
  expect(screen.queryByText("Fee")).toBeNull();
  expect(screen.queryByText("Est. receive")).toBeNull();
});

it("hotkey B/S toggles side; M sets price to midpoint in limit mode", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="limit"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  const form = screen.getByLabelText("Order entry");
  // Press S → flips to Sell.
  fireEvent.keyDown(form, { key: "s" });
  expect(screen.getByLabelText("Order summary").textContent).toContain("SELL");
  // Press B → flips back to Buy.
  fireEvent.keyDown(form, { key: "b" });
  expect(screen.getByLabelText("Order summary").textContent).toContain("BUY");
  // Clear price, press M → restores midpoint.
  const priceInput = screen.getByLabelText("Limit price") as HTMLInputElement;
  fireEvent.change(priceInput, { target: { value: "" } });
  fireEvent.keyDown(form, { key: "m" });
  expect(priceInput.value).toBe("0.9213");
});

it("renders the OrderPipeline in idle state by default", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  expect(
    screen.getByRole("group", { name: /Order execution pipeline/i }),
  ).toBeDefined();
  expect(screen.getByText("Order pipeline · idle")).toBeDefined();
  ["sign", "queued", "matched", "settling", "settled"].forEach((s) => {
    expect(document.querySelector(`[data-stage="${s}"]`)).not.toBeNull();
  });
});

it("advances the pipeline through Sign → Queued → Matched → Settling → Settled on submit", () => {
  vi.useFakeTimers();
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  fireEvent.change(screen.getByLabelText("Amount"), {
    target: { value: "100" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Submit/ }));

  // Submit lands the user on `sign` immediately.
  expect(
    document.querySelector('[data-stage="sign"]')?.getAttribute("data-state"),
  ).toBe("current");

  const expected: Array<[string, string]> = [
    ["queued", "current"],
    ["matched", "current"],
    ["settling", "current"],
    ["settled", "current"],
  ];
  for (const [stage, state] of expected) {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      document.querySelector(`[data-stage="${stage}"]`)?.getAttribute("data-state"),
    ).toBe(state);
  }

  // Idle caption is gone once the pipeline starts.
  expect(screen.queryByText("Order pipeline · idle")).toBeNull();
});

it("surfaces the failure banner + Simulate failure trigger when ?simulateFailure=true", () => {
  vi.useFakeTimers();
  currentParams = new URLSearchParams("simulateFailure=true");
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  fireEvent.change(screen.getByLabelText("Amount"), {
    target: { value: "100" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Submit/ }));

  // Tick to settling so the failure lands at a representative late stage.
  // Separate `act` blocks so each render flush queues the next effect's timer
  // before the next advance.
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(
    document
      .querySelector('[data-stage="settling"]')
      ?.getAttribute("data-state"),
  ).toBe("current");

  fireEvent.click(
    screen.getByRole("button", { name: /Simulate failure at current stage/i }),
  );

  expect(
    document.querySelector('[data-stage="settling"]')?.getAttribute("data-state"),
  ).toBe("failed");
  expect(
    screen.getByText(/Settlement reverted on L1\./),
  ).toBeDefined();
  expect(
    screen.getByRole("link", { name: /View your fills/i }),
  ).toBeDefined();
});
