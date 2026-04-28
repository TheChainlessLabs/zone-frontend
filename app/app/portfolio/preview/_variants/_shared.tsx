"use client";

/**
 * Shared helpers and SVG primitives for the portfolio preview variants.
 *
 * These helpers exist purely to keep each variant file under the 400-LOC
 * guard and to centralize token-driven chart styling. Charts are hand-rolled
 * SVG so we avoid pulling in a chart library for an exploratory picker — all
 * fills/strokes resolve through CSS custom properties so theme switching
 * works without touching individual variants.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import type {
  BalanceFixture,
  DepositFixture,
  FillFixture,
  OrderFixture,
  PortfolioFixture,
  WithdrawalFixture,
} from "@/lib/fixtures";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Constants                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export const EYEBROW =
  "font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]";

export const VARIANT_PROPS_DOCS = `Each variant takes the same { fixture: PortfolioFixture } so the picker can compare layouts honestly against identical data.`;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Number / format helpers                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export function parseNum(s: string): number {
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function fmtUsd(n: number, fractionDigits = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000)
    return `${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}

export function truncateHash(hash: string): string {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mon = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${mon}-${dd} ${hh}:${mm}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mon = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yy = String(d.getUTCFullYear()).slice(-2);
  return `${mon}/${dd}/${yy}`;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Aggregations                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

export interface Totals {
  available: number;
  locked: number;
  total: number;
  totalUsd: number;
}

export function computeTotals(fixture: PortfolioFixture): Totals {
  let available = 0;
  let locked = 0;
  let total = 0;
  for (const b of fixture.balances) {
    available += parseNum(b.available);
    locked += parseNum(b.locked);
    total += parseNum(b.total);
  }
  const totalUsd = parseNum(fixture.totalValueUSD);
  return { available, locked, total, totalUsd };
}

export interface Allocation {
  token: BalanceFixture["token"];
  value: number;
  share: number;
}

export function computeAllocations(fixture: PortfolioFixture): Allocation[] {
  const total = computeTotals(fixture).total;
  return fixture.balances
    .map((b) => {
      const value = parseNum(b.total);
      return {
        token: b.token,
        value,
        share: total > 0 ? value / total : 0,
      };
    })
    .filter((a) => a.value > 0)
    .sort((a, b) => b.value - a.value);
}

/**
 * A deterministic 30-point pseudo-time-series synthesized from the current
 * portfolio total. Fixture-only — the production page wires real timeseries
 * in M6. We seed off the integer total so each fixture produces a stable
 * curve across rerenders. No randomness; no wall-clock; no oracle.
 */
export function syntheticSeries(
  total: number,
  points = 30,
  amp = 0.04,
): number[] {
  if (total <= 0) return Array.from({ length: points }, () => 0);
  const seed = Math.floor(total) || 1;
  const out: number[] = [];
  // Two stacked sine waves seeded by the total — deterministic walk.
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const a = Math.sin((seed % 13) + i * 0.42);
    const b = Math.cos((seed % 7) + i * 0.18);
    const drift = total * (1 - amp + amp * 2 * t);
    const wobble = total * amp * (a * 0.5 + b * 0.3) * 0.4;
    out.push(drift + wobble);
  }
  // Force the last point to equal the actual total so the hero number agrees.
  out[out.length - 1] = total;
  return out;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Token color (token-driven, no raw hex outside SVG defs derived from CSS)  */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Allocation colors are driven via CSS variables so theme + a11y changes
 * propagate. We pick from neutral foreground tones plus the success token —
 * institutional steel/zinc + emerald for the dominant slice. No neon.
 */
export const TOKEN_TONE: Record<BalanceFixture["token"], string> = {
  USDC: "var(--foreground)",
  EURC: "var(--success)",
  USDT: "var(--muted-foreground)",
  ETH: "var(--ring)",
  BTC: "var(--accent-foreground)",
};

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
  const stepX = width / (series.length - 1 || 1);
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
      {last ? (
        <circle
          cx={last[0]}
          cy={last[1]}
          r={2.5}
          fill={stroke}
        />
      ) : null}
    </svg>
  );
}

export interface DonutProps {
  allocations: Allocation[];
  size?: number;
  thickness?: number;
  ariaLabel: string;
}

export function Donut({
  allocations,
  size = 140,
  thickness = 18,
  ariaLabel,
}: DonutProps) {
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (allocations.length === 0) {
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
      </svg>
    );
  }

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
        {allocations.map((a) => {
          const len = circumference * a.share;
          const dasharray = `${len} ${circumference - len}`;
          const node = (
            <circle
              key={a.token}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={TOKEN_TONE[a.token]}
              strokeWidth={thickness}
              strokeDasharray={dasharray}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return node;
        })}
      </g>
    </svg>
  );
}

