"use client";

/**
 * PortfolioView — the account surface (`/portfolio`), ported from the Omega
 * Markets design kit (`ui_kits/trading-app/Portfolio.jsx`).
 *
 * The kit wins completely on design: the value lede + 30-day sparkline, the
 * Holdings centerpiece (per-token rows + allocation bars + value), the
 * Activity feed, the right rail (equal-weight Deposit/Withdraw actions,
 * Execution-quality card, cancelable Open-orders), the Overview / Tokens /
 * Orders / Activity tabs, pagination, and the shimmer loading skeletons.
 *
 * The app keeps its behaviour + data: this component is fed the live
 * `PortfolioFixture` the page builds from the connected wallet's real
 * OALPHA / PATH.USD balances and onchain activity (the kit's USDC/EURC is
 * demo data and is NOT used here). Deposit/Withdraw drive the real modals;
 * order cancellation is a local removal (backend deferred). The value trend
 * is a deterministic, fixture-derived curve — there is no price-history
 * backend in v1, so it is synthesized from the current total (no randomness,
 * no wall-clock) exactly as the prior surface did, purely as chart chrome.
 */

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Animate } from "@/components/ui/animate";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type {
  BalanceFixture,
  FillFixture,
  OrderFixture,
  PortfolioFixture,
} from "@/lib/view-types";

import styles from "./portfolio.module.css";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Constants + helpers                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

type PortfolioTab = "overview" | "tokens" | "orders" | "activity";

/** Display names for the tokens the venue lists. */
const TOKEN_NAMES: Record<BalanceFixture["token"], string> = {
  "PATH.USD": "Path Dollar",
  OALPHA: "Omega Alpha",
  USDC: "USD Coin",
  EURC: "Euro Coin",
  USDT: "Tether USD",
  ETH: "Ethereum",
  BTC: "Bitcoin",
};

