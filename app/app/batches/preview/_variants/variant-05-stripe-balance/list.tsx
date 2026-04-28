"use client";

/**
 * Variant 05 (list) — Stripe-balance.
 *
 * Journal-entry list with a thin status column and a clean per-row
 * volume right-align. Stripe's dashboard register: the row is the unit,
 * the status pill is the sole accent, the rest is monochrome.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  computeListTotals,
  fmtCompactUsd,
  fmtUsd,
  formatStampUtc,
  HashCell,
  latestSealedAt,
  MonoNum,
  PairChip,
  parseNum,
  StatusPill,
  type ListVariantProps,
} from "../_shared";

export default function Variant05ListStripe({
  fixture,
  buildHref,
}: ListVariantProps) {
  const totals = computeListTotals(fixture);
  // Use the latest sealedAt as a deterministic anchor — keeps the
  // "as of" header stable across rerenders.
  const reference = latestSealedAt(fixture);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-baseline justify-between gap-3 p-5">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Cleared volume — last batch window
          </span>
          <MonoNum className="text-3xl font-medium leading-none">
            ${fmtUsd(totals.totalUsd)}
          </MonoNum>
          <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
            {totals.batchCount} batches · {totals.totalFills.toLocaleString("en-US")} fills · {totals.totalOrders.toLocaleString("en-US")} orders
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          As of {formatStampUtc(reference)}
        </span>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[68px_1fr_auto_120px_120px_84px] items-center gap-4 border-b border-[var(--border)] bg-[var(--muted)]/40 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          <span className="font-mono">Batch</span>
          <span className="font-mono">Description</span>
          <span className="font-mono">Pairs</span>
          <span className="font-mono text-right">L1 tx</span>
          <span className="font-mono text-right">Date</span>
          <span className="font-mono text-right">Volume</span>
        </div>
        <ul className="flex flex-col">
          {fixture.batches.map((batch) => (
            <li key={batch.number}>
              <Link
                href={buildHref(batch.number)}
                className={cn(
                  "grid grid-cols-[68px_1fr_auto_120px_120px_84px] items-center gap-4 border-b border-[var(--border)] px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--muted)]/30",
                )}
              >
                <MonoNum className="text-sm">#{batch.number}</MonoNum>
                <span className="flex items-center gap-2">
                  <StatusPill status={batch.status} />
                  <span className="font-mono text-xs text-[var(--muted-foreground)]">
                    {batch.fillCount} fills · {batch.orderCount} orders
                  </span>
                </span>
                <span className="hidden flex-wrap items-center gap-1 sm:flex">
                  {(batch.pairs ?? []).slice(0, 2).map((p) => (
                    <PairChip key={p} pair={p} />
                  ))}
                  {(batch.pairs?.length ?? 0) > 2 ? (
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                      +{batch.pairs!.length - 2}
                    </span>
                  ) : null}
                </span>
                <span className="text-right font-mono text-xs text-[var(--muted-foreground)]">
                  {batch.settlementTx ? (
                    <HashCell hash={batch.settlementTx} lead={6} tail={4} />
                  ) : (
                    "—"
                  )}
                </span>
                <span className="text-right font-mono text-xs text-[var(--muted-foreground)]">
                  {batch.sealedAt.slice(11, 16)} UTC
                </span>
                <MonoNum className="text-right text-sm tabular-nums">
                  {batch.volumeUsd
                    ? fmtCompactUsd(parseNum(batch.volumeUsd))
                    : "—"}
                </MonoNum>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