export interface BarsProps {
  values: { label: string; value: number; tone?: string }[];
  width?: number;
  height?: number;
  ariaLabel: string;
}

export function Bars({
  values,
  width = 240,
  height = 80,
  ariaLabel,
}: BarsProps) {
  const max = Math.max(...values.map((v) => v.value), 1);
  const slot = width / values.length;
  const barW = Math.max(slot - 6, 4);
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
    >
      {values.map((v, i) => {
        const h = (v.value / max) * (height - 12);
        const x = i * slot + 3;
        const y = height - h;
        return (
          <rect
            key={`${v.label}-${i}`}
            x={x}
            y={y}
            width={barW}
            height={h}
            fill={v.tone ?? "var(--foreground)"}
            opacity={0.8}
            rx={1.5}
          />
        );
      })}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Combined transfer + activity helpers                                      */
/* ────────────────────────────────────────────────────────────────────────── */

export type TransferRow =
  | ({ kind: "deposit" } & DepositFixture)
  | ({ kind: "withdrawal" } & WithdrawalFixture);

export function combinedTransfers(fixture: PortfolioFixture): TransferRow[] {
  const deposits: TransferRow[] = fixture.deposits.map((d) => ({
    kind: "deposit",
    ...d,
  }));
  const withdrawals: TransferRow[] = fixture.withdrawals.map((w) => ({
    kind: "withdrawal",
    ...w,
  }));
  return [...deposits, ...withdrawals].sort((a, b) =>
    a.initiatedAt < b.initiatedAt ? 1 : -1,
  );
}

export interface ActivityItem {
  id: string;
  kind: "fill" | "deposit" | "withdrawal" | "order";
  label: string;
  amount: string;
  token: string;
  pair?: string;
  status: string;
  at: string;
  txHash?: string | null;
}

export function combinedActivity(fixture: PortfolioFixture): ActivityItem[] {
  const out: ActivityItem[] = [];
  for (const f of fixture.recentFills) {
    out.push({
      id: f.id,
      kind: "fill",
      label: f.side === "buy" ? "Buy fill" : "Sell fill",
      amount: f.amount,
      token: f.pair.split("/")[0],
      pair: f.pair,
      status: f.status,
      at: f.matchedAt,
    });
  }
  for (const o of fixture.openOrders) {
    out.push({
      id: o.id,
      kind: "order",
      label: o.side === "buy" ? "Buy order" : "Sell order",
      amount: o.amount,
      token: o.pair.split("/")[0],
      pair: o.pair,
      status: o.status,
      at: o.submittedAt,
    });
  }
  for (const d of fixture.deposits) {
    out.push({
      id: d.id,
      kind: "deposit",
      label: "Deposit",
      amount: d.amount,
      token: d.token,
      status: d.status,
      at: d.initiatedAt,
      txHash: d.txHash,
    });
  }
  for (const w of fixture.withdrawals) {
    out.push({
      id: w.id,
      kind: "withdrawal",
      label: "Withdrawal",
      amount: w.amount,
      token: w.token,
      status: w.status,
      at: w.initiatedAt,
      txHash: w.txHash,
    });
  }
  return out.sort((a, b) => (a.at < b.at ? 1 : -1));
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Tiny presentational primitives                                            */
/* ────────────────────────────────────────────────────────────────────────── */

export function MonoNum({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>{children}</span>
  );
}

export function TokenChip({
  token,
  size = 28,
}: {
  token: BalanceFixture["token"];
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)] font-mono uppercase text-[var(--foreground)]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        letterSpacing: "0.04em",
      }}
    >
      {token.slice(0, 3)}
    </span>
  );
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <span className={EYEBROW}>{children}</span>;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Static day-delta — fixture-derived display only, NOT a real metric        */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Derive a deterministic day-over-day delta from the synthetic series so
 * the hero "today" badge agrees with the rendered sparkline. Still fixture-
 * only — the production wire-up lands in M6.
 */
export function deriveDayDelta(total: number) {
  if (total <= 0) return { absolute: 0, percent: 0, direction: "flat" as const };
  const series = syntheticSeries(total);
  const prev = series[series.length - 2] ?? total;
  const absolute = total - prev;
  const percent = prev !== 0 ? (absolute / prev) * 100 : 0;
  const direction =
    absolute > 0 ? "up" : absolute < 0 ? "down" : ("flat" as const);
  return { absolute, percent, direction };
}

export function fmtSignedUsd(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${fmtUsd(Math.abs(n))}`;
}

export function fmtSignedPct(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(2)}%`;
}

export type { OrderFixture, FillFixture, BalanceFixture, PortfolioFixture };
