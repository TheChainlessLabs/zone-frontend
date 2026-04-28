"use client";

/**
 * Variant 04 (list) — Vercel-activity.
 *
 * Vertical timeline list. Each entry is a row with a leading dot in the
 * timeline rail, deterministic age string, and a deploy-style status pill.
 * No table — feels like a deployment history scroll.
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
  STATUS_TONE,
  StatusPill,
  type ListVariantProps,
} from "../_shared";

export default function Variant04ListVercel({
  fixture,
  buildHref,
}: ListVariantProps) {
  const reference = latestSealedAt(fixture);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-medium">Activity</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Newest first
        </span>
      </div>

      <Card className="p-4 sm:p-6">
        <ol className="relative flex flex-col gap-0">
          <span
            aria-hidden
            className="absolute left-[10px] top-2 bottom-2 w-px bg-[var(--border)]"
          />
          {fixture.batches.map((batch) => {
            const tone = STATUS_TONE[batch.status];
            return (
              <li
                key={batch.number}
                className="relative flex items-start gap-4 py-3 pl-7"
              >
                <span
                  aria-hidden
                  className="absolute left-[5px] top-[18px] inline-block h-[11px] w-[11px] rounded-full border bg-[var(--card)]"
                  style={{ borderColor: tone.fg }}
                >
                  <span
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor: tone.fg }}
                  />
                </span>

                <Link
                  href={buildHref(batch.number)}
                  className="flex flex-1 flex-col gap-1.5 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <MonoNum className="text-sm font-medium">
                      Batch #{batch.number}
                    </MonoNum>
                    <StatusPill status={batch.status} />
                    <span className="ml-auto font-mono text-xs text-[var(--muted-foreground)]">
                      {ageVs(reference, batch.sealedAt)} ago
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
                    <span className="font-mono tabular-nums">
                      {batch.fillCount} fills · {batch.orderCount} orders
                    </span>
                    <span className="font-mono tabular-nums">
                      {batch.volumeUsd
                        ? fmtCompactUsd(parseNum(batch.volumeUsd))
                        : "—"}
                    </span>
                    <span className="flex flex-wrap items-center gap-1">
                      {(batch.pairs ?? []).slice(0, 3).map((p) => (
                        <PairChip key={p} pair={p} />
                      ))}
                    </span>
                    {batch.settlementTx ? (
                      <HashCell
                        hash={batch.settlementTx}
                        label={`L1 tx ${batch.settlementTx}`}
                      />
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </Card>

      <p className="text-[11px] text-[var(--muted-foreground)]">
        All entries are aggregate batch metadata only. No counterparty
        information surfaces here.
      </p>
    </div>
  );
}
