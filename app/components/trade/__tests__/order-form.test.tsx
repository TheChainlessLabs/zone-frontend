import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { OrderForm } from "@/components/trade";
import { DEFAULT_PAIR } from "@/lib/fixtures/pairs";

afterEach(() => {
  cleanup();
});

it("renders Market mode by default with Buy/Sell + percentage shortcuts", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
      available="10000.00"
    />,
  );
  expect(screen.getByRole("radio", { name: /Buy/ })).toBeDefined();
  expect(screen.getByRole("radio", { name: /Sell/ })).toBeDefined();
  expect(screen.getByRole("button", { name: "25%" })).toBeDefined();
  expect(screen.getByRole("button", { name: "50%" })).toBeDefined();
  expect(screen.getByRole("button", { name: "75%" })).toBeDefined();
  expect(screen.getByRole("button", { name: "MAX" })).toBeDefined();
});

it("does not render the in-form Market/Limit tabs (lifted to page-level OrderModeSelector)", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
      available="10000.00"
    />,
  );
  expect(screen.queryByRole("tab", { name: "Market" })).toBeNull();
  expect(screen.queryByRole("tab", { name: "Limit" })).toBeNull();
});

it("renders the top-line execution summary with side, pair, midpoint, and available balance", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
      available="10000.00"
    />,
  );
  const summary = screen.getByLabelText("Order summary");
  expect(summary.textContent).toContain("BUY");
  expect(summary.textContent).toContain(`${DEFAULT_PAIR.base}/${DEFAULT_PAIR.quote}`);
  expect(summary.textContent).toContain("0.9213");
  expect(summary.textContent).toContain("Available");
  expect(summary.textContent).toContain(`10,000.00 ${DEFAULT_PAIR.quote}`);
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
  expect(
    screen.getByRole("button", { name: new RegExp(`Buy ${DEFAULT_PAIR.base}`) }),
  ).toBeDefined();
});

it("CTA stays a simple verb + token label once amount is valid", () => {
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
  const cta = screen.getByRole("button", {
    name: new RegExp(`Buy ${DEFAULT_PAIR.base}`),
  });
  expect(cta.textContent).toContain(`Buy ${DEFAULT_PAIR.base}`);
  expect(cta.textContent).not.toContain("Submit");
  expect(cta.textContent).not.toContain("privately matched");
});

it("CTA flips to the Sell label after toggling side", () => {
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
  const cta = screen.getByRole("button", {
    name: new RegExp(`Sell ${DEFAULT_PAIR.base}`),
  });
  expect(cta.textContent).toContain(`Sell ${DEFAULT_PAIR.base}`);
});

it("clicking submit opens the confirmation modal with the order summary", () => {
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
  fireEvent.click(screen.getByRole("button", { name: /Buy USDC/i }));

  expect(screen.getByRole("dialog")).toBeDefined();
  // Receipt-format summary: ORDER PREVIEW header + privacy line
  expect(screen.getByText(/ORDER PREVIEW/i)).toBeDefined();
  expect(screen.getByText(/Matches privately at midpoint/i)).toBeDefined();
});

it("confirming in the modal calls onSubmit and closes the modal", () => {
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
  fireEvent.click(screen.getByRole("button", { name: /Buy USDC/i }));
  fireEvent.click(screen.getByRole("button", { name: /Confirm order/i }));

  expect(onSubmit).toHaveBeenCalledOnce();
  expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
    mode: "market",
    side: "buy",
    amount: "100",
  });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect((screen.getByLabelText("Amount") as HTMLInputElement).value).toBe("");
});

it("cancelling the modal keeps the form state intact", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="limit"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  fireEvent.change(screen.getByLabelText("Amount"), {
    target: { value: "250" },
  });
  fireEvent.change(screen.getByLabelText("Limit price"), {
    target: { value: "0.9300" },
  });
  fireEvent.click(screen.getByRole("button", { name: /Buy USDC/i }));
  fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

  expect(screen.queryByRole("dialog")).toBeNull();
  expect((screen.getByLabelText("Amount") as HTMLInputElement).value).toBe("250");
  expect((screen.getByLabelText("Limit price") as HTMLInputElement).value).toBe("0.9300");
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
  expect(
    screen.queryByText("Orders match privately at midpoint."),
  ).toBeNull();
});

it("renders the in-form Midpoint / Est. received / Fee strip", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  expect(screen.getByText("Midpoint")).toBeDefined();
  expect(screen.getByText("Est. received")).toBeDefined();
  expect(screen.getByText("Fee")).toBeDefined();
  expect(screen.queryByText("Settlement")).toBeNull();
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
  fireEvent.keyDown(form, { key: "s" });
  expect(screen.getByLabelText("Order summary").textContent).toContain("SELL");
  fireEvent.keyDown(form, { key: "b" });
  expect(screen.getByLabelText("Order summary").textContent).toContain("BUY");
  const priceInput = screen.getByLabelText("Limit price") as HTMLInputElement;
  fireEvent.change(priceInput, { target: { value: "" } });
  fireEvent.keyDown(form, { key: "m" });
  expect(priceInput.value).toBe("0.9213");
});

it("does not render the in-form order pipeline rail", () => {
  render(
    <OrderForm
      pair={DEFAULT_PAIR}
      mode="market"
      onModeChange={() => {}}
      midpoint="0.9213"
    />,
  );
  expect(
    screen.queryByRole("group", { name: /Order execution pipeline/i }),
  ).toBeNull();
});
