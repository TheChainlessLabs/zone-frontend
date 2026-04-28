"use client";

/**
 * Variant 01 — Centered card.
 *
 * Inspired by CoW Swap's account view: a single calm card carries the
 * hero. Value + delta + sparkline live above a quiet action row, and the
 * holdings sit below as a low-contrast list. Anti-pattern check: no glass
 * stacking, no neon, no "you saved $X" bragging.
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
  parseNum,
  Sparkline,
  syntheticSeries,
  TokenChip,
  type PortfolioFixture,
} from "./_shared";

export default function Variant01CowCentered({
  fixture,
}: {
  fixture: PortfolioFixture;
}) {
  const totals = computeTotals(fixture);
  const series = syntheticSeries(totals.totalUsd);
  const delta = deriveDayDelta(totals.totalUsd);
  const allocations = computeAllocations(fixture);
  const activity = combinedActivity(fixture).slice(0, 4);
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : delta.direction === "down"
      ? "text-[var(--destructive)]"
      : "text-[var(--muted-foreground)]";
  const ChangeIcon =
    delta.direction === "up"
      ? Icon.Up
      : delta.direction === "down"
      ? Icon.Down
      : Icon.Up;

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-6">
      <Animate variant="enter">
        <Card className="p-8">
          <header className="flex flex-col items-center gap-3 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Total portfolio value
            </span>
            <MonoNum
              className="text-[44px] font-medium leading-none tracking-tight"
              aria-label={`Portfolio value, $${fixture.totalValueUSD}`}
            >
              ${fixture.totalValueUSD}
            </MonoNum>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs",
                tone,
              )}
              aria-label={`Day change ${fmtSignedUsd(delta.absolute)} (${fmtSignedPct(delta.percent)})`}
            >
              <ChangeIcon size={12} aria-hidden />
              <MonoNum>
                {fmtSignedUsd(delta.absolute)} ({fmtSignedPct(delta.percent)})
              </MonoNum>
              <span className="text-[var(--muted-foreground)]">today</span>
            </span>
          </header>

          <div className="mt-6 flex justify-center">
            <Sparkline
              series={series}
              width={520}
              height={84}
              ariaLabel={`Portfolio value over 30 days, current $${fixture.totalValueUSD}`}
              stroke="var(--foreground)"
              fill="var(--foreground)"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button>
              <Icon.Wallet aria-hidden />
              Deposit
            </Button>
            <Button variant="outline">Withdraw</Button>
            <Button variant="ghost">View activity</Button>
          </div>
        </Card>
      </Animate>

      <Animate variant="enter" delay={0.05}>
        <Card className="p-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Holdings
          </h2>
          <ul className="mt-4 flex flex-col">
            {allocations.length === 0 ? (
              <li className="py-3 text-sm text-[var(--muted-foreground)]">
                No holdings yet.
              </li>
            ) : (
              allocations.map((a) => {
                const balance = fixture.balances.find((b) => b.token === a.token);
                if (!balance) return null;
                return (
                  <li
                    key={a.token}
                    className="flex items-center justify-between border-t border-[var(--border)] py-3 first:border-t-0"
                  >
                    <span className="flex items-center gap-3">
                      <TokenChip token={a.token} size={28} />
                      <span className="flex flex-col">
                        <span className="text-sm font-medium">{a.token}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {(a.share * 100).toFixed(1)}% of total
                        </span>
                      </span>
                    </span>
                    <span className="flex flex-col items-end">
                      <MonoNum className="text-sm">
                        {balance.total}
                      </MonoNum>
                      <MonoNum className="text-xs text-[var(--muted-foreground)]">
                        ${a.value.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </MonoNum>
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </Card>
      </Animate>

      <Animate variant="enter" delay={0.1}>
        <Card className="p-6">
          <header className="flex items-center justify-between">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Recent activity
            </h2>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </header>
          <ul className="mt-3 flex flex-col">
            {activity.length === 0 ? (
              <li className="py-3 text-sm text-[var(--muted-foreground)]">
                No activity yet.
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
                  <span className="flex items-center gap-3">
                    <MonoNum className="text-sm">
                      {a.amount}
                    </MonoNum>
                    <Status state={a.status as never} />
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </Animate>

      <p className="text-center text-[10px] text-[var(--muted-foreground)]">
        <MonoNum>${parseNum(fixture.totalValueUSD).toFixed(2)}</MonoNum> resolved
        from {fixture.balances.length} balances · midpoint mark
      </p>
    </div>
  );
}
