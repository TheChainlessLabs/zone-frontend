"use client";

/**
 * Variant 02 (detail) — Linear-feed.
 *
 * Linear-style ticket card: a tight title row with status pill, a left
 * column body of sections, a right rail of metadata fields. No drama.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/lib/icons";

import {
  aggregateByPair,
  batchStateSteps,
  fmtCompactUsd,
  formatStampUtc,
  HashCell,
  MonoNum,
  PairBars,
  parseNum,
  StatePips,
  StatusPill,
  type DetailVariantProps,
} from "../_shared";

export default function Variant02DetailLinear({
  fixture,
  listHref,
}: DetailVariantProps) {
  const { batch, fills } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const steps = batchStateSteps(batch);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        Back
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-5">
          <header className="flex flex-wrap items-center gap-3">
            <h2 className="font-mono text-2xl font-medium tracking-tight">
              Batch #{batch.number}
            </h2>
            <StatusPill status={batch.status} />
          </header>

          {batch.failureReason ? (
            <p
              className="rounded-md border px-3 py-2 text-xs leading-relaxed"
              style={{
                color: "var(--destructive)",
                backgroundColor:
                  "color-mix(in oklab, var(--destructive) 8%, transparent)",
                borderColor:
                  "color-mix(in oklab, var(--destructive) 30%, transparent)",
              }}
            >
              {batch.failureReason}
            </p>
          ) : null}

          <Section label="Progression">
            <div className="flex items-center gap-4">
              <StatePips steps={steps} width={260} />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                {steps.filter((s) => s.reached).length} / {steps.length}
              </span>
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {steps.map((s) => (
                <li
                  key={s.key}
                  className="flex flex-col gap-0.5 text-xs"
                >
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{
                      color: s.failed
                        ? "var(--destructive)"
                        : s.reached
                          ? "var(--success)"
                          : "var(--muted-foreground)",
                    }}
                  >
                    {s.label}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {s.hint}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section label="Pair breakdown (aggregate)">
            <PairBars aggregates={aggregates} width={520} />
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {aggregates.map((a) => (
                <li
                  key={a.pair}
                  className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="font-mono uppercase tracking-[0.12em]">
                    {a.pair}
                  </span>
                  <span className="flex items-center gap-4 font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
                    <span>{a.fillCount} fills</span>
                    <span>
                      {a.totalBaseAmount > 0
                        ? a.totalBaseAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </span>
                    <span>{(a.share * 100).toFixed(1)}%</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">
              Per-pair aggregate. Order IDs and counterparties never appear
              on this surface.
            </p>
          </Section>
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4 p-5">
            <Field label="Sealed at">
              <MonoNum className="text-xs">
                {formatStampUtc(batch.sealedAt)}
              </MonoNum>
            </Field>
            <Separator />
            <Field label="Volume">
              <MonoNum>
                {batch.volumeUsd
                  ? fmtCompactUsd(parseNum(batch.volumeUsd))
                  : "—"}
              </MonoNum>
            </Field>
            <Field label="Orders">
              <MonoNum>{batch.orderCount}</MonoNum>
            </Field>
            <Field label="Fills">
              <MonoNum>{batch.fillCount}</MonoNum>
            </Field>
            <Separator />
            <Field label="Batch root">
              <HashCell hash={batch.root} lead={8} tail={6} />
            </Field>
            <Field label="Proof hash">
              {batch.proofRef ? (
                <HashCell hash={batch.proofRef} lead={8} tail={6} />
              ) : (
                <span className="font-mono text-xs text-[var(--muted-foreground)]">
                  pending
                </span>
              )}
            </Field>
            <Field label="L1 tx">
              {batch.settlementTx ? (
                <HashCell hash={batch.settlementTx} lead={8} tail={6} />
              ) : (
                <span className="font-mono text-xs text-[var(--muted-foreground)]">
                  pending
                </span>
              )}
            </Field>
            <Field label="Submitter">
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                Sequencer #1 · TEE
              </span>
            </Field>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span>{children}</span>
    </div>
  );
}
