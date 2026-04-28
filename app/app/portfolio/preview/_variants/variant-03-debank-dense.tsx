"use client";

/**
 * Variant 03 — Dense terminal.
 *
 * Inspired by DeBank: tight rows, mono everywhere, allocation rendered as
 * an inline mini-bar instead of a chart. The trade-off is signal density;
 * this variant trusts the user to read numbers, not glance at shapes.
 */

import * as React from "react";

import { Animate } from "@/components/ui/animate";
import { Button } from "@/components/ui/button";
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

export default function Variant03DebankDense({
  fixture,
}: {
  fixture: PortfolioFixture;
}) {
  const totals = computeTotals(fixture);
  const series = syntheticSeries(totals.totalUsd);
  const delta = deriveDayDelta(totals.totalUsd);
  const allocations = computeAllocations(fixture);
  const activity = combinedActivity(fixture).slice(0, 8);
  const transfers = combinedTransfers(fixture).slice(0, 4);
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";

  return (
    <div className="flex flex-col gap-4">
      {/* Top KPI band — terminal-style read-out */}
      <Animate variant="enter">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)] md:grid-cols-5">
          <Kpi label="Net worth" value={`$${fixture.totalValueUSD}`} mono />
          <Kpi
            label="24h"
            value={`${fmtSignedUsd(delta.absolute)} (${fmtSignedPct(delta.percent)})`}
            tone={tone}
            mono
          />
          <Kpi
            label="Available"
            value={`$${totals.available.toFixed(2)}`}
            mono
          />
          <Kpi label="Locked" value={`$${totals.locked.toFixed(2)}`} mono />
          <Kpi
            label="Open · Fills"
            value={`${fixture.openOrders.length} · ${fixture.recentFills.length}`}
            mono
          />
        </div>
      </Animate>

      {/* Allocation strip — single row, all weight inline */}
      <Animate variant="enter" delay={0.05}>
        <div className="surface-soft rounded-[var(--radius-md)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Allocation
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              30D
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div
              className="flex h-2 flex-1 overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Allocation across ${allocations.length} tokens`}
            >
              {allocations.map((a) => (
                <div
                  key={a.token}
                  style={{
                    width: `${(a.share * 100).toFixed(2)}%`,
                    background: TOKEN_TONE[a.token],
                  }}
                  aria-hidden
                />
              ))}
            </div>
            <Sparkline
              series={series}
              width={140}
              height={32}
              ariaLabel={`Net worth trajectory, current $${fixture.totalValueUSD}`}
              showFill={false}
            />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {allocations.map((a) => (
              <li key={a.token} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: TOKEN_TONE[a.token] }}
                />
                <span className="font-mono text-[var(--muted-foreground)]">
                  {a.token}
                </span>
                <MonoNum className="text-[var(--foreground)]">
                  {(a.share * 100).toFixed(1)}%
                </MonoNum>
              </li>
            ))}
          </ul>
        </div>
      </Animate>

      {/* Wallet table — DeBank style: token / balance / value / share */}
      <Animate variant="enter" delay={0.1}>
        <DenseTable
          title="Wallet"
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Icon.Wallet aria-hidden />
                Deposit
              </Button>
              <Button size="sm" variant="ghost">
                Withdraw
              </Button>
            </div>
          }
          headers={["Token", "Available", "Locked", "Total", "Value", "Share"]}
          template="grid-cols-[1.1fr_1fr_0.8fr_1fr_1fr_0.7fr]"
          rows={fixture.balances.map((b) => {
            const value = parseNum(b.total);
            const share = totals.total > 0 ? value / totals.total : 0;
            return (
              <li
                key={b.token}
                className="grid grid-cols-[1.1fr_1fr_0.8fr_1fr_1fr_0.7fr] items-center gap-3 border-t border-[var(--border)] py-2 text-xs first:border-t-0"
              >
                <span className="flex items-center gap-2">
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
                <MonoNum>{b.total}</MonoNum>
                <MonoNum>${value.toFixed(2)}</MonoNum>
                <MonoNum className="text-right text-[var(--muted-foreground)]">
                  {(share * 100).toFixed(1)}%
                </MonoNum>
              </li>
            );
          })}
        />
      </Animate>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Animate variant="enter" delay={0.15}>
          <DenseTable
            title="Activity"
            headers={["Type", "Pair", "Side", "Amount", "Status", "Time"]}
            template="grid-cols-[0.8fr_0.9fr_0.6fr_1fr_1fr_1fr]"
            rows={activity.map((a) => (
              <li
                key={`${a.kind}-${a.id}`}
                className="grid grid-cols-[0.8fr_0.9fr_0.6fr_1fr_1fr_1fr] items-center gap-3 border-t border-[var(--border)] py-2 text-xs first:border-t-0"
              >
                <span className="font-mono uppercase tracking-wide text-[var(--muted-foreground)]">
                  {a.kind}
                </span>
                <span className="font-mono">{a.pair ?? a.token}</span>
                <span className="font-mono uppercase tracking-wide text-[var(--muted-foreground)]">
                  {a.label.split(" ")[0]}
                </span>
                <MonoNum>{a.amount}</MonoNum>
                <Status state={a.status as never} />
                <MonoNum className="text-[var(--muted-foreground)]">
                  {formatTime(a.at)}
                </MonoNum>
              </li>
            ))}
          />
        </Animate>

        <Animate variant="enter" delay={0.2}>
          <DenseTable
            title="Transfers"
            headers={["Type", "Token", "Amount", "Tx"]}
            template="grid-cols-[0.7fr_0.7fr_1fr_1fr]"
            rows={transfers.map((t) => (
              <li
                key={`${t.kind}-${t.id}`}
                className="grid grid-cols-[0.7fr_0.7fr_1fr_1fr] items-center gap-3 border-t border-[var(--border)] py-2 text-xs first:border-t-0"
              >
                <span
                  className={cn(
                    "font-mono uppercase tracking-wide",
                    t.kind === "deposit"
                      ? "text-[var(--success)]"
                      : "text-[var(--muted-foreground)]",
                  )}
                >
                  {t.kind === "deposit" ? "in" : "out"}
                </span>
                <span className="font-mono">{t.token}</span>
                <MonoNum>{t.amount}</MonoNum>
                {t.txHash ? (
                  <a
                    href={`https://etherscan.io/tx/${t.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono underline-offset-4 hover:underline"
                  >
                    {truncateHash(t.txHash)}
                    <Icon.External size={10} aria-hidden />
                  </a>
                ) : (
                  <span className="font-mono text-[var(--muted-foreground)]">
                    —
                  </span>
                )}
              </li>
            ))}
          />
        </Animate>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 bg-[var(--card)] p-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span
        className={cn(
          "text-sm md:text-base",
          mono && "font-mono tabular-nums",
          tone,
        )}
      >
        {value}
      </span>
    </div>
  );
}

function DenseTable({
  title,
  headers,
  template,
  rows,
  actions,
}: {
  title: string;
  headers: string[];
  template: string;
  rows: React.ReactNode[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="surface-soft rounded-[var(--radius-md)] bg-[var(--card)] p-4">
      <header className="flex items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {title}
        </h2>
        {actions}
      </header>
      <div
        className={cn(
          "mt-3 hidden border-b border-[var(--border)] pb-2 md:grid",
          template,
        )}
        role="row"
      >
        {headers.map((h) => (
          <span
            key={h}
            role="columnheader"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
          >
            {h}
          </span>
        ))}
      </div>
      <ul className="flex flex-col">
        {rows.length === 0 ? (
          <li className="py-3 text-xs text-[var(--muted-foreground)]">
            No rows yet.
          </li>
        ) : (
          rows
        )}
      </ul>
    </div>
  );
}
