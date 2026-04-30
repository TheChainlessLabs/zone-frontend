"use client";

/**
 * Expanded-row detail panels for `/portfolio` (M4.15).
 *
 * One component per list — Open positions, Recent fills, Transfers — so
 * each can pull the right fixture shape and synthesise missing
 * lifecycle data deterministically. M6 will replace the synthetic
 * timestamps / batch numbers / proof hashes with backend-sourced
 * values.
 *
 * Why these live in the variants tree (not `components/portfolio/`):
 * the panels are tightly coupled to the variant-11 fixture shapes and
 * the surrounding layout grid. The reusable primitive is
 * `ExpandableRow` itself, which stays in `components/portfolio/`.
 */

import * as React from "react";

import { CopyButton } from "@/app/batches/_components/copy-button";
import { EtherscanTxLink } from "@/app/batches/_components/etherscan-link";
import { LifecyclePip } from "@/components/portfolio/lifecycle-pip";
import {
  OrderPipeline,
  type ActiveStage,
  type PipelineStage,
} from "@/components/trade";
import { cn } from "@/lib/utils";
import { copyForStatusState } from "@/lib/lifecycle-copy";
import type {
  DepositFixture,
  FillFixture,
  OrderFixture,
  WithdrawalFixture,
} from "@/lib/fixtures";

import { formatTime, MonoNum, parseNum } from "./_shared";

const PILL = "font-mono text-[10px] uppercase tracking-[0.18em]";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Synthesis helpers — fixture-only, deterministic                            */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Derive a 4-digit batch number from a stable string id. Deterministic
 * so the same row always shows the same batch — fixture-only until M6.
 */
function batchNumberFor(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return 4800 + (Math.abs(hash) % 200);
}

/**
 * Synthesise a ~32-byte hex digest from a seed. Stable across renders so
 * the proof-hash slot reads consistently. Replaced by real proofRef
 * values in M6.
 */
function synthHash(seed: string, prefix = "0x"): `0x${string}` {
  let hash = BigInt(0);
  for (let i = 0; i < seed.length; i++) {
    hash = hash * BigInt(131) + BigInt(seed.charCodeAt(i));
  }
  // Spread the seed across 64 hex chars by repeating + xoring.
  const base = hash.toString(16).padStart(8, "0");
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += base.slice(i % base.length).padStart(8, "0");
  }
  return `${prefix}${out.slice(0, 64)}` as `0x${string}`;
}

/**
 * Map an OrderFixture status to a pipeline stage + (when failed) the
 * stage that failed. Mapping rationale:
 *   • `pending` — order accepted by the gateway, waiting for the next
 *     batch to seal. The pipeline reads this as `queued`.
 *   • `matched` — fills landed against the order in a sealed batch.
 *   • `settled` — L1 anchor confirmed.
 *   • `cancelled` — terminal pre-settlement; we read it as `idle` so
 *     the rail does not falsely advertise progress. The summary row
 *     already carries the cancelled chip.
 *   • `failed` — settlement reverted; the rail paints destructive at
 *     `settling` (the most common failure mode — see lifecycle-copy).
 */
export function pipelineStageForOrder(
  status: OrderFixture["status"],
): { stage: PipelineStage; failedAt?: ActiveStage } {
  switch (status) {
    case "pending":
      return { stage: "queued" };
    case "matched":
      return { stage: "matched" };
    case "settled":
      return { stage: "settled" };
    case "failed":
      return { stage: "failed", failedAt: "settling" };
    case "cancelled":
    default:
      return { stage: "idle" };
  }
}

/**
 * Synthesise per-stage ISO timestamps anchored on the fixture's known
 * timestamp. For an order: submittedAt → matched + 90s → settled + 12m.
 * For a fill / transfer: matchedAt or initiatedAt is the anchor.
 *
 * Deterministic offsets so re-renders don't shuffle the timeline.
 */
function offsetIso(iso: string, offsetSec: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t + offsetSec * 1000).toISOString();
}

