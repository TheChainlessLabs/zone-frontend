"use client";

/**
 * Variant 09 (detail) — Calm narrative.
 *
 * Editorial detail. Lede paragraph contextualises the batch, then
 * sectioned content (Lifecycle, Pairs, Audit). No charts beyond the
 * minimal state pips — the rhythm is paragraph-led.
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
  parseNum,
  StatePips,
  StatusPill,
  type DetailVariantProps,
} from "../_shared";

export default function Variant09DetailNarrative({
  fixture,
  listHref,
}: DetailVariantProps) {
  const { batch, fills } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const steps = batchStateSteps(batch);

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-7">
      <Link
        href={listHref}
        className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
        Settlement record
      </Link>

      <header className="flex flex-col gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Batch
        </span>
        <h2 className="font-mono text-3xl font-medium leading-none tracking-tight">
          #{batch.number}
        </h2>
        <div className="flex items-center gap-3">
          <StatusPill status={batch.status} />
          <span className="font-mono text-xs text-[var(--muted-foreground)]">
            Sealed {formatStampUtc(batch.sealedAt)}
          </span>
        </div>
      </header>

      <p className="max-w-prose text-sm leading-relaxed text-[var(--muted-foreground)]">
        This batch sealed{" "}
        <span className="text-[var(--foreground)]">
          <MonoNum>
            {batch.volumeUsd
              ? fmtCompactUsd(parseNum(batch.volumeUsd))
              : "—"}
          </MonoNum>
        </span>{" "}
        across <MonoNum>{batch.fillCount}</MonoNum> fills and{" "}
        <MonoNum>{batch.orderCount}</MonoNum> orders, spanning{" "}
        <MonoNum>{(batch.pairs ?? []).length}</MonoNum>{" "}
        {(batch.pairs ?? []).length === 1 ? "pair" : "pairs"}. The aggregate
        is verifiable against the batch root below; the orders that produced
        it remain private to their owners.
      </p>

      {batch.failureReason ? (
        <p
          className="rounded-md border px-4 py-3 text-sm leading-relaxed"
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

      <Separator />

      <Section title="Lifecycle">
        <StatePips steps={steps} width={420} />
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          {steps.map((s) => (
            <li key={s.key} className="flex flex-col gap-0.5 text-xs">
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
              <span className="text-[var(--muted-foreground)]">{s.hint}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Pair breakdown">
        <Card className="p-0">
          <ul className="flex flex-col">
            {aggregates.map((a) => (
              <li
                key={a.pair}
                className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3 last:border-b-0"
              >
                <span className="font-mono text-sm uppercase tracking-[0.12em]">
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
                  <span className="w-[44px] text-right">
                    {(a.share * 100).toFixed(1)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
          Per-pair aggregate. Order IDs and counterparties stay off this page.
        </p>
      </Section>

      <Section title="Audit">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Batch root">
            <HashCell hash={batch.root} lead={10} tail={8} />
          </Field>
          <Field label="Proof hash">
            {batch.proofRef ? (
              <HashCell hash={batch.proofRef} lead={10} tail={8} />
            ) : (
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                pending
              </span>
            )}
          </Field>
          <Field label="L1 settlement">
            {batch.settlementTx ? (
              <HashCell hash={batch.settlementTx} lead={10} tail={8} />
            ) : (
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                pending
              </span>
            )}
          </Field>
          <Field label="Submitter">
            <span className="font-mono text-xs text-[var(--muted-foreground)]">
              Sequencer #1 — TEE attestor
            </span>
          </Field>
        </dl>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-base font-medium tracking-tight">{title}</h3>
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
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
