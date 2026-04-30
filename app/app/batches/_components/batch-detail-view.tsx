"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PageLayout } from "@/components/shell/PageLayout";
import { OmegaMark } from "@/components/OmegaMark";
import { Icon } from "@/lib/icons";
import { batchesDetailFixtures } from "@/lib/fixtures";
import type { BatchesDetailFixture } from "@/lib/fixtures/types";
import {
  formatTimestampWithRelative,
  formatUSD,
  truncateHash,
} from "@/lib/format";
import { BATCH_STAGE_MEANING } from "@/lib/lifecycle-copy";
import {
  aggregateByPair,
  fmtCompactUsd,
  parseNum,
} from "@/app/batches/preview/_variants/_shared";
import { CopyButton } from "@/app/batches/_components/copy-button";
import { EtherscanTxLink } from "@/app/batches/_components/etherscan-link";

// TODO: consolidate to @/components/ui/receipt — local stub diverges in API
// (Body/Section/Row composable form vs prop-based). Tracked for follow-up.
import { Receipt } from "./receipt.local";

/**
 * BatchDetailView — per-batch verification surface.
 *
 * Privacy hard rule: aggregate-by-pair only. No individual fills, no
 * counterparty IDs, no order IDs. Users see their own fills via
 * /portfolio. Three default cells (verified / pending / failed) are
 * reachable via `?state=detail-verified|detail-pending|detail-failed`.
 *
 * Layout is a receipt-style attestation record. Production keeps the
 * route-segment fallback for the displayed batch number.
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
  const raw = params.get("state");
  const key: DetailStateKey =
    raw && VALID_DETAIL_KEYS.has(raw as DetailStateKey)
      ? (raw as DetailStateKey)
      : "detail-verified";
  const fixture = STATE_TO_FIXTURE[key];

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
      <ReceiptDetail fixture={fixtureForVariant} />
      <PrivacyFooter />
    </PageLayout>
  );
}

function ReceiptDetail({ fixture }: { fixture: BatchesDetailFixture }) {
  const { batch, fills, orders } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const queuedAt = orders
    .map((order) => order.submittedAt)
    .sort()[0] ?? batch.sealedAt;
  const provenAt = deriveStageTime(batch.sealedAt, 120);
  const settledAt = batch.settlementTx ? deriveStageTime(provenAt, 150) : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Link
        href="/batches"
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        Batch log
      </Link>

      <Receipt>
        <Receipt.Header>
          <div className="flex items-center gap-3">
            <OmegaMark size={24} className="text-[var(--foreground)]" />
            <span className="text-sm font-medium uppercase tracking-[0.28em]">
              OMEGA
            </span>
          </div>
          <Receipt.Label className="pt-1 text-right">
            Settlement record
          </Receipt.Label>
        </Receipt.Header>

        <Receipt.Body>
          <Receipt.Row>
            <Receipt.RowLabel>Batch</Receipt.RowLabel>
            <Receipt.RowValue>
              <div className="inline-flex items-center gap-1.5 font-mono text-lg font-medium">
                <span>{`Batch #${batch.number}`}</span>
                <CopyButton
                  value={`Batch #${batch.number}`}
                  label={`Copy batch number ${batch.number}`}
                />
              </div>
            </Receipt.RowValue>
          </Receipt.Row>

          <Receipt.Section aria-label="Metadata">
            <div className="pb-2">
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                Settlement details.
              </p>
            </div>
            <Receipt.Row>
              <Receipt.RowLabel>Sealed at</Receipt.RowLabel>
              <Receipt.RowValue>
                <ValueText>{formatTimestampWithRelative(batch.sealedAt)}</ValueText>
              </Receipt.RowValue>
            </Receipt.Row>
            <Receipt.Row>
              <Receipt.RowLabel>Settled at</Receipt.RowLabel>
              <Receipt.RowValue>
                {settledAt ? (
                  <ValueText>{formatTimestampWithRelative(settledAt)}</ValueText>
                ) : (
                  <MutedMono>pending</MutedMono>
                )}
              </Receipt.RowValue>
            </Receipt.Row>
            <Receipt.Row>
              <Receipt.RowLabel>Sequencer</Receipt.RowLabel>
              <Receipt.RowValue>
                <MutedMono>Sequencer #1 — TEE</MutedMono>
              </Receipt.RowValue>
            </Receipt.Row>
            <Receipt.Row>
              <Receipt.RowLabel>Pair set</Receipt.RowLabel>
              <Receipt.RowValue>
                <ValueMono>{(batch.pairs ?? []).join(", ") || "—"}</ValueMono>
              </Receipt.RowValue>
            </Receipt.Row>
            <Receipt.Row>
              <Receipt.RowLabel>Volume</Receipt.RowLabel>
              <Receipt.RowValue>
                <ValueMono>
                  {batch.volumeUsd
                    ? fmtCompactUsd(parseNum(batch.volumeUsd))
                    : "—"}
                </ValueMono>
              </Receipt.RowValue>
            </Receipt.Row>
          </Receipt.Section>

          <Receipt.Section aria-label="Actions" className="pt-5">
            <div className="flex flex-col gap-1 pb-2">
              <Receipt.Label>Actions</Receipt.Label>
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                Here&apos;s what happened to your batch.
              </p>
            </div>
            <ActionRow
              index={1}
              label="Queued"
              timestamp={queuedAt}
              meaning={BATCH_STAGE_MEANING.queued}
              detail={null}
            />
            <ActionRow
              index={2}
              label="Sealed"
              timestamp={batch.sealedAt}
              meaning={BATCH_STAGE_MEANING.sealed}
              detail={
                <HashLine hash={batch.root} copyLabel="Copy batch root hash" />
              }
            />
            <ActionRow
              index={3}
              label="Proven"
              timestamp={batch.status === "pending" ? null : provenAt}
              meaning={BATCH_STAGE_MEANING.proven}
              detail={
                batch.proofRef ? (
                  <HashLine hash={batch.proofRef} copyLabel="Copy proof hash" />
                ) : (
                  <MutedMono>pending</MutedMono>
                )
              }
            />
            <ActionRow
              index={4}
              label="Settled"
              timestamp={settledAt}
              tone={batch.status === "failed" ? "destructive" : "default"}
              meaning={BATCH_STAGE_MEANING.settled}
              detail={
                batch.settlementTx ? (
                  <HashLine
                    hash={batch.settlementTx}
                    copyLabel="Copy settlement transaction hash"
                  />
                ) : (
                  <MutedMono>pending</MutedMono>
                )
              }
            />
            {batch.status === "failed" && batch.failureReason ? (
              <p className="pt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {batch.failureReason}
              </p>
            ) : null}
          </Receipt.Section>

          <Receipt.Section aria-label="Pair aggregate" className="pt-5">
            <div className="pb-2">
              <Receipt.Label>Pair aggregate</Receipt.Label>
            </div>
            {aggregates.map((aggregate) => (
              <Receipt.Row key={aggregate.pair}>
                <Receipt.RowLabel>{aggregate.pair}</Receipt.RowLabel>
                <Receipt.RowValue>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm">
                    <span>{aggregate.fillCount} fills</span>
                    <span className="text-[var(--muted-foreground)]">
                      {(aggregate.share * 100).toFixed(1)}% share
                    </span>
                  </div>
                </Receipt.RowValue>
              </Receipt.Row>
            ))}
          </Receipt.Section>

          <Receipt.Section aria-label="Totals" className="pt-5">
            <div className="pb-2">
              <Receipt.Label>Totals</Receipt.Label>
            </div>
            <Receipt.Row>
              <Receipt.RowLabel>Fills</Receipt.RowLabel>
              <Receipt.RowValue>
                <ValueMono>{String(batch.fillCount)}</ValueMono>
              </Receipt.RowValue>
            </Receipt.Row>
            <Receipt.Row>
              <Receipt.RowLabel>Orders</Receipt.RowLabel>
              <Receipt.RowValue>
                <ValueMono>{String(batch.orderCount)}</ValueMono>
              </Receipt.RowValue>
            </Receipt.Row>
            <Receipt.Row>
              <Receipt.RowLabel>Volume</Receipt.RowLabel>
              <Receipt.RowValue>
                <ValueMono>{formatUSD(batch.volumeUsd ?? "0")}</ValueMono>
              </Receipt.RowValue>
            </Receipt.Row>
          </Receipt.Section>
        </Receipt.Body>

        {batch.settlementTx ? (
          <Receipt.Footer>
            <EtherscanTxLink
              hash={batch.settlementTx}
              label="View on Etherscan →"
              className="text-sm text-[var(--foreground)]"
            />
          </Receipt.Footer>
        ) : null}
      </Receipt>
    </div>
  );
}

function ValueMono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-sm text-[var(--foreground)]">{children}</span>
  );
}

function ValueText({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm text-[var(--foreground)]">{children}</span>
  );
}

function MutedMono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-sm text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

function ActionRow({
  index,
  label,
  timestamp,
  detail,
  meaning,
  tone = "default",
}: {
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
    <div className="grid grid-cols-1 gap-1.5 border-b border-dashed border-[var(--border)] py-3 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
      <div className="flex flex-col gap-1">
        <span className={`font-mono text-[11px] uppercase tracking-[0.16em] ${labelClassName}`}>
          {index}. {label}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {timestamp ? formatTimestampWithRelative(timestamp) : "pending"}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        {detail}
        {meaning ? (
          <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
            {meaning}
          </p>
        ) : null}
      </div>
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
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
      <span className="font-mono text-sm text-[var(--foreground)]">
        {truncateHash(hash, 10, 8)}
      </span>
      <CopyButton value={hash} label={copyLabel} />
      <EtherscanTxLink hash={hash} label="Etherscan" className="text-xs" />
    </div>
  );
}

function deriveStageTime(iso: string, offsetSeconds: number) {
  const baseMs = new Date(iso).getTime();
  if (Number.isNaN(baseMs)) return iso;
  return new Date(baseMs + offsetSeconds * 1000).toISOString();
}

function PrivacyFooter() {
  return (
    <p className="mx-auto mt-1 max-w-3xl text-balance text-center text-xs leading-relaxed text-[var(--muted-foreground)]">
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
