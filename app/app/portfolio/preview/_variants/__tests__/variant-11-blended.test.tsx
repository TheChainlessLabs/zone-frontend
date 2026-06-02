import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import type { PortfolioFixture } from "@/lib/fixtures";

import Variant11Blended from "../variant-11-blended";

afterEach(cleanup);

it("renders each live token with its token-denominated balance", () => {
  const fixture: PortfolioFixture = {
    totalValueUSD: "30,000.00",
    balances: [
      {
        token: "PATH.USD",
        available: "25,000.00",
        locked: "0.00",
        total: "25,000.00",
      },
      {
        token: "OALPHA",
        available: "5,000.00",
        locked: "0.00",
        total: "5,000.00",
      },
    ],
    openOrders: [],
    recentFills: [],
    deposits: [],
    withdrawals: [],
  };

  render(<Variant11Blended fixture={fixture} />);

  expect(screen.getByText("Token balances")).toBeDefined();
  expect(screen.getByText("25,000.00 PATH.USD")).toBeDefined();
  expect(screen.getByText("5,000.00 OALPHA")).toBeDefined();
});
