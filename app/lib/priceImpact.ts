import type { OrderBookResponse } from "@/lib/apiTypes";
import { decodeQuantity } from "@/lib/priceUtils";

export interface PriceImpactResult {
  impactPercent: number;
  severity: "none" | "warning" | "critical";
}

/**
 * Estimate the price impact of an order by comparing the quantity
 * to the total depth on the relevant side of the order book.
 *
 * A buy order consumes asks; a sell order consumes bids.
 * - >50% of book depth  → critical
 * - >10% of book depth  → warning
 * - otherwise            → none
 */
export function estimatePriceImpact(
  book: OrderBookResponse | undefined,
  side: "buy" | "sell",
  quantity: number,
): PriceImpactResult {
  if (!book || quantity <= 0) return { impactPercent: 0, severity: "none" };

  const entries = side === "buy" ? book.asks : book.bids;
  const totalDepth = entries.reduce(
    (sum, e) => sum + decodeQuantity(e.remaining_quantity, 6),
    0,
  );

  if (totalDepth === 0) return { impactPercent: 0, severity: "none" };

  const ratio = quantity / totalDepth;
  const impactPercent = Math.round(ratio * 100);

  if (ratio > 0.5) return { impactPercent, severity: "critical" };
  if (ratio > 0.1) return { impactPercent, severity: "warning" };
  return { impactPercent, severity: "none" };
}
