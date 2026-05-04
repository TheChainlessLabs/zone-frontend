"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PageLayout } from "@/components/shell/PageLayout";
import { SurfaceState } from "@/components/shell/SurfaceState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/lib/icons";
import { batchesDetailFixtures, usePageState } from "@/lib/fixtures";
import type { BatchesDetailFixture } from "@/lib/fixtures/types";
import {
  formatRelativeTime,
  formatTimestampWithRelative,
  truncateHash,
} from "@/lib/format";
import { BATCH_STAGE_MEANING } from "@/lib/lifecycle-copy";
import {
  aggregateByPair,
  fmtCompactUsd,
  parseNum,
} from "@/app/batches/preview/_variants/_shared";
import { AttestationStatus } from "@/app/batches/_components/attestation-status";
import { CopyButton } from "@/app/batches/_components/copy-button";
import { EtherscanTxLink } from "@/app/batches/_components/etherscan-link";

/**
 * BatchDetailView — per-batch verification surface.
 *
 * Privacy hard rule: aggregate-by-pair only. No individual fills, no
 * counterparty IDs, no order IDs. Users see their own fills via
 * /portfolio. Default renders the verified fixture; `?state=loading|
 * empty|error` mirrors the list-page review toggle, while the legacy
 * `detail-pending` / `detail-failed` variants remain available.
 *
 * M4.23 — compressed to a one-screen header strip + flat two-column body
 * (Tempo-style). Header carries the batch number, status, Etherscan jump,
 * and a one-line summary. Body splits settlement metadata + pair
 * distribution (left) from the four lifecycle actions (right) on desktop;
 * single column on mobile. Hash deep-link IDs and the 100ms hover
 * established by M5.5/M5.3 are preserved on the compact action rows.
 */

type DetailStateKey = "detail-verified" | "detail-pending" | "detail-failed";

const STATE_TO_FIXTURE: Record<DetailStateKey, BatchesDetailFixture> = {
  "detail-verified": batchesDetailFixtures.verified,
  "detail-pending": batchesDetailFixtures.pending,
  "detail-failed": batchesDetailFixtures.failed,
};

const VALID_DETAIL_KEYS = new Set<DetailStateKey>([
  "detail-verified",
  "detail-pending",
  "detail-failed",
]);

export function BatchDetailView({ id }: { id: string }) {
  const params = useSearchParams();
  const state = usePageState();
  const rawState = params.get("state");
  const fixture =
    state === "loading"
      ? batchesDetailFixtures.loading
      : state === "empty"
        ? batchesDetailFixtures.empty
        : state === "error"
          ? batchesDetailFixtures.error
          : rawState && VALID_DETAIL_KEYS.has(rawState as DetailStateKey)
            ? STATE_TO_FIXTURE[rawState as DetailStateKey]
            : batchesDetailFixtures.verified;

  // Honour the route segment for the title even when we render a
  // status-keyed fixture. Falls back to the fixture batch number.
  const overrideNumber = /^\d+$/.test(id) ? Number(id) : null;
  const fixtureForVariant: BatchesDetailFixture =
    overrideNumber !== null
      ? {
          ...fixture,
          batch: { ...fixture.batch, number: overrideNumber },
        }
      : fixture;

  return (
    <PageLayout width="default" bare>
      {fixture.isLoading ? (
        <BatchDetailSkeleton />
      ) : fixture.error ? (
        <SurfaceState
          title="Failed to load batch."
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
      ) : state === "empty" ? (
        <SurfaceState
          title="Batch not found."
          description="The route you tried doesn't exist. Head back to /batches."
          action={
            <Button asChild>
              <Link href="/batches">Back to /batches</Link>
            </Button>
          }
        />
      ) : (
        <>
          <BatchDetail fixture={fixtureForVariant} />
          <PrivacyFooter />
        </>
      )}
    </PageLayout>
  );
}

