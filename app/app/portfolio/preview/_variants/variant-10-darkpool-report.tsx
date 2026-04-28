"use client";

/**
 * Variant 10 — Darkpool report.
 *
 * Original take. Frames the portfolio as a private execution report rather
 * than a wallet snapshot: a hero card with the value + sparkline, then a
 * provenance band that says "matched / settled / proven" inline, then a
 * compact ledger of the user's own activity. The serif lede and the
 * attestation strip are the design-led moves — institutional, not flashy.
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
  parseNum,
  Sparkline,
  syntheticSeries,
  TOKEN_TONE,
  truncateHash,
  type PortfolioFixture,
} from "./_shared";

export default function Variant10DarkpoolReport({
  fixture,
}: {
  fixture: PortfolioFixture;
}) {
  const totals = computeTotals(fixture);
  const allocations = computeAllocations(fixture);
  const series = syntheticSeries(totals.totalUsd);
  const delta = deriveDayDelta(totals.totalUsd);
  const activity = combinedActivity(fixture).slice(0, 6);
  const transfers = combinedTransfers(fixture).slice(0, 4);
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";
  const matched = fixture.recentFills.filter(
    (f) => f.status === "matched",
  ).length;
  const settled = fixture.recentFills.filter(
    (f) => f.status === "settled",
  ).length;
  const proven = fixture.recentFills.filter(
    (f) => f.status === "proven",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <Animate variant="enter">
        <Card variant="glass" className="flex flex-col gap-6 p-8">
          <header className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Execution report · midpoint mark
            </span>
            <p className="font-serif text-xl leading-snug text-[var(--muted-foreground)] md:text-2xl">
              Privacy-preserving — only your own state. Counterparties stay
              invisible.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-end">
            <div className="flex flex-col gap-3">
              <MonoNum
                className="text-4xl font-medium tracking-tight md:text-5xl"
                aria-label={`Net asset value $${fixture.totalValueUSD}`}
              >
                ${fixture.totalValueUSD}
              </MonoNum>
              <span className={cn("inline-flex items-center gap-2 text-xs", tone)}>
                <MonoNum>
                  {fmtSignedUsd(delta.absolute)} · {fmtSignedPct(delta.percent)}
                </MonoNum>
                <span className="text-[var(--muted-foreground)]">today</span>
              </span>
              <Sparkline
                series={series}
                width={520}
                height={84}
                ariaLabel={`Net asset value over 30 days, current $${fixture.totalValueUSD}`}
                stroke="var(--success)"
                fill="var(--success)"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Stat label="Available" value={`$${totals.available.toFixed(2)}`} />
              <Stat label="Locked" value={`$${totals.locked.toFixed(2)}`} />
              <Stat
                label="Open · Fills"
                value={`${fixture.openOrders.length} / ${fixture.recentFills.length}`}
              />
              <div className="flex gap-2 pt-2">
                <Button>
                  <Icon.Wallet aria-hidden />
                  Deposit
                </Button>
                <Button variant="outline">Withdraw</Button>
              </div>
            </div>
          </div>
        </Card>
      </Animate>

      {/* Provenance / attestation strip — Omega-specific design beat */}
      <Animate variant="enter" delay={0.05}>
        <Card className="grid grid-cols-2 gap-4 p-5 md:grid-cols-4">
          <Provenance
            icon={Icon.Match}
            label="Matched"
            count={matched}
            tone="text-[var(--foreground)]"
          />
          <Provenance
            icon={Icon.Settled}
            label="Settled"
            count={settled}
            tone="text-[var(--success)]"
          />
          <Provenance
            icon={Icon.Proof}
            label="Proven"
            count={proven}
            tone="text-[var(--success)]"
          />
          <Provenance
            icon={Icon.Pending}
            label="Pending"
            count={fixture.openOrders.length}
            tone="text-[var(--muted-foreground)]"
          />
        </Card>
      </Animate>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Animate variant="enter" delay={0.1}>
          <Card className="flex flex-col gap-4 p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-medium">Holdings</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                {allocations.length} tokens
              </span>
            </header>
            <ul className="flex flex-col">
              {fixture.balances.map((b) => {
                const value = parseNum(b.total);
                const share = totals.total > 0 ? value / totals.total : 0;
                return (
                  <li
                    key={b.token}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                  >
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ background: TOKEN_TONE[b.token] }}
                    />
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium">{b.token}</span>
                        <MonoNum>{b.total}</MonoNum>
                      </span>
                      <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
                        <span>{(share * 100).toFixed(1)}%</span>
                        <MonoNum>${value.toFixed(2)}</MonoNum>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Animate>

        <Animate variant="enter" delay={0.15}>
          <Card className="flex flex-col gap-4 p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-base font-medium">Ledger</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Own + own-batch only
              </span>
            </header>
            <ul className="flex flex-col">
              {activity.map((a) => (
                <li
                  key={`${a.kind}-${a.id}`}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    {a.kind}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-medium">{a.label}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {a.pair ?? a.token} · {formatTime(a.at)}
                    </span>
                  </span>
                  <MonoNum>{a.amount}</MonoNum>
                  <Status state={a.status as never} />
                </li>
              ))}
            </ul>
          </Card>
        </Animate>
      </div>

      <Animate variant="enter" delay={0.2}>
        <Card className="flex flex-col gap-4 p-6">
          <header className="flex items-center justify-between">
            <h2 className="text-base font-medium">Onchain transfers</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              L1 settlement
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
                  className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-4 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.18em]",
                      t.kind === "deposit"
                        ? "text-[var(--success)]"
                        : "text-[var(--muted-foreground)]",
                    )}
                  >
                    {t.kind}
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
  );
}

function Provenance({
  icon: IconCmp,
  label,
  count,
  tone,
}: {
  icon: typeof Icon.Match;
  label: string;
  count: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)]",
          tone,
        )}
        aria-hidden
      >
        <IconCmp size={16} />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {label}
        </span>
        <MonoNum className="text-base">{count}</MonoNum>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-b-0 last:pb-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <MonoNum>{value}</MonoNum>
    </div>
  );
}
