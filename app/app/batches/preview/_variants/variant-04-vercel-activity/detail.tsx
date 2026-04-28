"use client";

/**
 * Variant 04 (detail) — Vercel-activity.
 *
 * Deploy-style state log. The state-machine becomes a vertical event
 * stream with leading dots and per-step timestamps. Hero stat row above,
 * pair aggregates and metadata below.
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
  parseNum,
  StatusPill,
  type DetailVariantProps,
  type StateStep,
} from "../_shared";

export default function Variant04DetailVercel({
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
        Activity
      </Link>

      <Card className="flex flex-col gap-4 p-6">
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

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Volume" value={batch.volumeUsd ? fmtCompactUsd(parseNum(batch.volumeUsd)) : "—"} />
          <Stat label="Orders" value={String(batch.orderCount)} />
          <Stat label="Fills" value={String(batch.fillCount)} />
          <Stat label="Pairs" value={String((batch.pairs ?? []).length)} />
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

      <Card className="p-6">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Build log
        </h3>
        <ol className="relative mt-3 flex flex-col gap-0">
          <span
            aria-hidden
            className="absolute left-[10px] top-3 bottom-3 w-px bg-[var(--border)]"
          />
          {steps.map((s, i) => (
            <StepRow key={s.key} step={s} index={i} batchSealed={batch.sealedAt} />
          ))}
        </ol>
      </Card>

      <Card className="flex flex-col gap-3 p-6">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Pair breakdown · aggregate
        </h3>
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
                <span>{(a.share * 100).toFixed(1)}%</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-[var(--muted-foreground)]">
          Per-pair aggregate. No counterparty fields on this surface.
        </p>
      </Card>

      <Card className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
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

function StepRow({
  step,
  index,
  batchSealed,
}: {
  step: StateStep;
  index: number;
  batchSealed: string;
}) {
  // Synthesise a per-step UTC time anchored to the batch sealedAt for
  // deterministic display. M6 wires real per-step timestamps.
  const t = new Date(batchSealed);
  t.setUTCSeconds(t.getUTCSeconds() + index * 30);
  const stamp = step.reached ? formatStampUtc(t.toISOString()) : "—";
  const color = step.failed
    ? "var(--destructive)"
    : step.reached
      ? "var(--success)"
      : "var(--muted-foreground)";

  return (
    <li className="relative flex items-start gap-4 py-2.5 pl-7">
      <span
        aria-hidden
        className="absolute left-[5px] top-[14px] inline-block h-[11px] w-[11px] rounded-full border bg-[var(--card)]"
        style={{ borderColor: color }}
      >
        <span
          className="absolute inset-1 rounded-full"
          style={{ backgroundColor: step.reached ? color : "transparent" }}
        />
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span
          className="font-mono text-[11px] uppercase tracking-[0.18em]"
          style={{ color }}
        >
          {step.label}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {step.hint}
        </span>
      </div>
      <span className="font-mono text-[11px] tabular-nums text-[var(--muted-foreground)]">
        {stamp}
      </span>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <MonoNum className="text-base font-medium leading-none">{value}</MonoNum>
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
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      {children}
    </div>
  );
}
