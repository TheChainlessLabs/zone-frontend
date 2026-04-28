"use client";

/**
 * Variant 10 (detail) — Omega original.
 *
 * "Darkpool batch report". Hero card with status + stats, then a wide
 * provenance band that visualises the lifecycle horizontally with per-
 * step time and tone. Pair aggregate uses the proportional bar. Audit
 * panel anchors the bottom. The aesthetic is deliberate — institutional
 * darkpool, not a transactions DB.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Icon } from "@/lib/icons";

import {
  aggregateByPair,
  batchStateSteps,
  fmtUsd,
  formatStampUtc,
  HashCell,
  MonoNum,
  PairBars,
  parseNum,
  StatePips,
  StatusPill,
  type DetailVariantProps,
  type StateStep,
} from "../_shared";

export default function Variant10DetailOmega({
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
        Settlement record
      </Link>

      <Card className="flex flex-col gap-5 p-7">
        <header className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Darkpool batch report
          </span>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-mono text-3xl font-medium leading-none tracking-tight">
              Batch #{batch.number}
            </h2>
            <div className="flex items-center gap-3">
              <StatusPill status={batch.status} />
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                {formatStampUtc(batch.sealedAt)}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
          <Stat
            label="Volume"
            value={
              batch.volumeUsd ? `$${fmtUsd(parseNum(batch.volumeUsd))}` : "—"
            }
          />
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

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Provenance band
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            {steps.filter((s) => s.reached).length} / {steps.length} stages
          </span>
        </div>
        <ProvenanceBand steps={steps} sealedAt={batch.sealedAt} />
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Pair aggregate · share of cleared volume
          </span>
          <StatePips
            steps={steps}
            width={140}
            height={6}
            ariaLabel="Batch lifecycle progression compact"
          />
        </div>
        <PairBars aggregates={aggregates} width={620} height={12} />
        <ul className="flex flex-col gap-2 text-sm">
          {aggregates.map((a) => (
            <li
              key={a.pair}
              className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-b-0 last:pb-0"
            >
              <span className="font-mono text-sm uppercase tracking-[0.12em]">
                {a.pair}
              </span>
              <span className="flex items-center gap-4 font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
                <span>{a.fillCount} fills</span>
                <span className="w-[120px] text-right">
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
        <p className="text-[11px] text-[var(--muted-foreground)]">
          Per-pair aggregate. Order IDs and counterparties never appear here —
          per-fill detail belongs to /portfolio.
        </p>
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
        <Field label="L1 settlement">
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

      <p className="text-center text-[11px] text-[var(--muted-foreground)]">
        Verify externally:{" "}
        <span className="font-mono">npx omega-verify {batch.number}</span>
      </p>
    </div>
  );
}

function ProvenanceBand({
  steps,
  sealedAt,
}: {
  steps: StateStep[];
  sealedAt: string;
}) {
  const W = 720;
  const H = 80;
  const padX = 20;
  const slotW = (W - padX * 2) / steps.length;
  const trackY = 38;
  const trackH = 4;
  const stamps = steps.map((_, i) => {
    const t = new Date(sealedAt);
    t.setUTCSeconds(t.getUTCSeconds() + i * 30);
    return formatStampUtc(t.toISOString()).slice(11);
  });
  return (
    <svg
      role="img"
      aria-label="Batch lifecycle provenance band"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      className="overflow-visible"
    >
      <line
        x1={padX}
        y1={trackY + trackH / 2}
        x2={W - padX}
        y2={trackY + trackH / 2}
        stroke="var(--border)"
        strokeWidth={1}
      />
      {steps.map((s, i) => {
        const cx = padX + slotW * (i + 0.5);
        const tone = s.failed
          ? "var(--destructive)"
          : s.reached
            ? "var(--success)"
            : "var(--muted-foreground)";
        return (
          <g key={s.key}>
            {i > 0 ? (
              <line
                x1={padX + slotW * (i - 0.5)}
                y1={trackY + trackH / 2}
                x2={cx}
                y2={trackY + trackH / 2}
                stroke={
                  steps[i - 1].reached && s.reached
                    ? "var(--success)"
                    : "var(--border)"
                }
                strokeWidth={2}
              />
            ) : null}
            <text
              x={cx}
              y={20}
              textAnchor="middle"
              fontFamily="var(--font-geist-mono, monospace)"
              fontSize={10}
              letterSpacing="2"
              fill="var(--muted-foreground)"
            >
              {s.label.toUpperCase()}
            </text>
            <circle
              cx={cx}
              cy={trackY + trackH / 2}
              r={s.reached ? 7 : 5}
              fill={s.reached ? tone : "var(--card)"}
              stroke={tone}
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={66}
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

