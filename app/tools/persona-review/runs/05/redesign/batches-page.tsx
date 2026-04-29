// /batches rebuilt as an editorial public record: masthead lede, dated rule, run-of-paper attestation column, marginalia rail.
// Persona 05 (Luca Bianchi) — restraint over chrome; Source Serif 4 italic earns its place exactly twice; mono carries the data plane.

"use client";

import * as React from "react";
import Link from "next/link";
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
import {
  ageVs,
  computeListTotals,
  fmtCompactUsd,
  fmtUsd,
  formatStampUtc,
  HashCell,
  latestSealedAt,
  parseNum,
  STATUS_TONE,
} from "@/app/batches/preview/_variants/_shared";

/**
 * BatchesEditorialView — public attestation log, set as a financial paper.
 *
 * Reading order is editorial, not databasy:
 *   1. Masthead — name + ISO date of the latest seal, like a paper of record.
 *   2. Dek (Source Serif 4 italic, 18px) — one sentence on why this page exists.
 *   3. Standfirst rule — totals expressed as a sentence, not a stat-band.
 *   4. Run-of-paper — every sealed batch as a numbered entry with a single
 *      tonal bar at left. Status reads down the left margin like an editor's
 *      margin ticks.
 *   5. Marginalia rail — search, filters, page size sit in a right-hand rail
 *      so the column of batches is never broken by chrome.
 *
 * The page renders public, aggregate data only. Counterparty information is
 * by design absent — that absence is the editorial point and is named once,
 * in the dek, in italic.
 */

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export function BatchesEditorialView() {
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

  const params = useSearchParams();
  const searchParam = params.get("search");
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

  const reference = latestSealedAt(fixture);
  const totals = computeListTotals(fixture);

  return (
    <PageLayout width="wide">
      {/* MASTHEAD ─────────────────────────────────────────────────────── */}
      <header className="mb-8 border-b border-[var(--border)] pb-6">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-[28px] font-semibold tracking-tight leading-none">
            Attestation Log
          </h1>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Edition · {formatStampUtc(reference)}
          </span>
        </div>
        <p
          className="mt-3 max-w-[58ch] text-[18px] leading-[1.45] text-[var(--muted-foreground)]"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
        >
          A public ledger of sealed settlement batches. Counterparty names —
          by design — appear nowhere on this page.
        </p>
      </header>

      {/* STANDFIRST — totals as a sentence, not a stat band ──────────── */}
      <Standfirst totals={totals} reference={reference} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
        {/* RUN OF PAPER ──────────────────────────────────────────────── */}
        <section>
          {searchFixture && searchFixture.results.length === 0 ? (
            <EditorialNote
              eyebrow="No record"
              title={`No batch matches "${searchFixture.query}".`}
              body="The log holds the most recent 100 sealed batches. Try a different identifier or proof hash."
            />
          ) : isLoading ? (
            <RunSkeleton rows={8} />
          ) : error ? (
            <EditorialNote
              eyebrow="Pressroom error"
              title="The log could not be retrieved."
              body="The attestation feed is unreachable. Refresh to try again — sealed batches remain valid offchain regardless."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.reload();
                    }
                  }}
                >
                  Retry
                </Button>
              }
            />
          ) : rows.length === 0 ? (
            <EditorialNote
              eyebrow="Pre-press"
              title="No batches sealed yet."
              body="The first edition appears once the matching engine seals its inaugural batch. The log will populate from the top."
            />
          ) : (
            <>
              <ol className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {pageRows.map((batch, idx) => (
                  <BatchEntry
                    key={batch.number}
                    batch={batch}
                    referenceIso={reference}
                    ordinal={pageStart + idx + 1}
                  />
                ))}
              </ol>
              <Colophon
                page={safePage}
                totalPages={totalPages}
                count={pageRows.length}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </>
          )}
        </section>

        {/* MARGINALIA ────────────────────────────────────────────────── */}
        <aside className="order-first space-y-6 lg:order-last lg:sticky lg:top-24 lg:self-start">
          <RailSection label="Find a batch">
            <div className="relative flex items-center">
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
                placeholder="Batch ID or 0x…"
                aria-label="Search the attestation log"
                className="pl-9 pr-14"
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
          </RailSection>

          <RailSection label="Edition window">
            <p className="font-mono text-xs leading-relaxed text-[var(--muted-foreground)]">
              The log holds the last 100 sealed batches. Older editions roll
              off as new batches seal.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 h-8 w-full justify-between gap-1 font-mono text-xs"
                >
                  Per page · {pageSize}
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
          </RailSection>

          <RailSection label="Privacy clause">
            <p className="font-mono text-[11px] leading-[1.55] text-[var(--muted-foreground)]">
              Aggregate volumes, fill counts, pair tags, proof references.
              No addresses. No order IDs. No counterparties.
            </p>
          </RailSection>
        </aside>
      </div>
    </PageLayout>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Standfirst — totals as one editorial sentence with mono inserts       */
/* ────────────────────────────────────────────────────────────────────── */

