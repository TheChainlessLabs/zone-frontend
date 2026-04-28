"use client";

/**
 * /portfolio — M3.3 wireframe (closes omega-interface#144).
 *
 * The user's personal financial dashboard: total value, balances,
 * open positions, fill history, and onchain deposit/withdrawal log.
 *
 * Privacy contract (omega-docs#5 PRD): only the connected user's own
 * state ever lands on this page — no counterparty IDs, no global feed.
 *
 * Inspiration thread:
 *   - Uniswap "Pool" / Account — table-heavy financial dashboard.
 *   - Linear "My Issues"       — quiet rows, subtle hover, mono numerals.
 *   - CoW Swap "Activity"      — clean past-trade list.
 *
 * State coverage (driven by `?state=`):
 *   default · empty · loading · error · skeleton · disconnected.
 *
 * No `wrong-network` cell — the page is read-only and chain-agnostic
 * (see lib/fixtures/M3-state-coverage.md).
 *
 * The Table primitive is intentionally NOT introduced here. The brief
 * defers that to an M2 follow-up; this page composes div-grid rows so
 * the visual pass in M4 can decide on the primitive's API first.
 */

import * as React from "react";
import Link from "next/link";

import { AppShell } from "@/components/shell/AppShell";
import { PageLayout, PageSection } from "@/components/shell/PageLayout";
import { DisconnectedState } from "@/components/DisconnectedState";
import { DepositModal } from "@/components/modals/deposit-modal";
import { WithdrawModal } from "@/components/modals/withdraw-modal";
import { Badge } from "@/components/ui/badge";
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
  portfolioFixtures,
  usePageState,
  type BalanceFixture,
  type DepositFixture,
  type FillFixture,
  type OrderFixture,
  type PortfolioFixture,
  type WithdrawalFixture,
} from "@/lib/fixtures";

// Static day-over-day delta — fixture-only display value. Real data
// wiring lands in M6.
const DAY_DELTA = "+$1,204.10 (+2.6%) today";
const DAY_DELTA_DIRECTION: "up" | "down" = "up";

export default function PortfolioPage() {
  const state = usePageState();
  const [depositOpen, setDepositOpen] = React.useState(false);
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);

  // The disconnected branch short-circuits the layout per the issue
  // brief — `/portfolio` is auth-gated, so a disconnected viewer has
  // no portfolio to show.
  if (state === "disconnected") {
    return (
      <AppShell route="/portfolio" auth>
        <DisconnectedState
          title="Portfolio is private."
          description="Connect a wallet to see your balances, positions, and history."
          onAction={() => {}}
        />
      </AppShell>
    );
  }

  const fixture =
    state === "default" || state === "empty"
      ? portfolioFixtures[state]
      : portfolioFixtures.default;
  const isLoading = state === "loading" || state === "skeleton";
  const isError = state === "error";
  const errorMessage =
    portfolioFixtures.error.error?.message ?? "Portfolio unavailable.";

  return (
    <AppShell route="/portfolio" auth>
      <PageLayout
        width="wide"
        title="Portfolio"
        description="Your positions, balances, and history."
      >
        {isError ? <ErrorBand message={errorMessage} /> : null}

        <PortfolioHero
          fixture={fixture}
          isLoading={isLoading}
          isError={isError}
          onDeposit={() => setDepositOpen(true)}
          onWithdraw={() => setWithdrawOpen(true)}
        />

        <BalancesSection
          fixture={fixture}
          isLoading={isLoading}
          isError={isError}
          onDeposit={() => setDepositOpen(true)}
        />

        <OpenPositionsSection
          fixture={fixture}
          isLoading={isLoading}
          isError={isError}
        />

        <FillHistorySection
          fixture={fixture}
          isLoading={isLoading}
          isError={isError}
        />

        <TransfersSection
          fixture={fixture}
          isLoading={isLoading}
          isError={isError}
        />
      </PageLayout>

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        state="idle"
      />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        state="idle"
      />
    </AppShell>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Shared cells                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

const EYEBROW =
  "font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]";

function MonoNum({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>{children}</span>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-3 w-16 animate-pulse rounded-sm bg-[var(--muted)]",
        className,
      )}
    />
  );
}

