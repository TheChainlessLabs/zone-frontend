"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { PageLayout } from "@/components/shell/PageLayout";
import { TransitionLink as Link } from "@/components/shell/transition-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  formatRelativeTime,
  formatThousands,
  formatUSD,
  truncateHash,
} from "@/lib/format";
import {
  batchesListFixtures,
  batchesSearchFixtures,
  usePageState,
} from "@/lib/fixtures";
import type { BatchFixture, BatchStatus } from "@/lib/fixtures/types";

import { CopyButton } from "./copy-button";
import { EtherscanTxLink } from "./etherscan-link";

/**
 * BatchesListView — the public settlement explorer.
 *
 * Default state shows the last 100 sealed batches paginated client-side
 * (per omega-docs#5 Q3). Search by batch ID or tx hash narrows the table
 * to a search-results fixture. The page is read-only and renders
 * regardless of wallet state — privacy hard rule: NO counterparty IDs
 * anywhere on this surface.
 *
 * Visual register: tempo-explorer flat-table (M4.20). Single card with a
 * 1px border, mono everywhere inside the table, hairline row dividers,
 * compact ~40px rows, status as dot+label (not a pill). Mobile collapses
 * to a card-stack but keeps the mono register.
 */

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

// `--warning` is intentionally absent from the v1 token set (see
// components/ui/badge.tsx); the existing batches surface uses
// `--muted-foreground` for the pending tone — match that here so the
// register stays consistent with the receipt detail page.
const STATUS_DOT: Record<BatchStatus, { color: string; label: string }> = {
  verified: { color: "var(--success)", label: "Verified" },
  pending: { color: "var(--muted-foreground)", label: "Pending" },
  failed: { color: "var(--destructive)", label: "Failed" },
};

export function BatchesListView() {
  const state = usePageState();
  const fallback = batchesListFixtures.default;
  const fixture =
    state === "empty"
      ? batchesListFixtures.empty
      : state === "loading"
        ? batchesListFixtures.loading
        : state === "error"
          ? batchesListFixtures.error
          : fallback;

  const [search, setSearch] = React.useState("");
  const [pageSize, setPageSize] = React.useState<PageSize>(100);
  const [page, setPage] = React.useState(1);

  const searchParam = useSearchParam("search");
  const searchFixture =
    searchParam === "results"
      ? batchesSearchFixtures.results
      : searchParam === "no-results"
        ? batchesSearchFixtures["no-results"]
        : null;

  React.useEffect(() => {
    if (searchFixture) setSearch(searchFixture.query);
  }, [searchFixture]);

  const isLoading = !!fixture.isLoading && !searchFixture;
  const error = !searchFixture ? fixture.error : undefined;

  const rows: BatchFixture[] = searchFixture
    ? searchFixture.results
    : fixture.batches;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
  const rangeStart = rows.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = pageStart + pageRows.length;

  return (
    <PageLayout
      width="wide"
      title="Batches"
      description="Sealed settlement batches with on-chain attestation. Public, verifiable."
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="relative flex w-full items-center md:max-w-md">
          <Icon.Search
            className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--muted-foreground)]"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by batch ID or tx hash"
            aria-label="Search batches"
            className="pl-9 pr-16 font-mono"
          />
          {search ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-1 h-7 px-2 text-xs"
            >
              Clear
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          <span className="font-mono uppercase tracking-[0.18em]">Last 100</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="glass"
                size="sm"
                className="h-8 gap-1 font-mono text-xs"
              >
                Per page: {pageSize}
                <Icon.Caret.Down className="h-3 w-3" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[10rem]">
              <DropdownMenuRadioGroup
                value={String(pageSize)}
                onValueChange={(next) => {
                  setPageSize(Number(next) as PageSize);
                  setPage(1);
                }}
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <DropdownMenuRadioItem key={opt} value={String(opt)}>
                    {opt} per page
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {searchFixture && searchFixture.results.length === 0 ? (
        <ListMessage
          title={`No batches match "${searchFixture.query}".`}
          description="Try a different ID or hash."
        />
      ) : isLoading ? (
        <SkeletonTable rows={8} />
      ) : error ? (
        <ListMessage
          title="Failed to load batches."
          description="Refresh to retry."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") window.location.reload();
              }}
              className="min-h-[44px] md:min-h-0"
            >
              Retry
            </Button>
          }
        />
      ) : rows.length === 0 ? (
        <ListMessage
          title="No batches sealed yet."
          description="Check back after the first market open."
        />
      ) : (
        <BatchesTable
          rows={pageRows}
          totalCount={rows.length}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          page={safePage}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          onFirst={() => setPage(1)}
          onLast={() => setPage(totalPages)}
        />
      )}
    </PageLayout>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Table                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

