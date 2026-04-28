"use client";

/**
 * Variant 09 (list) — Calm narrative.
 *
 * Editorial lede over a clean list. Two sentences set the frame, then
 * the list reads as a record. Generous spacing, sans-serif everywhere
 * except numerals, status pill is the only chromatic accent.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";

import {
  ageVs,
  computeListTotals,
  fmtCompactUsd,
  formatStampUtc,
  HashCell,
  latestSealedAt,
  MonoNum,
  PairChip,
  parseNum,
  StatusPill,
  type ListVariantProps,
} from "../_shared";

export default function Variant09ListNarrative({
  fixture,
  buildHref,
}: ListVariantProps) {
  const totals = computeListTotals(fixture);
  const reference = latestSealedAt(fixture);

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-7">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Settlement record
        </span>
        <h2 className="text-2xl font-medium leading-tight tracking-tight md:text-3xl">
          The last {totals.batchCount} batches cleared{" "}
          <MonoNum className="font-medium">
            {fmtCompactUsd(totals.totalUsd)}
          </MonoNum>{" "}
          across {totals.totalFills.toLocaleString("en-US")} fills.
        </h2>
        <p className="max-w-prose text-sm leading-relaxed text-[var(--muted-foreground)]">
          Each entry below is one sealed settlement window. The volume,
          fill count, and proof state are public — the orders that produced
          them remain private to their owners.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {fixture.batches.map((batch) => (
          <li key={batch.number}>
            <Link href={buildHref(batch.number)} className="block">
              <Card className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[var(--muted)]/20">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <MonoNum className="text-base font-medium">
                      Batch #{batch.number}
                    </MonoNum>
                    <StatusPill status={batch.status} />
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {formatStampUtc(batch.sealedAt)} ·{" "}
                    {ageVs(reference, batch.sealedAt)} ago
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex flex-wrap items-center gap-1">
                    {(batch.pairs ?? []).slice(0, 3).map((p) => (
                      <PairChip key={p} pair={p} />
                    ))}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
                    {batch.fillCount} fills
                  </span>
                  <MonoNum className="text-sm tabular-nums">
                    {batch.volumeUsd
                      ? fmtCompactUsd(parseNum(batch.volumeUsd))
                      : "—"}
                  </MonoNum>
                  {batch.settlementTx ? (
                    <HashCell hash={batch.settlementTx} lead={6} tail={4} />
                  ) : (
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">
                      L1 pending
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-center text-[11px] text-[var(--muted-foreground)]">
        Per-fill detail belongs to its counterparties — see /portfolio for
        your own.
      </p>
    </div>
  );
}
