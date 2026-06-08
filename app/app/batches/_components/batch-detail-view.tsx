"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PageLayout } from "@/components/shell/PageLayout";
import { SurfaceState } from "@/components/shell/SurfaceState";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { batchesDetailFixtures, usePageState } from "@/lib/fixtures";
import type { BatchesDetailFixture, BatchStatus } from "@/lib/fixtures/types";
import { formatRelativeTime } from "@/lib/format";
import { getZoneBatch, type ZoneBatchSummary } from "@/lib/zone";

import { aggregateByPair, parseNum } from "./aggregate";
import { CopyButton } from "./copy-button";
import { EtherscanTxLink } from "./etherscan-link";
import { zoneBatchToFixture } from "./batches-list-view";
import styles from "./batches.module.css";

/**
 * BatchDetailView — the per-batch verification surface, ported to the
 * design-kit `BatchDetail`.
 *
 * Composition (kit `Batches.jsx`): a back pill, an identity header
 * (batch glyph · #number · status · seal time · Etherscan + Verify-proof
 * actions), then a split of an Overview sidebar (settlement metadata) and a
 * main column carrying the lifecycle stepper (Submitted → Proven → Settled),
 * the per-pair fill distribution, and the privacy note.
 *
 * Behaviour preserved from the app: in the default state the batch comes
 * from the live Omega Zone RPC keyed on the route segment; `?state=loading|
 * empty|error` and the legacy `detail-verified|detail-pending|detail-failed`
 * fixtures still resolve. Public/no-auth.
 *
 * Privacy hard rule: aggregate + per-pair only — never a counterparty, an
 * order ID, or an individual fill owner.
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

const STATUS_STATE: Record<BatchStatus, "settled" | "pending" | "failed"> = {
  verified: "settled",
  pending: "pending",
  failed: "failed",
};
const STATUS_LABEL: Record<BatchStatus, string> = {
  verified: "Settled",
  pending: "Pending",
  failed: "Failed",
};

export function BatchDetailView({ id }: { id: string }) {
  const params = useSearchParams();
  const state = usePageState();
  const rawState = params.get("state");
  const [liveFixture, setLiveFixture] =
    React.useState<BatchesDetailFixture | null>(null);
  const [liveState, setLiveState] = React.useState<
    "loading" | "ready" | "error" | "empty"
  >("loading");
  const [liveError, setLiveError] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (state !== "default" || rawState) return;
    let cancelled = false;
    async function loadBatch() {
      setLiveState("loading");
      setLiveError(undefined);
      try {
        const batch = await getZoneBatch(parseBatchRouteId(id));
        if (cancelled) return;
        if (!batch) {
          setLiveFixture(null);
          setLiveState("empty");
          return;
        }
        setLiveFixture(zoneBatchToDetailFixture(batch));
        setLiveState("ready");
      } catch (error) {
        if (cancelled) return;
        setLiveError(getErrorMessage(error));
        setLiveState("error");
      }
    }
    void loadBatch();
    return () => {
      cancelled = true;
    };
  }, [id, rawState, state]);

  const fixture: BatchesDetailFixture =
    state === "loading"
      ? batchesDetailFixtures.loading
      : state === "empty"
        ? batchesDetailFixtures.empty
        : state === "error"
          ? batchesDetailFixtures.error
          : rawState && VALID_DETAIL_KEYS.has(rawState as DetailStateKey)
            ? STATE_TO_FIXTURE[rawState as DetailStateKey]
            : liveState === "empty"
              ? batchesDetailFixtures.empty
              : liveFixture ??
                {
                  ...batchesDetailFixtures.loading,
                  error:
                    liveState === "error"
                      ? {
                          message: liveError ?? "Failed to load batch.",
                          code: "ZONE_RPC",
                        }
                      : undefined,
                  isLoading: liveState === "loading",
                };

  // Honour the route segment for the title even when we render a
  // status-keyed fixture.
  const overrideNumber = /^\d+$/.test(id) ? Number(id) : null;
  const fixtureForVariant: BatchesDetailFixture =
    overrideNumber !== null
      ? { ...fixture, batch: { ...fixture.batch, number: overrideNumber } }
      : fixture;

  return (
    <PageLayout width="default" bare>
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1000px] flex-col gap-4",
          styles.viewBack,
        )}
      >
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
        ) : state === "empty" || liveState === "empty" ? (
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
          <div className={cn("flex flex-col gap-4", styles.fade)}>
            <BatchDetail fixture={fixtureForVariant} />
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function zoneBatchToDetailFixture(batch: ZoneBatchSummary): BatchesDetailFixture {
  return { batch: zoneBatchToFixture(batch), orders: [], fills: [] };
}

function parseBatchRouteId(id: string) {
  if (id.startsWith("0x")) return id as `0x${string}`;
  if (/^\d+$/.test(id)) return BigInt(id);
  throw new Error("Invalid batch identifier.");
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to load batch.";
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Detail body                                                            */
/* ─────────────────────────────────────────────────────────────────────── */

