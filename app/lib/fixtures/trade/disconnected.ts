import type { TradeFixture } from "../types";

/**
 * /trade disconnected — wallet not connected.
 *
 * Public market data (book + midpoint) is still visible — only `myOpenOrders`
 * is hidden. The page overlays the order form with a Connect Wallet prompt.
 */
export const tradeDisconnected: TradeFixture = {
  pair: "USDC/EURC",
  midpoint: "0.9213",
  recentFills: [],
  bids: [
    { price: "0.9212", size: "12,500.00" },
    { price: "0.9211", size: "28,400.00" },
    { price: "0.9210", size: "55,200.00" },
  ],
  asks: [
    { price: "0.9214", size: "9,800.00" },
    { price: "0.9215", size: "22,100.00" },
    { price: "0.9216", size: "48,700.00" },
  ],
  myOpenOrders: [],
};
