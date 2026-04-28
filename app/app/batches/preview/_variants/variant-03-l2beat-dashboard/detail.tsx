"use client";

/**
 * Variant 03 (detail) — L2Beat-dashboard.
 *
 * Report-card detail: a wide stat band, a state-machine row, a pair-bars
 * card, then a metadata grid. Same calm institutional register as the
 * list view.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Icon } from "@/lib/icons";

import {
  aggregateByPair,
  batchStateSteps,
  fmtCompactUsd,
  formatStampUtc,
  HashCell,
  MonoNum,
  PairBars,
  parseNum,
  StatePips,
  StatusPill,
  type DetailVariantProps,
} from "../_shared";

export default function Variant03DetailL2Beat({
  fixture,
  listHref,
}: DetailVariantProps) {
  const { batch, fills } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const steps = batchStateSteps(batch);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        All batches
      </Link>

      <Card className="flex flex-col gap-5 p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-2xl font-medium tracking-tight">
              Batch #{batch.number}
            </h2>
            <StatusPill status={batch.status} />
          </div>
          <span className="font-mono text-xs text-[var(--muted-foreground)]">
            {formatStampUtc(batch.sealedAt)}
          </span>
        </header>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
          <Stat label="Volume" value={batch.volumeUsd ? fmtCompactUsd(parseNum(batch.volumeUsd)) : "—"} />
          <Stat label="Orders" value={String(batch.orderCount)} />
          <Stat label="Fills" value={String(batch.fillCount)} />
          <Stat label="Pairs" value={String((batch.pairs ?? []).length)} />
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            State machine
          </span>
          <StatePips steps={steps} width={420} />
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
            {steps.map((s) => (
              <div key={s.key} className="flex flex-col gap-0.5 text-xs">
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
              </div>
            ))}
          </div>
        </div>

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
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <header className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Pairs · aggregate-by-pair (no counterparty data)
          </span>
        </header>
        <PairBars aggregates={aggregates} width={520} />
        <ul className="flex flex-col gap-2 text-sm">
          {aggregates.map((a) => (
            <li
              key={a.pair}
              className="flex items-center justify-between border-b border-[var(--border)] pb-2 last:border-b-0 last:pb-0"
            >
              <span className="font-mono uppercase tracking-[0.12em]">
                {a.pair}
              </span>
              <span className="flex items-center gap-4 font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
                <span>{a.fillCount} fills</span>
                <span className="w-[110px] text-right">
                  {a.totalBaseAmount > 0
                    ? a.totalBaseAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "—"}
                </span>
                <span className="w-[44px] text-right">
                  {(a.share * 100).toFixed(1)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="grid grid-cols-1 gap-px overflow-hidden bg-[var(--border)] p-0 sm:grid-cols-2">
        <Field label="Batch root">
          <HashCell hash={batch.root} lead={10} tail={8} />
        </Field>
        <Field label="Proof hash">
          {batch.proofRef ? (
            <HashCell hash={batch.proofRef} lead={10} tail={8} />
          ) : (
            <span className="font-mono text-xs text-[var(--muted-foreground)]">
              pending
            </span>
          )}
        </Field>
        <Field label="L1 tx">
          {batch.settlementTx ? (
            <HashCell hash={batch.settlementTx} lead={10} tail={8} />
          ) : (
            <span className="font-mono text-xs text-[var(--muted-foreground)]">
              pending
            </span>
          )}
        </Field>
        <Field label="Submitter">
          <span className="font-mono text-xs text-[var(--muted-foreground)]">
            Sequencer #1 — TEE attestor
          </span>
        </Field>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-[var(--card)] px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <MonoNum className="text-lg font-medium leading-none">{value}</MonoNum>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 bg-[var(--card)] px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      {children}
    </div>
  );
}