interface BatchesTableProps {
  rows: BatchFixture[];
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
}

function BatchesTable({
  rows,
  totalCount,
  rangeStart,
  rangeEnd,
  page,
  totalPages,
  onPrev,
  onNext,
  onFirst,
  onLast,
}: BatchesTableProps) {
  return (
    <Card className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-0 shadow-none">
      <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-5">
        <h2 className="flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          <span>Batches</span>
          <span className="text-[var(--muted-foreground)]/70">
            ({formatThousands(String(totalCount))})
          </span>
        </h2>
        <LiveIndicator />
      </header>

      {/* Desktop: flat table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <Th className="w-[8%] text-left">Batch</Th>
              <Th className="w-[14%] text-left">Sealed</Th>
              <Th className="w-[8%] text-right">Fills</Th>
              <Th className="w-[14%] text-right">Volume</Th>
              <Th
                className="w-[24%] text-left"
                title="Currency pairs traded in this batch"
              >
                Pairs
              </Th>
              <Th className="w-[12%] text-left">Status</Th>
              <Th
                className="w-[20%] text-left"
                title="On-chain Ethereum transaction that settled this batch"
              >
                L1 tx
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((batch) => (
              <BatchRow key={batch.number} batch={batch} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card-stack with mono register */}
      <ul className="flex flex-col md:hidden" aria-label="Batches">
        {rows.map((batch) => (
          <li
            key={batch.number}
            className="border-b border-[var(--border)] last:border-b-0"
          >
            <BatchRowMobile batch={batch} />
          </li>
        ))}
      </ul>

      <Pagination
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        onPrev={onPrev}
        onNext={onNext}
        onFirst={onFirst}
        onLast={onLast}
      />
    </Card>
  );
}

function Th({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <th
      scope="col"
      title={title}
      className={cn(
        "px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-[var(--muted-foreground)]",
        title ? "cursor-help" : undefined,
        className,
      )}
    >
      {children}
    </th>
  );
}

function BatchRow({ batch }: { batch: BatchFixture }) {
  const status = STATUS_DOT[batch.status];
  return (
    <tr className="group border-b border-[var(--border)] transition-[background-color] duration-75 ease-[var(--ease-standard)] last:border-b-0 hover:bg-[var(--muted)]/30 hover:-mt-px hover:border-t hover:border-[var(--border)]">
      <Td className="text-left">
        <Link
          href={`/batches/${batch.number}`}
          className="font-mono text-sm tabular-nums text-[var(--foreground)] underline-offset-4 hover:underline"
        >
          #{batch.number}
        </Link>
      </Td>
      <Td className="text-left text-[var(--muted-foreground)]">
        {formatRelativeTime(batch.sealedAt)}
      </Td>
      <Td className="text-right tabular-nums">
        {formatThousands(String(batch.fillCount))}
      </Td>
      <Td className="text-right tabular-nums">
        {batch.volumeUsd ? formatUSD(batch.volumeUsd) : "—"}
      </Td>
      <Td className="text-left">
        <PairsCluster pairs={batch.pairs ?? []} />
      </Td>
      <Td className="text-left">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <span className="font-mono text-xs">{status.label}</span>
        </span>
      </Td>
      <Td className="text-left">
        <HashRefCell
          hash={batch.settlementTx}
          copyLabel={`Copy settlement tx for batch #${batch.number}`}
          fallback="pending"
        />
      </Td>
    </tr>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "h-[40px] px-4 py-1.5 align-middle font-mono text-xs text-[var(--foreground)]",
        className,
      )}
    >
      {children}
    </td>
  );
}

