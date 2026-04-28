"use client";

/**
 * Variant 10 (list) — Omega original.
 *
 * Design-led report card per row. Each row carries a provenance band
 * down its left edge (status tone), a mini state-pips strip, and a
 * deliberate use of pair bars to show within-batch share. The aesthetic
 * is "darkpool report" — institutional, confident, privacy-led.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";

import {
  ageVs,
  batchStateSteps,
  computeListTotals,
  fillsSeries,
  fmtCompactUsd,
  formatStampUtc,
  HashCell,
  latestSealedAt,
  MiniBar,
  MonoNum,
  PairChip,
  parseNum,
  Sparkline,
  STATUS_TONE,
  StatePips,
  StatusPill,
  type ListVariantProps,
} from "../_shared";

export default function Variant10ListOmega({
  fixture,
  buildHref,
}: ListVariantProps) {
  const totals = computeListTotals(fixture);
  const reference = latestSealedAt(fixture);
  const fills = fillsSeries(fixture);
  const maxVol = Math.max(
    ...fixture.batches.map((b) => parseNum(b.volumeUsd)),
    1,
  );

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Darkpool · settlement record
          </span>
          <h2 className="text-xl font-medium leading-tight tracking-tight">
            <MonoNum>{fmtCompactUsd(totals.totalUsd)}</MonoNum> cleared across{" "}
            <MonoNum>{totals.batchCount}</MonoNum> batches
          </h2>
          <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
            {totals.totalFills.toLocaleString("en-US")} fills · {totals.verifiedCount} verified · {totals.pendingCount} pending · {totals.failedCount} failed
          </span>
        </div>
        <Sparkline
          series={fills}
          width={260}
          height={56}
          ariaLabel="Fill counts across recent batches, oldest to newest"
          stroke="var(--foreground)"
          fill="var(--foreground)"
        />
      </Card>

      <ul className="flex flex-col gap-3">
        {fixture.batches.map((batch) => {
          const tone = STATUS_TONE[batch.status];
          const steps = batchStateSteps(batch);
          const vol = parseNum(batch.volumeUsd);
          const share = vol / maxVol;
          return (
            <li key={batch.number}>
              <Link href={buildHref(batch.number)} className="block">
                <Card className="flex items-stretch gap-0 overflow-hidden p-0 transition-colors hover:bg-[var(--muted)]/20">
                  <div
                    aria-hidden
                    className="w-1 shrink-0"
                    style={{ backgroundColor: tone.fg }}
                  />
                  <div className="flex flex-1 flex-col gap-3 px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <MonoNum className="text-base font-medium">
                          Batch #{batch.number}
                        </MonoNum>
                        <StatusPill status={batch.status} />
                      </div>
                      <span className="font-mono text-xs text-[var(--muted-foreground)]">
                        {formatStampUtc(batch.sealedAt)} ·{" "}
                        {ageVs(reference, batch.sealedAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                          <span className="font-mono tabular-nums">
                            <span className="text-[var(--muted-foreground)]">VOL </span>
                            <span className="text-[var(--foreground)]">
                              {batch.volumeUsd ? fmtCompactUsd(vol) : "—"}
                            </span>
                          </span>
                          <span className="font-mono tabular-nums text-[var(--muted-foreground)]">
                            {batch.fillCount} fills · {batch.orderCount} orders
                          </span>
                          <span className="flex flex-wrap items-center gap-1">
                            {(batch.pairs ?? []).slice(0, 3).map((p) => (
                              <PairChip key={p} pair={p} />
                            ))}
                            {(batch.pairs?.length ?? 0) > 3 ? (
                              <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                                +{batch.pairs!.length - 3}
                              </span>
                            ) : null}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MiniBar
                            share={share}
                            width={120}
                            ariaLabel={`Volume share ${(share * 100).toFixed(0)}% of largest`}
                          />
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                            VS MAX
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 lg:items-end">
                        <StatePips steps={steps} width={180} height={6} />
                        <div className="flex items-center gap-3 text-[11px] text-[var(--muted-foreground)]">
                          {batch.proofRef ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="font-mono uppercase tracking-[0.18em]">
                                proof
                              </span>
                              <HashCell hash={batch.proofRef} lead={6} tail={4} />
                            </span>
                          ) : (
                            <span className="font-mono uppercase tracking-[0.18em]">
                              proof pending
                            </span>
                          )}
                          {batch.settlementTx ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="font-mono uppercase tracking-[0.18em]">
                                L1
                              </span>
                              <HashCell hash={batch.settlementTx} lead={6} tail={4} />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="text-center text-[11px] text-[var(--muted-foreground)]">
        Aggregate batch metadata. Counterparties stay private — see /portfolio
        for your own fills.
      </p>
    </div>
  );
}
