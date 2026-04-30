"use client";

/**
 * Variant 11 — Blended.
 *
 * Combines the strongest moves from variants 04 (narrative whisper),
 * 07 (chart-led hero), and 05 (dual-column with sticky summary).
 * Top strip frames the page with the total + a single short serif
 * line. The chart hero is the visual anchor; range chips + actions
 * sit inside the same card so the toolbar doesn't compete. Below,
 * a dual-column carries the trader-day-job utility — positions,
 * fills, transfers in the scrollable column, and a sticky summary
 * stack (capital deployed, allocation donut) on the right.
 *
 * Mobile collapses cleanly: the summary card lifts above the
 * scrollable sections so the quick-glance signal stays visible
 * after the chart instead of being buried under the lists.
 *
 * M4.17: rows became receipt-format drill-down triggers. Click
 * (or Enter / Space) opens a Sheet on desktop / Drawer on mobile
 * carrying the full receipt for that row. The earlier M4.15
 * inline accordion is gone.
 */

import * as React from "react";

import { Animate } from "@/components/ui/animate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Status } from "@/components/ui/status";
import { LifecyclePip } from "@/components/portfolio/lifecycle-pip";
import {
  PortfolioDrilldownSheet,
  type PortfolioDrilldownPayload,
} from "@/components/portfolio/drilldown-sheet";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { copyForStatusState } from "@/lib/lifecycle-copy";

import {
  combinedTransfers,
  computeAllocations,
  computeTotals,
  deriveDayDelta,
  fmtSignedPct,
  fmtSignedUsd,
  formatTime,
  MonoNum,
  parseNum,
  Sparkline,
  syntheticSeries,
  TOKEN_TONE,
  type PortfolioFixture,
} from "./_shared";

const RANGES = ["1D", "1W", "1M", "3M", "1Y", "All"] as const;
const POINTS: Record<(typeof RANGES)[number], number> = {
  "1D": 12, "1W": 14, "1M": 30, "3M": 60, "1Y": 90, All: 120,
};
const PILL =
  "font-mono text-[10px] uppercase tracking-[0.18em]";

