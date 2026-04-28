"use client";

/**
 * Variant 08 (detail) — Bloomberg-restrained.
 *
 * Multi-pane terminal-style detail. Three panes side-by-side at desktop:
 * pane 1 = state-machine, pane 2 = pair aggregate, pane 3 = audit. Tight
 * spacing, monospace throughout, cells nested in a hairline grid.
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

export default function Variant08DetailBloomberg({
  fixture,
  listHref,
}: DetailVariantProps) {
  const { batch, fills } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const steps = batchStateSteps(batch);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        BATCHES
      </Link>

      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            BATCH
          </span>
          <MonoNum className="text-2xl font-medium leading-none">
            #{batch.number}
          </MonoNum>
          <StatusPill status={batch.status} />
        </div>
        <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
          {formatStampUtc(batch.sealedAt)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
        <Stat label="VOL" value={batch.volumeUsd ? fmtCompactUsd(parseNum(batch.volumeUsd)) : "—"} />
        <Stat label="ORD" value={String(batch.orderCount)} />
        <Stat label="FILL" value={String(batch.fillCount)} />
        <Stat label="PAIRS" value={String((batch.pairs ?? []).length)} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="flex flex-col gap-3 p-4">
          <Heading>STATE</Heading>
          <StatePips steps={steps} width={240} />
          <ul className="flex flex-col gap-1.5 text-xs">
            {steps.map((s) => (
              <li
                key={s.key}
                className="flex items-center justify-between gap-2 border-b border-[var(--border)] py-1 last:border-b-0"
              >
                <span
                  className="font-mono uppercase tracking-[0.18em]"
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
                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                  {s.failed ? "FAILED" : s.reached ? "DONE" : "WAIT"}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <Heading>PAIRS · AGG</Heading>
          <PairBars aggregates={aggregates} width={240} />
          <ul className="flex flex-col gap-1.5 text-xs">
            {aggregates.map((a) => (
              <li
                key={a.pair}
                className="flex items-center justify-between gap-2 border-b border-[var(--border)] py-1 last:border-b-0"
              >
                <span className="font-mono uppercase tracking-[0.12em]">
                  {a.pair}
                </span>
                <span className="flex items-center gap-3 font-mono text-[10px] tabular-nums text-[var(--muted-foreground)]">
                  <span>{a.fillCount}f</span>
                  <span>{(a.share * 100).toFixed(1)}%</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <Heading>AUDIT</Heading>
          <Audit label="ROOT" hash={batch.root} />
          <Audit label="PROOF" hash={batch.proofRef ?? null} />
          <Audit label="L1 TX" hash={batch.settlementTx ?? null} />
          <Audit
            label="SUB"
            hash={null}
            fallback="Sequencer #1 · TEE"
          />
        </Card>
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
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-[var(--card)] px-3 py-2.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <MonoNum className="text-base font-medium leading-none">{value}</MonoNum>
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
    <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] py-1 text-xs last:border-b-0">
      <span className="font-mono uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      {hash ? (
        <HashCell hash={hash} lead={6} tail={4} />
      ) : (
        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
          {fallback ?? "pending"}
        </span>
      )}
    </div>
  );
}
