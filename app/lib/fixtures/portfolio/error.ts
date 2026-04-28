import type { PortfolioFixture } from "../types";

/** /portfolio error — gateway returned 5xx; page renders ErrorState. */
export const portfolioError: PortfolioFixture = {
  totalValueUSD: "",
  balances: [],
  openOrders: [],
  recentFills: [],
  deposits: [],
  withdrawals: [],
  error: {
    message: "Portfolio unavailable. Retry in a moment.",
    code: "GATEWAY_5XX",
  },
};
