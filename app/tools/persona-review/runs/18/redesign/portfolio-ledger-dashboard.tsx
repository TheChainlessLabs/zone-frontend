// Rebuilt /portfolio as a reconciliation-first ledger dashboard so users can trace deposits, fills, batch settlement, and withdrawal readiness in one surface.
"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Status } from "@/components/ui/status";
import { cn } from "@/lib/utils";
import type {
  DepositFixture,
  FillFixture,
  PortfolioFixture,
  WithdrawalFixture,
} from "@/lib/fixtures/types";

import {
  MonoNum,
  computeTotals,
  formatTime,
  parseNum,
  truncateHash,
} from "@/app/portfolio/preview/_variants/_shared";

const PILL = "font-mono text-[10px] uppercase tracking-[0.18em]";
const MUTED_PILL = `${PILL} text-[var(--muted-foreground)]`;
const TABLE_HEAD = "px-4 py-2 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]";
const TABLE_CELL = "px-4 py-3 align-top text-sm";

type LedgerEntry = {
  id: string;
  occurredAt: string;
  kind: "deposit" | "withdrawal" | "fill";
  direction: "in" | "out" | "internal";
  asset: string;
  amount: number;
  status: string;
  reference: string;
  detail: string;
  counterBucket: string;
};

export function NathanBrooksPortfolioRedesign({
  fixture,
  onDeposit,
  onWithdraw,
}: {
  fixture: PortfolioFixture;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}) {
  const totals = computeTotals(fixture);
  const pendingWithdrawal = fixture.withdrawals
    .filter((item) => item.status === "pending" || item.status === "awaiting-signature")
    .reduce((sum, item) => sum + parseNum(item.amount), 0);
  const inProof = fixture.recentFills
    .filter((item) => item.status === "proven")
    .reduce((sum, item) => sum + fillNotional(item), 0);
  const settledToday = fixture.recentFills
    .filter((item) => item.status === "settled")
    .reduce((sum, item) => sum + fillNotional(item), 0);
  const ledger = React.useMemo(() => buildLedgerEntries(fixture), [fixture]);

  return (
    <div className="flex flex-col gap-6">
      <header className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <Card className="flex flex-col gap-5 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className={MUTED_PILL}>Portfolio ledger</span>
              <div className="flex flex-wrap items-end gap-3">
                <MonoNum className="text-3xl font-medium leading-none tracking-tight md:text-5xl">
                  ${fixture.totalValueUSD}
                </MonoNum>
                <span className="pb-1 text-sm text-[var(--muted-foreground)]">
                  Current marked value across funded balances
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onDeposit}>
                Deposit
              </Button>
              <Button size="sm" variant="outline" onClick={onWithdraw}>
                Withdraw
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <BucketCard
              label="Available now"
              value={totals.available}
              hint="Funds that can back a new order immediately."
            />
            <BucketCard
              label="Locked in orders"
              value={totals.locked}
              hint="Capital reserved against resting liquidity."
            />
            <BucketCard
              label="Pending withdrawal"
              value={pendingWithdrawal}
              hint="Approved outflow not final on L1 yet."
              tone="warning"
            />
            <BucketCard
              label="In proof"
              value={inProof}
              hint="Matched, but still waiting for final settlement."
            />
            <BucketCard
              label="Settled today"
              value={settledToday}
              hint="Value that completed the lifecycle already."
              tone="success"
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-4 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <span className={MUTED_PILL}>Reconciliation status</span>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]">
              Zero drift
            </span>
          </div>

          <div className="grid gap-3">
            <ReconcileRow label="Deposits settled" value={sumDeposits(fixture.deposits)} />
            <ReconcileRow label="Withdrawals pending" value={pendingWithdrawal} />
            <ReconcileRow label="Open-order lock" value={totals.locked} />
            <ReconcileRow label="Matched not yet settled" value={inProof} />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/20 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className={MUTED_PILL}>Operational rule</span>
              <span className="font-mono text-xs">where did my money go?</span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              Every outflow needs a source bucket, every fill needs a batch state,
              and every withdrawal needs a settlement reference before it looks final.
            </p>
          </div>
        </Card>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <Card className="flex flex-col gap-4 p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 md:px-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-medium">Money movement register</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                One table for deposits, fills, and withdrawals.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", "Money in", "Money out", "In proof", "Pending"].map((view) => (
                <span
                  key={view}
                  className={cn(
                    "rounded-full border border-[var(--border)] px-3 py-1.5 text-xs",
                    view === "All" ? "bg-[var(--accent)] text-[var(--foreground)]" : "text-[var(--muted-foreground)]",
                  )}
                >
                  {view}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className={TABLE_HEAD}>Time</th>
                  <th className={TABLE_HEAD}>Event</th>
                  <th className={TABLE_HEAD}>Asset</th>
                  <th className={TABLE_HEAD}>Amount</th>
                  <th className={TABLE_HEAD}>Counter-bucket</th>
                  <th className={TABLE_HEAD}>Status</th>
                  <th className={TABLE_HEAD}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--border)] last:border-b-0">
                    <td className={TABLE_CELL}>
                      <div className="flex flex-col gap-1">
                        <span className="font-mono">{formatTime(entry.occurredAt)}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">{entry.detail}</span>
                      </div>
                    </td>
                    <td className={TABLE_CELL}>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium capitalize">{entry.kind}</span>
                        <span className={cn(PILL, directionTone(entry.direction))}>
                          {entry.direction === "in" ? "Money in" : entry.direction === "out" ? "Money out" : "Internal"}
                        </span>
                      </div>
                    </td>
                    <td className={cn(TABLE_CELL, "font-mono")}>{entry.asset}</td>
                    <td className={TABLE_CELL}>
                      <MonoNum className="font-mono">
                        {entry.direction === "out" ? "-" : entry.direction === "in" ? "+" : ""}
                        {formatUsd(entry.amount)}
                      </MonoNum>
                    </td>
                    <td className={TABLE_CELL}>
                      <span className="text-sm text-[var(--muted-foreground)]">{entry.counterBucket}</span>
                    </td>
                    <td className={TABLE_CELL}>
                      <Status state={entry.status as never} />
                    </td>
                    <td className={TABLE_CELL}>
                      <span className="font-mono text-xs text-[var(--muted-foreground)]">{entry.reference}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Balance by asset</h2>
              <span className={MUTED_PILL}>Source of funds</span>
            </div>
            <ul className="flex flex-col gap-3">
              {fixture.balances.map((balance) => (
                <li
                  key={balance.token}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/20 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-base">{balance.token}</span>
                    <MonoNum className="text-base font-medium">
                      {formatUsd(parseNum(balance.total))}
                    </MonoNum>
                  </div>
                  <div className="grid gap-2 text-sm text-[var(--muted-foreground)]">
                    <InlineMetric label="Available" value={parseNum(balance.available)} />
                    <InlineMetric label="Locked" value={parseNum(balance.locked)} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Settlement queue</h2>
              <span className={MUTED_PILL}>User-visible lifecycle</span>
            </div>
            <ol className="flex flex-col gap-3">
              {fixture.recentFills.map((fill) => (
                <li
                  key={fill.id}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/20 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-sm">{fill.pair}</span>
                    <Status state={fill.status as never} />
                  </div>
                  <div className="grid gap-2 text-sm text-[var(--muted-foreground)]">
                    <QueueLine label="Matched" value={formatTime(fill.matchedAt)} />
                    <QueueLine
                      label="Notional"
                      value={`${formatUsd(fillNotional(fill))} ${quoteAsset(fill.pair)}`}
                    />
                    <QueueLine
                      label="Release rule"
                      value={fill.status === "settled" ? "Withdrawable now" : "Wait for batch attestation"}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </section>
    </div>
  );
}

function BucketCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/20 p-4">
      <span className={MUTED_PILL}>{label}</span>
      <MonoNum
        className={cn(
          "mt-2 block text-2xl font-medium leading-none",
          tone === "success" && "text-[var(--success)]",
          tone === "warning" && "text-[var(--destructive)]",
        )}
      >
        ${formatUsd(value)}
      </MonoNum>
      <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">{hint}</p>
    </div>
  );
}

function ReconcileRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-b-0 last:pb-0">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <MonoNum className="text-sm font-medium">${formatUsd(value)}</MonoNum>
    </div>
  );
}

function InlineMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <MonoNum className="font-mono">${formatUsd(value)}</MonoNum>
    </div>
  );
}

function QueueLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}

function buildLedgerEntries(fixture: PortfolioFixture): LedgerEntry[] {
  const depositEntries = fixture.deposits.map((item) => depositToEntry(item));
  const withdrawalEntries = fixture.withdrawals.map((item) => withdrawalToEntry(item));
  const fillEntries = fixture.recentFills.map((item) => fillToEntry(item));

  return [...depositEntries, ...withdrawalEntries, ...fillEntries].sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
  );
}

function depositToEntry(item: DepositFixture): LedgerEntry {
  return {
    id: item.id,
    occurredAt: item.initiatedAt,
    kind: "deposit",
    direction: "in",
    asset: item.token,
    amount: parseNum(item.amount),
    status: item.status,
    reference: truncateHash(item.txHash),
    detail: "Wallet funding landed on-chain",
    counterBucket: "External wallet -> Available balance",
  };
}

function withdrawalToEntry(item: WithdrawalFixture): LedgerEntry {
  return {
    id: item.id,
    occurredAt: item.initiatedAt,
    kind: "withdrawal",
    direction: "out",
    asset: item.token,
    amount: parseNum(item.amount),
    status: item.status,
    reference: item.txHash ? truncateHash(item.txHash) : "signature required",
    detail: item.status === "awaiting-signature" ? "Awaiting wallet approval" : "Release initiated",
    counterBucket: "Available balance -> External wallet",
  };
}

function fillToEntry(item: FillFixture): LedgerEntry {
  const quote = quoteAsset(item.pair);
  return {
    id: item.id,
    occurredAt: item.matchedAt,
    kind: "fill",
    direction: "internal",
    asset: quote,
    amount: fillNotional(item),
    status: item.status,
    reference: item.orderId,
    detail: `${item.side.toUpperCase()} ${item.amount} @ ${item.price}`,
    counterBucket: item.status === "settled" ? "Locked -> Available" : "Locked -> In batch",
  };
}

function fillNotional(fill: FillFixture): number {
  return parseNum(fill.amount) * parseNum(fill.price);
}

function quoteAsset(pair: string): string {
  return pair.split("/")[1] ?? pair;
}

function sumDeposits(items: DepositFixture[]): number {
  return items.reduce((sum, item) => sum + parseNum(item.amount), 0);
}

function directionTone(direction: LedgerEntry["direction"]): string {
  if (direction === "in") return "text-[var(--success)]";
  if (direction === "out") return "text-[var(--destructive)]";
  return "text-[var(--muted-foreground)]";
}

function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