interface StageRow {
  label: string;
  iso: string | null;
  reached: boolean;
  failed?: boolean;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Open positions — full pipeline + identifying metadata                      */
/* ────────────────────────────────────────────────────────────────────────── */

export function OpenPositionExpanded({ order }: { order: OrderFixture }) {
  const { stage, failedAt } = pipelineStageForOrder(order.status);
  const batchNum = batchNumberFor(order.id);
  const midpointAtSubmit = (parseNum(order.price) * 1.0001).toFixed(4);

  const stages: StageRow[] = [
    {
      label: "Sign",
      iso: offsetIso(order.submittedAt, -2),
      reached: stage !== "idle",
    },
    {
      label: "Queued",
      iso: order.submittedAt,
      reached:
        stage === "queued" ||
        stage === "matched" ||
        stage === "settling" ||
        stage === "settled" ||
        stage === "failed",
    },
    {
      label: "Matched",
      iso:
        order.status === "matched" ||
        order.status === "settled" ||
        order.status === "failed"
          ? offsetIso(order.submittedAt, 90)
          : null,
      reached:
        stage === "matched" ||
        stage === "settling" ||
        stage === "settled" ||
        (stage === "failed" && failedAt !== "matched"),
    },
    {
      label: "Settling",
      iso:
        order.status === "settled" || order.status === "failed"
          ? offsetIso(order.submittedAt, 720)
          : null,
      reached: stage === "settled",
      failed: stage === "failed" && failedAt === "settling",
    },
    {
      label: "Settled",
      iso:
        order.status === "settled" ? offsetIso(order.submittedAt, 750) : null,
      reached: stage === "settled",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <OrderPipeline stage={stage} failedAt={failedAt} />

      {order.status === "failed" ? (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 text-xs text-[var(--destructive)]"
        >
          Settlement reverted on L1. Fills remain valid offchain — no
          action required.
        </div>
      ) : null}

      <StageTimeline stages={stages} />

      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-xs">
        <DetailRow label="Order ID">
          <span className="inline-flex items-center gap-1.5">
            <MonoNum>{order.id}</MonoNum>
            <CopyButton value={order.id} label="Copy order ID" />
          </span>
        </DetailRow>
        <DetailRow label="Pair">
          <MonoNum>{order.pair}</MonoNum>
        </DetailRow>
        <DetailRow label="Side">
          <span className={cn(PILL, sideTone(order.side))}>{order.side}</span>
        </DetailRow>
        <DetailRow label="Type">
          <MonoNum className="text-[var(--muted-foreground)]">
            {order.type}
          </MonoNum>
        </DetailRow>
        <DetailRow label="Size">
          <MonoNum>{order.amount}</MonoNum>
        </DetailRow>
        <DetailRow label="Filled">
          <MonoNum>{order.filledPercent}%</MonoNum>
        </DetailRow>
        <DetailRow label="Limit price">
          <MonoNum>{order.price}</MonoNum>
        </DetailRow>
        <DetailRow label="Midpoint at submit">
          <MonoNum className="text-[var(--muted-foreground)]">
            {midpointAtSubmit}
          </MonoNum>
        </DetailRow>
        <DetailRow label="Batch">
          <MonoNum className="text-[var(--muted-foreground)]">
            #{batchNum}
          </MonoNum>
        </DetailRow>
      </dl>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Recent fills — larger lifecycle pip + proof + settlement tx                */
/* ────────────────────────────────────────────────────────────────────────── */

export function RecentFillExpanded({ fill }: { fill: FillFixture }) {
  const batchNum = batchNumberFor(fill.id);
  const proofHash = synthHash(`${fill.id}-proof`);
  // Token fee = 0.05% of notional.
  const fees = (parseNum(fill.amount) * parseNum(fill.price) * 0.0005).toFixed(
    4,
  );

  const stages: StageRow[] = [
    {
      label: "Queued",
      iso: offsetIso(fill.matchedAt, -45),
      reached: true,
    },
    {
      label: "Sealed",
      iso: fill.matchedAt,
      reached: true,
    },
    {
      label: "Proven",
      iso:
        fill.status === "proven" || fill.status === "settled"
          ? offsetIso(fill.matchedAt, 240)
          : null,
      reached: fill.status === "proven" || fill.status === "settled",
    },
    {
      label: "Settled",
      iso:
        fill.status === "settled" ? offsetIso(fill.matchedAt, 720) : null,
      reached: fill.status === "settled",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="scale-[1.5] origin-left">
          <LifecyclePip status={fill.status} />
        </span>
        <span className={cn(PILL, "text-[var(--muted-foreground)]")}>
          {copyForStatusState(fill.status as never) ?? ""}
        </span>
      </div>

      <StageTimeline stages={stages} />

      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-xs">
        <DetailRow label="Pair">
          <MonoNum>{fill.pair}</MonoNum>
        </DetailRow>
        <DetailRow label="Side">
          <span className={cn(PILL, sideTone(fill.side))}>{fill.side}</span>
        </DetailRow>
        <DetailRow label="Amount">
          <MonoNum>{fill.amount}</MonoNum>
        </DetailRow>
        <DetailRow label="Price">
          <MonoNum>{fill.price}</MonoNum>
        </DetailRow>
        <DetailRow label="Fees">
          <MonoNum className="text-[var(--muted-foreground)]">{fees}</MonoNum>
        </DetailRow>
        <DetailRow label="Filled at">
          <MonoNum className="text-[var(--muted-foreground)]">
            {formatTime(fill.matchedAt)}
          </MonoNum>
        </DetailRow>
        <DetailRow label="Batch">
          <MonoNum className="text-[var(--muted-foreground)]">
            #{batchNum}
          </MonoNum>
        </DetailRow>
        <DetailRow label="Proof hash">
          <span className="inline-flex items-center gap-0.5">
            <EtherscanTxLink hash={proofHash} />
            <CopyButton value={proofHash} label="Copy proof hash" />
          </span>
        </DetailRow>
        <DetailRow label="Settlement tx">
          {fill.txHash ? (
            <span className="inline-flex items-center gap-0.5">
              <EtherscanTxLink hash={fill.txHash} />
              <CopyButton value={fill.txHash} label="Copy settlement tx" />
            </span>
          ) : (
            <MonoNum className="text-[var(--muted-foreground)]">—</MonoNum>
          )}
        </DetailRow>
      </dl>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Transfers — token + amount + L1 tx + per-stage timeline                    */
/* ────────────────────────────────────────────────────────────────────────── */

export type TransferDetail =
  | { kind: "deposit"; row: DepositFixture }
  | { kind: "withdrawal"; row: WithdrawalFixture };

export function TransferExpanded({ transfer }: { transfer: TransferDetail }) {
  const isWithdrawal = transfer.kind === "withdrawal";
  const r = transfer.row;
  const completedIso =
    r.status === "settled" ? offsetIso(r.initiatedAt, 720) : null;

  const stages: StageRow[] = isWithdrawal
    ? [
        {
          label: "Sign",
          iso: offsetIso(r.initiatedAt, -3),
          reached: r.status !== "awaiting-signature",
        },
        {
          label: "Queued",
          iso: r.initiatedAt,
          reached:
            r.status === "pending" ||
            r.status === "settled" ||
            r.status === "failed",
        },
        {
          label: "L1 anchor",
          iso: completedIso,
          reached: r.status === "settled",
          failed: r.status === "failed",
        },
      ]
    : [
        {
          label: "Broadcast",
          iso: r.initiatedAt,
          reached: true,
        },
        {
          label: "L1 confirmation",
          iso: r.status === "pending" ? null : offsetIso(r.initiatedAt, 60),
          reached: r.status === "settled",
          failed: r.status === "failed",
        },
        {
          label: "Credited",
          iso: r.status === "settled" ? offsetIso(r.initiatedAt, 90) : null,
          reached: r.status === "settled",
        },
      ];

  return (
    <div className="flex flex-col gap-4">
      <StageTimeline stages={stages} />

      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-xs">
        <DetailRow label="Direction">
          <span
            className={cn(
              PILL,
              isWithdrawal
                ? "text-[var(--muted-foreground)]"
                : "text-[var(--success)]",
            )}
          >
            {isWithdrawal ? "Withdrawal" : "Deposit"}
          </span>
        </DetailRow>
        <DetailRow label="Token">
          <MonoNum>{r.token}</MonoNum>
        </DetailRow>
        <DetailRow label="Amount">
          <MonoNum>{r.amount}</MonoNum>
        </DetailRow>
        <DetailRow label="Status">
          <MonoNum className="text-[var(--muted-foreground)]">
            {r.status}
          </MonoNum>
        </DetailRow>
        <DetailRow label="Initiated at">
          <MonoNum className="text-[var(--muted-foreground)]">
            {formatTime(r.initiatedAt)}
          </MonoNum>
        </DetailRow>
        <DetailRow label="Completed at">
          <MonoNum className="text-[var(--muted-foreground)]">
            {completedIso ? formatTime(completedIso) : "—"}
          </MonoNum>
        </DetailRow>
        <DetailRow label="L1 tx">
          {r.txHash ? (
            <span className="inline-flex items-center gap-0.5">
              <EtherscanTxLink hash={r.txHash} />
              <CopyButton value={r.txHash} label="Copy L1 tx hash" />
            </span>
          ) : (
            <MonoNum className="text-[var(--muted-foreground)]">—</MonoNum>
          )}
        </DetailRow>
      </dl>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Building blocks                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function StageTimeline({ stages }: { stages: StageRow[] }) {
  return (
    <ol className="flex flex-col gap-1.5 text-xs">
      {stages.map((s) => (
        <li
          key={s.label}
          className="flex items-center justify-between gap-3"
          data-stage={s.label.toLowerCase()}
          data-state={
            s.failed ? "failed" : s.reached ? "reached" : "future"
          }
        >
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                s.failed
                  ? "bg-[var(--destructive)]"
                  : s.reached
                    ? "bg-[var(--success)]"
                    : "border border-[var(--border)]",
              )}
            />
            <span
              className={cn(
                PILL,
                s.reached || s.failed
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)]",
              )}
            >
              {s.label}
            </span>
          </span>
          <MonoNum
            className={cn(
              "text-[var(--muted-foreground)]",
              !s.reached && !s.failed && "opacity-60",
            )}
          >
            {s.iso ? formatTime(s.iso) : "—"}
          </MonoNum>
        </li>
      ))}
    </ol>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt
        className={cn(
          PILL,
          "text-[10px] text-[var(--muted-foreground)] self-center",
        )}
      >
        {label}
      </dt>
      <dd className="min-w-0 self-center">{children}</dd>
    </>
  );
}

function sideTone(side: "buy" | "sell") {
  return side === "buy"
    ? "text-[var(--success)]"
    : "text-[var(--destructive)]";
}
