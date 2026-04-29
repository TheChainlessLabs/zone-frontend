// @ts-nocheck
// Rebuilds batch detail around one quiet lifecycle rail so pending and verified states feel inevitable rather than decorative.
"use client";

import * as React from "react";
import Link from "next/link";

import { Animate } from "@/components/ui/animate";
import { Card } from "@/components/ui/card";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type {
  BatchFixture,
  BatchesDetailFixture,
  MarketPair,
} from "@/lib/fixtures/types";
import {
  aggregateByPair,
  fmtCompactUsd,
  formatStampUtc,
  parseNum,
  truncateHash,
} from "@/app/batches/preview/_variants/_shared";

type LifecycleTone = "done" | "active" | "upcoming" | "failed";

interface QuietBatchDetailViewProps {
  fixture: BatchesDetailFixture;
  listHref?: string;
}

interface LifecycleStep {
  key: string;
  label: string;
  meta: string;
  tone: LifecycleTone;
}

export default function QuietBatchDetailView({
  fixture,
  listHref = "/batches",
}: QuietBatchDetailViewProps) {
  const { batch, fills } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const steps = buildLifecycle(batch);
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.tone === "active"),
  );
  const completed = steps.filter((step) => step.tone === "done").length;
  const progress = Math.round((completed / (steps.length - 1)) * 100);
  const evidence = buildEvidence(batch);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        Attestation log
      </Link>

      <Card className="grid gap-5 p-4 md:grid-cols-[minmax(0,1.3fr)_320px] md:p-6">
        <section className="flex flex-col gap-5">
          <header className="flex flex-col gap-3 border-b border-[var(--border)] pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Settlement attestation
                </span>
                <h2 className="font-mono text-2xl font-medium tracking-tight">
                  Batch #{batch.number}
                </h2>
              </div>
              <Status
                state={statusState(batch)}
                label={statusLabel(batch)}
                className="self-start"
              />
            </div>
            <div className="grid gap-2 text-sm text-[var(--muted-foreground)] sm:grid-cols-3">
              <MetaRow label="Sealed" value={formatStampUtc(batch.sealedAt)} />
              <MetaRow
                label="Progress"
                value={`${completed}/${steps.length} stages complete`}
              />
              <MetaRow label="Next" value={steps[activeIndex]?.label ?? "Done"} />
            </div>
          </header>

          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <ProgressColumn progress={progress} activeIndex={activeIndex} />
            <ol className="flex flex-col gap-2">
              {steps.map((step, index) => (
                <LifecycleRow
                  key={step.key}
                  step={step}
                  index={index}
                  isLast={index === steps.length - 1}
                />
              ))}
            </ol>
          </div>

          {batch.failureReason ? (
            <Card className="border border-[color-mix(in_oklab,var(--destructive)_28%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_7%,transparent)] p-4">
              <div className="flex items-start gap-3">
                <Icon.Warning
                  className="mt-0.5 h-4 w-4 text-[var(--destructive)]"
                  aria-hidden
                />
                <div className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--destructive)]">
                    Settlement exception
                  </span>
                  <p className="leading-relaxed text-[var(--foreground)]">
                    {batch.failureReason}
                  </p>
                </div>
              </div>
            </Card>
          ) : null}
        </section>

        <aside className="flex flex-col gap-4">
          <EvidenceCard evidence={evidence} />
          <SummaryCard batch={batch} pairCount={(batch.pairs ?? []).length} />
        </aside>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="flex flex-col gap-3 p-4 md:p-5">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Pair aggregate
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Privacy-safe totals
            </span>
          </header>
          <ul className="flex flex-col">
            {aggregates.map((aggregate, index) => (
              <PairRow
                key={aggregate.pair}
                aggregate={aggregate}
                delay={index * 0.03}
              />
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col gap-3 p-4 md:p-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Verification note
          </span>
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            Proof artefacts appear only when they exist. Until then, the page
            should describe the next stage plainly and remain still.
          </p>
          <div className="grid gap-3 text-sm text-[var(--muted-foreground)]">
            <NoteRow
              title="Open"
              body="Queued and sealed are operational states. They should not borrow success styling."
            />
            <NoteRow
              title="Settled"
              body="Settlement confirms L1 anchoring. It is a fact, not a celebration."
            />
            <NoteRow
              title="Verified"
              body="Verification is the point where evidence becomes externally checkable."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function buildLifecycle(batch: BatchFixture): LifecycleStep[] {
  const hasSettlement = Boolean(batch.settlementTx);
  const hasProof = Boolean(batch.proofRef);
  const failed = batch.status === "failed";

  return [
    {
      key: "queued",
      label: "Queued",
      meta: "Orders accepted into the batch window.",
      tone: "done",
    },
    {
      key: "sealed",
      label: "Sealed",
      meta: "Matching engine sealed the batch.",
      tone: failed ? "done" : "done",
    },
    {
      key: "settled",
      label: "Anchored on L1",
      meta: hasSettlement
        ? "Settlement transaction is available."
        : failed
          ? "Settlement did not complete."
          : "Settlement is the next externally visible step.",
      tone: failed ? "failed" : hasSettlement ? "done" : "active",
    },
    {
      key: "verified",
      label: "Externally verifiable",
      meta: hasProof
        ? "Proof evidence is available for review."
        : "Proof appears only after the batch is ready.",
      tone: failed ? "upcoming" : hasProof ? "done" : hasSettlement ? "active" : "upcoming",
    },
  ];
}

function buildEvidence(batch: BatchFixture) {
  return [
    {
      label: "Batch root",
      value: batch.root,
      ready: true,
    },
    {
      label: "Settlement tx",
      value: batch.settlementTx,
      ready: Boolean(batch.settlementTx),
    },
    {
      label: "Proof hash",
      value: batch.proofRef ?? null,
      ready: Boolean(batch.proofRef),
    },
  ];
}

function statusState(batch: BatchFixture): "pending" | "settled" | "failed" {
  if (batch.status === "verified") return "settled";
  if (batch.status === "failed") return "failed";
  return "pending";
}

function statusLabel(batch: BatchFixture): string {
  if (batch.status === "verified") return "Verified";
  if (batch.status === "failed") return "Attention required";
  return "In progress";
}

function ProgressColumn({
  progress,
  activeIndex,
}: {
  progress: number;
  activeIndex: number;
}) {
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-start gap-4 lg:flex-col lg:gap-3">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full">
          <circle
            cx="60"
            cy="60"
            r="44"
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="44"
            fill="none"
            stroke="var(--success)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Stage
          </span>
          <span className="font-mono text-2xl tabular-nums text-[var(--foreground)]">
            {activeIndex + 1}/4
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Motion note
        </span>
        <p className="max-w-[24ch] text-sm leading-relaxed text-[var(--muted-foreground)]">
          Keep the ring calm. The rail carries state; the circle only confirms
          that the path is progressing.
        </p>
      </div>
    </div>
  );
}

function LifecycleRow({
  step,
  index,
  isLast,
}: {
  step: LifecycleStep;
  index: number;
  isLast: boolean;
}) {
  return (
    <Animate variant="enter" delay={index * 0.03}>
      <li
        className={cn(
          "grid grid-cols-[20px_minmax(0,1fr)] gap-3 rounded-[var(--radius-lg)] px-1 py-2",
          step.tone === "active" && "bg-[var(--muted)]/30",
        )}
      >
        <div className="flex flex-col items-center">
          <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", toneDot(step.tone))} />
          {!isLast ? (
            <span className="mt-2 h-full w-px bg-[var(--border)]" aria-hidden />
          ) : null}
        </div>
        <div className="flex flex-col gap-1 border-b border-[var(--border)] pb-3 last:border-b-0">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--foreground)]">
              {step.label}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              {toneLabel(step.tone)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            {step.meta}
          </p>
        </div>
      </li>
    </Animate>
  );
}

function EvidenceCard({
  evidence,
}: {
  evidence: Array<{ label: string; value: string | null; ready: boolean }>;
}) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Evidence
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Reveal on readiness
        </span>
      </header>
      <div className="flex flex-col gap-2">
        {evidence.map((item, index) => (
          <Animate key={item.label} variant="enter" delay={index * 0.03}>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  {item.label}
                </span>
                <Status
                  state={item.ready ? "settled" : "pending"}
                  label={item.ready ? "Visible" : "Waiting"}
                />
              </div>
              <div className="mt-2 font-mono text-xs text-[var(--foreground)]">
                {item.value ? truncateHash(item.value, 10, 8) : "pending"}
              </div>
            </div>
          </Animate>
        ))}
      </div>
    </Card>
  );
}

