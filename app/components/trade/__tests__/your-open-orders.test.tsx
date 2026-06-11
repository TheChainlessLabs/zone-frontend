import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

import { YourOpenOrders } from "@/components/trade";
import type { OrderFixture } from "@/lib/view-types";

afterEach(cleanup);

const order: OrderFixture = {
  id: "o-1",
  pair: "OALPHA/PATH.USD",
  side: "buy",
  type: "limit",
  amount: "5.00",
  price: "1.000000",
  filledPercent: 0,
  status: "pending",
  submittedAt: "2026-06-11T12:34:56.000Z",
};

it("renders the heading and a resting-order count", () => {
  render(<YourOpenOrders orders={[order]} />);
  expect(screen.getByText("Open orders")).toBeDefined();
  expect(screen.getByText("1 order resting")).toBeDefined();
});

it("renders an empty state when there are no open orders", () => {
  render(<YourOpenOrders orders={[]} />);
  expect(
    screen.getByText(/No open orders\. Your resting limit orders/),
  ).toBeDefined();
  expect(screen.queryByRole("table")).toBeNull();
});

it("renders a row with side, amount, price and status for each order", () => {
  render(<YourOpenOrders orders={[order]} />);
  const table = screen.getByRole("table");
  expect(within(table).getByText("Buy")).toBeDefined();
  expect(within(table).getByText("5.00")).toBeDefined();
  expect(within(table).getByText("1.000000")).toBeDefined();
  expect(within(table).getByText("OALPHA/PATH.USD")).toBeDefined();
});

it("shows an error row instead of the table when errorMessage is set", () => {
  render(<YourOpenOrders orders={[order]} errorMessage="Zone unreachable" />);
  expect(screen.getByRole("alert")).toBeDefined();
  expect(screen.getByText("Zone unreachable")).toBeDefined();
  expect(screen.queryByRole("table")).toBeNull();
});
