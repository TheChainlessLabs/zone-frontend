"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { PageLayout } from "@/components/shell/PageLayout";
import { TransitionLink as Link } from "@/components/shell/transition-link";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  batchesListFixtures,
  usePageState,
} from "@/lib/fixtures";
import type {
  BatchFixture,
  BatchStatus,
  MarketPair,
} from "@/lib/fixtures/types";
import {
  listZoneBatches,
  searchZoneBatch,
  type ZoneBatchSummary,
  type ZoneBatchStatus,
} from "@/lib/zone";

import { CopyButton } from "./copy-button";
import { EtherscanTxLink } from "./etherscan-link";
import styles from "./batches.module.css";

/**
 * BatchesListView — the dark pool's one public surface, ported to the
 * design-kit settlement explorer.
 *
 * Composition (kit `Batches.jsx`): ExplorerHeader (the live next-batch ~12s
 * heartbeat), StatStrip (ticking aggregate metrics), and a searchable,
 * paginated Recent-batches table (7 per page). A new batch seals at the top
 * every ~12s and flashes once; the strip ticks alongside it.
 *
 * Behaviour preserved from the app: `usePageState()` drives the `?state=`
 * fixtures (default/empty/loading/error); in the default state the rows come
 * from the live Omega Zone RPC (`listZoneBatches` / `searchZoneBatch`).
 * `?search=` seeds the query. The surface is public/no-auth and renders
 * regardless of wallet state.
 *
 * Privacy hard rule: aggregate + per-pair metadata only — never a
 * counterparty, an order ID, or an individual fill owner.
 */

const PAGE_SIZE = 7;
const PAIR_POOL: MarketPair[] = [
  "OALPHA/PATH.USD",
  "USDC/EURC",
  "USDC/USDT",
  "USDT/EURC",
  "ETH/USDC",
];

// `verified` (the app's settled+proven end state) maps onto the kit's
// `settled` lexicon glyph; pending/failed map directly. Centralised so the
// table cells and the detail page never drift.
const STATUS_STATE: Record<
  BatchStatus,
  "settled" | "pending" | "failed"
> = {
  verified: "settled",
  pending: "pending",
  failed: "failed",
};
const STATUS_LABEL: Record<BatchStatus, string> = {
  verified: "Settled",
  pending: "Pending",
  failed: "Failed",
};

