"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PageLayout, PageSection } from "@/components/shell/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { batchesDetailFixtures } from "@/lib/fixtures";
import type {
  BatchesDetailFixture,
  FillFixture,
  MarketPair,
} from "@/lib/fixtures/types";
import {
  formatAbsoluteTime,
  formatRelativeTime,
  formatThousands,
  formatUSD,
  truncateHash,
} from "@/lib/format";

import { AttestationStatus } from "./attestation-status";
import { CopyButton } from "./copy-button";
import { EtherscanTxLink } from "./etherscan-link";

/**
 * BatchDetailView — per-batch verification surface.
 *
 * Privacy hard rule: aggregate-by-pair only. No individual fills, no
 * counterparty IDs, no order IDs. Users see their own fills via
 * /portfolio. Three default cells (verified / pending / failed) are
 * reachable via `?state=detail-verified|detail-pending|detail-failed`
 * for review.
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
  // The detail page accepts `?state=detail-verified|detail-pending|detail-failed`
  // for review-time variant coverage. Anything else (including the literal
  // default) lands the verified happy path. The route segment id is
  // informational at the wireframe stage — once M6 wires real data the
  // segment will drive the lookup.
  const raw = params.get("state");
  const key: DetailStateKey =
    raw && VALID_DETAIL_KEYS.has(raw as DetailStateKey)
      ? (raw as DetailStateKey)
      : "detail-verified";
  const fixture = STATE_TO_FIXTURE[key];

  const { batch, fills } = fixture;
  // Allow the page to honour the route segment for the title even when
  // we're rendering a status-keyed fixture. Falls back to the fixture
  // batch number when the segment is missing or non-numeric.
  const displayNumber = /^\d+$/.test(id) ? id : String(batch.number);

  return (
    <PageLayout
      width="default"
      title={`Batch #${displayNumber}`}
      description="Settlement attestation + L1 anchoring."
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href="/batches" className="inline-flex items-center gap-1.5">
            <span aria-hidden>{"←"}</span>
            Back to list
          </Link>
        </Button>
      }
    >
      <StatusHero fixture={fixture} />

      <Separator className="my-2" />

      <BatchMetadata fixture={fixture} />

      <Separator className="my-2" />

      <AggregateFills fills={fills} pairs={batch.pairs ?? []} />

      <Separator className="my-2" />

      <VerificationProof fixture={fixture} />
    </PageLayout>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sections                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

function StatusHero({ fixture }: { fixture: BatchesDetailFixture }) {
  const { batch } = fixture;
  const banner =
    batch.status === "pending"
      ? "Awaiting attestation submission. The proof is generated; settlement is queued for the next L1 anchor."
      : batch.status === "failed"
        ? batch.failureReason ??
          "Settlement reverted on L1. Fills remain valid offchain — see /portfolio for your own fills."
        : null;

  return (
    <PageSection className="py-4 md:py-6">
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Attestation
            </span>
            <div className="flex items-center gap-3">
              <AttestationStatus status={batch.status} />
              <span
                className="font-mono text-xs text-[var(--muted-foreground)]"
                title={formatAbsoluteTime(batch.sealedAt)}
              >
                Sealed {formatRelativeTime(batch.sealedAt)}
              </span>
            </div>
          </div>
          {batch.settlementTx ? (
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                L1 tx
              </span>
              <div className="flex items-center gap-1">
                <EtherscanTxLink hash={batch.settlementTx} />
                <CopyButton value={batch.settlementTx} label="Copy L1 tx hash" />
              </div>
            </div>
          ) : null}
        </div>

        {banner ? (
          <p
            className={cn(
              "rounded-md border px-3 py-2 text-xs leading-relaxed",
              batch.status === "failed"
                ? "border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_8%,transparent)] text-[var(--destructive)]"
                : "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]",
            )}
          >
            {banner}
          </p>
        ) : null}

        <div className="flex flex-col gap-1 rounded-md border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2.5 text-xs text-[var(--muted-foreground)]">
          <span className="inline-flex items-center gap-1.5 font-medium text-[var(--foreground)]">
            <Icon.Proof className="h-3.5 w-3.5" aria-hidden />
            Externally verifiable
          </span>
          <span className="leading-relaxed">
            Anyone can verify this batch&apos;s proof on-chain.{" "}
            {batch.settlementTx ? (
              <EtherscanTxLink
                hash={batch.settlementTx}
                label="View on Etherscan"
                className="text-[var(--foreground)]"
              />
            ) : (
              "L1 anchor pending."
            )}
          </span>
        </div>
      </Card>
    </PageSection>
  );
}

function BatchMetadata({ fixture }: { fixture: BatchesDetailFixture }) {
  const { batch } = fixture;
  return (
    <PageSection title="Batch metadata">
      <dl className="grid grid-cols-1 gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 sm:grid-cols-2">
        <MetadataRow label="Batch ID">
          <span className="inline-flex items-center gap-1 font-mono text-sm">
            #{batch.number}
            <CopyButton value={String(batch.number)} label="Copy batch ID" />
          </span>
        </MetadataRow>

        <MetadataRow label="Sealed at">
          <span
            className="font-mono text-sm"
            title={formatAbsoluteTime(batch.sealedAt)}
          >
            {formatAbsoluteTime(batch.sealedAt)}
          </span>
        </MetadataRow>

        <MetadataRow label="Batch root">
          <span className="inline-flex items-center gap-1 font-mono text-sm">
            {truncateHash(batch.root, 10, 6)}
            <CopyButton value={batch.root} label="Copy batch root" />
          </span>
        </MetadataRow>

        {batch.proofRef ? (
          <MetadataRow label="Proof hash">
            <span className="inline-flex items-center gap-1 font-mono text-sm">
              {truncateHash(batch.proofRef, 10, 6)}
              <CopyButton value={batch.proofRef} label="Copy proof hash" />
            </span>
          </MetadataRow>
        ) : (
          <MetadataRow label="Proof hash">
            <span className="font-mono text-sm text-[var(--muted-foreground)]">
              — pending
            </span>
          </MetadataRow>
        )}

        <MetadataRow label="Verification">
          <AttestationStatus status={batch.status} />
        </MetadataRow>

        <MetadataRow label="Submitter">
          <span className="font-mono text-sm text-[var(--muted-foreground)]">
            Sequencer #1 (TEE attestor)
          </span>
        </MetadataRow>
      </dl>
    </PageSection>
  );
}

function MetadataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Aggregate fills — privacy-safe pair-level breakdown only                  */
/* ────────────────────────────────────────────────────────────────────────── */

