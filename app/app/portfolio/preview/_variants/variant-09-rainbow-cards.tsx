"use client";

/**
 * Variant 09 — Tinted cards.
 *
 * Inspired by Rainbow Wallet's per-token cards: each holding gets its own
 * card with a sparkline + a tinted accent. The tint stays restrained — a
 * 6% color-mix over the card surface, never a saturated wash. The grid
 * gives the page a calmer rhythm than a single dense table.
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
  TOKEN_TONE,
  TokenChip,
  type PortfolioFixture,
  type BalanceFixture,
} from "./_shared";

export default function Variant09RainbowCards({
  fixture,
}: {
  fixture: PortfolioFixture;
}) {
  const totals = computeTotals(fixture);
  const allocations = computeAllocations(fixture);
  const delta = deriveDayDelta(totals.totalUsd);
  const activity = combinedActivity(fixture).slice(0, 5);
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";

  return (
    <div className="flex flex-col gap-6">
      <Animate variant="enter">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Holdings
            </span>
            <MonoNum
              className="text-3xl font-medium tracking-tight md:text-4xl"
              aria-label={`Total $${fixture.totalValueUSD}`}
            >
              ${fixture.totalValueUSD}
            </MonoNum>
            <span className={cn("inline-flex items-center gap-2 text-xs", tone)}>
              <MonoNum>
                {fmtSignedUsd(delta.absolute)} · {fmtSignedPct(delta.percent)}
              </MonoNum>
              <span className="text-[var(--muted-foreground)]">today</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Button>
              <Icon.Wallet aria-hidden />
              Deposit
            </Button>
            <Button variant="outline">Withdraw</Button>
          </div>
        </header>
      </Animate>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fixture.balances.map((b, idx) => (
          <Animate key={b.token} variant="enter" delay={0.04 + idx * 0.04}>
            <TokenCard balance={b} totals={totals} />
          </Animate>
        ))}
      </div>

      <Animate variant="enter" delay={0.2}>
        <Card className="flex flex-col gap-3 p-6">
          <header className="flex items-center justify-between">
            <h2 className="text-base font-medium">Activity</h2>
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
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                >
                  <TokenChip
                    token={a.token as BalanceFixture["token"]}
                    size={26}
                  />
                  <span className="flex flex-col">
                    <span className="font-medium">{a.label}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {a.pair ?? a.token} · {formatTime(a.at)}
                    </span>
                  </span>
                  <MonoNum>{a.amount}</MonoNum>
                  <Status state={a.status as never} />
                </li>
              ))
            )}
          </ul>
        </Card>
      </Animate>

      <p className="text-xs text-[var(--muted-foreground)]">
        Allocation rendered as colored cards — {allocations.length} tokens of{" "}
        {fixture.balances.length} balances active. Empty balances stay visible
        so the deposit affordance is always one click away.
      </p>
    </div>
  );
}

function TokenCard({
  balance,
  totals,
}: {
  balance: BalanceFixture;
  totals: ReturnType<typeof computeTotals>;
}) {
  const value = parseNum(balance.total);
  const share = totals.total > 0 ? value / totals.total : 0;
  const series = syntheticSeries(value || 1, 24, 0.05);
  const tint = TOKEN_TONE[balance.token];
  const isEmpty = value === 0;

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 p-5",
        // Tinted surface — color-mix so it stays token-driven and theme-aware.
        // The 6% blend keeps the card readable in both modes.
        "bg-[color-mix(in_oklab,var(--card)_94%,var(--accent)_6%)]",
      )}
      style={{
        // Per-token accent rendered as a thin top border via inset shadow —
        // token-driven, no raw hex.
        boxShadow: `inset 0 2px 0 0 color-mix(in oklab, ${tint} 30%, transparent), var(--shadow-soft)`,
      }}
    >
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2.5">
          <TokenChip token={balance.token} size={32} />
          <span className="flex flex-col">
            <span className="text-sm font-medium">{balance.token}</span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {(share * 100).toFixed(1)}% of total
            </span>
          </span>
        </span>
        <Sparkline
          series={series}
          width={84}
          height={32}
          ariaLabel={`${balance.token} balance trend, current ${balance.total}`}
          stroke={tint}
          fill={tint}
          showFill={false}
          strokeWidth={1.4}
        />
      </header>

      <div className="flex flex-col gap-1">
        <MonoNum
          className={cn(
            "text-2xl font-medium tracking-tight",
            isEmpty && "text-[var(--muted-foreground)]",
          )}
        >
          {balance.total}
        </MonoNum>
        <span className="text-xs text-[var(--muted-foreground)]">
          ${value.toFixed(2)}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col gap-0.5">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Available
          </dt>
          <dd>
            <MonoNum>{balance.available}</MonoNum>
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Locked
          </dt>
          <dd>
            <MonoNum className="text-[var(--muted-foreground)]">
              {balance.locked}
            </MonoNum>
          </dd>
        </div>
      </dl>

      <div className="flex gap-2 pt-1">
        <Button size="sm" variant={isEmpty ? "default" : "outline"}>
          Deposit
        </Button>
        <Button size="sm" variant="ghost" disabled={isEmpty}>
          Trade {balance.token}
        </Button>
      </div>
    </Card>
  );
}
