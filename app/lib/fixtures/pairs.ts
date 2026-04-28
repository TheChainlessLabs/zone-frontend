/**
 * The 5 launch pairs for v0. Source: omega-docs/03-brand/naming.md.
 *
 * USDC/EURC is the canonical demo pair (PRD).
 * All pairs are stablecoin/crypto tokens — never fiat tickers.
 */

import type { MarketPair } from "./types";

export interface LaunchPair {
  pair: MarketPair;
  base: string;
  quote: string;
  /** Sample midpoint used for fixtures so demo numbers stay consistent across pages. */
  demoMidpoint: string;
}

export const LAUNCH_PAIRS: LaunchPair[] = [
  { pair: "USDC/EURC", base: "USDC", quote: "EURC", demoMidpoint: "0.9213" },
  { pair: "USDC/USDT", base: "USDC", quote: "USDT", demoMidpoint: "1.0001" },
  { pair: "USDT/EURC", base: "USDT", quote: "EURC", demoMidpoint: "0.9211" },
  { pair: "ETH/USDC", base: "ETH", quote: "USDC", demoMidpoint: "3450.42" },
  { pair: "BTC/USDC", base: "BTC", quote: "USDC", demoMidpoint: "62500.00" },
];

export const DEFAULT_PAIR: LaunchPair = LAUNCH_PAIRS[0];
