"use client";

/**
 * Variant 04 — Narrative.
 *
 * Inspired by Wealthfront's narrative panel: a serif italic lede pulls you
 * into the page, then a hero line chart, then a calm allocation donut with
 * a legend. The data is identical to every other variant — the difference
 * is pacing and language.
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
  Donut,
  fmtSignedPct,
  fmtSignedUsd,
  formatDate,
  MonoNum,
  Sparkline,
  syntheticSeries,
  TOKEN_TONE,
  type PortfolioFixture,
} from "./_shared";

const RANGES = ["1D", "1W", "1M", "3M", "1Y"] as const;

export default function Variant04WealthfrontSoft({
  fixture,
}: {
  fixture: PortfolioFixture;
}) {
  const [range, setRange] = React.useState<(typeof RANGES)[number]>("1M");
  const totals = computeTotals(fixture);
  // Range only changes the resolution / visual denseness; the deterministic
  // series stays anchored to the actual total. This keeps the visual brief
  // (the picker only renders the default state).
  const points = range === "1D" ? 12 : range === "1W" ? 14 : range === "1M" ? 30 : range === "3M" ? 60 : 90;
  const series = syntheticSeries(totals.totalUsd, points, 0.05);
  const delta = deriveDayDelta(totals.totalUsd);
  const allocations = computeAllocations(fixture);
  const activity = combinedActivity(fixture).slice(0, 5);
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Animate variant="enter">
        <Card className="flex flex-col gap-6 p-8">
          <header className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Portfolio
            </span>
            <p className="font-serif text-xl leading-snug text-[var(--muted-foreground)] md:text-2xl">
              Your capital is matched, settled, and proved. Today’s mark sits
              at <span className="text-[var(--foreground)]">${fixture.totalValueUSD}</span>.
            </p>
          </header>

          <div className="flex items-end gap-6">
            <MonoNum
              className="text-4xl font-medium tracking-tight md:text-5xl"
              aria-label={`Portfolio value $${fixture.totalValueUSD}`}
            >
              ${fixture.totalValueUSD}
            </MonoNum>
            <span
              className={cn("inline-flex items-center gap-2 pb-2 text-xs", tone)}
              aria-label={`Day change ${fmtSignedUsd(delta.absolute)}`}
            >
              <MonoNum>
                {fmtSignedUsd(delta.absolute)} · {fmtSignedPct(delta.percent)}
              </MonoNum>
              <span className="text-[var(--muted-foreground)]">today</span>
            </span>
          </div>

          <div
            role="img"
            aria-label={`Portfolio value over ${range}, current $${fixture.totalValueUSD}`}
          >
            <Sparkline
              series={series}
              width={720}
              height={180}
              ariaLabel={`Portfolio value over ${range}`}
              stroke="var(--foreground)"
              fill="var(--success)"
              strokeWidth={1.75}
            />
          </div>

          <div
            role="tablist"
            aria-label="Time range"
            className="flex flex-wrap items-center gap-1 self-start rounded-full border border-[var(--border)] p-1"
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

          <p className="font-serif text-sm leading-relaxed text-[var(--muted-foreground)]">
            Your stables are working — {(totals.locked / Math.max(totals.total, 1) * 100).toFixed(1)}% of capital is currently locked in open positions, the rest is available to deploy.
          </p>
        </Card>
      </Animate>

      <div className="flex flex-col gap-6">
        <Animate variant="enter" delay={0.05}>
          <Card className="flex flex-col gap-4 p-6">
            <h2 className="text-base font-medium">Allocation</h2>
            <div className="flex items-center justify-between gap-4">
              <Donut
                allocations={allocations}
                size={140}
                thickness={20}
                ariaLabel={`Allocation across ${allocations.length} tokens`}
              />
              <ul className="flex flex-col gap-2 text-xs">
                {allocations.map((a) => (
                  <li key={a.token} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: TOKEN_TONE[a.token] }}
                    />
                    <span className="font-medium">{a.token}</span>
                    <MonoNum className="text-[var(--muted-foreground)]">
                      {(a.share * 100).toFixed(1)}%
                    </MonoNum>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <Stat label="Available" value={`$${totals.available.toFixed(2)}`} />
              <Stat label="Locked" value={`$${totals.locked.toFixed(2)}`} />
            </div>
            <div className="flex gap-2">
              <Button size="sm">
                <Icon.Wallet aria-hidden />
                Deposit
              </Button>
              <Button size="sm" variant="outline">
                Withdraw
              </Button>
            </div>
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
                    className="flex items-center justify-between border-t border-[var(--border)] py-2 text-xs first:border-t-0"
                  >
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {a.label}
                      </span>
                      <span className="text-[var(--muted-foreground)]">
                        {formatDate(a.at)}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <MonoNum>{a.amount}</MonoNum>
                      <Status state={a.status as never} />
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </Animate>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <MonoNum>{value}</MonoNum>
    </div>
  );
}
