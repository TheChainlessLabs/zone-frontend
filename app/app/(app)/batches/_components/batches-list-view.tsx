"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageLayout } from "@/components/shell/PageLayout";
import { TransitionLink as Link } from "@/components/shell/transition-link";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  listZoneBatches,
  searchZoneBatch,
  type ZoneBatchSummary,
} from "@/lib/zone";

import {
  averageSettlementInterval,
  type BatchRecord,
  type BatchRecordStatus,
  formatBatchNumber,
  formatBatchVolumes,
  formatDuration,
  zoneBatchToRecord,
} from "./batch-data";
import { CopyButton } from "./copy-button";
import { TempoTxLink } from "./etherscan-link";
import styles from "./batches.module.css";

/**
 * BatchesListView — the dark pool's one public surface, ported to the
 * design-kit settlement explorer.
 *
 * Rows and metrics come exclusively from the live Omega Zone batch RPC. The
 * cursor returned by `zone_listBatches` drives pagination; `?search=` seeds a
 * server-side batch/settlement-transaction search.
 *
 * Privacy hard rule: aggregate + per-pair metadata only — never a
 * counterparty, an order ID, or an individual fill owner.
 */

const PAGE_SIZE = 7;

// Map RPC states onto the existing status glyph vocabulary without changing
// their user-facing labels.
const STATUS_STATE: Record<
  BatchRecordStatus,
  "settled" | "pending" | "proven" | "failed"
> = {
  pending: "pending",
  submitted: "settled",
  verified: "proven",
  failed: "failed",
};
const STATUS_LABEL: Record<BatchRecordStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  verified: "Verified",
  failed: "Failed",
};

export function BatchesListView() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [cursors, setCursors] = React.useState<(string | undefined)[]>([
    undefined,
  ]);
  const [nextCursor, setNextCursor] = React.useState<string | undefined>();
  const [liveRows, setLiveRows] = React.useState<BatchRecord[]>([]);
  const [liveState, setLiveState] = React.useState<
    "loading" | "ready" | "error"
  >("loading");
  const [liveError, setLiveError] = React.useState<string | undefined>();

  const searchParam = useSearchParam("search");
  const cursor = cursors[page - 1];

  React.useEffect(() => {
    if (searchParam) setSearch(searchParam);
  }, [searchParam]);

  React.useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setLiveState("loading");
      setLiveError(undefined);
      try {
        const query = search.trim();
        const response = query
          ? {
              batches: compactBatch(await searchZoneBatch(query)),
              nextCursor: undefined,
            }
          : await listZoneBatches({ limit: PAGE_SIZE, cursor });
        if (cancelled) return;
        setLiveRows(response.batches.map(zoneBatchToRecord));
        setNextCursor(query ? undefined : response.nextCursor);
        setLiveState("ready");
      } catch (error) {
        if (cancelled) return;
        setLiveRows([]);
        setLiveError(getErrorMessage(error));
        setLiveState("error");
      }
    }, search.trim() ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [cursor, search]);

  React.useEffect(() => {
    setPage(1);
    setCursors([undefined]);
  }, [search]);

  const isLoading = liveState === "loading";
  const error =
    liveState === "error"
      ? { message: liveError ?? "Failed to load batches.", code: "ZONE_RPC" }
      : undefined;

  const rows = liveRows;
  const rangeStart = rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = rangeStart + Math.max(0, rows.length - 1);
  const orderCount = rows.reduce((sum, row) => sum + row.orderCount, BigInt(0));
  const fillCount = rows.reduce((sum, row) => sum + row.fillCount, BigInt(0));
  const l1PostedPct = rows.length
    ? Math.round(
        (100 *
          rows.filter(
            (row) => row.status === "submitted" || row.status === "verified",
          ).length) /
          rows.length,
      )
    : 0;

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
            <ExplorerHeader connected={!error} />
            {!error ? (
              <StatStrip
                loadedBatches={rows.length}
                orderCount={orderCount}
                fillCount={fillCount}
                averageInterval={averageSettlementInterval(rows)}
                l1PostedPct={l1PostedPct}
              />
            ) : null}
            <BatchList
              rows={rows}
              total={rows.length}
              query={search}
              onQuery={setSearch}
              page={page}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              error={error}
              hasNextPage={Boolean(nextCursor)}
              onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
              onNextPage={() => {
                if (!nextCursor) return;
                setCursors((current) => {
                  const next = current.slice(0, page);
                  next[page] = nextCursor;
                  return next;
                });
                setPage((current) => current + 1);
              }}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Explorer header                                                        */
/* ─────────────────────────────────────────────────────────────────────── */