function BatchDetail({ fixture }: { fixture: BatchesDetailFixture }) {
  const { batch, fills } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const pairCount = (batch.pairs ?? []).length;
  const sealedRel = formatRelativeTime(batch.sealedAt);

  return (
    <>
      {/* Back */}
      <Link
        href="/batches"
        className="press-down inline-flex h-[34px] items-center gap-2 self-start whitespace-nowrap rounded-full border border-[var(--border)] bg-transparent pl-2.5 pr-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <Icon.Caret.Right className="h-[15px] w-[15px] rotate-180" aria-hidden />
        All batches
      </Link>

      {/* Identity header + actions */}
      <header className="panel flex flex-wrap items-center justify-between gap-5 rounded-[var(--radius-xl)] p-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--muted-foreground)]"
            style={{ background: "color-mix(in oklab, var(--muted) 60%, var(--card))" }}
          >
            <Icon.Batches className="h-5 w-5" />
          </span>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="m-0 font-mono text-2xl font-medium leading-tight tracking-[-0.01em] text-[var(--foreground)]">
                {batchNo(batch.number)}
              </h1>
              <CopyButton
                value={`Batch #${batch.number}`}
                label={`Copy batch number ${batch.number}`}
              />
              <Status
                state={STATUS_STATE[batch.status]}
                label={STATUS_LABEL[batch.status]}
              />
            </div>
            <span className="whitespace-nowrap font-mono text-xs text-[var(--muted-foreground)]">
              Sealed {sealedRel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {batch.settlementTx ? (
            <EtherscanTxLink
              hash={batch.settlementTx}
              label="Etherscan"
              className="h-9 rounded-[var(--radius-md)] border border-[var(--input)] bg-[var(--background)] px-3.5 font-sans text-[13px] font-medium text-[var(--foreground)] no-underline hover:no-underline"
            />
          ) : null}
          <Button className="h-9 px-3.5 text-[13px]">
            <Icon.Proof aria-hidden />
            Verify proof
          </Button>
        </div>
      </header>

      {/* Split: Overview sidebar + main content */}
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[320px_minmax(0,1fr)]">
        {/* Overview sidebar */}
        <aside className="panel flex flex-col rounded-[var(--radius-xl)] px-5 pb-4 pt-2">
          <h2 className="pb-1.5 pt-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Overview
          </h2>
          <OverviewRow label="Status" first>
            <Status
              state={STATUS_STATE[batch.status]}
              label={STATUS_LABEL[batch.status]}
            />
          </OverviewRow>
          <OverviewRow label="Sealed">{sealedRel}</OverviewRow>
          <OverviewRow label="Fills">{String(batch.fillCount)}</OverviewRow>
          <OverviewRow label="Volume">
            {batch.volumeUsd
              ? `${formatGroup(roundStr(batch.volumeUsd))} USDC`
              : "—"}
          </OverviewRow>
          <OverviewRow label="Pairs">{String(pairCount)}</OverviewRow>
          <OverviewRow label="Batch time">~12s</OverviewRow>
          <OverviewRow label="Sequencer">Sequencer #1 — TEE</OverviewRow>
          <OverviewRow label="L1 settlement tx" stack>
            {batch.settlementTx ? (
              <span id="settlement-tx">
                <HashLine hash={batch.settlementTx} copyLabel="Copy settlement transaction hash" />
              </span>
            ) : (
              <span className="text-[var(--muted-foreground)]">pending</span>
            )}
          </OverviewRow>
          <OverviewRow label="State root" stack>
            <span id="sealed">
              <HashLine hash={batch.root} copyLabel="Copy batch root hash" />
            </span>
          </OverviewRow>
          <OverviewRow label="Proof system" stack>
            {batch.proofRef ? (
              <span id="proof-hash">
                <HashLine hash={batch.proofRef} copyLabel="Copy proof hash" />
              </span>
            ) : (
              "TEE-attested"
            )}
          </OverviewRow>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-col gap-4">
          <LifecycleStepper status={batch.status} sealedRel={sealedRel} />

          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="t-h3 m-0">Pairs in batch</h2>
              <span className="text-[13px] text-[var(--muted-foreground)]">
                {pairCount} {pairCount === 1 ? "pair" : "pairs"} · {batch.fillCount} fills
              </span>
            </div>

            {batch.status === "failed" && batch.failureReason ? (
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                {batch.failureReason}
              </p>
            ) : null}

            <div className="flex flex-col">
              {aggregates.length === 0 ? (
                <span className="py-3 font-mono text-xs text-[var(--muted-foreground)]">
                  —
                </span>
              ) : (
                aggregates.map((aggregate, i) => (
                  <div
                    key={aggregate.pair}
                    className={cn(
                      "flex items-center gap-4 py-3",
                      i > 0 ? "border-t border-[var(--border)]" : undefined,
                    )}
                  >
                    <span className="w-[120px] flex-shrink-0 font-mono text-sm font-medium">
                      {aggregate.pair}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className="h-full rounded-full bg-[var(--foreground)]"
                        style={{ width: `${Math.round(aggregate.share * 100)}%` }}
                      />
                    </div>
                    <span className="w-[88px] flex-shrink-0 whitespace-nowrap text-right font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
                      {aggregate.fillCount > 0
                        ? `${aggregate.fillCount} fill${aggregate.fillCount > 1 ? "s" : ""}`
                        : `${(aggregate.share * 100).toFixed(0)}%`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <PrivacyNote />
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Lifecycle stepper (Submitted → Proven → Settled)                       */
/* ─────────────────────────────────────────────────────────────────────── */

const LIFECYCLE = [
  { key: "submitted", label: "Submitted", sub: "Batch sealed", icon: "batches" },
  { key: "proven", label: "Proven", sub: "Proof attested", icon: "proof" },
  { key: "settled", label: "Settled", sub: "Onchain · L1", icon: "settled" },
] as const;

// The app's three batch statuses collapse onto the kit's three lifecycle
// stops: pending = Submitted, verified = Settled (fully advanced). A failed
// settlement is shown as reaching Proven but not Settled.
function activeIndexFor(status: BatchStatus): number {
  if (status === "verified") return 2;
  if (status === "failed") return 1;
  return 0;
}

function LifecycleStepper({
  status,
  sealedRel,
}: {
  status: BatchStatus;
  sealedRel: string;
}) {
  const activeIdx = activeIndexFor(status);
  return (
    <div className="panel flex items-start rounded-[var(--radius-xl)] px-6 py-[22px]">
      {LIFECYCLE.map((step, i) => {
        const done = i < activeIdx;
        const current = i === activeIdx;
        const reached = done || current;
        const id = STEP_ID[step.key];
        const StepIcon = done ? Icon.Confirm : STEP_ICON[step.icon];
        return (
          <React.Fragment key={step.key}>
            <div
              id={id}
              className="flex w-[110px] flex-[0_0_auto] flex-col items-center gap-2"
            >
              <span
                aria-hidden
                className={cn(
                  "inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border",
                  current ? styles.pulse : undefined,
                )}
                style={{
                  borderColor: reached
                    ? "color-mix(in oklab, var(--success) 45%, transparent)"
                    : "var(--border)",
                  background: reached
                    ? "color-mix(in oklab, var(--success) 12%, transparent)"
                    : "transparent",
                  color: reached ? "var(--success)" : "var(--muted-foreground)",
                }}
              >
                <StepIcon className="h-4 w-4" />
              </span>
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className={cn(
                    "font-mono text-[11px] uppercase tracking-[0.1em]",
                    reached
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)]",
                  )}
                >
                  {step.label}
                </span>
                <span className="whitespace-nowrap text-[11px] text-[var(--muted-foreground)]">
                  {current && status === "pending" ? sealedRel : step.sub}
                </span>
              </div>
            </div>
            {i < LIFECYCLE.length - 1 ? (
              <div
                className="mt-[17px] h-px flex-1"
                style={{
                  background:
                    i < activeIdx
                      ? "color-mix(in oklab, var(--success) 45%, transparent)"
                      : "var(--border)",
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const STEP_ICON = {
  batches: Icon.Batches,
  proof: Icon.Proof,
  settled: Icon.Settled,
} as const;

// Hash deep-link anchors preserved so `/batches/N#proven` etc. still land.
const STEP_ID: Record<(typeof LIFECYCLE)[number]["key"], string> = {
  submitted: "queued",
  proven: "proven",
  settled: "settled",
};

/* ─────────────────────────────────────────────────────────────────────── */
/*  Small parts                                                            */
/* ─────────────────────────────────────────────────────────────────────── */

function OverviewRow({
  label,
  children,
  first,
  stack,
}: {
  label: string;
  children: React.ReactNode;
  first?: boolean;
  stack?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-3 py-[11px]",
        stack ? "flex-col items-start gap-1.5" : "flex-row items-center",
        first ? undefined : "border-t border-[var(--border)]",
      )}
    >
      <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <div
        className={cn(
          "min-w-0 font-mono text-[13px] tabular-nums text-[var(--foreground)]",
          stack ? "break-all text-left" : "text-right",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function HashLine({ hash, copyLabel }: { hash: string; copyLabel: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
      <span className="font-mono text-xs text-[var(--foreground)]">
        {shortHash(hash)}
      </span>
      <CopyButton value={hash} label={copyLabel} />
      <EtherscanTxLink hash={hash} label="Etherscan" className="text-[11px]" />
    </span>
  );
}

function PrivacyNote() {
  return (
    <div className="flex items-start gap-2 px-1">
      <Icon.Sign className="mt-px h-[13px] w-[13px] flex-shrink-0 text-[var(--muted-foreground)]" aria-hidden />
      <span className="text-xs leading-relaxed text-[var(--muted-foreground)]">
        Counterparties are never revealed — the proof attests correct midpoint
        matching without disclosing identities. Individual fills are visible
        only to their owner via{" "}
        <Link
          href="/portfolio"
          className="underline-offset-4 hover:text-[var(--foreground)] hover:underline"
        >
          /portfolio
        </Link>
        .
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Loading skeleton                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

function BatchDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skel className="h-[34px] w-[120px] rounded-full" />
      <Skel className="h-[92px] w-full rounded-[var(--radius-xl)]" />
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[320px_minmax(0,1fr)]">
        <Skel className="h-[380px] w-full rounded-[var(--radius-xl)]" />
        <div className="flex flex-col gap-4">
          <Skel className="h-[88px] w-full rounded-[var(--radius-xl)]" />
          <div className="flex flex-col gap-3.5">
            <Skel className="h-5 w-36" />
            <SkelRows n={3} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Skel({
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

function SkelRows({ n }: { n: number }) {
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
/*  Format helpers                                                         */
/* ─────────────────────────────────────────────────────────────────────── */

function formatGroup(value: number | string): string {
  const [whole, frac] = String(value).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

function roundStr(value: string): string {
  const n = parseNum(value);
  return String(Math.round(n));
}

function shortHash(h: string): string {
  return h.length > 18 ? `${h.slice(0, 10)}…${h.slice(-8)}` : h;
}

function batchNo(id: number): string {
  return "#" + formatGroup(id);
}
