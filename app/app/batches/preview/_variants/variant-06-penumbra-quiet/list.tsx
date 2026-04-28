"use client";

/**
 * Variant 06 (list) — Penumbra-quiet.
 *
 * Minimal three-column list: batch number, time, status. Privacy-first
 * register — what's NOT shown is part of the message. Density emerges
 * from typographic rhythm, not from packing fields.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";

import {
  ageVs,
  computeListTotals,
  fmtCompactUsd,
  formatStampUtc,
  latestSealedAt,
  MonoNum,
  StatusPill,
  type ListVariantProps,
} from "../_shared";

export default function Variant06ListPenumbra({
  fixture,
  buildHref,
}: ListVariantProps) {
  const totals = computeListTotals(fixture);
  const reference = latestSealedAt(fixture);

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-medium tracking-tight">Sealed batches</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          The public record of cleared settlement windows. Counterparties stay
          private — what you see here is what is meant to be seen.
        </p>
      </header>

      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-[var(--border)] pb-4">
        <Stat label="Cleared volume" value={fmtCompactUsd(totals.totalUsd)} />
        <Stat label="Batches" value={String(totals.batchCount)} />
        <Stat label="Verified" value={String(totals.verifiedCount)} />
        <Stat label="Pending" value={String(totals.pendingCount)} />
      </div>

      <Card className="p-0">
        <ul className="flex flex-col">
          {fixture.batches.map((batch) => (
            <li key={batch.number}>
              <Link
                href={buildHref(batch.number)}
                className="grid grid-cols-[80px_1fr_auto_64px] items-center gap-4 border-b border-[var(--border)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[var(--muted)]/30"
              >
                <MonoNum className="text-sm">#{batch.number}</MonoNum>
                <span className="font-mono text-xs text-[var(--muted-foreground)]">
                  {formatStampUtc(batch.sealedAt)}
                </span>
                <StatusPill status={batch.status} />
                <span className="text-right font-mono text-xs text-[var(--muted-foreground)]">
                  {ageVs(reference, batch.sealedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-center text-[11px] text-[var(--muted-foreground)]">
        Aggregate metadata only. Per-fill detail belongs to its
        counterparties — see /portfolio for your own.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <MonoNum className="text-base font-medium leading-none">{value}</MonoNum>
    </div>
  );
}
