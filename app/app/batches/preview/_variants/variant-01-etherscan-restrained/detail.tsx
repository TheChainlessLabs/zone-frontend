"use client";

/**
 * Variant 01 (detail) — Etherscan-restrained.
 *
 * Tabbed Etherscan-style detail. Three tabs (Overview / Pairs / Proof)
 * keep the dense affordance without overwhelming the canvas. Privacy
 * note: the Pairs tab is aggregate-by-pair only — no order IDs, no
 * counterparties.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

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

export default function Variant01DetailEtherscan({
  fixture,
  listHref,
}: DetailVariantProps) {
  const { batch, fills } = fixture;
  const aggregates = aggregateByPair(fills, batch.pairs ?? []);
  const steps = batchStateSteps(batch);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={listHref}
            className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <Icon.Caret.Right className="h-3 w-3 rotate-180" aria-hidden />
            All batches
          </Link>
          <h2 className="font-mono text-lg font-medium tracking-tight">
            Batch #{batch.number}
          </h2>
          <StatusPill status={batch.status} />
        </div>
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          {formatStampUtc(batch.sealedAt)}
        </span>
      </header>

      <div className="flex items-center gap-3">
        <StatePips steps={steps} width={260} ariaLabel="Batch progress" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {steps.filter((s) => s.reached).length} / {steps.length} steps
        </span>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pairs">Pairs ({aggregates.length})</TabsTrigger>
          <TabsTrigger value="proof">Proof</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="p-0">
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-[var(--border)] sm:grid-cols-2">
              <Field label="Batch ID">
                <MonoNum>#{batch.number}</MonoNum>
              </Field>
              <Field label="Sealed at">
                <MonoNum className="text-xs">
                  {formatStampUtc(batch.sealedAt)}
                </MonoNum>
              </Field>
              <Field label="Orders">
                <MonoNum>{batch.orderCount}</MonoNum>
              </Field>
              <Field label="Fills">
                <MonoNum>{batch.fillCount}</MonoNum>
              </Field>
              <Field label="Volume">
                <MonoNum>
                  {batch.volumeUsd
                    ? fmtCompactUsd(parseNum(batch.volumeUsd))
                    : "—"}
                </MonoNum>
              </Field>
              <Field label="Submitter">
                <span className="font-mono text-xs text-[var(--muted-foreground)]">
                  Sequencer #1 — TEE attestor
                </span>
              </Field>
              <Field label="Batch root">
                <HashCell hash={batch.root} lead={10} tail={8} />
              </Field>
              <Field label="L1 tx">
                {batch.settlementTx ? (
                  <HashCell hash={batch.settlementTx} lead={10} tail={8} />
                ) : (
                  <span className="font-mono text-xs text-[var(--muted-foreground)]">
                    pending
                  </span>
                )}
              </Field>
            </dl>
          </Card>
          {batch.failureReason ? (
            <p
              className="mt-3 rounded-md border px-3 py-2 text-xs"
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
        </TabsContent>

        <TabsContent value="pairs" className="mt-4">
          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50 text-left">
                  <Th>Pair</Th>
                  <Th align="right">Fills</Th>
                  <Th align="right">Volume (base)</Th>
                  <Th align="right">Share</Th>
                </tr>
              </thead>
              <tbody>
                {aggregates.map((a) => (
                  <tr
                    key={a.pair}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    <td className="px-3 py-2.5 font-mono text-sm uppercase tracking-[0.12em]">
                      {a.pair}
                    </td>
                    <td className="px-3 py-2.5 text-right align-middle font-mono text-sm tabular-nums">
                      {a.fillCount}
                    </td>
                    <td className="px-3 py-2.5 text-right align-middle font-mono text-sm tabular-nums">
                      {a.totalBaseAmount > 0
                        ? a.totalBaseAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right align-middle font-mono text-sm tabular-nums">
                      {(a.share * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="mt-3 text-[11px] text-[var(--muted-foreground)]">
            Aggregate-by-pair view. Individual fills visible only to their
            counterparties via /portfolio.
          </p>
        </TabsContent>

        <TabsContent value="proof" className="mt-4">
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-start gap-3">
              <Icon.Proof
                className="mt-0.5 h-4 w-4 text-[var(--muted-foreground)]"
                aria-hidden
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Externally verifiable
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Run the verifier locally or inspect the proof on-chain.
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProofRow label="Proof hash">
                {batch.proofRef ? (
                  <HashCell hash={batch.proofRef} lead={10} tail={8} />
                ) : (
                  <span className="font-mono text-xs text-[var(--muted-foreground)]">
                    pending
                  </span>
                )}
              </ProofRow>
              <ProofRow label="Batch root">
                <HashCell hash={batch.root} lead={10} tail={8} />
              </ProofRow>
            </div>
            <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2 text-xs">
              <code className="font-mono">
                npx omega-verify {batch.number}
              </code>
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]",
        align === "right" && "text-right",
      )}
    >
      {children}
    </th>
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
    <div className="flex flex-col gap-1 bg-[var(--card)] px-4 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

function ProofRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      {children}
    </div>
  );
}