function BatchDetail({ fixture }: { fixture: BatchesDetailFixture }) {
  const { batch, fills, orders } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const queuedAt = orders
    .map((order) => order.submittedAt)
    .sort()[0] ?? batch.sealedAt;
  const provenAt = deriveStageTime(batch.sealedAt, 120);
  const settledAt = batch.settlementTx ? deriveStageTime(provenAt, 150) : null;

  const summaryBits = [
    `Sealed ${formatRelativeTime(batch.sealedAt)}`,
    `${batch.fillCount} fills`,
    batch.volumeUsd
      ? `${fmtCompactUsd(parseNum(batch.volumeUsd))} volume`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Link
        href="/batches"
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        Batch log
      </Link>

      <Card className="flex flex-col gap-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-none sm:p-6">
      {/* Header strip — title + status + Etherscan + summary */}
      <header className="flex flex-col gap-2 border-b border-dashed border-[var(--border)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-medium leading-tight text-[var(--foreground)]">
              {`Batch #${batch.number}`}
            </h1>
            <CopyButton
              value={`Batch #${batch.number}`}
              label={`Copy batch number ${batch.number}`}
            />
            <AttestationStatus status={batch.status} />
          </div>
          {batch.settlementTx ? (
            <EtherscanTxLink
              hash={batch.settlementTx}
              label="View on Etherscan"
              className="text-sm text-[var(--foreground)]"
            />
          ) : null}
        </div>
        <p className="font-mono text-xs text-[var(--muted-foreground)]">
          {summaryBits.join(" · ")}
        </p>
      </header>

      {/* Body — two columns on desktop, single on mobile */}
      <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-12 md:gap-y-0">
        {/* LEFT: settlement metadata + pair distribution + (failure) */}
        <section
          aria-label="Settlement metadata"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col">
            <SectionLabel>Settlement</SectionLabel>
            <MetaRow label="Sealed at">
              <ValueText>
                {formatTimestampWithRelative(batch.sealedAt)}
              </ValueText>
            </MetaRow>
            <MetaRow label="Settled at">
              {settledAt ? (
                <ValueText>{formatTimestampWithRelative(settledAt)}</ValueText>
              ) : (
                <MutedMono>pending</MutedMono>
              )}
            </MetaRow>
            <MetaRow label="Sequencer">
              <MutedMono>Sequencer #1 — TEE</MutedMono>
            </MetaRow>
            <MetaRow label="Pair set">
              <ValueMono>
                {(batch.pairs ?? []).join(", ") || "—"}
              </ValueMono>
            </MetaRow>
            <MetaRow label="Volume">
              <ValueMono>
                {batch.volumeUsd
                  ? fmtCompactUsd(parseNum(batch.volumeUsd))
                  : "—"}
              </ValueMono>
            </MetaRow>
          </div>

          {batch.status === "failed" && batch.failureReason ? (
            <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
              {batch.failureReason}
            </p>
          ) : null}

          <div className="flex flex-col">
            <SectionLabel>Pair distribution</SectionLabel>
            {aggregates.length === 0 ? (
              <MutedMono>—</MutedMono>
            ) : (
              aggregates.map((aggregate) => (
                <MetaRow key={aggregate.pair} label={aggregate.pair}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
                    <span className="text-[var(--foreground)]">
                      {aggregate.fillCount} fills
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {(aggregate.share * 100).toFixed(1)}% share
                    </span>
                  </div>
                </MetaRow>
              ))
            )}
          </div>
        </section>

        {/* RIGHT: lifecycle — 4 compact rows */}
        <section
          aria-label="Lifecycle"
          className="flex flex-col"
        >
          <SectionLabel>Lifecycle</SectionLabel>
          <ActionRow
            id="queued"
            index={1}
            label="Queued"
            timestamp={queuedAt}
            meaning={BATCH_STAGE_MEANING.queued}
            detail={null}
          />
          <ActionRow
            id="sealed"
            index={2}
            label="Sealed"
            timestamp={batch.sealedAt}
            meaning={BATCH_STAGE_MEANING.sealed}
            detail={
              <HashLine hash={batch.root} copyLabel="Copy batch root hash" />
            }
          />
          <ActionRow
            id="proven"
            index={3}
            label="Proven"
            timestamp={batch.status === "pending" ? null : provenAt}
            meaning={BATCH_STAGE_MEANING.proven}
            detail={
              batch.proofRef ? (
                <span id="proof-hash">
                  <HashLine hash={batch.proofRef} copyLabel="Copy proof hash" />
                </span>
              ) : (
                <MutedMono>pending</MutedMono>
              )
            }
          />
          <ActionRow
            id="settled"
            index={4}
            label="Settled"
            timestamp={settledAt}
            tone={batch.status === "failed" ? "destructive" : "default"}
            meaning={BATCH_STAGE_MEANING.settled}
            detail={
              batch.settlementTx ? (
                <span id="settlement-tx">
                  <HashLine
                    hash={batch.settlementTx}
                    copyLabel="Copy settlement transaction hash"
                  />
                </span>
              ) : (
                <MutedMono>pending</MutedMono>
              )
            }
          />
        </section>
      </div>
      </Card>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-0.5 border-b border-dashed border-[var(--border)] py-2 last:border-b-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-baseline sm:gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ValueMono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-xs text-[var(--foreground)]">
      {children}
    </span>
  );
}

