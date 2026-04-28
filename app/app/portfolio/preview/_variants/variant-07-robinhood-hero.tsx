"use client";

/**
 * Variant 07 — Chart hero.
 *
 * Inspired by Robinhood's chart-led account view: an oversized line chart
 * dominates the top of the page with the value floating above. Below it,
 * range chips and a quiet holdings list. Calmed for institutional context
 * — no green wash, no brokerage chrome.
 */

import * as React from "react";

import { Animate } from "@/components/ui/animate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Sparkline,
  syntheticSeries,
  TOKEN_TONE,
  type PortfolioFixture,
} from "./_shared";

const RANGES = ["1D", "1W", "1M", "3M", "1Y", "All"] as const;

export default function Variant07RobinhoodHero({
  fixture,
}: {
  fixture: PortfolioFixture;
}) {
  const [range, setRange] = React.useState<(typeof RANGES)[number]>("1M");
  const totals = computeTotals(fixture);
  const points =
    range === "1D"
      ? 12
      : range === "1W"
      ? 14
      : range === "1M"
      ? 30
      : range === "3M"
      ? 60
      : range === "1Y"
      ? 90
      : 120;
  const series = syntheticSeries(totals.totalUsd, points, 0.06);
  const delta = deriveDayDelta(totals.totalUsd);
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";
  const stroke =
    delta.direction === "down" ? "var(--destructive)" : "var(--success)";
  const allocations = computeAllocations(fixture);
  const activity = combinedActivity(fixture).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <Animate variant="enter">
        <section
          aria-label="Portfolio chart hero"
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Total
            </span>
            <MonoNum
              className="text-[48px] font-medium leading-none tracking-tight md:text-[64px]"
              aria-label={`Portfolio total $${fixture.totalValueUSD}`}
            >
              ${fixture.totalValueUSD}
            </MonoNum>
            <span
              className={cn("inline-flex items-center gap-2 text-sm", tone)}
              aria-label={`Day change ${fmtSignedUsd(delta.absolute)} (${fmtSignedPct(delta.percent)})`}
            >
              <MonoNum>
                {fmtSignedUsd(delta.absolute)} · {fmtSignedPct(delta.percent)}
              </MonoNum>
              <span className="text-[var(--muted-foreground)]">
                today
              </span>
            </span>
          </div>

          <div
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4"
            role="img"
            aria-label={`Portfolio value over ${range}, current $${fixture.totalValueUSD}`}
          >
            <Sparkline
              series={series}
              width={1100}
              height={260}
              ariaLabel={`Portfolio value over ${range}`}
              stroke={stroke}
              fill={stroke}
              strokeWidth={2}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
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
                    "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
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
              <Button>
                <Icon.Wallet aria-hidden />
                Deposit
              </Button>
              <Button variant="outline">Withdraw</Button>
            </div>
          </div>
        </section>
      </Animate>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <Animate variant="enter" delay={0.05}>
          <Card className="flex flex-col gap-3 p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-medium">Holdings</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Available · Locked · Value
              </span>
            </header>
            <ul className="flex flex-col">
              {fixture.balances.map((b) => (
                <li
                  key={b.token}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center gap-3 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: TOKEN_TONE[b.token] }}
                    />
                    <span className="font-medium">{b.token}</span>
                  </span>
                  <MonoNum>{b.available}</MonoNum>
                  <MonoNum className="text-[var(--muted-foreground)]">
                    {b.locked}
                  </MonoNum>
                  <MonoNum className="text-right">{b.total}</MonoNum>
                </li>
              ))}
            </ul>
          </Card>
        </Animate>

        <Animate variant="enter" delay={0.1}>
          <Card className="flex flex-col gap-3 p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-medium">Recent</h2>
              <Button size="sm" variant="ghost">
                View all
              </Button>
            </header>
            <ul className="flex flex-col">
              {activity.length === 0 ? (
                <li className="py-3 text-sm text-[var(--muted-foreground)]">
                  Nothing yet.
                </li>
              ) : (
                activity.map((a) => (
                  <li
                    key={`${a.kind}-${a.id}`}
                    className="flex items-center justify-between border-t border-[var(--border)] py-3 first:border-t-0"
                  >
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{a.label}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {a.pair ?? a.token} · {formatTime(a.at)}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <MonoNum className="text-sm">{a.amount}</MonoNum>
                      <Status state={a.status as never} />
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </Animate>
      </div>

      <Animate variant="enter" delay={0.15}>
        <p className="text-xs text-[var(--muted-foreground)]">
          {allocations.length} tokens marked at midpoint · capital deployed{" "}
          <MonoNum className="text-[var(--foreground)]">
            {totals.total > 0
              ? ((totals.locked / totals.total) * 100).toFixed(1)
              : "0.0"}
            %
          </MonoNum>
        </p>
      </Animate>
    </div>
  );
}