export default function Variant11Blended({
  fixture,
  onDeposit,
  onWithdraw,
}: {
  fixture: PortfolioFixture;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}) {
  const [range, setRange] = React.useState<(typeof RANGES)[number]>("1M");
  const [drilldown, setDrilldown] =
    React.useState<PortfolioDrilldownPayload | null>(null);
  const totals = computeTotals(fixture);
  const allocations = computeAllocations(fixture);
  const transfers = combinedTransfers(fixture).slice(0, 4);
  const series = syntheticSeries(totals.totalUsd, POINTS[range], 0.06);
  const delta = deriveDayDelta(totals.totalUsd);
  const lockedShare = totals.total > 0 ? totals.locked / totals.total : 0;
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";
  const stroke =
    delta.direction === "down" ? "var(--destructive)" : "var(--foreground)";
  const fill =
    delta.direction === "down" ? "var(--destructive)" : "var(--success)";

  return (
    <div className="flex flex-col gap-6">
      <Animate variant="enter">
        <section
          aria-label="Portfolio overview"
          className="flex flex-col gap-3"
        >
          <span
            className={cn(
              PILL,
              "text-[11px] text-[var(--muted-foreground)]",
            )}
          >
            Portfolio
          </span>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2 md:gap-x-4">
            <MonoNum
              className="text-3xl font-medium leading-none tracking-tight sm:text-4xl md:text-6xl"
              aria-label={`Portfolio total $${fixture.totalValueUSD}`}
            >
              ${fixture.totalValueUSD}
            </MonoNum>
            <span
              className={cn("inline-flex items-center gap-2 pb-1.5 text-xs", tone)}
              aria-label={`Day change ${fmtSignedUsd(delta.absolute)} (${fmtSignedPct(delta.percent)})`}
            >
              <MonoNum>
                {fmtSignedUsd(delta.absolute)} · {fmtSignedPct(delta.percent)}
              </MonoNum>
              <span className="text-[var(--muted-foreground)]">today</span>
            </span>
          </div>
        </section>
      </Animate>

      <Animate variant="enter" delay={0.05}>
        <Card className="flex flex-col gap-4 p-4 md:p-6">
          <div
            role="img"
            aria-label={`Portfolio value over ${range}, current $${fixture.totalValueUSD}`}
            className="overflow-hidden [&>svg]:block [&>svg]:h-[160px] [&>svg]:w-full md:[&>svg]:h-[220px]"
          >
            <Sparkline
              series={series}
              width={1100}
              height={220}
              ariaLabel={`Portfolio value over ${range}`}
              stroke={stroke}
              fill={fill}
              strokeWidth={1.75}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Time range"
              className="flex flex-wrap items-center gap-1 rounded-full border border-[var(--border)] p-1"
            >
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={r === range}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-full px-3 py-1 transition-colors",
                    PILL,
                    r === range
                      ? "bg-[var(--accent)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onDeposit}
                className="min-h-[44px] md:min-h-0"
              >
                <Icon.Wallet aria-hidden />
                Deposit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onWithdraw}
                className="min-h-[44px] md:min-h-0"
              >
                Withdraw
              </Button>
            </div>
          </div>
        </Card>
      </Animate>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.6fr_1fr]">
        <aside className="flex flex-col gap-4 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <Animate variant="enter" delay={0.1}>
            <Card variant="glass" className="flex flex-col gap-4 p-5 md:p-6">
              <span
                className={cn(
                  PILL,
                  "text-[11px] text-[var(--muted-foreground)]",
                )}
              >
                Summary
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Capital deployed</span>
                  <MonoNum>{(lockedShare * 100).toFixed(1)}%</MonoNum>
                </div>
                <div
                  role="img"
                  aria-label={`Capital deployed ${(lockedShare * 100).toFixed(1)} percent`}
                  className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                >
                  <div
                    className="h-full rounded-full bg-[var(--success)]"
                    style={{ width: `${(lockedShare * 100).toFixed(2)}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <SummaryRow label="Available" value={`$${totals.available.toFixed(2)}`} />
                <SummaryRow label="Locked" value={`$${totals.locked.toFixed(2)}`} />
              </div>
              <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Allocation</span>
                  <MonoNum>{allocations.length} tokens</MonoNum>
                </div>
                {allocations.length > 0 ? (
                  <div
                    role="img"
                    aria-label={`Allocation across ${allocations.length} tokens: ${allocations
                      .map((a) => `${a.token} ${(a.share * 100).toFixed(1)} percent`)
                      .join(", ")}`}
                    className="flex h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  >
                    {allocations.map((a) => (
                      <span
                        key={a.token}
                        aria-hidden
                        className="block h-full"
                        style={{
                          width: `${(a.share * 100).toFixed(2)}%`,
                          background: TOKEN_TONE[a.token],
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    aria-hidden
                    className="h-2 w-full rounded-full bg-[var(--muted)]"
                  />
                )}
                <ul className="flex flex-col gap-1.5 text-xs">
                  {allocations.map((a) => {
                    const balance = fixture.balances.find((b) => b.token === a.token);
                    const usd = balance ? parseNum(balance.total) : 0;
                    return (
                      <li
                        key={a.token}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <span
                            aria-hidden
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ background: TOKEN_TONE[a.token] }}
                          />
                          <span className="font-medium">{a.token}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          <MonoNum className="text-[var(--muted-foreground)]">
                            ${usd.toFixed(2)}
                          </MonoNum>
                          <MonoNum className="w-12 text-right text-[var(--muted-foreground)]">
                            {(a.share * 100).toFixed(1)}%
                          </MonoNum>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Card>
          </Animate>
        </aside>

        <div className="flex flex-col gap-6 lg:order-1">
          <Animate variant="enter" delay={0.15}>
            <Card className="flex flex-col gap-4 p-5 md:p-6">
              <SectionHeader
                title="Open positions"
                trailing={
                  fixture.openOrders.length > 0 ? (
                    <Button size="sm" variant="ghost">Cancel all</Button>
                  ) : null
                }
              />
              {fixture.openOrders.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No open positions.
                </p>
              ) : (
                <ul className="flex flex-col" data-testid="open-positions-list">
                  {fixture.openOrders.map((o) => (
                    <li key={o.id}>
                      <DrilldownRowButton
                        ariaLabel={`Order ${o.id} ${o.pair} ${o.side} ${o.type}, ${o.amount} at ${o.price}. Open receipt`}
                        onActivate={() =>
                          setDrilldown({ kind: "order", order: o })
                        }
                      >
                        <span className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-4">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="font-mono font-medium">
                              {o.pair}
                            </span>
                            <SidePill side={o.side} />
                            <span
                              className={cn(
                                PILL,
                                "text-[var(--muted-foreground)]",
                              )}
                            >
                              {o.type}
                            </span>
                          </span>
                          <span className="flex flex-wrap items-center gap-3 md:gap-4">
                            <MonoNum>{o.amount}</MonoNum>
                            <MonoNum className="text-[var(--muted-foreground)]">
                              @ {o.price}
                            </MonoNum>
                            <MonoNum className="text-xs text-[var(--muted-foreground)]">
                              {o.filledPercent}%
                            </MonoNum>
                            <Status
                              state={o.status as never}
                              tooltip={
                                copyForStatusState(o.status as never) ??
                                undefined
                              }
                            />
                          </span>
                        </span>
                      </DrilldownRowButton>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Animate>

          <Animate variant="enter" delay={0.2}>
            <Card className="flex flex-col gap-4 p-5 md:p-6">
              <SectionHeader
                title="Recent fills"
                trailing={
                  <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
                    Own batch only
                  </span>
                }
              />
              {fixture.recentFills.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No fills yet.</p>
              ) : (
                <ul className="flex flex-col" data-testid="recent-fills-list">
                  {fixture.recentFills.map((f) => (
                    <li key={f.id}>
                      <DrilldownRowButton
                        ariaLabel={`Fill ${f.id} ${f.pair} ${f.side}, ${f.amount} at ${f.price}. Open receipt`}
                        onActivate={() =>
                          setDrilldown({ kind: "fill", fill: f })
                        }
                      >
                        <span className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-4">
                          <span className="flex items-center gap-2 font-mono">
                            <span className="font-medium">{f.pair}</span>
                            <SidePill side={f.side} />
                          </span>
                          <span className="flex flex-wrap items-center gap-3 text-xs">
                            <MonoNum className="text-sm">{f.amount}</MonoNum>
                            <MonoNum className="text-[var(--muted-foreground)]">
                              @ {f.price}
                            </MonoNum>
                            <LifecyclePip status={f.status} />
                            <MonoNum className="text-[var(--muted-foreground)]">
                              {formatTime(f.matchedAt)}
                            </MonoNum>
                          </span>
                        </span>
                      </DrilldownRowButton>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Animate>

          <Animate variant="enter" delay={0.25}>
            <Card className="flex flex-col gap-4 p-5 md:p-6">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Transfers
              </h2>
              {transfers.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No transfers yet.</p>
              ) : (
                <ul className="flex flex-col" data-testid="transfers-list">
                  {transfers.map((t) => {
                    const payload: PortfolioDrilldownPayload =
                      t.kind === "withdrawal"
                        ? {
                            kind: "withdrawal",
                            withdrawal: {
                              id: t.id,
                              token: t.token,
                              amount: t.amount,
                              status: t.status,
                              initiatedAt: t.initiatedAt,
                              txHash: t.txHash,
                            },
                          }
                        : {
                            kind: "deposit",
                            deposit: {
                              id: t.id,
                              token: t.token,
                              amount: t.amount,
                              status: t.status,
                              initiatedAt: t.initiatedAt,
                              txHash: t.txHash,
                            },
                          };
                    return (
                      <li key={`${t.kind}-${t.id}`}>
                        <DrilldownRowButton
                          ariaLabel={`${t.kind === "deposit" ? "Deposit" : "Withdrawal"} ${t.token}, ${t.amount}. Open receipt`}
                          onActivate={() => setDrilldown(payload)}
                        >
                          <span className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-4">
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  PILL,
                                  t.kind === "deposit"
                                    ? "text-[var(--success)]"
                                    : "text-[var(--muted-foreground)]",
                                )}
                              >
                                {t.kind === "deposit"
                                  ? "Deposit"
                                  : "Withdrawal"}
                              </span>
                              <span className="font-mono">{t.token}</span>
                            </span>
                            <span className="flex flex-wrap items-center gap-3 text-xs">
                              <MonoNum className="text-sm">
                                {t.amount}
                              </MonoNum>
                              <Status
                                state={t.status as never}
                                tooltip={
                                  copyForStatusState(
                                    t.status as never,
                                    t.kind === "withdrawal"
                                      ? "withdrawal"
                                      : "deposit",
                                  ) ?? undefined
                                }
                              />
                            </span>
                          </span>
                        </DrilldownRowButton>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </Animate>
        </div>
      </div>

      <PortfolioDrilldownSheet
        open={drilldown !== null}
        onOpenChange={(next) => {
          if (!next) setDrilldown(null);
        }}
        payload={drilldown}
      />
    </div>
  );
}

interface DrilldownRowButtonProps {
  ariaLabel: string;
  onActivate: () => void;
  children: React.ReactNode;
}

/**
 * Whole-row button trigger for a portfolio drilldown. Inherits row baseline
 * (border-top, padding, hover) from the M4.15 row chrome but loses the
 * chevron + accordion plumbing — the receipt opens in a Sheet/Drawer now.
 */
function DrilldownRowButton({
  ariaLabel,
  onActivate,
  children,
}: DrilldownRowButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onActivate}
      className={cn(
        "flex w-full items-center gap-3 border-t border-[var(--border)] py-3 text-left text-sm transition-colors first:border-t-0 motion-reduce:transition-none",
        "hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
      )}
    >
      <span className="flex-1 min-w-0">{children}</span>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          PILL,
          "text-[11px] text-[var(--muted-foreground)]",
        )}
      >
        {label}
      </span>
      <MonoNum>{value}</MonoNum>
    </div>
  );
}

function SectionHeader({
  title,
  trailing,
}: {
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {title}
      </h2>
      {trailing ?? null}
    </header>
  );
}

function SidePill({ side }: { side: "buy" | "sell" }) {
  return (
    <span
      className={cn(
        PILL,
        side === "buy" ? "text-[var(--success)]" : "text-[var(--destructive)]",
      )}
    >
      {side}
    </span>
  );
}