function ExplorerHeader({ connected }: { connected: boolean }) {
  return (
    <section className="glass flex flex-col gap-4 rounded-[var(--radius-xl)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="t-h2 m-0">Settlement explorer</h1>
          <p className="font-serif m-0 max-w-[460px] text-[15px] font-light text-[var(--muted-foreground)]">
            Zone block ranges and Tempo L1 submissions, with privacy-safe
            trading aggregates.
          </p>
        </div>
        <span
          role="status"
          aria-label={connected ? "Zone RPC connected" : "Zone RPC unavailable"}
          className="inline-flex h-7 items-center gap-[7px] whitespace-nowrap rounded-full border px-3 font-mono text-[11px] uppercase tracking-[0.1em]"
          style={{
            borderColor:
              `color-mix(in oklab, var(--${connected ? "success" : "destructive"}) 30%, transparent)`,
            background: `color-mix(in oklab, var(--${connected ? "success" : "destructive"}) 10%, transparent)`,
            color: `var(--${connected ? "success" : "destructive"})`,
          }}
        >
          <span
            aria-hidden
            className={cn("h-1.5 w-1.5 rounded-full bg-current", styles.pulse)}
          />
          {connected ? "Connected · Tempo L1" : "Zone RPC unavailable"}
        </span>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Stat strip                                                             */
/* ─────────────────────────────────────────────────────────────────────── */

function StatStrip({
  loadedBatches,
  orderCount,
  fillCount,
  averageInterval,
  l1PostedPct,
}: {
  loadedBatches: number;
  orderCount: bigint;
  fillCount: bigint;
  averageInterval?: number;
  l1PostedPct: number;
}) {
  return (
    <section className="glass flex items-stretch rounded-[var(--radius-xl)] py-5">
      <StatCell label="Loaded" value={loadedBatches.toLocaleString("en-US")} />
      <Divider />
      <StatCell label="Orders" value={orderCount.toLocaleString("en-US")} />
      <Divider />
      <StatCell label="Fills" value={fillCount.toLocaleString("en-US")} />
      <Divider />
      <StatCell label="Avg interval" value={formatDuration(averageInterval)} />
      <Divider />
      <StatCell
        label="L1 posted"
        value={`${l1PostedPct}%`}
        tone="var(--success)"
      />
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
  rangeStart,
  rangeEnd,
  error,
  hasNextPage,
  onPreviousPage,
  onNextPage,
}: {
  rows: BatchRecord[];
  total: number;
  query: string;
  onQuery: (next: string) => void;
  page: number;
  rangeStart: number;
  rangeEnd: number;
  error?: { message: string; code: string };
  hasNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  return (
    <section className="glass flex flex-col gap-4 rounded-[var(--radius-xl)] p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="t-h3 m-0">Recent batches</h2>
          <span className="text-[13px] text-[var(--muted-foreground)]">
            Zone batches · newest first
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
                <Th>Zone blocks</Th>
                <Th align="right">Orders</Th>
                <Th align="right">Fills</Th>
                <Th>Token volume</Th>
                <Th title="Tempo L1 transaction that submitted this batch">
                  Settlement
                </Th>
                <Th>Status</Th>
                <Th align="right">Age</Th>
                <th aria-hidden className="w-6" />
              </tr>
            </thead>
            <tbody>
              {rows.map((batch) => <BatchRow key={batch.number} batch={batch} />)}
            </tbody>
          </table>
        )}
      </div>

      {!error && total > 0 ? (
        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-1">
          <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.06em] tabular-nums text-[var(--muted-foreground)]">
            {rangeStart}–{rangeEnd}
          </span>
          <div className="flex items-center gap-2.5">
            <PageButton dir={-1} disabled={page <= 1} onClick={onPreviousPage}>
              Prev
            </PageButton>
            <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.08em] tabular-nums text-[var(--foreground)]">
              Page {page}
            </span>
            <PageButton
              dir={1}
              disabled={!hasNextPage}
              onClick={onNextPage}
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

function BatchRow({ batch }: { batch: BatchRecord }) {
  const router = useRouter();
  return (
    <tr
      onClick={() => router.push(`/batches/${batch.number}`)}
      className={cn(
        "group cursor-pointer border-t border-[var(--border)] transition-[background-color] duration-75 ease-[var(--ease-standard)] hover:bg-[var(--muted)]/30",
      )}
    >
      <Td>
        <Link
          href={`/batches/${batch.number}`}
          className="font-medium text-[var(--foreground)] underline-offset-4 hover:underline"
        >
          {formatBatchNumber(batch.number)}
        </Link>
      </Td>
      <Td className="text-[var(--muted-foreground)]">
        {batch.zoneBlockFrom != null && batch.zoneBlockTo != null
          ? `${batch.zoneBlockFrom.toLocaleString("en-US")}–${batch.zoneBlockTo.toLocaleString("en-US")}`
          : "—"}
      </Td>
      <Td align="right">{batch.orderCount.toLocaleString("en-US")}</Td>
      <Td align="right">{batch.fillCount.toLocaleString("en-US")}</Td>
      <Td className="max-w-[260px] whitespace-normal text-[var(--muted-foreground)]">
        {batch.volumes.length > 0 ? formatBatchVolumes(batch.volumes) : "—"}
      </Td>
      <Td className="text-[var(--muted-foreground)]">
        {batch.settlementTx ? (
          <span
            className="inline-flex items-center gap-1"
            onClick={(event) => event.stopPropagation()}
          >
            <TempoTxLink
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
        {ageOf(batch.sealedAt ?? batch.settledAt)}
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

function compactBatch(batch: ZoneBatchSummary | null): ZoneBatchSummary[] {
  return batch ? [batch] : [];
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to load batches.";
}

function shortHash(h: string): string {
  return h.length > 18 ? `${h.slice(0, 10)}…${h.slice(-8)}` : h;
}

function ageOf(iso: string | undefined): string {
  if (!iso) return "—";
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
