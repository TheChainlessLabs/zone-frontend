/**
 * Batch aggregation + number helpers for the public settlement explorer.
 *
 * Privacy contract: everything here operates on aggregate, per-pair data
 * only — never per-user addresses, order IDs, or counterparty fields. The
 * detail surface renders a pair-level fill distribution from these; nothing
 * traces one batch's fills back to an owner.
 *
 * Lifted out of the removed `/batches/preview` exploration lane so the live
 * detail view keeps the same privacy-safe math without depending on the
 * pruned variants. Fixture-only volume; M6 sources the real price oracle.
 */

import type { FillFixture, MarketPair } from "@/lib/fixtures/types";

/** Parse a decimal display string ("5,000.00") to a number, comma-tolerant. */
export function parseNum(s: string | undefined | null): number {
  if (!s) return 0;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Compact USD: `$184.3K`, `$1.84M`, `$420`. */
export function fmtCompactUsd(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

/**
 * Per-pair aggregate inside a single batch detail. Privacy-safe — never
 * includes order IDs or counterparty fields. Returned sorted by base volume,
 * descending; pairs with no observed fills still appear (share 0) so the
 * full pair set the batch cleared is represented.
 */
export interface PairAggregate {
  pair: MarketPair;
  fillCount: number;
  totalBaseAmount: number;
  share: number;
}

export function aggregateByPair(
  fills: FillFixture[],
  pairs: MarketPair[],
): PairAggregate[] {
  const map = new Map<MarketPair, PairAggregate>();
  for (const fill of fills) {
    const entry = map.get(fill.pair) ?? {
      pair: fill.pair,
      fillCount: 0,
      totalBaseAmount: 0,
      share: 0,
    };
    entry.fillCount += 1;
    entry.totalBaseAmount += parseNum(fill.amount);
    map.set(fill.pair, entry);
  }
  for (const pair of pairs) {
    if (!map.has(pair)) {
      map.set(pair, { pair, fillCount: 0, totalBaseAmount: 0, share: 0 });
    }
  }
  const out = Array.from(map.values());
  const totalAmount = out.reduce((acc, a) => acc + a.totalBaseAmount, 0);
  for (const a of out) {
    a.share = totalAmount > 0 ? a.totalBaseAmount / totalAmount : 0;
  }
  return out.sort((x, y) => y.totalBaseAmount - x.totalBaseAmount);
}
