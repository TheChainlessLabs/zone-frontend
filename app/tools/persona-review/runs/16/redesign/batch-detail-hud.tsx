// Omar El-Sayed redesign: rebuild the batch detail page as a competitive-state HUD so proof progression is readable under pressure.
"use client";

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { BatchesDetailFixture } from "@/lib/fixtures/types";
import {
  aggregateByPair,
  batchStateSteps,
  EYEBROW,
  fmtCompactUsd,
  formatStampUtc,
  HashCell,
  MonoNum,
  parseNum,
  STATUS_TONE,
} from "@/app/batches/preview/_variants/_shared";

type Persona16BatchDetailHudProps = {
  fixture: BatchesDetailFixture;
  listHref?: string;
};

export default function Persona16BatchDetailHud({
  fixture,
  listHref = "/batches",
}: Persona16BatchDetailHudProps) {
  const { batch, fills } = fixture;
  const tone = STATUS_TONE[batch.status];
  const steps = batchStateSteps(batch);
  const activeStepIndex = getActiveStepIndex(steps);
  const activeStep = steps[activeStepIndex];
  const reached = steps.filter((step) => step.reached).length;
  const progress = `${reached}/${steps.length}`;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const incident =
    batch.status === "failed"
      ? {
          title: "Settlement interrupted",
          detail:
            batch.failureReason ??
            "A settlement fault blocked the final L1 anchor.",
          checkpoint: batch.proofRef ? "Proof recorded before failure." : "Proof not yet recorded.",
        }
      : batch.status === "pending"
        ? {
            title: "Awaiting next stage",
            detail:
              activeStep?.hint ??
              "The batch is sealed and waiting for the next verification event.",
            checkpoint: batch.proofRef ? "Proof hash is present." : "Proof hash not published yet.",
          }
        : {
            title: "Verification complete",
            detail: "Every attestation lane is locked and the L1 anchor is visible.",
            checkpoint: "Public audit references are live.",
          };

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        Back to attestation log
      </Link>

      <section
        className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)]"
        style={{
          boxShadow:
            "0 20px 60px -36px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: tone.fg }}
        />
        <div className="grid gap-0 xl:grid-cols-[1.3fr_0.92fr]">
          <div className="border-b border-[var(--border)] p-5 xl:border-b-0 xl:border-r xl:p-7">
            <HeroHeader
              batchNumber={batch.number}
              sealedAt={batch.sealedAt}
              statusLabel={tone.label}
              progress={progress}
              activeLabel={activeStep.label}
              activeHint={activeStep.hint ?? "Waiting for the next attestation event."}
              tone={tone}
            />
            <div className="mt-6 grid gap-3 md:grid-cols-[220px_1fr]">
              <StageRadar
                status={batch.status}
                progress={progress}
                tone={tone}
                activeLabel={activeStep.label}
              />
              <StageRail steps={steps} activeIndex={activeStepIndex} />
            </div>
            <IncidentBar
              title={incident.title}
              detail={incident.detail}
              checkpoint={incident.checkpoint}
              status={batch.status}
            />
          </div>

          <aside className="p-5 xl:p-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <KpiTile label="Volume" value={batch.volumeUsd ? fmtCompactUsd(parseNum(batch.volumeUsd)) : "-"} />
              <KpiTile label="Orders" value={String(batch.orderCount)} />
              <KpiTile label="Fills" value={String(batch.fillCount)} />
              <KpiTile label="Pairs" value={String((batch.pairs ?? []).length)} />
            </div>

            <AuditPanel
              title="Proof telemetry"
              items={[
                { label: "Batch root", value: <HashCell hash={batch.root} lead={10} tail={8} /> },
                {
                  label: "Proof hash",
                  value: batch.proofRef ? (
                    <HashCell hash={batch.proofRef} lead={10} tail={8} />
                  ) : (
                    <span className="font-mono text-sm text-[var(--muted-foreground)]">pending</span>
                  ),
                },
                {
                  label: "L1 settlement",
                  value: batch.settlementTx ? (
                    <HashCell hash={batch.settlementTx} lead={10} tail={8} />
                  ) : (
                    <span className="font-mono text-sm text-[var(--muted-foreground)]">pending</span>
                  ),
                },
                {
                  label: "Submitter",
                  value: <span className="font-mono text-sm">Sequencer #1 - TEE</span>,
                },
              ]}
            />
          </aside>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <PairPressurePanel aggregates={aggregates} />
        <SystemContractPanel status={batch.status} />
      </div>
    </div>
  );
}

