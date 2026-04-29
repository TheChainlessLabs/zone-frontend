// Persona 09 rebuild: replaces the chart-led portfolio hero with a dense account-state dashboard for faster trading scans.
"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { PortfolioFixture } from "@/lib/fixtures";
import {
  MonoNum,
  TOKEN_TONE,
  combinedTransfers,
  computeTotals,
  formatTime,
  parseNum,
  truncateHash,
} from "@/app/portfolio/preview/_variants/_shared";

const TABLE_HEAD =
  "sticky top-0 z-10 bg-[var(--background)]/96 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] backdrop-blur";
const CELL = "px-3 py-2.5 align-middle";
const ROW = "border-t border-[var(--border)] text-sm";
const PILL = "font-mono text-[10px] uppercase tracking-[0.18em]";

export default function Persona09PortfolioPage({
  fixture,
  onDeposit,
  onWithdraw,
}: {
  fixture: PortfolioFixture;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}) {
  const totals = computeTotals(fixture);
  const transfers = combinedTransfers(fixture).slice(0, 6);
  const latestTransfer = transfers[0];
  const pendingWithdrawals = fixture.withdrawals.filter(
    (item) => item.status === "pending" || item.status === "awaiting-signature",
  );
  const proofReadyFills = fixture.recentFills.filter(
    (fill) => fill.status === "proven" || fill.status === "settled",
  ).length;
  const pendingOrders = fixture.openOrders.filter(
    (order) => order.status === "pending",
  ).length;
  const lockedRatio =
    totals.total > 0 ? Math.min(1, totals.locked / totals.total) : 0;

  return (
    <div className="flex flex-col gap-4 text-[var(--foreground)]">
      <section className="grid gap-3 xl:grid-cols-[1.7fr_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-[var(--border)] px-4 py-3 md:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
                  Account state
                </span>
                <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                  <MonoNum className="text-3xl font-medium tracking-tight md:text-5xl">
                    ${fixture.totalValueUSD}
                  </MonoNum>
                  <div className="pb-1 text-xs text-[var(--muted-foreground)]">
                    <span className="mr-2">Available</span>
                    <MonoNum className="text-[var(--foreground)]">
                      ${totals.available.toFixed(2)}
                    </MonoNum>
                  </div>
                  <div className="pb-1 text-xs text-[var(--muted-foreground)]">
                    <span className="mr-2">Locked</span>
                    <MonoNum className="text-[var(--foreground)]">
                      ${totals.locked.toFixed(2)}
                    </MonoNum>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={onDeposit}>
                  <Icon.Wallet aria-hidden />
                  Deposit
                </Button>
                <Button size="sm" variant="outline" onClick={onWithdraw}>
                  Withdraw
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-[var(--border)] md:grid-cols-5">
            <MetricTile
              label="Open orders"
              value={String(fixture.openOrders.length)}
              detail={`${pendingOrders} pending`}
            />
            <MetricTile
              label="Recent fills"
              value={String(fixture.recentFills.length)}
              detail={`${proofReadyFills} proved or settled`}
            />
            <MetricTile
              label="Pending outflow"
              value={`$${sumAmounts(pendingWithdrawals).toFixed(2)}`}
              detail={`${pendingWithdrawals.length} withdrawal requests`}
            />
            <MetricTile
              label="Capital deployed"
              value={`${(lockedRatio * 100).toFixed(1)}%`}
              detail="Locked in resting orders"
            />
            <MetricTile
              label="Latest movement"
              value={
                latestTransfer
                  ? `${latestTransfer.kind === "deposit" ? "IN" : "OUT"} ${latestTransfer.token}`
                  : "Flat"
              }
              detail={latestTransfer ? formatTime(latestTransfer.initiatedAt) : "No cash movement"}
            />
          </div>
        </Card>

        <Card className="p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
              Balance utilisation
            </span>
            <MonoNum className="text-xs text-[var(--muted-foreground)]">
              {fixture.balances.length} assets
            </MonoNum>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {fixture.balances
              .filter((balance) => parseNum(balance.total) > 0)
              .sort((a, b) => parseNum(b.total) - parseNum(a.total))
              .map((balance) => {
                const total = parseNum(balance.total);
                const available = parseNum(balance.available);
                const share = totals.total > 0 ? (total / totals.total) * 100 : 0;
                const used = total > 0 ? ((total - available) / total) * 100 : 0;
                return (
                  <div key={balance.token} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: TOKEN_TONE[balance.token] }}
                        />
                        <span className="font-medium">{balance.token}</span>
                      </span>
                      <MonoNum>${total.toFixed(2)}</MonoNum>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(used, 2)}%`,
                          backgroundColor: TOKEN_TONE[balance.token],
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
                      <MonoNum>Available ${available.toFixed(2)}</MonoNum>
                      <MonoNum>{share.toFixed(1)}% of account</MonoNum>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-5">
            <div className="flex flex-col">
              <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
                Balances
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                Available, locked, and total by asset
              </span>
            </div>
            <MonoNum className="text-xs text-[var(--muted-foreground)]">
              Sticky header
            </MonoNum>
          </div>
          <TableFrame maxHeight="max-h-[420px]">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className={TABLE_HEAD}>Asset</th>
                  <th className={TABLE_HEAD}>Available</th>
                  <th className={TABLE_HEAD}>Locked</th>
                  <th className={TABLE_HEAD}>Total</th>
                  <th className={TABLE_HEAD}>Share</th>
                </tr>
              </thead>
              <tbody>
                {fixture.balances
                  .filter((balance) => parseNum(balance.total) > 0)
                  .sort((a, b) => parseNum(b.total) - parseNum(a.total))
                  .map((balance) => {
                    const total = parseNum(balance.total);
                    const share = totals.total > 0 ? (total / totals.total) * 100 : 0;
                    return (
                      <tr key={balance.token} className={ROW}>
                        <td className={CELL}>
                          <span className="inline-flex items-center gap-2">
                            <span
                              aria-hidden
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: TOKEN_TONE[balance.token] }}
                            />
                            <span className="font-medium">{balance.token}</span>
                          </span>
                        </td>
                        <td className={CELL}>
                          <MonoNum>{balance.available}</MonoNum>
                        </td>
                        <td className={CELL}>
                          <MonoNum>{balance.locked}</MonoNum>
                        </td>
                        <td className={CELL}>
                          <MonoNum>{balance.total}</MonoNum>
                        </td>
                        <td className={CELL}>
                          <MonoNum>{share.toFixed(1)}%</MonoNum>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </TableFrame>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-5">
            <div className="flex flex-col">
              <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
                Open orders
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                Working risk on venue
              </span>
            </div>
            <Button size="sm" variant="ghost">
              Cancel all
            </Button>
          </div>
          <TableFrame maxHeight="max-h-[420px]">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className={TABLE_HEAD}>Pair</th>
                  <th className={TABLE_HEAD}>Qty</th>
                  <th className={TABLE_HEAD}>Price</th>
                  <th className={TABLE_HEAD}>Fill</th>
                  <th className={TABLE_HEAD}>State</th>
                </tr>
              </thead>
              <tbody>
                {fixture.openOrders.map((order) => (
                  <tr key={order.id} className={ROW}>
                    <td className={CELL}>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{order.pair}</span>
                        <span className={cn(PILL, order.side === "buy" ? "text-[var(--success)]" : "text-[var(--destructive)]")}>
                          {order.side} {order.type}
                        </span>
                      </div>
                    </td>
                    <td className={CELL}>
                      <MonoNum>{order.amount}</MonoNum>
                    </td>
                    <td className={CELL}>
                      <MonoNum>{order.price}</MonoNum>
                    </td>
                    <td className={CELL}>
                      <MonoNum>{order.filledPercent}%</MonoNum>
                    </td>
                    <td className={CELL}>
                      <Status state={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableFrame>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-5">
            <div className="flex flex-col">
              <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
                Fills and cash movement
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                One ledger, no page-hopping
              </span>
            </div>
            <MonoNum className="text-xs text-[var(--muted-foreground)]">
              Last 6
            </MonoNum>
          </div>
          <TableFrame maxHeight="max-h-[420px]">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className={TABLE_HEAD}>Type</th>
                  <th className={TABLE_HEAD}>Amount</th>
                  <th className={TABLE_HEAD}>Ref</th>
                  <th className={TABLE_HEAD}>State</th>
                </tr>
              </thead>
              <tbody>
                {buildLedgerRows(fixture).map((row) => (
                  <tr key={row.id} className={ROW}>
                    <td className={CELL}>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{row.label}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {row.meta}
                        </span>
                      </div>
                    </td>
                    <td className={CELL}>
                      <MonoNum>{row.amount}</MonoNum>
                    </td>
                    <td className={CELL}>
                      <div className="flex flex-col gap-0.5">
                        <MonoNum className="text-xs">
                          {row.reference}
                        </MonoNum>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {row.at}
                        </span>
                      </div>
                    </td>
                    <td className={CELL}>
                      <Status state={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableFrame>
        </Card>
      </div>

      <Card className="p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex flex-col">
            <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
              Desktop scan model
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">
              Keep the headers fixed, keep the rows compact, keep state above narrative.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <span className="rounded border border-[var(--border)] px-2 py-1 font-mono">
              / Search
            </span>
            <span className="rounded border border-[var(--border)] px-2 py-1 font-mono">
              O Orders
            </span>
            <span className="rounded border border-[var(--border)] px-2 py-1 font-mono">
              P Portfolio
            </span>
            <span className="rounded border border-[var(--border)] px-2 py-1 font-mono">
              F Fills
            </span>
          </div>
        </div>
        <div className="mt-3 grid gap-3 text-xs text-[var(--muted-foreground)] md:grid-cols-3">
          <DeskNote
            title="State before story"
            body="The account opens on balances, working orders, proofs, and transfers. Performance history can sit lower."
          />
          <DeskNote
            title="Rows before cards"
            body="Every object that changes intraday gets a row. Cards are containers, not the information model."
          />
          <DeskNote
            title="Proof in workflow"
            body="Settlement and proof status stay beside fills and cash movement, not on a separate conceptual island."
          />
        </div>
      </Card>
    </div>
  );
}

function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="bg-[var(--background)] px-4 py-3 md:px-5">
      <div className={cn(PILL, "text-[var(--muted-foreground)]")}>{label}</div>
      <MonoNum className="mt-1 block text-lg font-medium">{value}</MonoNum>
      <div className="mt-1 text-xs text-[var(--muted-foreground)]">{detail}</div>
    </div>
  );
}

function TableFrame({
  children,
  maxHeight,
}: {
  children: React.ReactNode;
  maxHeight: string;
}) {
  return <div className={cn("overflow-auto", maxHeight)}>{children}</div>;
}

function DeskNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/20 p-3">
      <div className="text-sm font-medium text-[var(--foreground)]">{title}</div>
      <div className="mt-1 leading-relaxed">{body}</div>
    </div>
  );
}

function sumAmounts(items: Array<{ amount: string }>) {
  return items.reduce((acc, item) => acc + parseNum(item.amount), 0);
}

function buildLedgerRows(fixture: PortfolioFixture) {
  const fillRows = fixture.recentFills.map((fill) => ({
    id: fill.id,
    label: fill.side === "buy" ? "Buy fill" : "Sell fill",
    meta: fill.pair,
    amount: `${fill.amount} @ ${fill.price}`,
    reference: fill.orderId,
    rawAt: fill.matchedAt,
    at: formatTime(fill.matchedAt),
    status: fill.status,
  }));

  const transferRows = combinedTransfers(fixture).map((transfer) => ({
    id: transfer.id,
    label: transfer.kind === "deposit" ? "Deposit" : "Withdrawal",
    meta: transfer.token,
    amount: transfer.amount,
    reference: truncateHash(transfer.txHash ?? "signature"),
    rawAt: transfer.initiatedAt,
    at: formatTime(transfer.initiatedAt),
    status: transfer.status,
  }));

  return [...fillRows, ...transferRows]
    .sort((a, b) => (a.rawAt < b.rawAt ? 1 : -1))
    .slice(0, 6);
}