function ValueText({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs text-[var(--foreground)]">{children}</span>
  );
}

function MutedMono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-xs text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

function ActionRow({
  id,
  index,
  label,
  timestamp,
  detail,
  meaning,
  tone = "default",
}: {
  id?: string;
  index: number;
  label: string;
  timestamp: string | null;
  detail: React.ReactNode;
  meaning?: string;
  tone?: "default" | "destructive";
}) {
  const labelClassName =
    tone === "destructive"
      ? "text-[var(--destructive)]"
      : "text-[var(--foreground)]";

  return (
    <div
      id={id}
      title={meaning}
      className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-0.5 border-b border-dashed border-[var(--border)] py-2 transition-[background-color,color] duration-100 ease-[var(--ease-standard)] last:border-b-0 hover:bg-[var(--muted)]/20 motion-reduce:transition-none"
    >
      <span
        className={`font-mono text-[11px] uppercase tracking-[0.16em] ${labelClassName}`}
      >
        {index}. {label}
      </span>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
          {timestamp ? formatRelativeTime(timestamp) : "pending"}
        </span>
        <div className="min-w-0">{detail}</div>
      </div>
      {meaning ? (
        <p className="col-start-2 text-[10px] leading-snug text-[var(--muted-foreground)]">
          {meaning}
        </p>
      ) : null}
    </div>
  );
}

function HashLine({
  hash,
  copyLabel,
}: {
  hash: string;
  copyLabel: string;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
      <span className="font-mono text-xs text-[var(--foreground)]">
        {truncateHash(hash, 8, 6)}
      </span>
      <CopyButton value={hash} label={copyLabel} />
      <EtherscanTxLink hash={hash} label="Etherscan" className="text-[11px]" />
    </span>
  );
}

function deriveStageTime(iso: string, offsetSeconds: number) {
  const baseMs = new Date(iso).getTime();
  if (Number.isNaN(baseMs)) return iso;
  return new Date(baseMs + offsetSeconds * 1000).toISOString();
}

function PrivacyFooter() {
  return (
    <p className="mx-auto mt-6 max-w-3xl text-balance text-center text-xs leading-relaxed text-[var(--muted-foreground)]">
      Counterparty information is by design absent from this surface.
      Individual fills are visible only to their owner via{" "}
      <Link
        href="/portfolio"
        className="underline-offset-4 hover:text-[var(--foreground)] hover:underline"
      >
        /portfolio
      </Link>
      .
    </p>
  );
}

function BatchDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div
        aria-hidden
        className="h-4 w-24 animate-pulse rounded bg-[var(--muted)]"
      />
      <Card className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-none">
        <div className="flex flex-col gap-3 border-b border-dashed border-[var(--border)] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-8 w-32 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-6 w-6 animate-pulse rounded bg-[var(--muted)]" />
              <div className="h-6 w-20 animate-pulse rounded bg-[var(--muted)]" />
            </div>
            <div className="h-5 w-28 animate-pulse rounded bg-[var(--muted)]" />
          </div>
          <div className="h-3 w-48 animate-pulse rounded bg-[var(--muted)]" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-12 md:gap-y-0">
          <SkeletonSection rows={6} />
          <SkeletonSection rows={4} />
        </div>
      </Card>
    </div>
  );
}

function SkeletonSection({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-3 w-28 animate-pulse rounded bg-[var(--muted)]" />
      <div className="flex flex-col">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 gap-2 border-b border-dashed border-[var(--border)] py-2 last:border-b-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-baseline sm:gap-3"
          >
            <div className="h-3 w-20 animate-pulse rounded bg-[var(--muted)]" />
            <div className="h-3 w-full max-w-[220px] animate-pulse rounded bg-[var(--muted)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
