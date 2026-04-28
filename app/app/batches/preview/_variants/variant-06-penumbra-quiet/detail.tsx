"use client";

/**
 * Variant 06 (detail) — Penumbra-quiet.
 *
 * Timeline-led. The state machine takes the canvas: a horizontal gantt
 * of the four stops dominates the top half. Below: aggregate stats and
 * audit hashes only. The choice is "this is the story" — calm and
 * privacy-confident.
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

export default function Variant06DetailPenumbra({
  fixture,
  listHref,
}: DetailVariantProps) {
  const { batch, fills } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const steps = batchStateSteps(batch);

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-6">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        All batches
      </Link>

      <header className="flex flex-col gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Batch
        </span>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-mono text-3xl font-medium leading-none tracking-tight">
            #{batch.number}
          </h2>
          <StatusPill status={batch.status} />
        </div>
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          Sealed {formatStampUtc(batch.sealedAt)}
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

      <Card className="flex flex-col gap-5 p-7">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Lifecycle
        </span>
        <Gantt steps={steps} sealedAt={batch.sealedAt} />
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

      <Card className="flex flex-col gap-3 p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Pair aggregate · no counterparty data
        </span>
        <ul className="flex flex-col">
          {aggregates.map((a) => (
            <li
              key={a.pair}
              className="flex items-center justify-between border-b border-[var(--border)] py-2.5 last:border-b-0"
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

      <Card className="flex flex-col gap-3 p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Audit
        </span>
        <Audit label="Batch root" hash={batch.root} />
        <Audit label="Proof hash" hash={batch.proofRef ?? null} />
        <Audit label="L1 settlement" hash={batch.settlementTx ?? null} />
        <Audit label="Submitter" hash={null} fallback="Sequencer #1 — TEE" />
      </Card>
    </div>
  );
}

function Gantt({
  steps,
  sealedAt,
}: {
  steps: StateStep[];
  sealedAt: string;
}) {
  // Each step occupies an even column; reached steps render a tone bar,
  // unreached render a dashed track. Hand-rolled SVG keeps the visual
  // weight calm and proportional to the canvas.
  const W = 720;
  const H = 96;
  const padX = 16;
  const slotW = (W - padX * 2) / steps.length;
  const barH = 18;
  const labelY = 38;
  const trackY = 58;
  const stampY = 92;
  // Synthesise per-step UTC anchored to sealedAt.
  const stamps = steps.map((_, i) => {
    const t = new Date(sealedAt);
    t.setUTCSeconds(t.getUTCSeconds() + i * 30);
    return formatStampUtc(t.toISOString()).slice(11);
  });
  return (
    <svg
      role="img"
      aria-label="Batch lifecycle gantt — queued, sealed, proven, settled"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      className="overflow-visible"
    >
      {steps.map((s, i) => {
        const x = padX + i * slotW;
        const tone = s.failed
          ? "var(--destructive)"
          : s.reached
            ? "var(--success)"
            : "var(--muted-foreground)";
        return (
          <g key={s.key}>
            <text
              x={x + slotW / 2}
              y={labelY}
              textAnchor="middle"
              fontFamily="var(--font-geist-mono, monospace)"
              fontSize={10}
              letterSpacing="2"
              fill="var(--muted-foreground)"
            >
              {s.label.toUpperCase()}
            </text>
            <rect
              x={x + 4}
              y={trackY}
              width={slotW - 8}
              height={barH}
              rx={2}
              fill={s.reached ? tone : "var(--muted)"}
              opacity={s.reached ? 0.9 : 0.7}
              stroke={s.reached ? "transparent" : "var(--border)"}
              strokeDasharray={s.reached ? undefined : "3 3"}
            />
            <text
              x={x + slotW / 2}
              y={stampY}
              textAnchor="middle"
              fontFamily="var(--font-geist-mono, monospace)"
              fontSize={10}
              fill="var(--muted-foreground)"
            >
              {s.reached ? stamps[i] : "—"}
            </text>
          </g>
        );
      })}
    </svg>
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
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-2 last:border-b-0">
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
