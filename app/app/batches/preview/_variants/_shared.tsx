"use client";

/**
 * Shared helpers and SVG primitives for the /batches preview variants.
 *
 * Privacy contract — repeated here because every variant imports this file:
 * the public batches surface NEVER reveals counterparty information. No
 * per-user addresses, no per-user order IDs, no traces from one user's
 * order to another's. What may be displayed: aggregate stats per pair,
 * batch-level totals, attestation/proof status, L1 settlement tx hash,
 * batch state-machine progression. The variants below ONLY render data
 * that satisfies that contract.
 *
 * All charts hand-rolled SVG; all colors resolve through CSS custom
 * properties so theme switching works without touching variants.
 */

import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  BatchFixture,
  BatchStatus,
  BatchesDetailFixture,
  BatchesListFixture,
  FillFixture,
  MarketPair,
} from "@/lib/fixtures/types";
import {
  copyForBatchStage,
  copyForBatchStatus,
} from "@/lib/lifecycle-copy";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Constants                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export const EYEBROW =
  "font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Number / format helpers                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export function parseNum(s: string | undefined | null): number {
  if (!s) return 0;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function fmtUsd(n: number, fractionDigits = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function fmtCompactUsd(n: number): string {
  if (Math.abs(n) >= 1_000_000)
    return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function truncateHash(hash: string, lead = 6, tail = 4): string {
  if (!hash.startsWith("0x")) return hash;
  if (hash.length <= lead + tail + 1) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-tail)}`;
}

export function formatTimeUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss} UTC`;
}

export function formatDateUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatStampUtc(iso: string): string {
  return `${formatDateUtc(iso)} ${formatTimeUtc(iso)}`;
}

/** Stable, deterministic age string given a fixed reference moment. We do
 *  NOT use real wall-clock so visual regression snapshots stay stable and
 *  no flapping `2 minutes ago` strings cross test boundaries. The reference
 *  is the latest sealedAt across the loaded fixture. */
