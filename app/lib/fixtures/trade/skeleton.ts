import type { TradeFixture } from "../types";

/**
 * /trade skeleton — first paint before any data lands.
 *
 * Same as `loading` but the page renders skeleton primitives instead of
 * inline spinners. The shape stays identical so the page only branches
 * on `state === "skeleton"`.
 */
export const tradeSkeleton: TradeFixture = {
  pair: "USDC/EURC",
  midpoint: "",
  recentFills: [],
  bids: [],
  asks: [],
  myOpenOrders: [],
  isLoading: true,
};