function ErrorBand({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 text-[var(--destructive)] md:items-center"
    >
      <div className="flex items-start gap-2 text-xs md:items-center">
        <Icon.Warning size={14} aria-hidden className="mt-0.5 shrink-0 md:mt-0" />
        <span className="leading-relaxed">{message}</span>
      </div>
      <Button variant="destructive" size="sm" onClick={() => {}}>
        Retry
      </Button>
    </div>
  );
}

function SectionMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
      {children}
    </p>
  );
}

function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--muted)]/30 p-6 sm:flex-row sm:items-center sm:justify-between">
      <SectionMessage>{message}</SectionMessage>
      {action}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Hero — total portfolio value                                              */
/* ────────────────────────────────────────────────────────────────────────── */

function PortfolioHero({
  fixture,
  isLoading,
  isError,
  onDeposit,
  onWithdraw,
}: {
  fixture: PortfolioFixture;
  isLoading: boolean;
  isError: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  const totals = computeTotals(fixture.balances);
  const showSkeleton = isLoading || isError;
  const ChangeIcon = DAY_DELTA_DIRECTION === "up" ? Icon.Up : Icon.Down;
  const changeTone =
    DAY_DELTA_DIRECTION === "up"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";

  return (
    <Card variant="glass" className="p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        {/* Left — value + change */}
        <div className="flex min-w-0 flex-col gap-2">
          <span className={EYEBROW}>Total portfolio value</span>
          {showSkeleton ? (
            <SkeletonBar className="h-9 w-44" />
          ) : (
            <MonoNum className="text-3xl font-medium tracking-tight md:text-4xl">
              ${fixture.totalValueUSD || "0.00"}
            </MonoNum>
          )}
          {showSkeleton ? (
            <SkeletonBar className="w-56" />
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs",
                changeTone,
              )}
            >
              <ChangeIcon size={12} aria-hidden />
              <MonoNum>{DAY_DELTA}</MonoNum>
            </span>
          )}
        </div>

        {/* Right — chip set + CTAs */}
        <div className="flex flex-col gap-4 md:items-end">
          <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <HeroStat label="Available" value={totals.available} skeleton={showSkeleton} />
            <HeroStat label="Locked" value={totals.locked} skeleton={showSkeleton} />
            <HeroStat label="Pending" value={totals.pending} skeleton={showSkeleton} />
          </dl>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button onClick={onDeposit}>
              <Icon.Wallet aria-hidden />
              <span>Deposit</span>
            </Button>
            <Button variant="outline" onClick={onWithdraw}>
              Withdraw
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function HeroStat({
  label,
  value,
  skeleton,
}: {
  label: string;
  value: string;
  skeleton: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <dt className={EYEBROW}>{label}</dt>
      <dd>
        {skeleton ? <SkeletonBar className="w-20" /> : <MonoNum>${value}</MonoNum>}
      </dd>
    </div>
  );
}

function computeTotals(balances: BalanceFixture[]) {
  let available = 0;
  let locked = 0;
  for (const b of balances) {
    available += parseDecimal(b.available);
    locked += parseDecimal(b.locked);
  }
  return {
    available: formatUsd(available),
    locked: formatUsd(locked),
    // No oracle yet — pending settlement is fixture-only.
    pending: formatUsd(0),
  };
}

function parseDecimal(s: string): number {
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Balances                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

function BalancesSection({
  fixture,
  isLoading,
  isError,
  onDeposit,
}: {
  fixture: PortfolioFixture;
  isLoading: boolean;
  isError: boolean;
  onDeposit: () => void;
}) {
  const balances = isLoading || isError ? [] : fixture.balances;
  const showEmpty = !isLoading && !isError && balances.length === 0;

  return (
    <PageSection title="Balances">
      {isLoading || isError ? (
        <SkeletonRows rows={3} />
      ) : showEmpty ? (
        <EmptyState
          message="No balances yet. Deposit funds to start trading."
          action={<Button size="sm" onClick={onDeposit}>Deposit</Button>}
        />
      ) : (
        <div className="flex flex-col">
          <DataTableHeader
            cols={["Token", "Available", "Locked", "Total", "Value (USD)"]}
            // 5 cols on desktop; mobile collapses to a card layout.
            template="grid-cols-[1.1fr_1fr_1fr_1fr_1fr]"
          />
          <ul className="flex flex-col">
            {balances.map((b) => (
              <BalanceRow key={b.token} balance={b} />
            ))}
          </ul>
        </div>
      )}
    </PageSection>
  );
}

function BalanceRow({ balance }: { balance: BalanceFixture }) {
  // USD value tracks 1:1 for stables in the fixture set; this is a
  // display approximation, not an oracle quote.
  const usdValue = formatUsd(parseDecimal(balance.total));
  return (
    <li className="grid grid-cols-2 gap-y-2 border-t border-[var(--border)] py-3 md:grid-cols-[1.1fr_1fr_1fr_1fr_1fr] md:items-center md:gap-y-0 md:py-3">
      <DataCell mobileLabel="Token" emphasis>
        <span className="inline-flex items-center gap-2">
          <TokenChip token={balance.token} />
          <span className="font-medium">{balance.token}</span>
        </span>
      </DataCell>
      <DataCell mobileLabel="Available">
        <MonoNum>{balance.available}</MonoNum>
      </DataCell>
      <DataCell mobileLabel="Locked">
        <MonoNum className="text-[var(--muted-foreground)]">{balance.locked}</MonoNum>
      </DataCell>
      <DataCell mobileLabel="Total">
        <MonoNum>{balance.total}</MonoNum>
      </DataCell>
      <DataCell mobileLabel="Value (USD)">
        <MonoNum>${usdValue}</MonoNum>
      </DataCell>
    </li>
  );
}

function TokenChip({ token }: { token: BalanceFixture["token"] }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)] font-mono text-[10px] uppercase tracking-wider text-[var(--foreground)]"
    >
      {token.slice(0, 3)}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Open positions                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function OpenPositionsSection({
  fixture,
  isLoading,
  isError,
}: {
  fixture: PortfolioFixture;
  isLoading: boolean;
  isError: boolean;
}) {
  const orders = isLoading || isError ? [] : fixture.openOrders;
  const showEmpty = !isLoading && !isError && orders.length === 0;
  const hasRows = !isLoading && !isError && orders.length > 0;

  return (
    <PageSection
      title="Open positions"
      actions={
        hasRows ? (
          <Button variant="outline" size="sm" onClick={() => {}}>
            Cancel all
          </Button>
        ) : null
      }
    >
      {isLoading || isError ? (
        <SkeletonRows rows={2} />
      ) : showEmpty ? (
        <EmptyState
          message="No open positions. Place an order to start trading."
          action={
            <Button asChild size="sm">
              <Link href="/trade">Go to Trade</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col">
          <DataTableHeader
            cols={[
              "Pair",
              "Side",
              "Type",
              "Size",
              "Price",
              "Filled",
              "Status",
              "Time",
              "",
            ]}
            template="grid-cols-[1fr_0.7fr_0.8fr_1fr_1fr_0.8fr_1fr_1fr_0.6fr]"
          />
          <ul className="flex flex-col">
            {orders.map((o) => (
              <OpenPositionRow key={o.id} order={o} />
            ))}
          </ul>
        </div>
      )}
    </PageSection>
  );
}

function OpenPositionRow({ order }: { order: OrderFixture }) {
  const sideTone =
    order.side === "buy"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";
  return (
    <li className="group grid grid-cols-2 gap-y-2 border-t border-[var(--border)] py-3 transition-colors hover:bg-[var(--muted)]/40 md:grid-cols-[1fr_0.7fr_0.8fr_1fr_1fr_0.8fr_1fr_1fr_0.6fr] md:items-center md:gap-y-0">
      <DataCell mobileLabel="Pair" emphasis>
        <Link
          href={`/trade?pair=${encodeURIComponent(order.pair)}`}
          className="font-mono text-sm hover:underline"
        >
          {order.pair}
        </Link>
      </DataCell>
      <DataCell mobileLabel="Side">
        <span className={cn("text-xs font-medium uppercase tracking-wide", sideTone)}>
          {order.side}
        </span>
      </DataCell>
      <DataCell mobileLabel="Type">
        <span className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          {order.type}
        </span>
      </DataCell>
      <DataCell mobileLabel="Size">
        <MonoNum>{order.amount}</MonoNum>
      </DataCell>
      <DataCell mobileLabel="Price">
        <MonoNum>{order.price}</MonoNum>
      </DataCell>
      <DataCell mobileLabel="Filled">
        <MonoNum>{order.filledPercent}%</MonoNum>
      </DataCell>
      <DataCell mobileLabel="Status">
        <Status state={order.status} />
      </DataCell>
      <DataCell mobileLabel="Time">
        <MonoNum className="text-xs text-[var(--muted-foreground)]">
          {formatTime(order.submittedAt)}
        </MonoNum>
      </DataCell>
      <DataCell mobileLabel="">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {}}
          aria-label={`Cancel order ${order.id}`}
          className="md:ml-auto"
        >
          Cancel
        </Button>
      </DataCell>
    </li>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Recent fills                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

function FillHistorySection({
  fixture,
  isLoading,
  isError,
}: {
  fixture: PortfolioFixture;
  isLoading: boolean;
  isError: boolean;
}) {
  const fills = isLoading || isError ? [] : fixture.recentFills;
  const showEmpty = !isLoading && !isError && fills.length === 0;
  const hasRows = !isLoading && !isError && fills.length > 0;

  return (
    <PageSection title="Recent fills">
      {isLoading || isError ? (
        <SkeletonRows rows={2} />
      ) : showEmpty ? (
        <EmptyState message="No fills yet. Your matches will appear here." />
      ) : (
        <div className="flex flex-col">
          <DataTableHeader
            cols={["Pair", "Side", "Size", "Price", "Status", "Filled at"]}
            template="grid-cols-[1fr_0.7fr_1fr_1fr_1fr_1fr]"
          />
          <ul className="flex flex-col">
            {fills.map((f) => (
              <FillRow key={f.id} fill={f} />
            ))}
          </ul>
        </div>
      )}
      {hasRows ? <Pagination /> : null}
    </PageSection>
  );
}

function FillRow({ fill }: { fill: FillFixture }) {
  const sideTone =
    fill.side === "buy"
      ? "text-[var(--success)]"
      : "text-[var(--destructive)]";
  return (
    <li className="grid grid-cols-2 gap-y-2 border-t border-[var(--border)] py-3 transition-colors hover:bg-[var(--muted)]/40 md:grid-cols-[1fr_0.7fr_1fr_1fr_1fr_1fr] md:items-center md:gap-y-0">
      <DataCell mobileLabel="Pair" emphasis>
        <Link
          href={`/trade?pair=${encodeURIComponent(fill.pair)}`}
          className="font-mono text-sm hover:underline"
        >
          {fill.pair}
        </Link>
      </DataCell>
      <DataCell mobileLabel="Side">
        <span className={cn("text-xs font-medium uppercase tracking-wide", sideTone)}>
          {fill.side}
        </span>
      </DataCell>
      <DataCell mobileLabel="Size">
        <MonoNum>{fill.amount}</MonoNum>
      </DataCell>
      <DataCell mobileLabel="Price">
        <MonoNum>{fill.price}</MonoNum>
      </DataCell>
      <DataCell mobileLabel="Status">
        <Status state={fill.status} />
      </DataCell>
      <DataCell mobileLabel="Filled at">
        <MonoNum className="text-xs text-[var(--muted-foreground)]">
          {formatTime(fill.matchedAt)}
        </MonoNum>
      </DataCell>
    </li>
  );
}

function Pagination() {
  return (
    <div className="flex items-center justify-end gap-2 pt-3">
      <Button variant="outline" size="sm" disabled>
        Prev
      </Button>
      <Button variant="outline" size="sm" disabled>
        Next
      </Button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Deposits + withdrawals                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

type TransferRow =
  | ({ kind: "deposit" } & DepositFixture)
  | ({ kind: "withdrawal" } & WithdrawalFixture);

function TransfersSection({
  fixture,
  isLoading,
  isError,
}: {
  fixture: PortfolioFixture;
  isLoading: boolean;
  isError: boolean;
}) {
  const all: TransferRow[] = React.useMemo(() => {
    if (isLoading || isError) return [];
    const deposits: TransferRow[] = fixture.deposits.map((d) => ({
      kind: "deposit",
      ...d,
    }));
    const withdrawals: TransferRow[] = fixture.withdrawals.map((w) => ({
      kind: "withdrawal",
      ...w,
    }));
    return [...deposits, ...withdrawals].sort((a, b) =>
      a.initiatedAt < b.initiatedAt ? 1 : -1,
    );
  }, [fixture, isLoading, isError]);

  const deposits = all.filter((r) => r.kind === "deposit");
  const withdrawals = all.filter((r) => r.kind === "withdrawal");

  return (
    <PageSection title="Deposits & withdrawals">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="self-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TransfersTable
            rows={all}
            isLoading={isLoading}
            isError={isError}
            emptyMessage="No transfers yet. Deposits and withdrawals will appear here."
          />
        </TabsContent>
        <TabsContent value="deposits">
          <TransfersTable
            rows={deposits}
            isLoading={isLoading}
            isError={isError}
            emptyMessage="No deposits yet."
          />
        </TabsContent>
        <TabsContent value="withdrawals">
          <TransfersTable
            rows={withdrawals}
            isLoading={isLoading}
            isError={isError}
            emptyMessage="No withdrawals yet."
          />
        </TabsContent>
      </Tabs>
    </PageSection>
  );
}

function TransfersTable({
  rows,
  isLoading,
  isError,
  emptyMessage,
}: {
  rows: TransferRow[];
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
}) {
  if (isLoading || isError) {
    return <SkeletonRows rows={2} />;
  }
  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }
  return (
    <div className="flex flex-col">
      <DataTableHeader
        cols={["Type", "Token", "Amount", "Status", "Tx", "Time"]}
        template="grid-cols-[0.9fr_0.8fr_1fr_1fr_1fr_1fr]"
      />
      <ul className="flex flex-col">
        {rows.map((row) => (
          <TransferRowItem key={`${row.kind}-${row.id}`} row={row} />
        ))}
      </ul>
    </div>
  );
}

function TransferRowItem({ row }: { row: TransferRow }) {
  return (
    <li className="grid grid-cols-2 gap-y-2 border-t border-[var(--border)] py-3 transition-colors hover:bg-[var(--muted)]/40 md:grid-cols-[0.9fr_0.8fr_1fr_1fr_1fr_1fr] md:items-center md:gap-y-0">
      <DataCell mobileLabel="Type" emphasis>
        <Badge variant={row.kind === "deposit" ? "success" : "outline"}>
          {row.kind === "deposit" ? "Deposit" : "Withdrawal"}
        </Badge>
      </DataCell>
      <DataCell mobileLabel="Token">
        <span className="font-medium">{row.token}</span>
      </DataCell>
      <DataCell mobileLabel="Amount">
        <MonoNum>{row.amount}</MonoNum>
      </DataCell>
      <DataCell mobileLabel="Status">
        <Status state={row.status} />
      </DataCell>
      <DataCell mobileLabel="Tx">
        {row.txHash ? (
          <a
            href={`https://etherscan.io/tx/${row.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-[var(--foreground)] underline-offset-4 hover:underline"
          >
            {truncateHash(row.txHash)}
            <Icon.External size={12} aria-hidden />
          </a>
        ) : (
          <span className="font-mono text-xs text-[var(--muted-foreground)]">—</span>
        )}
      </DataCell>
      <DataCell mobileLabel="Time">
        <MonoNum className="text-xs text-[var(--muted-foreground)]">
          {formatTime(row.initiatedAt)}
        </MonoNum>
      </DataCell>
    </li>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Table primitives (local — div-grid)                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function DataTableHeader({
  cols,
  template,
}: {
  cols: string[];
  template: string;
}) {
  return (
    <div
      className={cn(
        "hidden border-b border-[var(--border)] py-2 md:grid",
        template,
      )}
      role="row"
    >
      {cols.map((c, i) => (
        <span
          key={`${c}-${i}`}
          role="columnheader"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function DataCell({
  mobileLabel,
  emphasis = false,
  children,
}: {
  mobileLabel: string;
  emphasis?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-0">
      {mobileLabel ? (
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)] md:hidden",
            emphasis ? "" : "",
          )}
        >
          {mobileLabel}
        </span>
      ) : null}
      <div className="text-sm md:w-full">{children}</div>
    </div>
  );
}

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <ul className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-4 border-t border-[var(--border)] py-3 first:border-t-0"
        >
          <SkeletonBar className="w-24" />
          <SkeletonBar className="w-16" />
          <SkeletonBar className="ml-auto w-20" />
          <SkeletonBar className="w-16" />
        </li>
      ))}
    </ul>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Formatting                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function truncateHash(hash: string): string {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function formatTime(iso: string): string {
  // Stable display so visual snapshots don't flap on rerun. The full
  // timestamp is preserved as a tooltip-equivalent via title.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mon = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${mon}-${dd} ${hh}:${mm}`;
}
