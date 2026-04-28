import type { PortfolioFixture } from "../types";

/** /portfolio loading — page renders inline loading affordances. */
export const portfolioLoading: PortfolioFixture = {
  totalValueUSD: "",
  balances: [],
  openOrders: [],
  recentFills: [],
  deposits: [],
  withdrawals: [],
  isLoading: true,
};