function HeroHeader({
  batchNumber,
  sealedAt,
  statusLabel,
  progress,
  activeLabel,
  activeHint,
  tone,
}: {
  batchNumber: number;
  sealedAt: string;
  statusLabel: string;
  progress: string;
  activeLabel: string;
  activeHint: string;
  tone: { fg: string; bg: string; border: string };
}) {
  return (
    <header className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
      <div className="space-y-2">
        <span className={EYEBROW}>Settlement attestation</span>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-3xl font-semibold tracking-tight md:text-4xl">
            Batch #{batchNumber}
          </h1>
          <StatusLozenge label={statusLabel} tone={tone} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted-foreground)]">
          <span>Sealed {formatStampUtc(sealedAt)}</span>
          <span className="font-mono uppercase tracking-[0.18em] text-[11px]">
            live phase {activeLabel}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 text-right">
        <div className={EYEBROW}>Stage lock</div>
        <MonoNum className="mt-1 text-3xl font-semibold leading-none">
          {progress}
        </MonoNum>
        <p className="mt-2 max-w-[18rem] text-xs leading-relaxed text-[var(--muted-foreground)]">
          {activeHint}
        </p>
      </div>
    </header>
  );
}

function StageRadar({
  status,
  progress,
  tone,
  activeLabel,
}: {
  status: "pending" | "verified" | "failed";
  progress: string;
  tone: { fg: string; bg: string; border: string };
  activeLabel: string;
}) {
  const [done, total] = progress.split("/").map((value) => Number(value));
  const fraction = total > 0 ? done / total : 0;
  const circumference = 2 * Math.PI * 78;
  const offset = circumference * (1 - fraction);
  const IconGlyph =
    status === "verified"
      ? Icon.Settled
      : status === "failed"
        ? Icon.Failed
        : Icon.Pending;

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--muted)_45%,transparent),transparent)] p-5">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="196" height="196" viewBox="0 0 196 196" aria-hidden>
            <circle
              cx="98"
              cy="98"
              r="78"
              fill="none"
              stroke="color-mix(in oklab, var(--muted-foreground) 18%, transparent)"
              strokeWidth="18"
            />
            <circle
              cx="98"
              cy="98"
              r="78"
              fill="none"
              stroke={tone.fg}
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 98 98)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={EYEBROW}>Stage</span>
            <MonoNum className="mt-1 text-4xl font-semibold leading-none">
              {progress}
            </MonoNum>
            <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              {activeLabel}
            </span>
          </div>
        </div>
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
          style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.fg }}
        >
          <IconGlyph className="h-4 w-4" aria-hidden />
          <span>{status === "verified" ? "All checks locked" : status === "failed" ? "Manual attention required" : "Waiting for next signal"}</span>
        </div>
      </div>
    </div>
  );
}

function StageRail({
  steps,
  activeIndex,
}: {
  steps: ReturnType<typeof batchStateSteps>;
  activeIndex: number;
}) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isDone = step.reached && !isActive;
        const isFailed = !!step.failed;
        const stateLabel = isFailed
          ? "FAILED"
          : isActive
            ? "LIVE"
            : step.reached
              ? "LOCKED"
              : "WAITING";

        return (
          <li
            key={step.key}
            className={cn(
              "rounded-[20px] border px-4 py-4 transition-colors",
              isActive && "bg-[var(--muted)]/30",
            )}
            style={{
              borderColor: isFailed
                ? "color-mix(in oklab, var(--destructive) 35%, var(--border))"
                : isActive
                  ? "color-mix(in oklab, var(--success) 28%, var(--border))"
                  : "var(--border)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className={EYEBROW}>{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="font-mono text-lg font-medium uppercase tracking-[0.08em]">
                    {step.label}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {step.hint}
                </p>
              </div>
              <span
                className="font-mono text-xs uppercase tracking-[0.18em]"
                style={{
                  color: isFailed
                    ? "var(--destructive)"
                    : isActive
                      ? "var(--success)"
                      : isDone
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                }}
              >
                {stateLabel}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function IncidentBar({
  title,
  detail,
  checkpoint,
  status,
}: {
  title: string;
  detail: string;
  checkpoint: string;
  status: "pending" | "verified" | "failed";
}) {
  const palette =
    status === "failed"
      ? {
          fg: "var(--destructive)",
          bg: "color-mix(in oklab, var(--destructive) 12%, transparent)",
          border: "color-mix(in oklab, var(--destructive) 35%, transparent)",
        }
      : status === "verified"
        ? {
            fg: "var(--success)",
            bg: "color-mix(in oklab, var(--success) 10%, transparent)",
            border: "color-mix(in oklab, var(--success) 28%, transparent)",
          }
        : {
            fg: "var(--foreground)",
            bg: "color-mix(in oklab, var(--muted-foreground) 10%, transparent)",
            border: "color-mix(in oklab, var(--muted-foreground) 25%, transparent)",
          };

  return (
    <div
      className="mt-5 rounded-[22px] border px-4 py-4"
      style={{ backgroundColor: palette.bg, borderColor: palette.border }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: palette.fg }}>
          Incident lane
        </span>
        <h3 className="text-base font-medium">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed">{detail}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
        Last checkpoint: {checkpoint}
      </p>
    </div>
  );
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--muted)]/20 px-4 py-4">
      <div className={EYEBROW}>{label}</div>
      <MonoNum className="mt-2 text-2xl font-semibold leading-none">{value}</MonoNum>
    </div>
  );
}

