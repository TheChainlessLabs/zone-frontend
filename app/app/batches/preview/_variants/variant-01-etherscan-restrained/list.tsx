"use client";

/**
 * Variant 01 (list) — Etherscan-restrained.
 *
 * Inspired by Etherscan's block index: a dense table that pins the
 * canonical fields (number, age, fills, volume, status, tx) at fixed
 * column widths, monospace numerals throughout. The restraint comes from
 * dropping every Etherscan affordance that would leak counterparty info
 * (no "internal txs", no "from/to", no holder index). What remains is a
 * confident, terminal-dense roll of sealed batches.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

import {
  ageVs,
  computeListTotals,
  fmtCompactUsd,
  HashCell,
  latestSealedAt,
  MonoNum,
  PairChip,
  parseNum,
  StatusPill,
  type ListVariantProps,
} from "../_shared";

export default function Variant01ListEtherscan({
  fixture,
  buildHref,
}: ListVariantProps) {
  const totals = computeListTotals(fixture);
  const reference = latestSealedAt(fixture);

  return (
    <div className="flex flex-col gap-5">
      <KpiStrip totals={totals} />
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50 text-left">
                <Th>Batch</Th>
                <Th>Age</Th>
                <Th align="right">Orders</Th>
                <Th align="right">Fills</Th>
                <Th align="right">Volume</Th>
                <Th>Pairs</Th>
                <Th>Attestation</Th>
                <Th>L1 tx</Th>
                <Th>Root</Th>
              </tr>
            </thead>
            <tbody>
              {fixture.batches.map((batch) => (
                <tr
                  key={batch.number}
                  className="group border-b border-[var(--border)] last:border-b-0 transition-colors hover:bg-[var(--muted)]/40"
                >
                  <td className="px-3 py-2.5 align-middle">
                    <Link
                      href={buildHref(batch.number)}
                      className="inline-flex items-center gap-1 font-mono text-sm text-[var(--foreground)] hover:underline underline-offset-4"
                    >
                      <Icon.Caret.Right
                        className="h-3 w-3 text-[var(--muted-foreground)]"
                        aria-hidden
                      />
                      <span aria-label={`Batch number ${batch.number}`}>
                        #{batch.number}
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 align-middle font-mono text-xs text-[var(--muted-foreground)]">
                    {ageVs(reference, batch.sealedAt)}
                  </td>
                  <td className="px-3 py-2.5 text-right align-middle font-mono text-sm tabular-nums">
                    {batch.orderCount}
                  </td>
                  <td className="px-3 py-2.5 text-right align-middle font-mono text-sm tabular-nums">
                    {batch.fillCount}
                  </td>
                  <td className="px-3 py-2.5 text-right align-middle font-mono text-sm tabular-nums">
                    {batch.volumeUsd
                      ? fmtCompactUsd(parseNum(batch.volumeUsd))
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <div className="flex flex-wrap items-center gap-1">
                      {(batch.pairs ?? []).slice(0, 2).map((p) => (
                        <PairChip key={p} pair={p} />
                      ))}
                      {(batch.pairs?.length ?? 0) > 2 ? (
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                          +{(batch.pairs!.length - 2)}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <StatusPill status={batch.status} />
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    {batch.settlementTx ? (
                      <HashCell
                        hash={batch.settlementTx}
                        label={`L1 tx ${batch.settlementTx}`}
                      />
                    ) : (
                      <span className="font-mono text-xs text-[var(--muted-foreground)]">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <HashCell
                      hash={batch.root}
                      lead={6}
                      tail={4}
                      label={`Batch root ${batch.root}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <FooterNote />
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

function KpiStrip({ totals }: { totals: ReturnType<typeof computeListTotals> }) {
  const cells: { label: string; value: string }[] = [
    { label: "Batches", value: String(totals.batchCount) },
    { label: "Verified", value: String(totals.verifiedCount) },
    { label: "Pending", value: String(totals.pendingCount) },
    { label: "Failed", value: String(totals.failedCount) },
    { label: "Fills", value: totals.totalFills.toLocaleString("en-US") },
    { label: "Orders", value: totals.totalOrders.toLocaleString("en-US") },
    { label: "Volume", value: fmtCompactUsd(totals.totalUsd) },
  ];
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-7">
      {cells.map((c) => (
        <div
          key={c.label}
          className="flex flex-col gap-1 bg-[var(--card)] px-4 py-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            {c.label}
          </span>
          <MonoNum className="text-base font-medium leading-none">
            {c.value}
          </MonoNum>
        </div>
      ))}
    </div>
  );
}

function FooterNote() {
  return (
    <p className="text-center text-[11px] text-[var(--muted-foreground)]">
      Batch metadata only. No counterparty data on this surface — see
      /portfolio for your own fills.
    </p>
  );
}