function Standfirst({
  totals,
  reference,
}: {
  totals: ReturnType<typeof computeListTotals>;
  reference: string;
}) {
  return (
    <p className="max-w-[78ch] text-[15px] leading-[1.7] text-[var(--foreground)]">
      Across the last{" "}
      <Mono>{totals.batchCount}</Mono> sealed batches —{" "}
      <Mono>{totals.verifiedCount}</Mono> verified,{" "}
      <Mono>{totals.pendingCount}</Mono> pending,{" "}
      <Mono>{totals.failedCount}</Mono> reverted on L1 — the matching engine
      cleared <Mono>{totals.totalFills.toLocaleString("en-US")}</Mono> fills
      against{" "}
      <Mono>{totals.totalOrders.toLocaleString("en-US")}</Mono>{" "}
      orders for a notional of{" "}
      <Mono>${fmtUsd(totals.totalUsd, 0)}</Mono>. Most recent seal:{" "}
      <Mono>{formatStampUtc(reference)}</Mono>.
    </p>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono tabular-nums text-[var(--foreground)]">
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Run of paper                                                          */
/* ────────────────────────────────────────────────────────────────────── */

function BatchEntry({
  batch,
  referenceIso,
  ordinal,
}: {
  batch: BatchFixture;
  referenceIso: string;
  ordinal: number;
}) {
  const tone = STATUS_TONE[batch.status];
  const pairs = (batch.pairs ?? []).slice(0, 3);
  return (
    <li>
      <Link
        href={`/batches/${batch.number}`}
        className="group flex gap-5 px-1 py-5 transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]"
      >
        {/* Ordinal — set in mono uppercase like a paper's entry number */}
        <div className="hidden w-12 shrink-0 pt-[2px] font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] md:block">
          № {String(ordinal).padStart(3, "0")}
        </div>

        {/* Status rule — single tonal stripe replaces the pill chrome */}
        <div
          aria-hidden
          className="w-px shrink-0"
          style={{ backgroundColor: tone.fg, opacity: 0.85 }}
        />

        <div className="flex flex-1 flex-col gap-2">
          {/* Headline line: status + batch + sealed-at */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div className="flex items-baseline gap-3">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: tone.fg }}
              >
                {tone.label}
              </span>
              <h3 className="font-mono text-[17px] font-medium leading-none tracking-tight">
                Batch #{batch.number}
              </h3>
            </div>
            <time
              className="font-mono text-[11px] tabular-nums text-[var(--muted-foreground)]"
              dateTime={batch.sealedAt}
            >
              {ageVs(referenceIso, batch.sealedAt)} ago ·{" "}
              {formatStampUtc(batch.sealedAt)}
            </time>
          </div>

          {/* Standfirst — one sentence rather than a chip rack */}
          <p className="text-[13px] leading-[1.55] text-[var(--muted-foreground)]">
            <Mono>{batch.fillCount}</Mono> fills against{" "}
            <Mono>{batch.orderCount}</Mono> orders, notional{" "}
            <Mono>
              {batch.volumeUsd
                ? fmtCompactUsd(parseNum(batch.volumeUsd))
                : "—"}
            </Mono>
            {pairs.length > 0 ? (
              <>
                {" "}
                across{" "}
                {pairs.map((p, i) => (
                  <React.Fragment key={p}>
                    {i > 0 ? ", " : ""}
                    <span className="font-mono text-[var(--foreground)]">
                      {p}
                    </span>
                  </React.Fragment>
                ))}
              </>
            ) : null}
            .
          </p>

          {/* Footnote — proof reference, set as colophon */}
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            <span>Proof</span>
            {batch.proofRef ? (
              <span className="text-[var(--foreground)] tracking-normal normal-case">
                <HashCell hash={batch.proofRef} lead={6} tail={4} />
              </span>
            ) : (
              <span className="tracking-normal normal-case">pending</span>
            )}
            <span aria-hidden className="text-[var(--border)]">
              ·
            </span>
            <span>read entry →</span>
          </div>
        </div>
      </Link>
    </li>
  );
}

function RunSkeleton({ rows }: { rows: number }) {
  return (
    <ol
      className="divide-y divide-[var(--border)] border-y border-[var(--border)]"
      aria-hidden
    >
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex gap-5 px-1 py-5">
          <div className="hidden w-12 shrink-0 pt-[2px] md:block">
            <div className="h-3 w-8 animate-pulse rounded bg-[var(--muted)]" />
          </div>
          <div className="w-px shrink-0 bg-[var(--border)]" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-16 animate-pulse rounded bg-[var(--muted)]" />
                <div className="h-4 w-32 animate-pulse rounded bg-[var(--muted)]" />
              </div>
              <div className="h-3 w-40 animate-pulse rounded bg-[var(--muted)]" />
            </div>
            <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--muted)]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--muted)]" />
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Editorial note — the empty / error / no-results state, written as a   */
/*  short editor's note rather than a generic empty state.                */
/* ────────────────────────────────────────────────────────────────────── */

function EditorialNote({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="border-y border-[var(--border)] py-16 text-left"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
        {eyebrow}
      </p>
      <p className="mt-3 max-w-[52ch] text-[20px] font-medium leading-[1.3]">
        {title}
      </p>
      <p
        className="mt-3 max-w-[52ch] text-[16px] leading-[1.55] text-[var(--muted-foreground)]"
        style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
      >
        {body}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Colophon — pagination written as a foot-of-page rule                  */
/* ────────────────────────────────────────────────────────────────────── */

function Colophon({
  page,
  totalPages,
  count,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {count} entries · page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
          className="min-h-[44px] md:min-h-0"
        >
          ← Earlier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
          className="min-h-[44px] md:min-h-0"
        >
          Later →
        </Button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Marginalia rail                                                       */
/* ────────────────────────────────────────────────────────────────────── */

function RailSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
        {label}
      </h2>
      {children}
    </section>
  );
}