function AuditPanel({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <Card className="mt-4 rounded-[22px] border-[var(--border)] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-mono text-sm uppercase tracking-[0.18em]">{title}</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          public audit
        </span>
      </div>
      <div className="mt-4 grid gap-4">
        {items.map((item) => (
          <div key={item.label} className="grid gap-1">
            <span className={EYEBROW}>{item.label}</span>
            <div className="min-w-0">{item.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PairPressurePanel({
  aggregates,
}: {
  aggregates: ReturnType<typeof aggregateByPair>;
}) {
  return (
    <Card className="rounded-[24px] border-[var(--border)] p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={EYEBROW}>Pair pressure</div>
          <h2 className="mt-1 font-mono text-2xl font-semibold tracking-tight">
            Aggregate fill lanes
          </h2>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          by batch share
        </span>
      </div>
      <div className="mt-5 grid gap-3">
        {aggregates.map((aggregate, index) => (
          <div
            key={aggregate.pair}
            className="rounded-[18px] border border-[var(--border)] bg-[var(--muted)]/12 px-4 py-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={EYEBROW}>{String(index + 1).padStart(2, "0")}</span>
                <span className="font-mono text-lg uppercase tracking-[0.08em]">
                  {aggregate.pair}
                </span>
              </div>
              <span className="font-mono text-sm tabular-nums">
                {(aggregate.share * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full bg-[var(--success)]"
                style={{ width: `${Math.max(aggregate.share * 100, 2)}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-sm text-[var(--muted-foreground)]">
              <span>{aggregate.fillCount} fills</span>
              <span>{aggregate.totalBaseAmount.toFixed(2)} base</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SystemContractPanel({
  status,
}: {
  status: "pending" | "verified" | "failed";
}) {
  const copy =
    status === "failed"
      ? "The batch failed at the settlement layer, but the page should still preserve the last safe checkpoint and expose exactly which lane broke."
      : status === "pending"
        ? "The batch is live. The interface should keep the active lane louder than the completed lanes until the next proof signal lands."
        : "The batch is closed. Once everything is verified, the page can relax into audit mode without losing the state chronology.";

  return (
    <Card className="rounded-[24px] border-[var(--border)] p-5 md:p-6">
      <div className="flex items-center gap-2">
        <Icon.Proof className="h-4 w-4" aria-hidden />
        <h2 className="text-base font-medium">Externally verifiable</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {copy}
      </p>
      <div className="mt-5 grid gap-3">
        {[
          "No counterparty identity on this surface.",
          "Proof and settlement references stay public.",
          "Current stage must beat prose in the visual hierarchy.",
        ].map((rule) => (
          <div
            key={rule}
            className="flex items-start gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--muted)]/15 px-4 py-3"
          >
            <span className="mt-0.5 h-2 w-2 rounded-full bg-[var(--success)]" aria-hidden />
            <span className="text-sm">{rule}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function StatusLozenge({
  label,
  tone,
}: {
  label: string;
  tone: { fg: string; bg: string; border: string };
}) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
      style={{
        color: tone.fg,
        backgroundColor: tone.bg,
        borderColor: tone.border,
      }}
    >
      <span
        aria-hidden
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: tone.fg }}
      />
      {label}
    </span>
  );
}

function getActiveStepIndex(steps: ReturnType<typeof batchStateSteps>) {
  const waitingIndex = steps.findIndex((step) => !step.reached);
  if (waitingIndex !== -1) {
    return waitingIndex;
  }
  const failedIndex = steps.findIndex((step) => step.failed);
  if (failedIndex !== -1) {
    return failedIndex;
  }
  return Math.max(steps.length - 1, 0);
}
