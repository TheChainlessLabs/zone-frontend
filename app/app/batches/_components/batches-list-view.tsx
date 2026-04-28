"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { PageLayout } from "@/components/shell/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/lib/icons";
import {
  batchesListFixtures,
  batchesSearchFixtures,
  usePageState,
} from "@/lib/fixtures";
import type { BatchFixture } from "@/lib/fixtures/types";

import Variant07List from "../preview/_variants/variant-07-aztec-proof-hero/list";

/**
 * BatchesListView — the public settlement explorer.
 *
 * Default state shows the last 100 sealed batches paginated client-side
 * (per omega-docs#5 Q3). Search by batch ID or tx hash narrows the table
 * to a search-results fixture. The page is read-only and renders
 * regardless of wallet state — privacy hard rule: NO counterparty IDs
 * anywhere on this surface.
 *
 * Row rendering is delegated to the Aztec-proof-hero variant (status-tone
 * leading band per row + proof reference inline). The chrome around it —
 * search box, per-page selector, pagination, state-machine forks — lives
 * here.
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
          <Variant07List
            fixture={{ batches: pageRows }}
            buildHref={(n) => `/batches/${n}`}
          />
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
/*  Loading + empty + error                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <ul className="flex flex-col gap-3" aria-hidden>
      {Array.from({ length: rows }).map((_, idx) => (
        <li
          key={idx}
          className="flex items-stretch gap-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
        >
          <div className="w-1 shrink-0 bg-[var(--muted)]" />
          <div className="flex flex-1 items-center justify-between gap-3 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--muted)]" />
              <div className="h-3 w-24 animate-pulse rounded bg-[var(--muted)]" />
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="h-3 w-16 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-3 w-20 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-3 w-28 animate-pulse rounded bg-[var(--muted)]" />
            </div>
          </div>
        </li>
      ))}
    </ul>
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

function useSearchParam(name: string): string | null {
  const params = useSearchParams();
  return params.get(name);
}
