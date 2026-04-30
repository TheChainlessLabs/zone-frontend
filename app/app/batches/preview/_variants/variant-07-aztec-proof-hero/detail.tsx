"use client";

/**
 * Variant 07 (detail) — Aztec-proof-hero.
 *
 * One big proof status card — the gauge dominates the canvas. Sub-stats
 * orbit the gauge. Below: pair aggregates and audit. The hero card is
 * unmistakably "is this batch verified?".
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Icon } from "@/lib/icons";
import { CopyButton } from "@/app/batches/_components/copy-button";
import { EtherscanTxLink } from "@/app/batches/_components/etherscan-link";
import { truncateHash } from "@/lib/format";

import {
  aggregateByPair,
  batchStateSteps,
  fmtCompactUsd,
  formatStampUtc,
  MonoNum,
  parseNum,
  ProofGauge,
  StatusPill,
  type DetailVariantProps,
} from "../_shared";

export default function Variant07DetailAztec({
  fixture,
  listHref,
}: DetailVariantProps) {
  const { batch, fills } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const steps = batchStateSteps(batch);
  const reached = steps.filter((s) => s.reached).length;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        Attestation log
      </Link>

      <Card className="grid grid-cols-1 gap-6 p-5 md:grid-cols-[200px_1fr] md:p-7">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <ProofGauge
              steps={steps}
              size={180}
              thickness={16}
              ariaLabel={`Batch state ${reached} of ${steps.length} stages complete`}
            />
            <div
              aria-hidden
              className="absolute inset-0 flex flex-col items-center justify-center gap-0.5"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Stage
              </span>
              <MonoNum className="text-3xl font-medium leading-none">
                {reached}/{steps.length}
              </MonoNum>
            </div>
          </div>
          <StatusPill status={batch.status} />
        </div>

        <div className="flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Settlement attestation
            </span>
            <h2 className="font-mono text-2xl font-medium tracking-tight">
              Batch #{batch.number}
            </h2>
            <span className="font-mono text-xs text-[var(--muted-foreground)]">
              Sealed {formatStampUtc(batch.sealedAt)}
            </span>
          </header>

          <ol className="flex flex-col gap-2">
            {steps.map((s) => (
              <li
                key={s.key}
                className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-1.5 last:border-b-0"
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{
                      color: s.failed
                        ? "var(--destructive)"
                        : s.reached
                          ? "var(--success)"
                          : "var(--muted-foreground)",
                    }}
                  >
                    {s.label}
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    {s.hint}
                  </span>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                  {s.failed ? "FAILED" : s.reached ? "DONE" : "WAITING"}
                </span>
              </li>
            ))}
          </ol>

          {batch.failureReason ? (
            <p
              className="rounded-md border px-3 py-2 text-xs leading-relaxed"
              style={{
                color: "var(--destructive)",
                backgroundColor:
                  "color-mix(in oklab, var(--destructive) 8%, transparent)",
                borderColor:
                  "color-mix(in oklab, var(--destructive) 30%, transparent)",
              }}
            >
              {batch.failureReason}
            </p>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Volume"
          value={
            batch.volumeUsd ? fmtCompactUsd(parseNum(batch.volumeUsd)) : "—"
          }
        />
        <Stat label="Orders" value={String(batch.orderCount)} />
        <Stat label="Fills" value={String(batch.fillCount)} />
        <Stat label="Pairs" value={String((batch.pairs ?? []).length)} />
      </div>

      <Card className="flex flex-col gap-3 p-4 md:p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Pair aggregate
        </span>
        <ul className="flex flex-col">
          {aggregates.map((a) => (
            <li
              key={a.pair}
              className="flex items-center justify-between border-b border-[var(--border)] py-2 last:border-b-0"
            >
              <span className="font-mono text-sm uppercase tracking-[0.12em]">
                {a.pair}
              </span>
              <span className="flex items-center gap-4 font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
                <span>{a.fillCount} fills</span>
                <span>{(a.share * 100).toFixed(1)}%</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:p-6">
        <Audit label="Batch root" hash={batch.root} />
        <Audit label="Proof hash" hash={batch.proofRef ?? null} />
        <Audit label="L1 settlement" hash={batch.settlementTx ?? null} />
        <Audit label="Submitter" hash={null} fallback="Sequencer #1 — TEE" />
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <MonoNum className="text-lg font-medium leading-none">{value}</MonoNum>
    </div>
  );
}

function Audit({
  label,
  hash,
  fallback,
}: {
  label: string;
  hash: string | null;
  fallback?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      {hash ? (
        <span className="inline-flex items-center gap-0.5">
          <EtherscanTxLink
            hash={hash}
            label={truncateHash(hash, 10, 8)}
            aria-label={`${label} ${hash} — open on Etherscan`}
          />
          <CopyButton value={hash} label={`Copy ${label.toLowerCase()}`} />
        </span>
      ) : (
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          {fallback ?? "pending"}
        </span>
      )}
    </div>
  );
}
