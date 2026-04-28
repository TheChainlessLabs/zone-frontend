import type { PortfolioFixture } from "../types";

/**
 * /portfolio disconnected — wallet not connected.
 *
 * Page renders DisconnectedState with a Connect Wallet CTA. No balances,
 * orders, or onchain history are visible without a connected session.
 */
export const portfolioDisconnected: PortfolioFixture = {
  totalValueUSD: "",
  balances: [],
  openOrders: [],
  recentFills: [],
  deposits: [],
  withdrawals: [],
};
