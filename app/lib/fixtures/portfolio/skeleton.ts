import type { PortfolioFixture } from "../types";

/** /portfolio skeleton — first paint before any data lands. */
export const portfolioSkeleton: PortfolioFixture = {
  totalValueUSD: "",
  balances: [],
  openOrders: [],
  recentFills: [],
  deposits: [],
  withdrawals: [],
  isLoading: true,
};
