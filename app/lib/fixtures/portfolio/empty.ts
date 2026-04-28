import type { PortfolioFixture } from "../types";

/** /portfolio empty — connected, never traded, no balances. */
export const portfolioEmpty: PortfolioFixture = {
  totalValueUSD: "0.00",
  balances: [
    { token: "USDC", available: "0.00", locked: "0.00", total: "0.00" },
    { token: "EURC", available: "0.00", locked: "0.00", total: "0.00" },
  ],
  openOrders: [],
  recentFills: [],
  deposits: [],
  withdrawals: [],
};