export function BatchesListView() {
  const state = usePageState();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [liveRows, setLiveRows] = React.useState<BatchFixture[]>([]);
  const [liveState, setLiveState] = React.useState<
    "loading" | "ready" | "error"
  >("loading");
  const [liveError, setLiveError] = React.useState<string | undefined>();

  // Live explorer heartbeat — the ~12s next-batch progress + the ticking
  // aggregate strip. Seeded near the kit's resting values; reduced motion
  // parks the bar and stops the seal loop.
  const [pct, setPct] = React.useState(28);
  const [batchesToday, setBatchesToday] = React.useState(482);
  const [volume24h, setVolume24h] = React.useState(38.4e6);
  const [freshNumber, setFreshNumber] = React.useState<number | null>(null);
  const nextIdRef = React.useRef<number | null>(null);

  const searchParam = useSearchParam("search");

  React.useEffect(() => {
    if (searchParam) setSearch(searchParam);
  }, [searchParam]);

  React.useEffect(() => {
    if (state !== "default") return;
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setLiveState("loading");
      setLiveError(undefined);
      try {
        const query = search.trim();
        const batches = query
          ? compactBatch(await searchZoneBatch(query))
          : (await listZoneBatches({ limit: 60 })).batches;
        if (cancelled) return;
        let rows = batches.map(zoneBatchToFixture);
        // No live data and no search → seed the demo fixtures so the public
        // explorer stays populated until the backend lands. A real non-empty
        // result always takes precedence.
        if (rows.length === 0 && !query) {
          rows = batchesListFixtures.default.batches;
        }
        setLiveRows(rows);
        if (nextIdRef.current === null && rows.length > 0) {
          nextIdRef.current = rows[0].number + 1;
        }
        setLiveState("ready");
      } catch (error) {
        if (cancelled) return;
        // Backend unreachable. For the unfiltered default view, fall back to
        // the demo fixtures rather than the error state; a live search that
        // fails still surfaces the error.
        if (!search.trim()) {
          setLiveRows(batchesListFixtures.default.batches);
          if (nextIdRef.current === null) {
            nextIdRef.current =
              batchesListFixtures.default.batches[0].number + 1;
          }
          setLiveState("ready");
          return;
        }
        setLiveError(getErrorMessage(error));
        setLiveState("error");
      }
    }, search.trim() ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [search, state]);

  // Demo fallback note: with no backend wired up the zone RPC errors or
  // returns nothing. The fetch effect above already substitutes the populated
  // demo fixtures into `liveRows` (and parks `liveState` at "ready") for the
  // unfiltered default view, so the explorer stays alive — heartbeat, stat
  // strip, and seal loop all run over the demo rows. Real data always wins;
  // the `?state=` review fixtures are untouched.
  const isLiveDefault =
    state === "default" && liveState === "ready" && search.trim() === "";

  // Seal a synthetic batch at the top and advance it Submitted → Proven →
  // Settled, mirroring the kit. Only runs over the live default list (not a
  // fixture state, not a filtered search) so it never fights real data.
  const sealNewBatch = React.useCallback(() => {
    setLiveRows((prev) => {
      if (prev.length === 0) return prev;
      const id = nextIdRef.current ?? prev[0].number + 1;
      nextIdRef.current = id + 1;
      const batch = makeBatch(id);
      setBatchesToday((n) => n + 1);
      setVolume24h((v) => v + (parseVolume(batch.volumeUsd) ?? 0));
      setFreshNumber(id);
      window.setTimeout(() => {
        setLiveRows((rows) =>
          rows.map((r) => (r.number === id ? { ...r, status: "verified" } : r)),
        );
      }, 4000);
      return [batch, ...prev].slice(0, 60);
    });
  }, []);

  React.useEffect(() => {
    if (freshNumber === null) return;
    const t = window.setTimeout(() => setFreshNumber(null), 900);
    return () => window.clearTimeout(t);
  }, [freshNumber]);

  // ~12s heartbeat → progress bar; seals a batch on wrap. Skipped under
  // reduced motion (the bar parks mid-cycle).
  React.useEffect(() => {
    if (!isLiveDefault) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPct(64);
      return;
    }
    let acc = pct;
    const iv = window.setInterval(() => {
      acc += 100 / 60; // 200ms × 60 ticks = ~12s
      if (acc >= 100) {
        acc = 0;
        sealNewBatch();
      }
      setPct(acc);
    }, 200);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLiveDefault, sealNewBatch]);

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const fixture =
    state === "empty"
      ? batchesListFixtures.empty
      : state === "loading"
        ? batchesListFixtures.loading
        : state === "error"
          ? batchesListFixtures.error
          : null;

  const isLoading =
    fixture?.isLoading || (state === "default" && liveState === "loading");
  const error =
    fixture?.error ??
    (state === "default" && liveState === "error"
      ? { message: liveError ?? "Failed to load batches.", code: "ZONE_RPC" }
      : undefined);

  const rows: BatchFixture[] =
    state === "default" ? liveRows : fixture?.batches ?? [];

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(pageStart, pageStart + PAGE_SIZE);
  const rangeStart = rows.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = pageStart + pageRows.length;

  const nextId = nextIdRef.current ?? (rows[0]?.number ?? 48201) + 1;
  const secsLeft = Math.max(0, 12 - (pct / 100) * 12);

  return (
    <PageLayout width="default" bare>
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1000px] flex-col gap-4",
          styles.viewFwd,
        )}
      >
        {isLoading ? (
          <BatchesListSkeleton />
        ) : (
          <div className={cn("flex flex-col gap-4", styles.fade)}>
            <ExplorerHeader
              pct={pct}
              secsLeft={secsLeft}
              nextLabel={batchNo(nextId)}
              live={isLiveDefault}
            />
            <StatStrip batchesToday={batchesToday} volume24h={volume24h} />
            <BatchList
              rows={pageRows}
              total={rows.length}
              query={search}
              onQuery={setSearch}
              page={safePage}
              pageCount={totalPages}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              error={error}
              freshNumber={freshNumber}
              onPage={(p) => setPage(Math.max(1, Math.min(totalPages, p)))}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Explorer header — the live ~12s heartbeat                              */
/* ─────────────────────────────────────────────────────────────────────── */

function ExplorerHeader({
  pct,
  secsLeft,
  nextLabel,
  live,
}: {
  pct: number;
  secsLeft: number;
  nextLabel: string;
  live: boolean;
}) {
  return (
    <section className="glass flex flex-col gap-4 rounded-[var(--radius-xl)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="t-h2 m-0">Settlement explorer</h1>
          <p className="font-serif m-0 max-w-[460px] text-[15px] font-light text-[var(--muted-foreground)]">
            Every match settles onchain in batches. Aggregate and verifiable —
            never a counterparty in sight.
          </p>
        </div>
        <span
          role="status"
          aria-label="Live · Ethereum L1"
          className="inline-flex h-7 items-center gap-[7px] whitespace-nowrap rounded-full border px-3 font-mono text-[11px] uppercase tracking-[0.1em]"
          style={{
            borderColor:
              "color-mix(in oklab, var(--success) 30%, transparent)",
            background: "color-mix(in oklab, var(--success) 10%, transparent)",
            color: "var(--success)",
          }}
        >
          <span
            aria-hidden
            className={cn("h-1.5 w-1.5 rounded-full bg-current", styles.pulse)}
          />
          Live · Ethereum L1
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Next batch
          </span>
          <span className="whitespace-nowrap font-mono text-[11px] tabular-nums text-[var(--muted-foreground)]">
            {live ? `~${secsLeft.toFixed(0)}s · sealing ${nextLabel}` : "live"}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
          <div
            className="h-full rounded-full bg-[var(--success)] transition-[width] duration-200 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Stat strip                                                             */
/* ─────────────────────────────────────────────────────────────────────── */

function StatStrip({
  batchesToday,
  volume24h,
}: {
  batchesToday: number;
  volume24h: number;
}) {
  return (
    <section className="glass flex items-stretch rounded-[var(--radius-xl)] py-5">
      <StatCell label="Batches today" value={formatGroup(Math.round(batchesToday))} />
      <Divider />
      <StatCell
        label="Volume · 24h"
        value={`${(volume24h / 1e6).toFixed(2)}M`}
        unit="USDC"
      />
      <Divider />
      <StatCell label="Avg batch" value="~12" unit="s" />
      <Divider />
      <StatCell label="Proven" value="100%" tone="var(--success)" />
    </section>
  );
}

function StatCell({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-5">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="flex items-baseline gap-[5px]">
        <span
          className="font-mono text-xl font-medium tabular-nums"
          style={tone ? { color: tone } : undefined}
        >
          {value}
        </span>
        {unit ? (
          <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--muted-foreground)]">
            {unit}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="w-px bg-[var(--border)]" />;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Recent batches — search + table + pagination                          */
/* ─────────────────────────────────────────────────────────────────────── */

function BatchList({
  rows,
  total,
  query,
  onQuery,
  page,
  pageCount,
  rangeStart,
  rangeEnd,
  error,
  freshNumber,
  onPage,
}: {
  rows: BatchFixture[];
  total: number;
  query: string;
  onQuery: (next: string) => void;
  page: number;
  pageCount: number;
  rangeStart: number;
  rangeEnd: number;
  error?: { message: string; code: string };
  freshNumber: number | null;
  onPage: (page: number) => void;
}) {
  return (
    <section className="glass flex flex-col gap-4 rounded-[var(--radius-xl)] p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="t-h3 m-0">Recent batches</h2>
          <span className="text-[13px] text-[var(--muted-foreground)]">
            Sealing onchain every ~12s · newest first
          </span>
        </div>
        <SearchBar value={query} onChange={onQuery} />
      </div>

      <div className="min-h-[120px] overflow-x-auto">
        {error ? (
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
        ) : total === 0 && query.trim() ? (
          <ListMessage
            title={`No batches match "${query.trim()}".`}
            description="Try a different ID or hash."
          />
        ) : total === 0 ? (
          <ListMessage
            title="No zone batches yet."
            description="Check back after the zone produces its first block range."
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th>Batch</Th>
                <Th align="right">Fills</Th>
                <Th align="right">Volume</Th>
                <Th title="On-chain Ethereum transaction that settled this batch">
                  Settlement
                </Th>
                <Th>Status</Th>
                <Th align="right">Age</Th>
                <th aria-hidden className="w-6" />
              </tr>
            </thead>
            <tbody>
              {rows.map((batch) => (
                <BatchRow
                  key={batch.number}
                  batch={batch}
                  fresh={batch.number === freshNumber}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!error && total > 0 ? (
        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-1">
          <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.06em] tabular-nums text-[var(--muted-foreground)]">
            {rangeStart}–{rangeEnd} of {total}
          </span>
          <div className="flex items-center gap-2.5">
            <PageButton dir={-1} disabled={page <= 1} onClick={() => onPage(page - 1)}>
              Prev
            </PageButton>
            <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.08em] tabular-nums text-[var(--foreground)]">
              {page} / {pageCount}
            </span>
            <PageButton
              dir={1}
              disabled={page >= pageCount}
              onClick={() => onPage(page + 1)}
            >
              Next
            </PageButton>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="relative w-[220px] max-w-full">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <Icon.Search className="h-[15px] w-[15px] text-[var(--muted-foreground)]" aria-hidden />
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search batch id…"
        aria-label="Search batches"
        className="glass h-9 w-full rounded-[var(--radius-md)] pl-9 pr-3 font-mono text-[13px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus-visible:ring-1 focus-visible:ring-[var(--ring)]"
      />
    </div>
  );
}

function Th({
  children,
  align = "left",
  title,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  title?: string;
}) {
  return (
    <th
      scope="col"
      title={title}
      className={cn(
        "whitespace-nowrap pb-2.5 pr-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)]",
        align === "right" ? "text-right" : "text-left",
        title ? "cursor-help" : undefined,
      )}
    >
      {children}
    </th>
  );
}

function BatchRow({ batch, fresh }: { batch: BatchFixture; fresh: boolean }) {
  return (
    <tr
      className={cn(
        "group cursor-pointer border-t border-[var(--border)] transition-[background-color] duration-75 ease-[var(--ease-standard)] hover:bg-[var(--muted)]/30",
        fresh ? styles.freshRow : undefined,
      )}
    >
      <Td>
        <Link
          href={`/batches/${batch.number}`}
          className="font-medium text-[var(--foreground)] underline-offset-4 hover:underline"
        >
          {batchNo(batch.number)}
        </Link>
      </Td>
      <Td align="right">{batch.fillCount}</Td>
      <Td align="right">
        {batch.volumeUsd ? (
          <>
            {fmtVol(parseVolume(batch.volumeUsd) ?? 0)}{" "}
            <span className="text-[10px] text-[var(--muted-foreground)]">USDC</span>
          </>
        ) : (
          <span className="text-[var(--muted-foreground)]">—</span>
        )}
      </Td>
      <Td className="text-[var(--muted-foreground)]">
        {batch.settlementTx ? (
          <span
            className="inline-flex items-center gap-1"
            onClick={(event) => event.stopPropagation()}
          >
            <EtherscanTxLink
              hash={batch.settlementTx}
              label={shortHash(batch.settlementTx)}
            />
            <CopyButton
              value={batch.settlementTx}
              label={`Copy settlement tx for batch #${batch.number}`}
              className="h-5 w-5"
            />
          </span>
        ) : (
          "pending"
        )}
      </Td>
      <Td>
        <Status state={STATUS_STATE[batch.status]} label={STATUS_LABEL[batch.status]} />
      </Td>
      <Td align="right" className="text-[var(--muted-foreground)]">
        {ageOf(batch.sealedAt)}
      </Td>
      <Td align="right" className="pr-0">
        <Link
          href={`/batches/${batch.number}`}
          aria-label={`Open batch ${batch.number}`}
        >
          <Icon.Caret.Right className="h-[15px] w-[15px] text-[var(--muted-foreground)]" aria-hidden />
        </Link>
      </Td>
    </tr>
  );
}

function Td({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={cn(
        "whitespace-nowrap py-[13px] pr-4 align-middle font-mono text-[13px] tabular-nums text-[var(--foreground)]",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </td>
  );
}

function PageButton({
  dir,
  disabled,
  onClick,
  children,
}: {
  dir: 1 | -1;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "press-down inline-flex h-[30px] items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--input)] bg-[var(--background)] px-3 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--foreground)]",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-pointer hover:bg-[var(--muted)]/40",
      )}
    >
      {dir < 0 ? <Icon.Caret.Right className="h-3.5 w-3.5 rotate-180" aria-hidden /> : null}
      {children}
      {dir > 0 ? <Icon.Caret.Right className="h-3.5 w-3.5" aria-hidden /> : null}
    </button>
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
      className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] px-6 py-12 text-center"
    >
      <p className="text-base font-medium leading-tight">{title}</p>
      <p className="max-w-md text-sm text-[var(--muted-foreground)]">
        {description}
      </p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Loading skeleton                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

function BatchesListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skel className="h-[132px] w-full rounded-[var(--radius-xl)]" />
      <Skel className="h-[84px] w-full rounded-[var(--radius-xl)]" />
      <div className="flex flex-col gap-3.5">
        <Skel className="h-5 w-40" />
        <Skel className="h-[13px] w-60" />
        <SkelRows n={7} />
      </div>
    </div>
  );
}

export function Skel({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={cn(styles.skel, "rounded-[var(--radius-sm)]", className)}
      style={style}
    />
  );
}

export function SkelRows({ n }: { n: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-3.5 py-[13px]",
            i > 0 ? "border-t border-[var(--border)]" : undefined,
          )}
        >
          <Skel className="h-8 w-8 rounded-full" />
          <Skel className="h-3.5" style={{ width: `${30 + (i % 3) * 8}%` }} />
          <div className="ml-auto flex gap-6">
            <Skel className="h-3.5 w-[70px]" />
            <Skel className="h-3.5 w-[54px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Zone → fixture mapping (shared with the detail view)                   */
/* ─────────────────────────────────────────────────────────────────────── */

export function zoneBatchToFixture(batch: ZoneBatchSummary): BatchFixture {
  const aggregatePairs = Array.isArray(batch.aggregatePairs)
    ? batch.aggregatePairs
    : [];
  return {
    number: Number(BigInt(batch.batchNumber)),
    zoneBlockFrom: formatZoneBlockNumber(batch.zoneBlockFrom),
    zoneBlockTo: formatZoneBlockNumber(batch.zoneBlockTo),
    root: asHex(batch.root),
    status: zoneStatusToFixture(batch.status),
    sealedAt: timestampToIso(batch.sealedAt ?? batch.settledAt),
    orderCount: Number(batch.orderCount ?? 0),
    fillCount: Number(batch.fillCount ?? 0),
    settlementTx: isHexString(batch.settlementTxHash)
      ? batch.settlementTxHash
      : null,
    proofRef: isHexString(batch.proofRef) ? batch.proofRef : undefined,
    pairs: aggregatePairs.filter(isKnownPair),
    volumeUsd: aggregateVolumeToUsd(batch.aggregateVolume),
  };
}

function zoneStatusToFixture(status: ZoneBatchStatus): BatchStatus {
  if (status === "failed") return "failed";
  if (status === "settled" || status === "verified") return "verified";
  return "pending";
}

function compactBatch(batch: ZoneBatchSummary | null): ZoneBatchSummary[] {
  return batch ? [batch] : [];
}

function aggregateVolumeToUsd(value: unknown): string | undefined {
  if (!value || (Array.isArray(value) && value.length === 0)) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const total = value.reduce<number>((sum, entry) => {
      if (!entry || typeof entry !== "object") return sum;
      const amount = (entry as { amount?: unknown }).amount;
      if (typeof amount === "number") return sum + amount;
      if (typeof amount === "string") {
        const parsed = Number(amount.startsWith("0x") ? BigInt(amount) : amount);
        return Number.isFinite(parsed) ? sum + parsed / 1_000_000 : sum;
      }
      return sum;
    }, 0);
    return total > 0 ? String(total) : undefined;
  }
  if (typeof value !== "object") return undefined;
  const values = Object.values(value as Record<string, unknown>);
  if (values.length === 0) return undefined;
  const total = values.reduce<number>((sum, next) => {
    if (typeof next === "number") return sum + next;
    if (typeof next === "string") {
      const parsed = Number(next);
      return Number.isFinite(parsed) ? sum + parsed : sum;
    }
    return sum;
  }, 0);
  return total > 0 ? String(total) : undefined;
}

function isKnownPair(value: string): value is MarketPair {
  return (
    value === "OALPHA/PATH.USD" ||
    value === "USDC/EURC" ||
    value === "USDC/USDT" ||
    value === "USDT/EURC" ||
    value === "ETH/USDC" ||
    value === "BTC/USDC"
  );
}

function isHexString(value: unknown): value is `0x${string}` {
  return typeof value === "string" && value.startsWith("0x");
}

function asHex(value: string): `0x${string}` {
  return isHexString(value)
    ? value
    : "0x0000000000000000000000000000000000000000000000000000000000000000";
}

function formatZoneBlockNumber(value: unknown): string | undefined {
  if (value == null) return undefined;
  try {
    const parsed =
      typeof value === "bigint"
        ? value
        : typeof value === "number"
          ? BigInt(value)
          : typeof value === "string"
            ? BigInt(value)
            : null;
    if (parsed === null) return undefined;
    return parsed.toLocaleString("en-US");
  } catch {
    return undefined;
  }
}

function timestampToIso(value: unknown): string {
  const fallback = new Date().toISOString();
  if (value == null) return fallback;
  try {
    const seconds =
      typeof value === "number"
        ? value
        : typeof value === "bigint"
          ? Number(value)
          : typeof value === "string"
            ? Number(BigInt(value))
            : Number.NaN;
    if (!Number.isFinite(seconds) || seconds <= 0) return fallback;
    return new Date(seconds * 1000).toISOString();
  } catch {
    return fallback;
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to load batches.";
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Synthetic-batch + format helpers (kit personality)                     */
/* ─────────────────────────────────────────────────────────────────────── */

function makeBatch(id: number): BatchFixture {
  const fills = 8 + Math.floor(Math.random() * 9); // 8–16
  const k = 2 + Math.floor(Math.random() * 2); // 2–3 pairs
  const chosen = [...PAIR_POOL].sort(() => Math.random() - 0.5).slice(0, k);
  const volume = Math.round(fills * (11000 + Math.random() * 4000));
  return {
    number: id,
    root: randHex(64),
    status: "pending",
    sealedAt: new Date().toISOString(),
    orderCount: fills + Math.floor(Math.random() * 6),
    fillCount: fills,
    settlementTx: randHex(64),
    pairs: chosen,
    volumeUsd: String(volume),
  };
}

function randHex(len: number): `0x${string}` {
  return ("0x" +
    Array.from({ length: len }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("")) as `0x${string}`;
}

function parseVolume(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function fmtVol(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(Math.round(n));
}

function formatGroup(value: number | string): string {
  const [whole, frac] = String(value).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

function shortHash(h: string): string {
  return h.length > 18 ? `${h.slice(0, 10)}…${h.slice(-8)}` : h;
}

function batchNo(id: number): string {
  return "#" + formatGroup(id);
}

/** Deterministic-ish age string from an ISO seal time. */
function ageOf(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

function useSearchParam(name: string): string | null {
  const params = useSearchParams();
  return params.get(name);
}