function BatchRowMobile({ batch }: { batch: BatchFixture }) {
  const status = STATUS_DOT[batch.status];
  return (
    <Link
      href={`/batches/${batch.number}`}
      className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-[var(--muted)]/30"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm tabular-nums text-[var(--foreground)]">
          #{batch.number}
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <span className="font-mono text-xs text-[var(--muted-foreground)]">
            {status.label}
          </span>
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-[var(--muted-foreground)]">
        <span>{formatRelativeTime(batch.sealedAt)}</span>
        <span className="tabular-nums text-[var(--foreground)]">
          {batch.volumeUsd ? formatUSD(batch.volumeUsd) : "—"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-[var(--muted-foreground)]">
        <span className="shrink-0 tabular-nums">
          {formatThousands(String(batch.fillCount))} fills
        </span>
        <span className="min-w-0 flex-1 truncate text-right text-[var(--foreground)]">
          {(batch.pairs ?? []).length === 0
            ? "—"
            : (() => {
                const pairs = batch.pairs ?? [];
                const visible = pairs.slice(0, 2);
                const overflow = pairs.length - visible.length;
                return overflow > 0
                  ? `${visible.join(", ")} +${overflow}`
                  : visible.join(", ");
              })()}
        </span>
      </div>
    </Link>
  );
}

function PairsCluster({
  pairs,
  max = 3,
}: {
  pairs: readonly string[];
  max?: number;
}) {
  if (pairs.length === 0) {
    return (
      <span className="font-mono text-xs text-[var(--muted-foreground)]">—</span>
    );
  }
  const visible = pairs.slice(0, max);
  const overflow = pairs.length - visible.length;
  const label =
    overflow > 0
      ? `${visible.join(", ")} +${overflow}`
      : visible.join(", ");
  return (
    <span
      className="block truncate font-mono text-xs text-[var(--foreground)]"
      title={pairs.join(", ")}
    >
      {label}
    </span>
  );
}

function HashRefCell({
  hash,
  copyLabel,
  fallback,
}: {
  hash: string | null | undefined;
  copyLabel: string;
  fallback: string;
}) {
  if (!hash) {
    return (
      <span className="font-mono text-xs text-[var(--muted-foreground)]">
        {fallback}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <EtherscanTxLink hash={hash} label={truncateHash(hash, 8, 6)} />
      <CopyButton value={hash} label={copyLabel} className="h-5 w-5" />
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Live indicator                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function LiveIndicator() {
  return (
    <span
      role="status"
      aria-label="Live"
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
    >
      <span className="relative inline-flex h-1.5 w-1.5">
        <span
          aria-hidden
          className="absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-60 motion-safe:animate-ping"
        />
        <span
          aria-hidden
          className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--success)]"
        />
      </span>
      Live
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Loading + empty + error                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function SkeletonTable({ rows }: { rows: number }) {
  return (
    <Card
      aria-hidden
      className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-0 shadow-none"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 sm:px-5">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-3 w-12 animate-pulse rounded bg-[var(--muted)]" />
      </div>
      <ul className="flex flex-col">
        {Array.from({ length: rows }).map((_, idx) => (
          <li
            key={idx}
            className="flex h-[40px] items-center justify-between gap-4 border-b border-[var(--border)] px-4 last:border-b-0"
          >
            <div className="flex items-center gap-4">
              <div className="h-3 w-12 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-3 w-14 animate-pulse rounded bg-[var(--muted)]" />
            </div>
            <div className="hidden items-center gap-4 md:flex">
              <div className="h-3 w-10 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-3 w-20 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-3 w-24 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-3 w-32 animate-pulse rounded bg-[var(--muted)]" />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ListMessage({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center"
    >
      <p className="text-base font-medium leading-tight">{title}</p>
      <p className="max-w-md text-sm text-[var(--muted-foreground)]">
        {description}
      </p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Pagination                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function Pagination({
  rangeStart,
  rangeEnd,
  totalCount,
  page,
  totalPages,
  onPrev,
  onNext,
  onFirst,
  onLast,
}: {
  rangeStart: number;
  rangeEnd: number;
  totalCount: number;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
}) {
  const atFirst = page <= 1;
  const atLast = page >= totalPages;
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-center gap-1">
        <PagerButton
          onClick={onFirst}
          disabled={atFirst}
          ariaLabel="First page"
        >
          <span aria-hidden>{"⏮"}</span>
        </PagerButton>
        <PagerButton
          onClick={onPrev}
          disabled={atFirst}
          ariaLabel="Previous page"
        >
          <span aria-hidden>{"◀"}</span>
        </PagerButton>
        <span className="px-2 font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
          #{formatThousands(String(rangeStart))}
          {"–"}
          #{formatThousands(String(rangeEnd))}
        </span>
        <PagerButton
          onClick={onNext}
          disabled={atLast}
          ariaLabel="Next page"
        >
          <span aria-hidden>{"▶"}</span>
        </PagerButton>
        <PagerButton
          onClick={onLast}
          disabled={atLast}
          ariaLabel="Last page"
        >
          <span aria-hidden>{"⏭"}</span>
        </PagerButton>
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {formatThousands(String(totalCount))} batches
      </span>
    </div>
  );
}

function PagerButton({
  onClick,
  disabled,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "press-down inline-flex h-7 min-w-[28px] items-center justify-center rounded font-mono text-xs text-[var(--muted-foreground)] transition-colors",
        "hover:text-[var(--foreground)] hover:bg-[var(--muted)]/40",
        "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--muted-foreground)]",
      )}
    >
      {children}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function useSearchParam(name: string): string | null {
  const params = useSearchParams();
  return params.get(name);
}
