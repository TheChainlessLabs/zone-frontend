"use client";

/**
 * Variant 06 — Performance band.
 *
 * Inspired by a restrained reading of the Bloomberg Terminal: a tight KPI
 * band across the top, a narrow chart strip, then a dense holdings + open
 * orders + fills grid below. The terminal density is intentional, but the
 * palette stays in zinc + emerald — no orange + black.
 */

import * as React from "react";

import { Animate } from "@/components/ui/animate";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

import {
  combinedActivity,
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

export default function Variant06BloombergBand({
  fixture,
}: {
  fixture: PortfolioFixture;
}) {
  const totals = computeTotals(fixture);
  const allocations = computeAllocations(fixture);
  const series = syntheticSeries(totals.totalUsd);
  const delta = deriveDayDelta(totals.totalUsd);
  const activity = combinedActivity(fixture).slice(0, 10);
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";

  return (
    <div className="flex flex-col gap-3">
      {/* Performance band — tight grid of metrics */}
      <Animate variant="enter">
        <div className="surface-soft rounded-[var(--radius-md)] bg-[var(--card)]">
          <div className="grid grid-cols-2 divide-x divide-[var(--border)] md:grid-cols-6">
            <Metric
              label="Net worth"
              value={`$${fixture.totalValueUSD}`}
              accent
            />
            <Metric
              label="24h"
              value={fmtSignedUsd(delta.absolute)}
              tone={tone}
            />
            <Metric
              label="24h %"
              value={fmtSignedPct(delta.percent)}
              tone={tone}
            />
            <Metric
              label="Available"
              value={`$${totals.available.toFixed(2)}`}
            />
            <Metric label="Locked" value={`$${totals.locked.toFixed(2)}`} />
            <Metric
              label="Open · Fills"
              value={`${fixture.openOrders.length} / ${fixture.recentFills.length}`}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 border-t border-[var(--border)] p-4 md:grid-cols-[1fr_auto] md:items-center">
            <Sparkline
              series={series}
              width={720}
              height={48}
              ariaLabel={`Net worth trajectory, current $${fixture.totalValueUSD}`}
              showFill
              stroke="var(--foreground)"
              fill="var(--foreground)"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] md:justify-self-end">
              30D · marked at midpoint
            </span>
          </div>
        </div>
      </Animate>

      {/* Holdings + activity grid */}
      <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr]">
        <Animate variant="enter" delay={0.05}>
          <section
            aria-label="Holdings"
            className="surface-soft flex flex-col rounded-[var(--radius-md)] bg-[var(--card)]"
          >
            <header className="flex items-center justify-between border-b border-[var(--border)] p-3">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Holdings
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                {allocations.length} tokens
              </span>
            </header>
            <ul>
              {fixture.balances.map((b) => {
                const value = parseNum(b.total);
                const share = totals.total > 0 ? value / totals.total : 0;
                return (
                  <li
                    key={b.token}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[var(--border)] px-3 py-2 text-xs last:border-b-0"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="inline-block h-2.5 w-2.5 rounded-sm"
                        style={{ background: TOKEN_TONE[b.token] }}
                      />
                      <span className="font-mono font-medium uppercase">
                        {b.token}
                      </span>
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <MonoNum className="text-[var(--muted-foreground)]">
                          {b.available} avail
                        </MonoNum>
                        <MonoNum>{b.total}</MonoNum>
                      </div>
                      <div
                        aria-hidden
                        className="h-[3px] overflow-hidden rounded-full bg-[var(--muted)]"
                      >
                        <div
                          className="h-full"
                          style={{
                            width: `${(share * 100).toFixed(2)}%`,
                            background: TOKEN_TONE[b.token],
                          }}
                        />
                      </div>
                    </div>
                    <MonoNum className="text-[var(--muted-foreground)]">
                      {(share * 100).toFixed(1)}%
                    </MonoNum>
                  </li>
                );
              })}
            </ul>
          </section>
        </Animate>

        <Animate variant="enter" delay={0.1}>
          <section
            aria-label="Activity"
            className="surface-soft flex flex-col rounded-[var(--radius-md)] bg-[var(--card)]"
          >
            <header className="flex items-center justify-between border-b border-[var(--border)] p-3">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Activity blotter
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Live · {activity.length} events
              </span>
            </header>
            <div
              className="hidden grid-cols-[0.7fr_0.9fr_0.6fr_1fr_1fr_1fr] gap-3 border-b border-[var(--border)] px-3 py-2 md:grid"
              role="row"
            >
              {["Type", "Pair", "Side", "Amount", "Status", "Time"].map(
                (h) => (
                  <span
                    key={h}
                    role="columnheader"
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
                  >
                    {h}
                  </span>
                ),
              )}
            </div>
            <ul>
              {activity.length === 0 ? (
                <li className="px-3 py-3 text-xs text-[var(--muted-foreground)]">
                  No activity.
                </li>
              ) : (
                activity.map((a) => (
                  <li
                    key={`${a.kind}-${a.id}`}
                    className="grid grid-cols-2 items-center gap-2 border-b border-[var(--border)] px-3 py-2 text-xs last:border-b-0 md:grid-cols-[0.7fr_0.9fr_0.6fr_1fr_1fr_1fr] md:gap-3"
                  >
                    <span className="font-mono uppercase tracking-wide text-[var(--muted-foreground)]">
                      {a.kind}
                    </span>
                    <span className="font-mono">{a.pair ?? a.token}</span>
                    <span
                      className={cn(
                        "font-mono uppercase tracking-wide",
                        a.label.startsWith("Buy")
                          ? "text-[var(--success)]"
                          : a.label.startsWith("Sell")
                          ? "text-[var(--destructive)]"
                          : "text-[var(--muted-foreground)]",
                      )}
                    >
                      {a.label.split(" ")[0]}
                    </span>
                    <MonoNum>{a.amount}</MonoNum>
                    <Status state={a.status as never} />
                    <MonoNum className="text-[var(--muted-foreground)]">
                      {formatTime(a.at)}
                    </MonoNum>
                  </li>
                ))
              )}
            </ul>
          </section>
        </Animate>
      </div>

      {/* Footer attestation strip — Omega-specific touch on a Bloomberg ref */}
      <Animate variant="enter" delay={0.15}>
        <footer className="surface-soft flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--card)] px-4 py-3 text-xs text-[var(--muted-foreground)]">
          <span className="inline-flex items-center gap-2">
            <Icon.Proof size={12} aria-hidden />
            <span>TEE-attested · midpoint marks</span>
          </span>
          <span className="font-mono">
            <MonoNum>${parseNum(fixture.totalValueUSD).toFixed(2)}</MonoNum> ·{" "}
            {fixture.balances.length} balances · {fixture.openOrders.length}{" "}
            open
          </span>
        </footer>
      </Animate>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  accent,
}: {
  label: string;
  value: string;
  tone?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 p-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span
        className={cn(
          "font-mono tabular-nums",
          accent ? "text-base font-medium md:text-lg" : "text-sm",
          tone,
        )}
      >
        {value}
      </span>
    </div>
  );
}
