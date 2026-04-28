"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PageLayout } from "@/components/shell/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  batchesListFixtures,
  batchesSearchFixtures,
  usePageState,
} from "@/lib/fixtures";
import type { BatchFixture, MarketPair } from "@/lib/fixtures/types";
import {
  formatAbsoluteTime,
  formatRelativeTime,
  formatThousands,
  formatUSD,
} from "@/lib/format";

import { AttestationStatus } from "./attestation-status";
import { EtherscanTxLink } from "./etherscan-link";

/**
 * BatchesListView — the public settlement explorer.
 *
 * Default state shows the last 100 sealed batches paginated client-side
 * (per omega-docs#5 Q3). Search by batch ID or tx hash narrows the table
 * to a search-results fixture. The page is read-only and renders
 * regardless of wallet state — privacy hard rule: NO counterparty IDs
 * anywhere on this surface.
 */

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

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

  // Search-results / search-no-results variants are not in the standard
  // PageState enum; expose them via a second `?search=results|no-results`
  // search-param so reviewers can reach them. The query echoes from the
  // fixture itself.
  const [search, setSearch] = React.useState("");
  const [pageSize, setPageSize] = React.useState<PageSize>(100);
  const [page, setPage] = React.useState(1);

  // The list view is M3 wireframe — `?search=` is the only documented way
  // to land on the search-results / search-no-results cells.
  const searchParam = useSearchParam("search");
  const searchFixture =
    searchParam === "results"
      ? batchesSearchFixtures.results
      : searchParam === "no-results"
        ? batchesSearchFixtures["no-results"]
        : null;

  // When the search-results fixture is in play, surface its query as the
  // input value so the chrome and the data agree.
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

  const heroDescription =
    "Sealed settlement batches with on-chain attestation. Public, verifiable.";

  return (
    <PageLayout
      width="wide"
      title="Batches"
      description={heroDescription}
    >
      {/* Toolbar — search + per-page selector */}
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
            className="pl-9 pr-16"
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
                variant="outline"
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
        <SkeletonRows rows={6} />
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
        <>
          <BatchesTable rows={pageRows} />
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}
    </PageLayout>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Table                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function BatchesTable({ rows }: { rows: BatchFixture[] }) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {/* Desktop table */}
        <table className="hidden w-full text-sm md:table">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left">
              <Th>Batch</Th>
              <Th>Sealed</Th>
              <Th align="right">Fills</Th>
              <Th align="right">Volume</Th>
              <Th>Pairs</Th>
              <Th>Attestation</Th>
              <Th>L1 tx</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((batch) => (
              <BatchRow key={batch.number} batch={batch} />
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <ul className="flex flex-col divide-y divide-[var(--border)] md:hidden">
          {rows.map((batch) => (
            <BatchCard key={batch.number} batch={batch} />
          ))}
        </ul>
      </div>
    </TooltipProvider>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]",
        align === "right" && "text-right",
      )}
    >
      {children}
    </th>
  );
}

