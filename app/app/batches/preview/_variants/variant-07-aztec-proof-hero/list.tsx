"use client";

/**
 * Variant 07 (list) — Aztec-proof-hero.
 *
 * Privacy-aware list. The status pill leads each row visually; volume
 * and counts are secondary. The eye reads "Verified · Verified · Pending"
 * down the column, which is exactly the question this surface answers.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { CopyButton } from "@/app/batches/_components/copy-button";
import { EtherscanTxLink } from "@/app/batches/_components/etherscan-link";

import {
  ageVs,
  fmtCompactUsd,
  latestSealedAt,
  MonoNum,
  PairChip,
  parseNum,
  STATUS_TONE,
  StatusPill,
  type ListVariantProps,
} from "../_shared";

export default function Variant07ListAztec({
  fixture,
  buildHref,
}: ListVariantProps) {
  const reference = latestSealedAt(fixture);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Attestation log
        </h2>
        <p className="max-w-prose text-sm text-[var(--muted-foreground)]">
          Each row is a sealed batch with its on-chain proof state. Counterparty
          information is by design absent from this surface.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {fixture.batches.map((batch) => {
          const tone = STATUS_TONE[batch.status];
          return (
            <li key={batch.number}>
              <Card className="relative flex items-stretch gap-4 overflow-hidden p-0 transition-colors hover:bg-[var(--muted)]/20">
                <Link
                  href={buildHref(batch.number)}
                  className="absolute inset-0 z-0"
                  aria-label={`Open batch #${batch.number}`}
                />
                <div
                  aria-hidden
                  className="w-1 shrink-0"
                  style={{ backgroundColor: tone.fg }}
                />
                <div className="flex flex-1 flex-col gap-2 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <StatusPill status={batch.status} />
                      <MonoNum className="text-base font-medium">
                        Batch #{batch.number}
                      </MonoNum>
                    </div>
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">
                      {ageVs(reference, batch.sealedAt)} · sealed
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="font-mono tabular-nums text-[var(--foreground)]">
                      {batch.fillCount} fills
                    </span>
                    <span className="font-mono tabular-nums text-[var(--muted-foreground)]">
                      {batch.orderCount} orders
                    </span>
                    <span className="font-mono tabular-nums text-[var(--muted-foreground)]">
                      {batch.volumeUsd
                        ? fmtCompactUsd(parseNum(batch.volumeUsd))
                        : "—"}
                    </span>
                    <span className="flex flex-wrap items-center gap-1">
                      {(batch.pairs ?? []).slice(0, 3).map((p) => (
                        <PairChip key={p} pair={p} />
                      ))}
                    </span>
                    <span className="ml-auto flex items-center gap-2 font-mono text-[11px] text-[var(--muted-foreground)]">
                      {batch.proofRef ? (
                        <span className="relative z-10 inline-flex items-center gap-1">
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                            proof
                          </span>
                          <EtherscanTxLink hash={batch.proofRef} />
                          <CopyButton
                            value={batch.proofRef}
                            label={`Copy proof hash for batch #${batch.number}`}
                          />
                        </span>
                      ) : (
                        <span>proof pending</span>
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
