import type { TradeFixture } from "../types";

/**
 * /trade wrong-network — wallet connected to a chain Omega doesn't support.
 *
 * The page shows the book read-only and replaces the order form with a
 * "Switch network" prompt. Recent fills and own orders are gated.
 */
export const tradeWrongNetwork: TradeFixture = {
  pair: "USDC/EURC",
  midpoint: "0.9213",
  recentFills: [],
  bids: [
    { price: "0.9212", size: "12,500.00" },
    { price: "0.9211", size: "28,400.00" },
  ],
  asks: [
    { price: "0.9214", size: "9,800.00" },
    { price: "0.9215", size: "22,100.00" },
  ],
  myOpenOrders: [],
};
