"use client";

/**
 * Variant 08 — Tabbed sections.
 *
 * Inspired by Zerion: a quiet hero with sparkline + segmented allocation
 * bar, then four tabs (Overview / Positions / Activity / Transfers). Each
 * tab content area is a single concern at a time, so the page never
 * surfaces more than one "table" worth of data at once.
 */

import * as React from "react";

import { Animate } from "@/components/ui/animate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Status } from "@/components/ui/status";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  TokenChip,
  truncateHash,
  type PortfolioFixture,
} from "./_shared";

export default function Variant08ZerionTabs({
  fixture,
}: {
  fixture: PortfolioFixture;
}) {
  const totals = computeTotals(fixture);
  const allocations = computeAllocations(fixture);
  const series = syntheticSeries(totals.totalUsd);
  const delta = deriveDayDelta(totals.totalUsd);
  const activity = combinedActivity(fixture).slice(0, 10);
  const transfers = combinedTransfers(fixture);
  const tone =
    delta.direction === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";

  return (
    <div className="flex flex-col gap-6">
      <Animate variant="enter">
        <Card className="grid gap-6 p-6 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Portfolio
            </span>
            <MonoNum
              className="text-3xl font-medium tracking-tight md:text-4xl"
              aria-label={`Portfolio value $${fixture.totalValueUSD}`}
            >
              ${fixture.totalValueUSD}
            </MonoNum>
            <span
              className={cn("inline-flex items-center gap-2 text-xs", tone)}
              aria-label={`Day change ${fmtSignedUsd(delta.absolute)}`}
            >
              <MonoNum>
                {fmtSignedUsd(delta.absolute)} · {fmtSignedPct(delta.percent)}
              </MonoNum>
              <span className="text-[var(--muted-foreground)]">today</span>
            </span>
            <div
              role="img"
              aria-label={`Allocation across ${allocations.length} tokens`}
              className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            >
              {allocations.map((a) => (
                <div
                  key={a.token}
                  aria-hidden
                  style={{
                    width: `${(a.share * 100).toFixed(2)}%`,
                    background: TOKEN_TONE[a.token],
                  }}
                />
              ))}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
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
                  <MonoNum>{(a.share * 100).toFixed(1)}%</MonoNum>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Sparkline
              series={series}
              width={320}
              height={100}
              ariaLabel={`Portfolio over 30 days, current $${fixture.totalValueUSD}`}
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

      <Animate variant="enter" delay={0.05}>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">
              Positions ({fixture.openOrders.length})
            </TabsTrigger>
            <TabsTrigger value="activity">
              Activity ({activity.length})
            </TabsTrigger>
            <TabsTrigger value="transfers">
              Transfers ({transfers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="flex flex-col gap-3 p-6">
              <h2 className="text-base font-medium">Holdings</h2>
              <ul className="flex flex-col">
                {fixture.balances.map((b) => {
                  const value = parseNum(b.total);
                  const share = totals.total > 0 ? value / totals.total : 0;
                  return (
                    <li
                      key={b.token}
                      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                    >
                      <TokenChip token={b.token} size={28} />
                      <span className="flex flex-col">
                        <span className="font-medium">{b.token}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {(share * 100).toFixed(1)}% · ${value.toFixed(2)}
                        </span>
                      </span>
                      <MonoNum>{b.total}</MonoNum>
                      <MonoNum className="text-xs text-[var(--muted-foreground)]">
                        {b.available} avail
                      </MonoNum>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="positions">
            <Card className="flex flex-col gap-3 p-6">
              <h2 className="text-base font-medium">Open positions</h2>
              {fixture.openOrders.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No open positions.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {fixture.openOrders.map((o) => (
                    <li
                      key={o.id}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                    >
                      <span className="font-mono">{o.pair}</span>
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
                      <MonoNum>{o.amount}</MonoNum>
                      <MonoNum>@ {o.price}</MonoNum>
                      <MonoNum className="text-[var(--muted-foreground)]">
                        {o.filledPercent}%
                      </MonoNum>
                      <Status state={o.status as never} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="flex flex-col gap-3 p-6">
              <h2 className="text-base font-medium">Activity</h2>
              <ul className="flex flex-col">
                {activity.map((a) => (
                  <li
                    key={`${a.kind}-${a.id}`}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
                  >
                    <span className="font-mono uppercase text-[10px] tracking-[0.18em] text-[var(--muted-foreground)]">
                      {a.kind}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-medium">{a.label}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {a.pair ?? a.token}
                      </span>
                    </span>
                    <MonoNum>{a.amount}</MonoNum>
                    <Status state={a.status as never} />
                    <MonoNum className="text-xs text-[var(--muted-foreground)]">
                      {formatTime(a.at)}
                    </MonoNum>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="transfers">
            <Card className="flex flex-col gap-3 p-6">
              <h2 className="text-base font-medium">Transfers</h2>
              <ul className="flex flex-col">
                {transfers.map((t) => (
                  <li
                    key={`${t.kind}-${t.id}`}
                    className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-3 border-t border-[var(--border)] py-3 text-sm first:border-t-0"
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
                    <TokenChip token={t.token} size={24} />
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
                ))}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </Animate>
    </div>
  );
}
