import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { OrderForm } from "@/components/trade";
import { DEFAULT_PAIR } from "@/lib/fixtures/pairs";

afterEach(cleanup);

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
  // Privacy notice — terse, period-terminated.
  expect(
    screen.getByText("Orders match privately at midpoint."),
  ).toBeDefined();
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
  fireEvent.click(screen.getByRole("button", { name: /Buy USDC/ }));
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
  const cta = screen.getByRole("button", { name: /Buy USDC/ });
  expect(cta.hasAttribute("disabled")).toBe(true);
  fireEvent.click(cta);
  expect(onSubmit).not.toHaveBeenCalled();
});
