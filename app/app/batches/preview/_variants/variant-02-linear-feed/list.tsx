"use client";

/**
 * Variant 02 (list) — Linear-feed.
 *
 * Inspired by Linear's "All issues" view: short rows with a leading
 * status pill, a tight title, secondary metadata trailing right. No
 * column headers, no horizontal scroll. Hover reveals a subtle row
 * accent only.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";

import {
  ageVs,
  fmtCompactUsd,
  HashCell,
  latestSealedAt,
  MonoNum,
  PairChip,
  parseNum,
  StatusPill,
  type ListVariantProps,
} from "../_shared";

export default function Variant02ListLinear({
  fixture,
  buildHref,
}: ListVariantProps) {
  const reference = latestSealedAt(fixture);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between border-b border-[var(--border)] pb-3">
        <h2 className="text-base font-medium">Sealed batches</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {fixture.batches.length} entries
        </span>
      </header>

      <Card className="overflow-hidden p-0">
        <ul className="flex flex-col">
          {fixture.batches.map((batch) => (
            <li key={batch.number}>
              <Link
                href={buildHref(batch.number)}
                className="flex items-center gap-4 border-b border-[var(--border)] px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--muted)]/40"
              >
                <span className="w-[88px] shrink-0">
                  <StatusPill status={batch.status} />
                </span>

                <span className="flex min-w-0 flex-1 items-baseline gap-2">
                  <MonoNum
                    className="text-sm text-[var(--foreground)]"
                    ariaLabel={`Batch number ${batch.number}`}
                  >
                    #{batch.number}
                  </MonoNum>
                  <span className="truncate text-sm text-[var(--muted-foreground)]">
                    {batch.fillCount} fills · {batch.orderCount} orders ·
                    {" "}
                    {batch.volumeUsd
                      ? fmtCompactUsd(parseNum(batch.volumeUsd))
                      : "—"}
                  </span>
                </span>

                <span className="hidden flex-wrap items-center gap-1 sm:flex">
                  {(batch.pairs ?? []).slice(0, 3).map((p) => (
                    <PairChip key={p} pair={p} />
                  ))}
                  {(batch.pairs?.length ?? 0) > 3 ? (
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                      +{batch.pairs!.length - 3}
                    </span>
                  ) : null}
                </span>

                <span className="hidden w-[100px] justify-end font-mono text-[11px] text-[var(--muted-foreground)] md:flex">
                  {batch.settlementTx ? (
                    <HashCell
                      hash={batch.settlementTx}
                      label={`L1 tx ${batch.settlementTx}`}
                    />
                  ) : (
                    "—"
                  )}
                </span>

                <span className="w-[40px] text-right font-mono text-xs text-[var(--muted-foreground)]">
                  {ageVs(reference, batch.sealedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-[11px] text-[var(--muted-foreground)]">
        Aggregate metadata only — no counterparty data on this surface.
      </p>
    </div>
  );
}
