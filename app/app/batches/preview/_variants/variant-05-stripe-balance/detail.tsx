"use client";

/**
 * Variant 05 (detail) — Stripe-balance.
 *
 * Receipt-style detail. Top metadata block on a quiet card, line-item
 * pair breakdown in a clean ledger, audit-trail metadata at the bottom.
 * No charts; the discipline is in the typography rhythm.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/lib/icons";

import {
  aggregateByPair,
  batchStateSteps,
  fmtCompactUsd,
  fmtUsd,
  formatStampUtc,
  HashCell,
  MonoNum,
  parseNum,
  StatePips,
  StatusPill,
  type DetailVariantProps,
} from "../_shared";

export default function Variant05DetailStripe({
  fixture,
  listHref,
}: DetailVariantProps) {
  const { batch, fills } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const steps = batchStateSteps(batch);

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-5">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        Back to ledger
      </Link>

      <Card className="flex flex-col gap-5 p-7">
        <header className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Settlement receipt
          </span>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-mono text-2xl font-medium tracking-tight">
              Batch #{batch.number}
            </h2>
            <StatusPill status={batch.status} />
          </div>
          <span className="font-mono text-xs text-[var(--muted-foreground)]">
            {formatStampUtc(batch.sealedAt)}
          </span>
        </header>

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

        <Separator />

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Cleared
          </span>
          <ul className="flex flex-col">
            {aggregates.map((a) => (
              <li
                key={a.pair}
                className="flex items-center justify-between gap-3 border-b border-dashed border-[var(--border)] py-2.5 last:border-b-0"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm uppercase tracking-[0.12em]">
                    {a.pair}
                  </span>
                  <span className="font-mono text-xs text-[var(--muted-foreground)]">
                    {a.fillCount} fills · {(a.share * 100).toFixed(1)}% of batch
                  </span>
                </span>
                <MonoNum className="text-sm tabular-nums">
                  {a.totalBaseAmount > 0
                    ? a.totalBaseAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "—"}
                </MonoNum>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Total
          </span>
          <MonoNum className="text-xl font-medium leading-none tabular-nums">
            {batch.volumeUsd ? `$${fmtUsd(parseNum(batch.volumeUsd))}` : "—"}
          </MonoNum>
        </div>

        <p className="text-[11px] text-[var(--muted-foreground)]">
          Per-pair line items aggregate fills inside this batch. Order IDs
          and counterparties are never written to this surface.
        </p>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          State machine
        </span>
        <StatePips steps={steps} width={320} />
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          {steps.map((s) => (
            <li key={s.key} className="flex flex-col gap-0.5 text-xs">
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
              <span className="text-[var(--muted-foreground)]">{s.hint}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Audit trail
        </span>
        <Audit label="Batch root" hash={batch.root} />
        <Audit label="Proof hash" hash={batch.proofRef ?? null} />
        <Audit label="L1 settlement" hash={batch.settlementTx ?? null} />
        <Audit label="Submitter" hash={null} fallback="Sequencer #1 — TEE" />
      </Card>

      <p className="text-center text-[11px] text-[var(--muted-foreground)]">
        Volume {batch.volumeUsd ? `$${fmtCompactUsd(parseNum(batch.volumeUsd))}` : "—"}{" "}
        · derived from {batch.fillCount} fills inside this batch.
      </p>
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
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      {hash ? (
        <HashCell hash={hash} lead={10} tail={8} />
      ) : (
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          {fallback ?? "pending"}
        </span>
      )}
    </div>
  );
}
