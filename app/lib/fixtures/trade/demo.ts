import { parseUnits } from "viem";

import type { FillFixture } from "../types";

/**
 * /trade demo snapshot — OALPHA/PATH.USD.
 *
 * The live trade surface reads its data from the Omega Zone (balances,
 * best bid/ask midpoint, own fills). With no backend running, that data is
 * empty, so the page falls back to THIS snapshot to stay alive for demos and
 * review. It is intentionally shaped to the page's live wiring — raw 6-decimal
 * token balances, a decimal-string midpoint, and own-only fills — so the page
 * can swap it in for the absent live values without any special-casing.
 *
 * Own-and-own-batch only: Omega is a dark pool, never a public tape
 * (omega-docs/03-brand/naming.md). The OALPHA/PATH.USD pair is the seeded
 * 1:1-ish market; numbers stay near the 1.000000 midpoint the zone uses.
 */

/** Raw 6-decimal balances, matching `readPrivateZone*Balance` return shape. */
export const DEMO_ZONE_PATH_USD_BALANCE: bigint = parseUnits("48250.00", 6);
export const DEMO_ZONE_OALPHA_BALANCE: bigint = parseUnits("12500.00", 6);

/** Decimal-string midpoint, matching `formatMidpoint` output. */
export const DEMO_ZONE_MIDPOINT = "1.000000";
/** Reference best bid / best ask, matching `formatRawPrice` output. */
export const DEMO_ZONE_BEST_BID = "1.000000";
export const DEMO_ZONE_BEST_ASK = "1.000000";

/**
 * Own fills for the demo timeline. ISO timestamps so `YourFills` renders the
 * same deterministic HH:MM:SS it would for live data.
 */
export const DEMO_ZONE_FILLS: FillFixture[] = [
  {
    id: "demo-f-3041",
    orderId: "demo-o-9620",
    pair: "OALPHA/PATH.USD",
    side: "sell",
    amount: "5,000.00",
    price: "1.000000",
    matchedAt: "2026-06-08T14:02:11Z",
    status: "settled",
  },
  {
    id: "demo-f-3038",
    orderId: "demo-o-9613",
    pair: "OALPHA/PATH.USD",
    side: "buy",
    amount: "1,250.00",
    price: "1.000000",
    matchedAt: "2026-06-08T13:58:04Z",
    status: "proven",
  },
  {
    id: "demo-f-3034",
    orderId: "demo-o-9601",
    pair: "OALPHA/PATH.USD",
    side: "buy",
    amount: "2,750.00",
    price: "1.000000",
    matchedAt: "2026-06-08T13:51:42Z",
    status: "matched",
  },
];