interface PairAggregate {
  pair: MarketPair;
  fillCount: number;
  totalBaseAmount: number;
}

function aggregateByPair(fills: FillFixture[]): PairAggregate[] {
  const map = new Map<MarketPair, PairAggregate>();
  for (const fill of fills) {
    const entry = map.get(fill.pair) ?? {
      pair: fill.pair,
      fillCount: 0,
      totalBaseAmount: 0,
    };
    entry.fillCount += 1;
    entry.totalBaseAmount += Number(fill.amount) || 0;
    map.set(fill.pair, entry);
  }
  return Array.from(map.values()).sort(
    (a, b) => b.totalBaseAmount - a.totalBaseAmount,
  );
}

function AggregateFills({
  fills,
  pairs,
}: {
  fills: FillFixture[];
  pairs: MarketPair[];
}) {
  const aggregates = aggregateByPair(fills);
  // Surface the canonical pair set even if the per-fill aggregate is sparse
  // (the fixture truncates fills for readability).
  for (const pair of pairs) {
    if (!aggregates.some((a) => a.pair === pair)) {
      aggregates.push({ pair, fillCount: 0, totalBaseAmount: 0 });
    }
  }

  const totalFills = aggregates.reduce((sum, a) => sum + a.fillCount, 0);
  const pairCount = aggregates.length;

  return (
    <PageSection
      title="Fills (aggregate)"
      description={`This batch contains ${formatThousands(String(totalFills))} fills across ${pairCount} ${pairCount === 1 ? "pair" : "pairs"}.`}
    >
      <p className="text-xs text-[var(--muted-foreground)]">
        Individual fills are visible only to their counterparties — see{" "}
        <Link
          href="/portfolio"
          className="underline-offset-4 hover:text-[var(--foreground)] hover:underline"
        >
          /portfolio
        </Link>
        .
      </p>
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left">
              <th
                scope="col"
                className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
              >
                Pair
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
              >
                Fills
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
              >
                Volume
              </th>
            </tr>
          </thead>
          <tbody>
            {aggregates.map((agg) => (
              <tr
                key={agg.pair}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <td className="px-4 py-3 font-mono text-sm uppercase tracking-[0.12em]">
                  {agg.pair}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm tabular-nums">
                  {formatThousands(String(agg.fillCount))}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm tabular-nums">
                  {agg.totalBaseAmount > 0
                    ? formatUSD(agg.totalBaseAmount.toFixed(2))
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Verification proof (collapsible)                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function VerificationProof({ fixture }: { fixture: BatchesDetailFixture }) {
  const [open, setOpen] = React.useState(false);
  const { batch } = fixture;
  const command = `npx omega-verify ${batch.number}`;

  return (
    <PageSection title="Verification proof">
      <details
        open={open}
        onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
        className="rounded-xl border border-[var(--border)] bg-[var(--card)]"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm">
          <span className="inline-flex items-center gap-2">
            <Icon.Proof className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden />
            Inspect the cryptographic proof
          </span>
          <Icon.Caret.Right
            className={cn(
              "h-4 w-4 text-[var(--muted-foreground)] transition-transform",
              open && "rotate-90",
            )}
            aria-hidden
          />
        </summary>
        <div className="flex flex-col gap-4 border-t border-[var(--border)] px-5 py-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Proof hash
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs">
              {batch.proofRef
                ? truncateHash(batch.proofRef, 12, 8)
                : "— pending"}
              {batch.proofRef ? (
                <CopyButton value={batch.proofRef} label="Copy proof hash" />
              ) : null}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Verify externally
            </span>
            <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2 text-xs">
              <code className="font-mono">{command}</code>
            </pre>
            <span className="text-[11px] text-[var(--muted-foreground)]">
              CLI ships in M6.
            </span>
          </div>
        </div>
      </details>
    </PageSection>
  );
}
