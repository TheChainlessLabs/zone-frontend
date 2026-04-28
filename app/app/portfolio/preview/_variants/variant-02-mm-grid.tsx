"use client";

/**
 * Variant 02 — Multi-section grid.
 *
 * Inspired by MetaMask Portfolio: P&L hero strip + holdings column +
 * activity column. Information is co-located so the trader can sweep down
 * one column without losing context. Calm not bright — no gradient walls.
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
  combinedTransfers,
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
  TokenChip,
  truncateHash,
  type PortfolioFixture,
} from "./_shared";

export default function Variant02MMGrid({
  fixture,
}: {
  fixture: PortfolioFixture;
}) {
  const totals = computeTotals(fixture);
  const series = syntheticSeries(totals.totalUsd);
  const delta = deriveDayDelta(totals.totalUsd);
  const allocations = computeAllocations(fixture);
  const activity = combinedActivity(fixture).slice(0, 6);
  const transfers = combinedTransfers(fixture).slice(0, 4);
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";
  const ChangeIcon = delta.direction === "up" ? Icon.Up : Icon.Down;

  return (
    <div className="flex flex-col gap-6">
      <Animate variant="enter">
        <Card className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Net worth
            </span>
            <MonoNum
              className="text-3xl font-medium tracking-tight md:text-4xl"
              aria-label={`Net worth $${fixture.totalValueUSD}`}
            >
              ${fixture.totalValueUSD}
            </MonoNum>
            <div
              className={cn("inline-flex items-center gap-2 text-xs", tone)}
              aria-label={`Day change ${fmtSignedUsd(delta.absolute)} ${fmtSignedPct(delta.percent)}`}
            >
              <ChangeIcon size={12} aria-hidden />
              <MonoNum>
                {fmtSignedUsd(delta.absolute)} · {fmtSignedPct(delta.percent)}
              </MonoNum>
              <span className="text-[var(--muted-foreground)]">today</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <Stat label="Available" value={`$${totals.available.toFixed(2)}`} />
              <Stat label="Locked" value={`$${totals.locked.toFixed(2)}`} />
              <Stat
                label="Open positions"
                value={String(fixture.openOrders.length)}
              />
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Sparkline
              series={series}
              width={320}
              height={72}
              ariaLabel={`Net worth over 30 days, current $${fixture.totalValueUSD}`}
            />
            <div className="flex gap-2">
              <Button size="sm">
                <Icon.Wallet aria-hidden />
                Deposit
              </Button>
              <Button size="sm" variant="outline">
                Withdraw
              </Button>
            </div>
          </div>
        </Card>
      </Animate>

      <div className="grid gap-6 md:grid-cols-2">
        <Animate variant="enter" delay={0.05}>
          <Card className="flex h-full flex-col gap-4 p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-medium">Holdings</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                {allocations.length} tokens
              </span>
            </header>
            <ul className="flex flex-col">
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
                      className="flex items-center gap-3 border-t border-[var(--border)] py-3 first:border-t-0"
                    >
                      <TokenChip token={a.token} size={32} />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{a.token}</span>
                          <MonoNum className="text-sm">
                            {balance.total}
                          </MonoNum>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div
                            className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--muted)]"
                            aria-hidden
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(a.share * 100).toFixed(1)}%`,
                                background: TOKEN_TONE[a.token],
                                opacity: 0.9,
                              }}
                            />
                          </div>
                          <MonoNum className="text-xs text-[var(--muted-foreground)]">
                            {(a.share * 100).toFixed(1)}%
                          </MonoNum>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </Card>
        </Animate>

        <Animate variant="enter" delay={0.1}>
          <Card className="flex h-full flex-col gap-4 p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-medium">Activity</h2>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </header>
            <ul className="flex flex-col">
              {activity.length === 0 ? (
                <li className="py-3 text-sm text-[var(--muted-foreground)]">
                  No activity yet.
                </li>
              ) : (
                activity.map((a) => (
                  <li
                    key={`${a.kind}-${a.id}`}
                    className="flex items-center justify-between gap-3 border-t border-[var(--border)] py-3 first:border-t-0"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="text-sm font-medium">{a.label}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {a.pair ?? a.token} · {formatTime(a.at)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <MonoNum className="text-sm">{a.amount}</MonoNum>
                      <Status state={a.status as never} />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </Animate>
      </div>

      <Animate variant="enter" delay={0.15}>
        <Card className="flex flex-col gap-4 p-6">
          <header className="flex items-center justify-between">
            <h2 className="text-base font-medium">Transfers</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Onchain · L1
            </span>
          </header>
          <ul className="flex flex-col">
            {transfers.length === 0 ? (
              <li className="py-3 text-sm text-[var(--muted-foreground)]">
                No transfers yet.
              </li>
            ) : (
              transfers.map((t) => (
                <li
                  key={`${t.kind}-${t.id}`}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                >
                  <span className="flex items-center gap-3">
                    <TokenChip token={t.token} size={24} />
                    <span className="flex flex-col">
                      <span className="font-medium">
                        {t.kind === "deposit" ? "Deposit" : "Withdrawal"}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {formatTime(t.initiatedAt)}
                      </span>
                    </span>
                  </span>
                  <MonoNum>{t.amount}</MonoNum>
                  <Status state={t.status as never} />
                  {t.txHash ? (
                    <a
                      href={`https://etherscan.io/tx/${t.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs underline-offset-4 hover:underline"
                    >
                      {truncateHash(t.txHash)}
                      <Icon.External size={12} aria-hidden />
                    </a>
                  ) : (
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">
                      —
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </Card>
      </Animate>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <MonoNum>{value}</MonoNum>
    </span>
  );
}