function parseNum(s: string): number {
  const n = Number(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Group the integer part with thousands separators, keep the fraction. */
function formatGroup(value: string | number): string {
  const [whole, frac] = String(value).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

const fmt2 = (n: number) => formatGroup(n.toFixed(2));

/** Time portion of an ISO timestamp — deterministic across SSR/CSR. */
function formatTime(iso: string): string {
  if (!iso) return "—";
  const [date, time = ""] = iso.split("T");
  const clock = time.slice(0, 5);
  const day = (date ?? "").slice(5); // MM-DD
  return clock ? `${day} · ${clock}` : (date ?? "—");
}

function truncateHash(hash?: string | null): string {
  if (!hash) return "—";
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

interface Holding {
  token: BalanceFixture["token"];
  name: string;
  available: number;
  locked: number;
  total: number;
  value: number;
  price: number | null;
  share: number;
}

/**
 * Project the fixture's balances into the kit's Holdings shape. Token values
 * are USD-equivalent at the venue's mark-to-midpoint (the fixture's `total`
 * strings are already PATH.USD-denominated), so value == total and the unit
 * price is value/balance where a balance exists. No oracle call.
 */
function deriveHoldings(fixture: PortfolioFixture): Holding[] {
  const rows = fixture.balances.map((b) => {
    const available = parseNum(b.available);
    const locked = parseNum(b.locked);
    const total = parseNum(b.total);
    const value = total; // mark-to-midpoint, already USD-equivalent
    return {
      token: b.token,
      name: TOKEN_NAMES[b.token] ?? b.token,
      available,
      locked,
      total,
      value,
      price: total > 0 ? value / total : null,
      share: 0,
    };
  });
  const sum = rows.reduce((s, r) => s + r.value, 0);
  for (const r of rows) r.share = sum > 0 ? r.value / sum : 0;
  return rows.sort((a, b) => b.value - a.value);
}

interface ActivityRow {
  id: string;
  side: "buy" | "sell" | "deposit" | "withdrawal";
  label: string;
  amount: string;
  status: string;
  ref: string;
  at: string;
}

/** Merge fills + transfers into one reverse-chronological activity stream. */
function deriveActivity(fixture: PortfolioFixture): ActivityRow[] {
  const fills: ActivityRow[] = fixture.recentFills.map((f) => ({
    id: f.id,
    side: f.side,
    label: f.pair,
    amount: formatGroup(f.amount),
    status: f.status,
    ref: truncateHash(f.txHash),
    at: f.matchedAt,
  }));
  const deposits: ActivityRow[] = fixture.deposits.map((d) => ({
    id: d.id,
    side: "deposit",
    label: d.token,
    amount: formatGroup(d.amount),
    status: d.status,
    ref: truncateHash(d.txHash),
    at: d.initiatedAt,
  }));
  const withdrawals: ActivityRow[] = fixture.withdrawals.map((w) => ({
    id: w.id,
    side: "withdrawal",
    label: w.token,
    amount: formatGroup(w.amount),
    status: w.status,
    ref: truncateHash(w.txHash),
    at: w.initiatedAt,
  }));
  return [...fills, ...deposits, ...withdrawals].sort((a, b) =>
    a.at < b.at ? 1 : -1,
  );
}

/**
 * Flat 30-point baseline pinned at the current total. There is no
 * portfolio-value history backend in v1, so the hero chart is a neutral flat
 * line — NEVER a fabricated trend or % change. Real history can replace this
 * once the zone indexes it.
 */
function flatBaseline(total: number, points = 30): number[] {
  return Array.from({ length: points }, () => Math.max(total, 0));
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Pagination                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function usePagination(total: number, perPage: number) {
  const [page, setPage] = React.useState(0);
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  React.useEffect(() => {
    if (page > pageCount - 1) setPage(0);
  }, [pageCount, page]);
  const start = page * perPage;
  return { page, setPage, pageCount, start, end: start + perPage };
}

function Pagination({
  page,
  pageCount,
  onPage,
  label,
}: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
  label: string;
}) {
  if (pageCount <= 1) return null;
  const from = Math.max(0, Math.min(page - 2, pageCount - 5));
  const nums: number[] = [];
  for (let i = from; i < Math.min(from + 5, pageCount); i++) nums.push(i);
  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex flex-wrap items-center justify-between gap-3"
    >
      <span className="font-mono text-[11px] tracking-[0.06em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="press-down inline-flex h-8 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--input)] bg-[var(--background)] px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page === 0}
          onClick={() => onPage(page - 1)}
        >
          <Icon.Caret.Right aria-hidden className="rotate-180" />
          Prev
        </button>
        <div className="flex gap-1">
          {nums.map((n) => {
            const active = n === page;
            return (
              <button
                key={n}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onPage(n)}
                className={cn(
                  "press-down inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] font-mono text-xs tabular-nums",
                  active
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "border border-[var(--border)] text-[var(--muted-foreground)]",
                )}
              >
                {n + 1}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="press-down inline-flex h-8 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--input)] bg-[var(--background)] px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page === pageCount - 1}
          onClick={() => onPage(page + 1)}
        >
          Next
          <Icon.Caret.Right aria-hidden />
        </button>
      </div>
    </nav>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Small presentational atoms                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function SideTag({ side }: { side: ActivityRow["side"] }) {
  const buy = side === "buy" || side === "deposit";
  const label =
    side === "deposit"
      ? "Deposit"
      : side === "withdrawal"
        ? "Withdraw"
        : side === "buy"
          ? "Buy"
          : "Sell";
  return (
    <span
      className="font-mono text-[11px] uppercase tracking-[0.14em]"
      style={{ color: buy ? "var(--success)" : "var(--destructive)" }}
    >
      {label}
    </span>
  );
}

function TokenGlyph({
  symbol,
  size = 34,
}: {
  symbol: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--border)] font-mono font-medium text-[var(--foreground)]"
      style={{
        width: size,
        height: size,
        background: "color-mix(in oklab, var(--muted) 60%, var(--card))",
        fontSize: size * 0.3,
        letterSpacing: "0.02em",
      }}
    >
      {symbol.replace(".", "").slice(0, 2)}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Tabs                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

const TABS: [PortfolioTab, string][] = [
  ["overview", "Overview"],
  ["tokens", "Tokens"],
  ["orders", "Orders"],
  ["activity", "Activity"],
];

function PortfolioTabs({
  tab,
  onTab,
  orderCount,
}: {
  tab: PortfolioTab;
  onTab: (t: PortfolioTab) => void;
  orderCount: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [ind, setInd] = React.useState({ left: 0, width: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const a = el.querySelector<HTMLElement>('[data-tab-active="true"]');
    if (a) setInd({ left: a.offsetLeft, width: a.offsetWidth });
  }, [tab, orderCount]);
  return (
    <div
      ref={ref}
      role="tablist"
      aria-label="Portfolio sections"
      className="relative flex gap-7 border-b border-[var(--border)]"
    >
      {TABS.map(([id, label]) => {
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            data-tab-active={active}
            onClick={() => onTab(id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 pb-3 text-[15px] font-medium transition-colors",
              active
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {label}
            {id === "orders" && orderCount > 0 ? (
              <span
                className={cn(
                  "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 font-mono text-[10px] tabular-nums",
                  active
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]",
                )}
              >
                {orderCount}
              </span>
            ) : null}
          </button>
        );
      })}
      <span
        aria-hidden
        className="absolute -bottom-px h-0.5 rounded-full bg-[var(--foreground)] transition-all duration-300 ease-out"
        style={{ left: ind.left, width: ind.width }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Area chart + value lede                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function AreaChart({
  data,
  height = 200,
  tone,
}: {
  data: number[];
  height?: number;
  tone: string;
}) {
  const W = 760;
  const H = height;
  const pad = 6;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (data.length - 1 || 1);
  const y = (v: number) => pad + (H - pad * 2) * (1 - (v - min) / span);
  const line = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${H - pad} L${x(0).toFixed(1)},${H - pad} Z`;
  const lastX = x(data.length - 1);
  const lastY = y(data[data.length - 1] ?? 0);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      aria-hidden
      className="block overflow-visible"
    >
      <defs>
        <linearGradient id="pf-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.2" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1="0"
          x2={W}
          y1={H * g}
          y2={H * g}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="2 7"
          strokeOpacity="0.5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <path d={area} fill="url(#pf-area)" />
      <path
        d={line}
        fill="none"
        stroke={tone}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r="3.5" fill={tone} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ValueLede({
  totalLabel,
  trend,
}: {
  totalLabel: string;
  trend: number[];
}) {
  // No portfolio-value history backend in v1 → no % change, no timeframe
  // switching, and a neutral flat baseline. Honest, never a fabricated trend.
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-2.5">
          <span
            className="font-mono text-[44px] font-medium leading-none tracking-[-0.02em] tabular-nums"
            aria-label={`Portfolio total ${totalLabel} PATH.USD`}
          >
            {totalLabel}
          </span>
          <span className="font-mono text-[15px] tracking-[0.12em] text-[var(--muted-foreground)]">
            PATH.USD
          </span>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
          Live balance · value history coming soon
        </span>
      </div>
      <div role="img" aria-label={`Portfolio total ${totalLabel} PATH.USD`}>
        <AreaChart data={trend} tone="var(--muted-foreground)" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Action grid + execution-quality card                                      */
/* ────────────────────────────────────────────────────────────────────────── */

function ActionGrid({
  onDeposit,
  onWithdraw,
  onMore,
}: {
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onMore?: () => void;
}) {
  const router = useRouter();
  const card = (
    icon: React.ReactNode,
    label: string,
    onClick?: () => void,
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "glass glass-interactive press-down flex min-h-[92px] flex-col justify-between gap-[18px] rounded-[var(--radius-lg)] p-4 text-left",
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
        {icon}
      </span>
      <span className="text-sm font-medium text-[var(--foreground)]">
        {label}
      </span>
    </button>
  );
  return (
    <div className="grid grid-cols-2 gap-3">
      {card(<Icon.Wallet size={16} aria-hidden />, "Deposit", onDeposit)}
      {card(<Icon.Sell size={16} aria-hidden />, "Withdraw", onWithdraw)}
      {card(<Icon.Trade size={16} aria-hidden />, "Trade", () => router.push("/trade"))}
      {card(<Icon.Settings size={16} aria-hidden />, "More", onMore)}
    </div>
  );
}

function ExecutionQualityCard({ fixture }: { fixture: PortfolioFixture }) {
  // Honest, fixture-derived figures — no oracle. Volume sums the user's own
  // fills; settlement reads the fill statuses (every fill is matched → proven
  // → settled in the dark pool, so "proven or better" == 100% when fills
  // exist). Midpoint saving is not yet sourced from the backend.
  const fills = fixture.recentFills;
  const volume = fills.reduce((s, f) => s + parseNum(f.amount), 0);
  const settled = fills.length === 0
    ? "—"
    : `${Math.round(
        (fills.filter((f) => f.status === "settled" || f.status === "proven")
          .length /
          fills.length) *
          100,
      )}% proven`;
  const row = (label: string, value: string, tone?: string) => (
    <div className="flex items-baseline justify-between gap-3">
      <span className="whitespace-nowrap text-[13px] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span
        className="whitespace-nowrap font-mono text-[13px] tabular-nums"
        style={{ color: tone ?? "var(--foreground)" }}
      >
        {value}
      </span>
    </div>
  );
  return (
    <Card className="glass flex flex-col gap-4 rounded-[var(--radius-xl)] p-5">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-[15px] font-semibold text-[var(--foreground)]">
          Execution quality
        </h2>
        <span className="rounded-full border border-[var(--border)] px-2.5 py-[3px] font-mono text-[11px] tracking-[0.08em] text-[var(--muted-foreground)]">
          24H
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {row("Volume", volume > 0 ? `${fmt2(volume)} PATH.USD` : "—")}
        {row("Settlement", settled, fills.length ? "var(--success)" : undefined)}
        {row("Routing", "Midpoint · internal", "var(--success)")}
      </div>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Holdings (tokens) table                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function HoldingsTable({
  holdings,
  limit,
  full,
  onViewAll,
}: {
  holdings: Holding[];
  limit?: number;
  full?: boolean;
  onViewAll?: () => void;
}) {
  const shown = limit ? holdings.slice(0, limit) : holdings;
  const th =
    "pb-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)] whitespace-nowrap";
  const td = "py-3.5 font-mono text-[13px] tabular-nums whitespace-nowrap";
  return (
    <section className="glass rounded-[var(--radius-xl)] p-5 flex flex-col gap-1">
      <div className="mb-3 flex flex-col gap-0.5">
        <h2 className="m-0 text-lg font-semibold text-[var(--foreground)]">
          Holdings
        </h2>
        <span className="text-[13px] text-[var(--muted-foreground)]">
          {holdings.length} {holdings.length === 1 ? "token" : "tokens"}
        </span>
      </div>
      {holdings.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-[var(--muted-foreground)]">
          No balances yet. Deposit to get started.
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={cn(th, "text-left")}>Token</th>
              <th className={cn(th, "text-right")}>Price</th>
              {full ? <th className={cn(th, "text-right")}>Available</th> : null}
              {full ? <th className={cn(th, "text-right")}>In orders</th> : null}
              <th className={cn(th, "text-right")}>Balance</th>
              <th className={cn(th, "text-right")}>Value</th>
              <th className={cn(th, "text-right")}>Allocation</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((h) => (
              <tr key={h.token} className="border-t border-[var(--border)] transition-[background-color] duration-75 hover:bg-[var(--muted)]/30">
                <td className={cn(td, "pr-3")}>
                  <span className="flex items-center gap-3">
                    <TokenGlyph symbol={h.token} />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-medium text-[var(--foreground)]">
                        {h.token}
                      </span>
                      <span className="truncate font-sans text-xs text-[var(--muted-foreground)]">
                        {h.name}
                      </span>
                    </span>
                  </span>
                </td>
                <td className={cn(td, "text-right text-[var(--muted-foreground)]")}>
                  {h.price !== null ? `$${h.price.toFixed(2)}` : "—"}
                </td>
                {full ? (
                  <td className={cn(td, "text-right")}>{fmt2(h.available)}</td>
                ) : null}
                {full ? (
                  <td
                    className={cn(
                      td,
                      "text-right",
                      h.locked > 0
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)]",
                    )}
                  >
                    {fmt2(h.locked)}
                  </td>
                ) : null}
                <td className={cn(td, "text-right")}>{fmt2(h.total)}</td>
                <td className={cn(td, "text-right")}>
                  {fmt2(h.value)}
                  {full ? (
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {" "}
                      USD
                    </span>
                  ) : null}
                </td>
                <td className={cn(td, "text-right")}>
                  <span className="flex items-center justify-end gap-2">
                    <span
                      aria-hidden
                      className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--muted)]"
                    >
                      <span
                        className="block h-full rounded-full bg-[var(--success)]"
                        style={{ width: `${(h.share * 100).toFixed(1)}%` }}
                      />
                    </span>
                    <span className="w-10 text-right text-[var(--muted-foreground)]">
                      {(h.share * 100).toFixed(0)}%
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {onViewAll ? (
        <button
          type="button"
          onClick={onViewAll}
          className="press-down mt-3.5 inline-flex h-9 items-center gap-2 self-start rounded-full border border-[var(--input)] bg-[var(--background)] px-4 text-[13px] font-medium text-[var(--foreground)]"
        >
          View all tokens <Icon.ArrowRight size={15} aria-hidden />
        </button>
      ) : null}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Activity                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

function ActivityTable({ rows }: { rows: ActivityRow[] }) {
  const { page, setPage, pageCount, start, end } = usePagination(
    rows.length,
    10,
  );
  const shown = rows.slice(start, end);
  const th =
    "pb-3 pr-4 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)] whitespace-nowrap";
  const td = "py-3.5 pr-4 font-mono text-[13px] tabular-nums whitespace-nowrap";
  return (
    <section className="glass rounded-[var(--radius-xl)] p-5 flex flex-col">
      <div className="mb-3 flex flex-col gap-0.5">
        <h2 className="m-0 text-lg font-semibold text-[var(--foreground)]">
          Activity
        </h2>
        <span className="text-[13px] text-[var(--muted-foreground)]">
          {rows.length} settlements · last 24h
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-[var(--muted-foreground)]">
          No activity yet.
        </p>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Side</th>
                <th className={th}>Market</th>
                <th className={cn(th, "text-right")}>Amount</th>
                <th className={th}>Status</th>
                <th className={th}>Settlement</th>
                <th className={cn(th, "pr-0 text-right")}>Time</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={`${r.side}-${r.id}`} className="border-t border-[var(--border)] transition-[background-color] duration-75 hover:bg-[var(--muted)]/30">
                  <td className={td}>
                    <SideTag side={r.side} />
                  </td>
                  <td className={td}>{r.label}</td>
                  <td className={cn(td, "text-right")}>{r.amount}</td>
                  <td className={td}>
                    <Status state={r.status as never} />
                  </td>
                  <td className={cn(td, "text-[var(--muted-foreground)]")}>
                    {r.ref}
                  </td>
                  <td className={cn(td, "pr-0 text-right text-[var(--muted-foreground)]")}>
                    {formatTime(r.at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            pageCount={pageCount}
            onPage={setPage}
            label={`${start + 1}–${Math.min(end, rows.length)} of ${rows.length}`}
          />
        </>
      )}
    </section>
  );
}

function ActivityList({
  rows,
  limit,
  onViewAll,
  title = "Recent activity",
}: {
  rows: ActivityRow[];
  limit?: number;
  onViewAll?: () => void;
  title?: string;
}) {
  const shown = limit ? rows.slice(0, limit) : rows;
  return (
    <section className="glass rounded-[var(--radius-xl)] p-5 flex flex-col">
      <div className="mb-2 flex flex-col gap-0.5">
        <h2 className="m-0 text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <span className="text-[13px] text-[var(--muted-foreground)]">
          {rows.length} settlements · last 24h
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-[13px] text-[var(--muted-foreground)]">
          No activity yet.
        </p>
      ) : (
        <div className="flex flex-col">
          {shown.map((r) => {
            const buy = r.side === "buy" || r.side === "deposit";
            return (
              <div key={`${r.side}-${r.id}`} className="flex items-center gap-3 py-3">
                <span
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)]"
                  style={{
                    background: "color-mix(in oklab, var(--muted) 55%, var(--card))",
                    color: buy ? "var(--success)" : "var(--destructive)",
                  }}
                >
                  {buy ? (
                    <Icon.Buy size={15} aria-hidden />
                  ) : (
                    <Icon.Sell size={15} aria-hidden />
                  )}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-mono text-[13px] font-medium text-[var(--foreground)]">
                    {r.side === "deposit"
                      ? `Deposit ${r.label}`
                      : r.side === "withdrawal"
                        ? `Withdraw ${r.label}`
                        : `${r.side === "buy" ? "Buy" : "Sell"} ${r.label}`}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--muted-foreground)]">
                    {r.ref} · {r.status[0].toUpperCase() + r.status.slice(1)}
                  </span>
                </div>
                <div className="ml-auto flex flex-col items-end gap-0.5">
                  <span className="font-mono text-[13px] tabular-nums text-[var(--foreground)]">
                    {r.amount}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                    {formatTime(r.at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {onViewAll && rows.length > (limit ?? 0) ? (
        <button
          type="button"
          onClick={onViewAll}
          className="press-down mt-3 inline-flex h-9 items-center gap-2 self-start rounded-full border border-[var(--input)] bg-[var(--background)] px-4 text-[13px] font-medium text-[var(--foreground)]"
        >
          View all activity <Icon.ArrowRight size={15} aria-hidden />
        </button>
      ) : null}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Orders                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

function OrdersTable({
  orders,
  onCancel,
}: {
  orders: OrderFixture[];
  onCancel: (id: string) => void;
}) {
  const { page, setPage, pageCount, start, end } = usePagination(
    orders.length,
    8,
  );
  const shown = orders.slice(start, end);
  const th =
    "pb-3 pr-4 text-left font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)] whitespace-nowrap";
  const td = "py-3.5 pr-4 font-mono text-[13px] tabular-nums whitespace-nowrap";
  return (
    <section className="glass rounded-[var(--radius-xl)] p-5 flex flex-col">
      <div className="mb-3 flex flex-col gap-0.5">
        <h2 className="m-0 text-lg font-semibold text-[var(--foreground)]">
          Open orders
        </h2>
        <span className="text-[13px] text-[var(--muted-foreground)]">
          {orders.length} resting · cancel anytime before match
        </span>
      </div>
      {orders.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-[var(--muted-foreground)]">
          No open orders.
        </p>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Side</th>
                <th className={th}>Market</th>
                <th className={cn(th, "text-right")}>Amount</th>
                <th className={cn(th, "text-right")}>Limit price</th>
                <th className={th}>Status</th>
                <th className={cn(th, "pr-0 text-right")}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)] transition-[background-color] duration-75 hover:bg-[var(--muted)]/30">
                  <td className={td}>
                    <SideTag side={o.side} />
                  </td>
                  <td className={td}>{o.pair}</td>
                  <td className={cn(td, "text-right")}>{formatGroup(o.amount)}</td>
                  <td className={cn(td, "text-right")}>{o.price}</td>
                  <td className={td}>
                    <Status state={o.status as never} />
                  </td>
                  <td className={cn(td, "pr-0 text-right")}>
                    <button
                      type="button"
                      onClick={() => onCancel(o.id)}
                      className="press-down h-7 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            pageCount={pageCount}
            onPage={setPage}
            label={`${start + 1}–${Math.min(end, orders.length)} of ${orders.length}`}
          />
        </>
      )}
    </section>
  );
}

function OpenOrders({
  orders,
  onCancel,
  onViewAll,
}: {
  orders: OrderFixture[];
  onCancel: (id: string) => void;
  onViewAll?: () => void;
}) {
  if (orders.length === 0) return null;
  const shown = orders.slice(0, 3);
  return (
    <section className="glass rounded-[var(--radius-xl)] p-5 flex flex-col">
      <div className="mb-2 flex flex-col gap-0.5">
        <h2 className="m-0 text-lg font-semibold text-[var(--foreground)]">
          Open orders
        </h2>
        <span className="text-[13px] text-[var(--muted-foreground)]">
          {orders.length} resting · cancel before match
        </span>
      </div>
      <div className="flex flex-col">
        {shown.map((o) => {
          const buy = o.side === "buy";
          return (
            <div
              key={o.id}
              className="flex items-center gap-3 border-t border-[var(--border)] py-3 transition-[background-color] duration-75 hover:bg-[var(--muted)]/30"
            >
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)]"
                style={{
                  background: "color-mix(in oklab, var(--muted) 55%, var(--card))",
                  color: buy ? "var(--success)" : "var(--destructive)",
                }}
              >
                {buy ? (
                  <Icon.Buy size={15} aria-hidden />
                ) : (
                  <Icon.Sell size={15} aria-hidden />
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-[13px] font-medium text-[var(--foreground)]">
                  {buy ? "Buy" : "Sell"} {o.pair}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-[var(--muted-foreground)]">
                  {formatGroup(o.amount)} @ {o.price}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onCancel(o.id)}
                className="press-down ml-auto h-7 shrink-0 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              >
                Cancel
              </button>
            </div>
          );
        })}
      </div>
      {orders.length > 3 && onViewAll ? (
        <button
          type="button"
          onClick={onViewAll}
          className="press-down mt-3 inline-flex h-9 items-center gap-2 self-start rounded-full border border-[var(--input)] bg-[var(--background)] px-4 text-[13px] font-medium text-[var(--foreground)]"
        >
          View all {orders.length} orders <Icon.ArrowRight size={15} aria-hidden />
        </button>
      ) : null}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Loading skeleton                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function Skel({
  w,
  h = 14,
  r = "var(--radius-sm)",
  className,
}: {
  w?: number | string;
  h?: number | string;
  r?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(styles.skel, className)}
      style={{ width: w, height: h, borderRadius: r }}
    />
  );
}

function SkelRows({ n = 5 }: { n?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3.5 py-3",
            i > 0 ? "border-t border-[var(--border)]" : "",
          )}
        >
          <Skel w={32} h={32} r="9999px" />
          <Skel w={`${30 + (i % 3) * 8}%`} />
          <div className="ml-auto flex gap-6">
            <Skel w={70} />
            <Skel w={54} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PortfolioSkeleton({ tab = "overview" }: { tab?: PortfolioTab }) {
  if (tab === "overview") {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-3.5">
            <Skel w={260} h={42} />
            <Skel w={150} h={14} />
            <Skel w="100%" h={200} r="var(--radius-lg)" className="mt-1.5" />
            <Skel w={220} h={36} r="9999px" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Skel w="100%" h={92} r="var(--radius-lg)" />
              <Skel w="100%" h={92} r="var(--radius-lg)" />
              <Skel w="100%" h={92} r="var(--radius-lg)" />
              <Skel w="100%" h={92} r="var(--radius-lg)" />
            </div>
            <Skel w="100%" h={150} r="var(--radius-xl)" />
          </div>
        </div>
        <div className="h-px bg-[var(--border)]" />
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-3.5">
            <Skel w={120} h={20} />
            <SkelRows n={4} />
          </div>
          <div className="flex flex-col gap-3.5">
            <Skel w={120} h={20} />
            <SkelRows n={4} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skel w={160} h={20} />
      <Skel w={200} h={13} />
      <SkelRows n={tab === "activity" ? 7 : 5} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Composed surface                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

export interface PortfolioViewProps {
  fixture: PortfolioFixture;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onMore?: () => void;
}

export function PortfolioView({
  fixture,
  onDeposit,
  onWithdraw,
  onMore,
}: PortfolioViewProps) {
  const [tab, setTab] = React.useState<PortfolioTab>("overview");
  const [cancelled, setCancelled] = React.useState<Set<string>>(
    () => new Set(),
  );

  const orders = React.useMemo(
    () => fixture.openOrders.filter((o) => !cancelled.has(o.id)),
    [fixture.openOrders, cancelled],
  );
  const cancel = React.useCallback((id: string) => {
    setCancelled((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const holdings = React.useMemo(() => deriveHoldings(fixture), [fixture]);
  const activity = React.useMemo(() => deriveActivity(fixture), [fixture]);
  const total = React.useMemo(
    () => parseNum(fixture.totalValueUSD),
    [fixture.totalValueUSD],
  );
  const trend = React.useMemo(() => flatBaseline(total), [total]);
  const totalLabel = fixture.totalValueUSD || fmt2(total);

  return (
    <div className="flex w-full max-w-[1040px] flex-col gap-6">
      <PortfolioTabs tab={tab} onTab={setTab} orderCount={orders.length} />
      <Animate key={tab} variant="enter" className="flex flex-col gap-6">
        {tab === "overview" ? (
          <>
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <ValueLede totalLabel={totalLabel} trend={trend} />
              <div className="flex flex-col gap-4">
                <ActionGrid
                  onDeposit={onDeposit}
                  onWithdraw={onWithdraw}
                  onMore={onMore}
                />
                <ExecutionQualityCard fixture={fixture} />
              </div>
            </div>

            <div className="h-px bg-[var(--border)]" />

            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <HoldingsTable
                holdings={holdings}
                onViewAll={() => setTab("tokens")}
              />
              <div className="flex flex-col gap-6">
                <OpenOrders
                  orders={orders}
                  onCancel={cancel}
                  onViewAll={() => setTab("orders")}
                />
                <ActivityList
                  rows={activity}
                  limit={4}
                  onViewAll={() => setTab("activity")}
                />
              </div>
            </div>
          </>
        ) : null}

        {tab === "tokens" ? <HoldingsTable holdings={holdings} full /> : null}
        {tab === "orders" ? (
          <OrdersTable orders={orders} onCancel={cancel} />
        ) : null}
        {tab === "activity" ? <ActivityTable rows={activity} /> : null}
      </Animate>
    </div>
  );
}

export default PortfolioView;
