"use client";

/**
 * Variant 08 (list) — Bloomberg-restrained.
 *
 * Terminal-density table with mini-bars per row. Tight row height,
 * monospace everywhere, every cell load-bearing. The restraint is in
 * the palette (single foreground tone for the bars) — no green-up,
 * red-down decoration on a metadata-only surface.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  ageVs,
  computeListTotals,
  fmtCompactUsd,
  HashCell,
  latestSealedAt,
  MiniBar,
  MonoNum,
  parseNum,
  StatusPill,
  type ListVariantProps,
} from "../_shared";

export default function Variant08ListBloomberg({
  fixture,
  buildHref,
}: ListVariantProps) {
  const totals = computeListTotals(fixture);
  const reference = latestSealedAt(fixture);
  const maxVol = Math.max(
    ...fixture.batches.map((b) => parseNum(b.volumeUsd)),
    1,
  );
  const maxFills = Math.max(...fixture.batches.map((b) => b.fillCount), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-baseline gap-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            BATCHES · LAST {totals.batchCount}
          </span>
          <MonoNum className="text-base font-medium">
            {fmtCompactUsd(totals.totalUsd)}
          </MonoNum>
          <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
            {totals.totalFills.toLocaleString("en-US")} fills · {totals.totalOrders.toLocaleString("en-US")} orders
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          V/P/F {totals.verifiedCount}/{totals.pendingCount}/{totals.failedCount}
        </span>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left">
                <Th>BATCH</Th>
                <Th>AGE</Th>
                <Th align="right">ORD</Th>
                <Th align="right">FILL</Th>
                <Th>FILL %</Th>
                <Th align="right">VOL</Th>
                <Th>VOL %</Th>
                <Th>PAIRS</Th>
                <Th>STAT</Th>
                <Th>L1 TX</Th>
                <Th>ROOT</Th>
              </tr>
            </thead>
            <tbody>
              {fixture.batches.map((batch) => {
                const vol = parseNum(batch.volumeUsd);
                const volShare = vol / maxVol;
                const fillShare = batch.fillCount / maxFills;
                return (
                  <tr
                    key={batch.number}
                    className="group border-b border-[var(--border)] last:border-b-0 transition-colors hover:bg-[var(--muted)]/30"
                  >
                    <Td>
                      <Link
                        href={buildHref(batch.number)}
                        className="font-mono hover:underline underline-offset-4"
                      >
                        #{batch.number}
                      </Link>
                    </Td>
                    <Td muted>{ageVs(reference, batch.sealedAt)}</Td>
                    <Td align="right">{batch.orderCount}</Td>
                    <Td align="right">{batch.fillCount}</Td>
                    <Td>
                      <MiniBar
                        share={fillShare}
                        width={48}
                        ariaLabel={`Fill share ${(fillShare * 100).toFixed(0)}%`}
                      />
                    </Td>
                    <Td align="right">
                      {batch.volumeUsd ? fmtCompactUsd(vol) : "—"}
                    </Td>
                    <Td>
                      <MiniBar
                        share={volShare}
                        width={64}
                        ariaLabel={`Volume share ${(volShare * 100).toFixed(0)}%`}
                      />
                    </Td>
                    <Td muted>
                      {(batch.pairs ?? []).length > 0
                        ? (batch.pairs ?? []).join(" ")
                        : "—"}
                    </Td>
                    <Td>
                      <StatusPill status={batch.status} />
                    </Td>
                    <Td muted>
                      {batch.settlementTx ? (
                        <HashCell hash={batch.settlementTx} lead={6} tail={4} />
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td muted>
                      <HashCell hash={batch.root} lead={6} tail={4} />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-[11px] text-[var(--muted-foreground)]">
        Aggregate metadata only. No counterparty data on this surface.
      </p>
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
        "px-2.5 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]",
        align === "right" && "text-right",
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  muted = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  muted?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-2.5 py-2 align-middle font-mono tabular-nums",
        align === "right" && "text-right",
        muted && "text-[var(--muted-foreground)]",
      )}
    >
      {children}
    </td>
  );
}