function SummaryCard({
  batch,
  pairCount,
}: {
  batch: BatchFixture;
  pairCount: number;
}) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        Batch summary
      </span>
      <div className="grid grid-cols-2 gap-3">
        <SummaryCell
          label="Volume"
          value={batch.volumeUsd ? fmtCompactUsd(parseNum(batch.volumeUsd)) : "—"}
        />
        <SummaryCell label="Orders" value={String(batch.orderCount)} />
        <SummaryCell label="Fills" value={String(batch.fillCount)} />
        <SummaryCell label="Pairs" value={String(pairCount)} />
      </div>
    </Card>
  );
}

function PairRow({
  aggregate,
  delay,
}: {
  aggregate: {
    pair: MarketPair;
    fillCount: number;
    totalBaseAmount: number;
    share: number;
  };
  delay: number;
}) {
  return (
    <Animate variant="enter" delay={delay}>
      <li className="grid grid-cols-[minmax(0,1fr)_88px] gap-4 border-b border-[var(--border)] py-3 last:border-b-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-sm uppercase tracking-[0.12em] text-[var(--foreground)]">
              {aggregate.pair}
            </span>
            <span className="font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
              {aggregate.fillCount} fills
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-[var(--success)]"
              style={{ width: `${Math.max(aggregate.share * 100, 6)}%` }}
            />
          </div>
        </div>
        <div className="text-right font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
          {(aggregate.share * 100).toFixed(1)}%
        </div>
      </li>
    </Animate>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <div className="mt-1 font-mono text-lg tabular-nums text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="font-mono text-xs text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function NoteRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-3">
      <span className="font-medium text-[var(--foreground)]">{title}</span>
      <p className="leading-relaxed">{body}</p>
    </div>
  );
}

function toneDot(tone: LifecycleTone): string {
  switch (tone) {
    case "done":
      return "bg-[var(--success)]";
    case "active":
      return "bg-[var(--foreground)]";
    case "failed":
      return "bg-[var(--destructive)]";
    case "upcoming":
      return "bg-[var(--border)]";
  }
}

function toneLabel(tone: LifecycleTone): string {
  switch (tone) {
    case "done":
      return "Done";
    case "active":
      return "Current";
    case "failed":
      return "Blocked";
    case "upcoming":
      return "Next";
  }
}
