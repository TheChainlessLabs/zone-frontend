import type { TradeFixture } from "../types";

/** /trade error — gateway unreachable; page renders ErrorState. */
export const tradeError: TradeFixture = {
  pair: "USDC/EURC",
  midpoint: "",
  recentFills: [],
  bids: [],
  asks: [],
  myOpenOrders: [],
  error: {
    message: "Market data unavailable. Retry in a moment.",
    code: "GATEWAY_UNREACHABLE",
  },
};