export function ageVs(referenceIso: string, sealedIso: string): string {
  const a = new Date(referenceIso).getTime();
  const b = new Date(sealedIso).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return "—";
  const diffSec = Math.max(0, Math.floor((a - b) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  return `${day}d`;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Batch-level aggregations (privacy-safe)                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export interface ListTotals {
  batchCount: number;
  verifiedCount: number;
  pendingCount: number;
  failedCount: number;
  totalFills: number;
  totalOrders: number;
  totalUsd: number;
}

export function computeListTotals(fixture: BatchesListFixture): ListTotals {
  const totals: ListTotals = {
    batchCount: fixture.batches.length,
    verifiedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    totalFills: 0,
    totalOrders: 0,
    totalUsd: 0,
  };
  for (const b of fixture.batches) {
    if (b.status === "verified") totals.verifiedCount++;
    else if (b.status === "pending") totals.pendingCount++;
    else if (b.status === "failed") totals.failedCount++;
    totals.totalFills += b.fillCount;
    totals.totalOrders += b.orderCount;
    totals.totalUsd += parseNum(b.volumeUsd);
  }
  return totals;
}

/** The most recent batch's sealedAt — used as the deterministic "now" for
 *  age computations so visual regression doesn't flap. */
export function latestSealedAt(fixture: BatchesListFixture): string {
  if (fixture.batches.length === 0) return new Date().toISOString();
  // Batches are sealed in descending order in the fixtures, but defend
  // against future fixtures that mix the order.
  let latest = fixture.batches[0].sealedAt;
  for (const b of fixture.batches) {
    if (b.sealedAt > latest) latest = b.sealedAt;
  }
  return latest;
}

/** Per-pair aggregate inside a single batch detail. Privacy-safe — never
 *  includes order IDs or counterparty fields. */
export interface PairAggregate {
  pair: MarketPair;
  fillCount: number;
  totalBaseAmount: number;
  share: number;
}

export function aggregateByPair(
  fills: FillFixture[],
  pairs: MarketPair[],
): PairAggregate[] {
  const map = new Map<MarketPair, PairAggregate>();
  for (const fill of fills) {
    const entry = map.get(fill.pair) ?? {
      pair: fill.pair,
      fillCount: 0,
      totalBaseAmount: 0,
      share: 0,
    };
    entry.fillCount += 1;
    entry.totalBaseAmount += parseNum(fill.amount);
    map.set(fill.pair, entry);
  }
  for (const pair of pairs) {
    if (!map.has(pair)) {
      map.set(pair, {
        pair,
        fillCount: 0,
        totalBaseAmount: 0,
        share: 0,
      });
    }
  }
  const out = Array.from(map.values());
  const totalAmount = out.reduce((acc, a) => acc + a.totalBaseAmount, 0);
  for (const a of out) {
    a.share = totalAmount > 0 ? a.totalBaseAmount / totalAmount : 0;
  }
  return out.sort((x, y) => y.totalBaseAmount - x.totalBaseAmount);
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Status tone — institutional steel/zinc + emerald/red                      */
/* ────────────────────────────────────────────────────────────────────────── */

export const STATUS_TONE: Record<
  BatchStatus,
  { fg: string; bg: string; border: string; label: string }
> = {
  verified: {
    fg: "var(--success)",
    bg: "color-mix(in oklab, var(--success) 12%, transparent)",
    border: "color-mix(in oklab, var(--success) 30%, transparent)",
    label: "Verified",
  },
  pending: {
    fg: "var(--muted-foreground)",
    bg: "color-mix(in oklab, var(--muted-foreground) 10%, transparent)",
    border: "color-mix(in oklab, var(--muted-foreground) 28%, transparent)",
    label: "Pending",
  },
  failed: {
    fg: "var(--destructive)",
    bg: "color-mix(in oklab, var(--destructive) 12%, transparent)",
    border: "color-mix(in oklab, var(--destructive) 30%, transparent)",
    label: "Failed",
  },
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  State-machine progression (privacy-safe)                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export interface StateStep {
  key: "queued" | "sealed" | "proven" | "settled";
  label: string;
  reached: boolean;
  failed?: boolean;
  hint?: string;
}

export function batchStateSteps(batch: BatchFixture): StateStep[] {
  const sealed = !!batch.sealedAt;
  const proven = !!batch.proofRef && batch.status !== "pending";
  const settled = !!batch.settlementTx && batch.status === "verified";
  const failed = batch.status === "failed";
  return [
    {
      key: "queued",
      label: "Queued",
      reached: true,
      hint: "Orders accepted into the batch window.",
    },
    {
      key: "sealed",
      label: "Sealed",
      reached: sealed,
      hint: "Matching engine sealed the batch.",
    },
    {
      key: "proven",
      label: "Proven",
      reached: proven,
      hint: "TEE attestation generated.",
    },
    {
      key: "settled",
      label: "Settled",
      reached: settled,
      failed: failed && !!batch.settlementTx,
      hint: failed
        ? "Settlement reverted on L1; fills remain valid offchain."
        : settled
          ? "Anchored on Ethereum L1."
          : "L1 anchor pending.",
    },
  ];
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Reverse-time series — deterministic synthetic volume curve for the list  */
/*  KPI band. Fixture-only; M6 wires real time-series.                        */
/* ────────────────────────────────────────────────────────────────────────── */

export function volumeSeries(fixture: BatchesListFixture): number[] {
  // Show the most recent batches first (left → right is older → newer)
  // by reversing the descending fixture.
  const sorted = [...fixture.batches].sort((a, b) =>
    a.sealedAt < b.sealedAt ? -1 : 1,
  );
  return sorted.map((b) => parseNum(b.volumeUsd));
}

export function fillsSeries(fixture: BatchesListFixture): number[] {
  const sorted = [...fixture.batches].sort((a, b) =>
    a.sealedAt < b.sealedAt ? -1 : 1,
  );
  return sorted.map((b) => b.fillCount);
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  SVG primitives                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

export interface SparklineProps {
  series: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  ariaLabel: string;
  strokeWidth?: number;
  showFill?: boolean;
  showLast?: boolean;
}

export function Sparkline({
  series,
  width = 240,
  height = 56,
  stroke = "var(--foreground)",
  fill = "var(--foreground)",
  ariaLabel,
  strokeWidth = 1.5,
  showFill = true,
  showLast = true,
}: SparklineProps) {
  if (series.length === 0) {
    return (
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
      />
    );
  }
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stepX = width / Math.max(series.length - 1, 1);
  const points = series.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const d =
    "M " +
    points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L ");
  const last = points[points.length - 1];
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="overflow-visible"
    >
      {showFill ? (
        <path
          d={`${d} L ${width} ${height} L 0 ${height} Z`}
          fill={fill}
          opacity={0.08}
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showLast && last ? (
        <circle cx={last[0]} cy={last[1]} r={2.5} fill={stroke} />
      ) : null}
    </svg>
  );
}

/** MiniBar — single horizontal bar inside a row. Used for per-row volume
 *  share density (Bloomberg-style). */
export function MiniBar({
  share,
  width = 80,
  height = 4,
  ariaLabel,
}: {
  share: number;
  width?: number;
  height?: number;
  ariaLabel: string;
}) {
  const w = Math.max(0, Math.min(1, share)) * width;
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
    >
      <rect width={width} height={height} fill="var(--muted)" rx={1} />
      <rect width={w} height={height} fill="var(--foreground)" rx={1} />
    </svg>
  );
}

/** StatePips — four-stop progression bar for the batch state machine.
 *  Reached steps are filled with the success token; unreached are muted;
 *  a failed last step uses the destructive token. */
export function StatePips({
  steps,
  width = 220,
  height = 8,
  ariaLabel = "Batch state machine progress",
}: {
  steps: StateStep[];
  width?: number;
  height?: number;
  ariaLabel?: string;
}) {
  const pipW = (width - (steps.length - 1) * 6) / steps.length;
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
    >
      {steps.map((s, i) => {
        const x = i * (pipW + 6);
        const fill = s.failed
          ? "var(--destructive)"
          : s.reached
            ? "var(--success)"
            : "var(--border)";
        return (
          <rect
            key={s.key}
            x={x}
            y={0}
            width={pipW}
            height={height}
            fill={fill}
            rx={1}
            opacity={s.failed ? 1 : s.reached ? 0.9 : 0.6}
          />
        );
      })}
    </svg>
  );
}

/** PairBars — proportional horizontal stacked bar of per-pair volume. */
export function PairBars({
  aggregates,
  width = 280,
  height = 10,
  ariaLabel = "Volume share by pair",
}: {
  aggregates: PairAggregate[];
  width?: number;
  height?: number;
  ariaLabel?: string;
}) {
  const total = aggregates.reduce((acc, a) => acc + a.totalBaseAmount, 0);
  if (total === 0) {
    return (
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
      >
        <rect width={width} height={height} fill="var(--muted)" rx={2} />
      </svg>
    );
  }
  let x = 0;
  const tones = [
    "var(--foreground)",
    "var(--success)",
    "var(--muted-foreground)",
    "var(--ring)",
    "var(--accent-foreground)",
  ];
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
    >
      <rect width={width} height={height} fill="var(--muted)" rx={2} />
      {aggregates.map((a, i) => {
        const w = (a.totalBaseAmount / total) * width;
        const node = (
          <rect
            key={a.pair}
            x={x}
            y={0}
            width={w}
            height={height}
            fill={tones[i % tones.length]}
            opacity={0.85}
            rx={i === 0 || i === aggregates.length - 1 ? 2 : 0}
          />
        );
        x += w;
        return node;
      })}
    </svg>
  );
}

/** ProofGauge — circular gauge showing how far along the batch is in the
 *  4-stage state machine. Used by the Aztec-proof-hero detail variant. */
export function ProofGauge({
  steps,
  size = 140,
  thickness = 12,
  ariaLabel,
}: {
  steps: StateStep[];
  size?: number;
  thickness?: number;
  ariaLabel: string;
}) {
  const reached = steps.filter((s) => s.reached).length;
  const failed = steps.some((s) => s.failed);
  const ratio = reached / steps.length;
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * ratio;
  const tone = failed ? "var(--destructive)" : "var(--success)";
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={thickness}
      />
      <g transform={`rotate(-90 ${center} ${center})`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Tiny presentational primitives                                            */
/* ────────────────────────────────────────────────────────────────────────── */

export function MonoNum({
  children,
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <span
      className={cn("font-mono tabular-nums", className)}
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}

/**
 * BatchStageTooltip — wraps a stage label in the lifecycle tooltip
 * primitive so users get the [what happened] [what to do next] string
 * for each Queued / Sealed / Proven / Settled stage. Used by the
 * production batch-detail variant (Aztec-proof-hero).
 */
export function BatchStageTooltip({
  stageKey,
  children,
}: {
  stageKey: StateStep["key"];
  children: React.ReactElement;
}) {
  const reactId = React.useId();
  const describedById = `batch-stage-tooltip-${reactId}`;
  const tooltip = copyForBatchStage(stageKey);
  const trigger = React.cloneElement(children, {
    "aria-describedby": describedById,
    tabIndex: 0,
  } as React.HTMLAttributes<HTMLElement>);
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          id={describedById}
          role="tooltip"
          className="max-w-[260px] text-xs leading-relaxed"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function StatusPill({ status }: { status: BatchStatus }) {
  const tone = STATUS_TONE[status];
  const reactId = React.useId();
  const describedById = `status-pill-tooltip-${reactId}`;
  const tooltip = copyForBatchStatus(status);
  const pill = (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
      style={{
        color: tone.fg,
        backgroundColor: tone.bg,
        borderColor: tone.border,
      }}
      tabIndex={0}
      aria-describedby={describedById}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: tone.fg }}
      />
      {tone.label}
    </span>
  );
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{pill}</TooltipTrigger>
        <TooltipContent
          id={describedById}
          role="tooltip"
          className="max-w-[260px] text-xs leading-relaxed"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function PairChip({
  pair,
  emphasis = "muted",
}: {
  pair: MarketPair;
  emphasis?: "muted" | "strong";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        emphasis === "strong"
          ? "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]"
          : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)]",
      )}
    >
      {pair}
    </span>
  );
}

export function HashCell({
  hash,
  lead = 6,
  tail = 4,
  label,
}: {
  hash: string;
  lead?: number;
  tail?: number;
  label?: string;
}) {
  return (
    <span className="inline-flex items-center font-mono text-xs">
      <span className="sr-only">{label ?? `Hash ${hash}`}</span>
      <span aria-hidden>{truncateHash(hash, lead, tail)}</span>
    </span>
  );
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <span className={EYEBROW}>{children}</span>;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Picker variant prop shapes                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export interface ListVariantProps {
  fixture: BatchesListFixture;
  /** Resolves to the picker's detail route; preserves the active variant
   *  so the list-row click delivers a coherent variant flow. */
  buildHref: (batchNumber: number) => string;
}

export interface DetailVariantProps {
  fixture: BatchesDetailFixture;
  /** Picker back link — points at the list page with the active variant. */
  listHref: string;
}

export type {
  BatchFixture,
  BatchStatus,
  BatchesDetailFixture,
  BatchesListFixture,
  FillFixture,
  MarketPair,
};
