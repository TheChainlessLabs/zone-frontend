import type { TradeFixture } from "../types";

/** /trade loading — page renders inline loading affordances. */
export const tradeLoading: TradeFixture = {
  pair: "USDC/EURC",
  midpoint: "",
  recentFills: [],
  bids: [],
  asks: [],
  myOpenOrders: [],
  isLoading: true,
};
