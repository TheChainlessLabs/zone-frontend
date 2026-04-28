import type { TradeFixture } from "../types";

/** /trade empty — connected user, fresh pair, no liquidity, no own orders. */
export const tradeEmpty: TradeFixture = {
  pair: "USDC/EURC",
  midpoint: "0.9213",
  recentFills: [],
  bids: [],
  asks: [],
  myOpenOrders: [],
};