function BatchRow({ batch }: { batch: BatchFixture }) {
  return (
    <tr
      onClick={(event) => {
        // Whole-row click: navigate to the batch detail unless the click
        // landed on another interactive element (the L1 etherscan link,
        // the copy button, etc.). This lets the row act like an Etherscan
        // index row without trapping nested affordances.
        const target = event.target as HTMLElement;
        if (target.closest("a:not([data-row-link]), button")) return;
        const link = event.currentTarget.querySelector<HTMLAnchorElement>(
          "a[data-row-link]",
        );
        link?.click();
      }}
      className="group cursor-pointer border-b border-[var(--border)] last:border-b-0 transition-colors hover:bg-[var(--muted)]/40"
    >
      <td className="px-4 py-3 align-middle">
        <Link
          href={`/batches/${batch.number}`}
          data-row-link
          className="inline-flex items-center gap-1 font-mono text-sm text-[var(--foreground)] transition-colors group-hover:text-[var(--foreground)]"
        >
          <Icon.Caret.Right className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" aria-hidden />
          #{batch.number}
        </Link>
      </td>
      <td className="px-4 py-3 align-middle">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default font-mono text-xs text-[var(--muted-foreground)]">
              {formatRelativeTime(batch.sealedAt)}
            </span>
          </TooltipTrigger>
          <TooltipContent>{formatAbsoluteTime(batch.sealedAt)}</TooltipContent>
        </Tooltip>
      </td>
      <td className="px-4 py-3 text-right align-middle font-mono text-sm tabular-nums">
        {formatThousands(String(batch.fillCount))}
      </td>
      <td className="px-4 py-3 text-right align-middle font-mono text-sm tabular-nums">
        {batch.volumeUsd ? formatUSD(batch.volumeUsd) : "—"}
      </td>
      <td className="px-4 py-3 align-middle">
        <PairChips pairs={batch.pairs ?? []} />
      </td>
      <td className="px-4 py-3 align-middle">
        <AttestationStatus status={batch.status} />
      </td>
      <td className="px-4 py-3 align-middle">
        {batch.settlementTx ? (
          <EtherscanTxLink hash={batch.settlementTx} />
        ) : (
          <span className="font-mono text-xs text-[var(--muted-foreground)]">—</span>
        )}
      </td>
    </tr>
  );
}

function BatchCard({ batch }: { batch: BatchFixture }) {
  return (
    <li>
      <Link
        href={`/batches/${batch.number}`}
        className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-[var(--muted)]/40"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-sm">
            <Icon.Caret.Right className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" aria-hidden />
            #{batch.number}
          </span>
          <AttestationStatus status={batch.status} />
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--muted-foreground)]">
          <span className="font-mono">{formatRelativeTime(batch.sealedAt)}</span>
          <span className="font-mono tabular-nums text-[var(--foreground)]">
            {batch.volumeUsd ? formatUSD(batch.volumeUsd) : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-mono text-[var(--muted-foreground)] tabular-nums">
            {formatThousands(String(batch.fillCount))} fills
          </span>
          <PairChips pairs={batch.pairs ?? []} compact />
        </div>
      </Link>
    </li>
  );
}

function PairChips({
  pairs,
  compact = false,
}: {
  pairs: MarketPair[];
  compact?: boolean;
}) {
  if (pairs.length === 0) {
    return <span className="font-mono text-xs text-[var(--muted-foreground)]">—</span>;
  }
  const limit = compact ? 2 : 3;
  const visible = pairs.slice(0, limit);
  const overflow = pairs.length - visible.length;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((pair) => (
        <Badge key={pair} variant="outline" className="font-mono text-[10px] uppercase tracking-[0.12em]">
          {pair}
        </Badge>
      ))}
      {overflow > 0 ? (
        <Badge variant="default" className="font-mono text-[10px] uppercase tracking-[0.12em]">
          +{overflow}
        </Badge>
      ) : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Loading + empty + error                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <ul className="divide-y divide-[var(--border)]">
        {Array.from({ length: rows }).map((_, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between gap-4 px-4 py-4"
            aria-hidden
          >
            <div className="h-3 w-24 animate-pulse rounded bg-[var(--muted)]" />
            <div className="h-3 w-20 animate-pulse rounded bg-[var(--muted)]" />
            <div className="hidden h-3 w-12 animate-pulse rounded bg-[var(--muted)] md:block" />
            <div className="hidden h-3 w-24 animate-pulse rounded bg-[var(--muted)] md:block" />
            <div className="hidden h-3 w-32 animate-pulse rounded bg-[var(--muted)] md:block" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--muted)]" />
            <div className="hidden h-3 w-28 animate-pulse rounded bg-[var(--muted)] md:block" />
          </li>
        ))}
      </ul>
    </div>
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

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={page <= 1}
      >
        Previous
      </Button>
      <span className="font-mono text-xs text-[var(--muted-foreground)] tabular-nums">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Next
      </Button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

// Wireframe-only `?search=` shortcut. `usePageState` is locked to the
// canonical PageState set; this surface needs an extra dial to reach the
// search-results / search-no-results fixtures. Production search lands
// in M6 against a real query parameter.
function useSearchParam(name: string): string | null {
  const params = useSearchParams();
  return params.get(name);
}
