/**
 * Launch markets.
 *
 * The live product market is ALPHAUSD/PATH.USD on the Omega Zone. Pair
 * convention (omega-docs/03-brand/naming.md): BASE/QUOTE token tickers only.
 */

import type { MarketPair } from "./view-types";

export interface LaunchPair {
  pair: MarketPair;
  base: string;
  quote: string;
}

export const LAUNCH_PAIRS: LaunchPair[] = [
  { pair: "ALPHAUSD/PATH.USD", base: "ALPHAUSD", quote: "PATH.USD" },
];

export const DEFAULT_PAIR: LaunchPair = LAUNCH_PAIRS[0];
