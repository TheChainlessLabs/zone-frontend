"use client";

/**
 * Variant 03 (list) — L2Beat-dashboard.
 *
 * KPI band on top, sparkline summarising recent volume, dense rows with
 * an inline mini-bar showing each batch's relative volume share. Calm
 * but information-rich — institutional dashboard register.
 */

import * as React from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

import {
  ageVs,
  computeListTotals,
  fillsSeries,
  fmtCompactUsd,
  HashCell,
  latestSealedAt,
  MiniBar,
  MonoNum,
  PairChip,
  parseNum,
  Sparkline,
  StatusPill,
  volumeSeries,
  type ListVariantProps,
} from "../_shared";

export default function Variant03ListL2Beat({
  fixture,
  buildHref,
}: ListVariantProps) {
  const totals = computeListTotals(fixture);
  const reference = latestSealedAt(fixture);
  const volSeries = volumeSeries(fixture);
  const fillSeries = fillsSeries(fixture);
  const maxVol = Math.max(...fixture.batches.map((b) => parseNum(b.volumeUsd)), 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_2fr]">
        <KpiBlock
          label="Verified · Pending · Failed"
          value={`${totals.verifiedCount} · ${totals.pendingCount} · ${totals.failedCount}`}
          tone="muted"
        />
        <KpiBlock
          label="Total volume"
          value={fmtCompactUsd(totals.totalUsd)}
          tone="default"
          sub={`${totals.totalFills.toLocaleString("en-US")} fills · ${totals.totalOrders.toLocaleString("en-US")} orders`}
        />
        <Card className="flex items-center justify-between gap-4 p-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Recent volume
            </span>
            <MonoNum className="text-base font-medium leading-none">
              {fmtCompactUsd(totals.totalUsd)}
            </MonoNum>
            <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
              {fillSeries.length} batches · oldest → newest
            </span>
          </div>
          <Sparkline
            series={volSeries}
            width={280}
            height={56}
            ariaLabel="Volume across recent batches, oldest to newest"
            stroke="var(--success)"
            fill="var(--success)"
          />
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left">
                <Th>Batch</Th>
                <Th>Sealed</Th>
                <Th align="right">Fills</Th>
                <Th align="right">Volume</Th>
                <Th>Share</Th>
                <Th>Pairs</Th>
                <Th>Attestation</Th>
                <Th>L1 tx</Th>
              </tr>
            </thead>
            <tbody>
              {fixture.batches.map((batch) => {
                const vol = parseNum(batch.volumeUsd);
                const share = vol / maxVol;
                return (
                  <tr
                    key={batch.number}
                    className="group border-b border-[var(--border)] last:border-b-0 transition-colors hover:bg-[var(--muted)]/30"
                  >
                    <td className="px-3 py-2.5 align-middle">
                      <Link
                        href={buildHref(batch.number)}
                        className="inline-flex items-center gap-1 font-mono text-sm hover:underline underline-offset-4"
                      >
                        <Icon.Caret.Right
                          className="h-3 w-3 text-[var(--muted-foreground)]"
                          aria-hidden
                        />
                        #{batch.number}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 align-middle font-mono text-xs text-[var(--muted-foreground)]">
                      {ageVs(reference, batch.sealedAt)} ago
                    </td>
                    <td className="px-3 py-2.5 text-right align-middle font-mono text-sm tabular-nums">
                      {batch.fillCount}
                    </td>
                    <td className="px-3 py-2.5 text-right align-middle font-mono text-sm tabular-nums">
                      {batch.volumeUsd ? fmtCompactUsd(vol) : "—"}
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <MiniBar
                        share={share}
                        ariaLabel={`Volume share ${(share * 100).toFixed(0)} percent of largest batch`}
                      />
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex flex-wrap items-center gap-1">
                        {(batch.pairs ?? []).slice(0, 3).map((p) => (
                          <PairChip key={p} pair={p} />
                        ))}
                        {(batch.pairs?.length ?? 0) > 3 ? (
                          <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                            +{batch.pairs!.length - 3}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <StatusPill status={batch.status} />
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      {batch.settlementTx ? (
                        <HashCell hash={batch.settlementTx} />
                      ) : (
                        <span className="font-mono text-xs text-[var(--muted-foreground)]">
                          pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function KpiBlock({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "default" | "muted";
}) {
  return (
    <Card className={cn("flex flex-col gap-1 p-4", tone === "muted" && "")}>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <MonoNum className="text-lg font-medium leading-tight">{value}</MonoNum>
      {sub ? (
        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
          {sub}
        </span>
      ) : null}
    </Card>
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
