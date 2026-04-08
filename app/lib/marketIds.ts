/**
 * Maps pair names to backend market IDs.
 * Only EUR/USD (market 1) exists on the backend for now.
 * Other pairs will be added as markets are created.
 */
export const PAIR_MARKET_IDS: Record<string, number> = {
  "EUR/USD": 1,
};

/**
 * Reverse lookup: market ID to pair name.
 */
export const MARKET_ID_PAIRS: Record<number, string> = Object.fromEntries(
  Object.entries(PAIR_MARKET_IDS).map(([pair, id]) => [id, pair]),
);
