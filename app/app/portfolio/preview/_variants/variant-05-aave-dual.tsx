"use client";

/**
 * Variant 05 — Dual-column.
 *
 * Inspired by Aave V3 dashboard: positions on the left, summary stack on
 * the right. The summary card is always visible at desktop width — pinned
 * net-worth + actions + health-style ratio bar — while the left column
 * scrolls through positions, fills, transfers.
 */

import * as React from "react";

import { Animate } from "@/components/ui/animate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

import {
  combinedTransfers,
  computeAllocations,
  computeTotals,
  deriveDayDelta,
  Donut,
  fmtSignedPct,
  fmtSignedUsd,
  formatTime,
  MonoNum,
  parseNum,
  TOKEN_TONE,
  truncateHash,
  type PortfolioFixture,
} from "./_shared";

export default function Variant05AaveDual({
  fixture,
}: {
  fixture: PortfolioFixture;
}) {
  const totals = computeTotals(fixture);
  const allocations = computeAllocations(fixture);
  const delta = deriveDayDelta(totals.totalUsd);
  const transfers = combinedTransfers(fixture).slice(0, 4);
  const lockedShare = totals.total > 0 ? totals.locked / totals.total : 0;
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-6">
        <Animate variant="enter">
          <Card className="flex flex-col gap-4 p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-medium">Open positions</h2>
              <Button size="sm" variant="outline">
                Cancel all
              </Button>
            </header>
            {fixture.openOrders.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                No open positions.
              </p>
            ) : (
              <ul className="flex flex-col">
                {fixture.openOrders.map((o) => (
                  <li
                    key={o.id}
                    className="flex flex-col gap-3 border-t border-[var(--border)] py-4 first:border-t-0 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {o.pair}
                        </span>
                        <span
                          className={cn(
                            "font-mono text-[10px] uppercase tracking-[0.18em]",
                            o.side === "buy"
                              ? "text-[var(--success)]"
                              : "text-[var(--destructive)]",
                          )}
                        >
                          {o.side}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                          {o.type}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {formatTime(o.submittedAt)} · order {o.id}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center gap-6">
                      <Stat label="Size" value={o.amount} />
                      <Stat label="Price" value={o.price} />
                      <Stat label="Filled" value={`${o.filledPercent}%`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Status state={o.status as never} />
                      <Button size="sm" variant="ghost">
                        Cancel
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Animate>

        <Animate variant="enter" delay={0.05}>
          <Card className="flex flex-col gap-4 p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-medium">Recent fills</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Privacy: own + own-batch
              </span>
            </header>
            {fixture.recentFills.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                No fills yet.
              </p>
            ) : (
              <ul className="flex flex-col">
                {fixture.recentFills.map((f) => (
                  <li
                    key={f.id}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                  >
                    <span className="flex items-center gap-3 font-mono">
                      <span className="font-medium">{f.pair}</span>
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-[0.18em]",
                          f.side === "buy"
                            ? "text-[var(--success)]"
                            : "text-[var(--destructive)]",
                        )}
                      >
                        {f.side}
                      </span>
                    </span>
                    <MonoNum>{f.amount}</MonoNum>
                    <MonoNum className="text-[var(--muted-foreground)]">
                      @ {f.price}
                    </MonoNum>
                    <Status state={f.status as never} />
                    <MonoNum className="text-xs text-[var(--muted-foreground)]">
                      {formatTime(f.matchedAt)}
                    </MonoNum>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Animate>

        <Animate variant="enter" delay={0.1}>
          <Card className="flex flex-col gap-4 p-6">
            <h2 className="text-base font-medium">Transfers</h2>
            <ul className="flex flex-col">
              {transfers.length === 0 ? (
                <li className="py-3 text-sm text-[var(--muted-foreground)]">
                  No transfers yet.
                </li>
              ) : (
                transfers.map((t) => (
                  <li
                    key={`${t.kind}-${t.id}`}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                  >
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-[0.18em]",
                        t.kind === "deposit"
                          ? "text-[var(--success)]"
                          : "text-[var(--muted-foreground)]",
                      )}
                    >
                      {t.kind === "deposit" ? "Deposit" : "Withdrawal"}
                    </span>
                    <span className="font-mono">{t.token}</span>
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

      <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
        <Animate variant="enter" delay={0.05}>
          <Card variant="glass" className="flex flex-col gap-5 p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Net worth
            </span>
            <MonoNum
              className="text-3xl font-medium tracking-tight"
              aria-label={`Net worth $${fixture.totalValueUSD}`}
            >
              ${fixture.totalValueUSD}
            </MonoNum>
            <span className={cn("inline-flex items-center gap-2 text-xs", tone)}>
              <MonoNum>
                {fmtSignedUsd(delta.absolute)} · {fmtSignedPct(delta.percent)}
              </MonoNum>
              <span className="text-[var(--muted-foreground)]">today</span>
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

            <div className="flex flex-col gap-2 text-xs">
              <Stat label="Available" value={`$${totals.available.toFixed(2)}`} />
              <Stat label="Locked" value={`$${totals.locked.toFixed(2)}`} />
            </div>

            <div className="flex flex-col gap-2">
              <Button>
                <Icon.Wallet aria-hidden />
                Deposit
              </Button>
              <Button variant="outline">Withdraw</Button>
            </div>
          </Card>
        </Animate>

        <Animate variant="enter" delay={0.1}>
          <Card className="flex flex-col gap-4 p-6">
            <h3 className="text-base font-medium">Allocation</h3>
            <div className="flex items-center gap-4">
              <Donut
                allocations={allocations}
                size={120}
                thickness={16}
                ariaLabel="Allocation across tokens"
              />
              <ul className="flex flex-col gap-1 text-xs">
                {allocations.map((a) => {
                  const balance = fixture.balances.find(
                    (b) => b.token === a.token,
                  );
                  const usd = balance ? parseNum(balance.total) : 0;
                  return (
                    <li
                      key={a.token}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: TOKEN_TONE[a.token] }}
                        />
                        <span className="font-medium">{a.token}</span>
                      </span>
                      <MonoNum>${usd.toFixed(2)}</MonoNum>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>
        </Animate>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <MonoNum>{value}</MonoNum>
    </div>
  );
}
