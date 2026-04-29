// Rebuilt /batches as a desktop-first settlement console because operators need scanable state, inline drilldown, and zero decorative waste.
"use client";

import * as React from "react";

import { batchesDefault } from "../../../../../lib/fixtures/batches/default";
import type { BatchFixture } from "../../../../../lib/fixtures/types";

type StatusFilter = "all" | BatchFixture["status"];

const rows = batchesDefault.batches;

export default function KevinParkBatchesRedesign() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [selected, setSelected] = React.useState<number>(rows[0]?.number ?? 0);

  const filtered = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!normalized) return true;
      const haystack = [
        String(row.number),
        row.root,
        row.proofRef ?? "",
        row.settlementTx ?? "",
        ...(row.pairs ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, status]);

  const active =
    filtered.find((row) => row.number === selected) ?? filtered[0] ?? rows[0];

  const stats = React.useMemo(() => {
    const verified = rows.filter((row) => row.status === "verified").length;
    const pending = rows.filter((row) => row.status === "pending").length;
    const failed = rows.filter((row) => row.status === "failed").length;
    const latest = rows[0];
    const pendingRows = rows.filter((row) => row.status === "pending");
    return {
      verified,
      pending,
      failed,
      totalVolume: rows.reduce((sum, row) => sum + num(row.volumeUsd), 0),
      latestSealed: latest ? relativeFromLatest(latest.sealedAt, latest.sealedAt) : "n/a",
      oldestPending:
        pendingRows.length > 0
          ? relativeFromLatest(rows[0].sealedAt, pendingRows[pendingRows.length - 1].sealedAt)
          : "none",
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060606] text-zinc-50">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-8 lg:px-8">
        <header className="border-b border-zinc-800 pb-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Public settlement console
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                Batches
              </h1>
              <p className="max-w-2xl text-sm text-zinc-400">
                Sealed batches, proof state, and L1 settlement evidence. No mood
                lighting. Just the object and its current condition.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Verified" value={String(stats.verified)} tone="verified" />
              <Stat label="Pending" value={String(stats.pending)} tone="pending" />
              <Stat label="Failed" value={String(stats.failed)} tone="failed" />
              <Stat label="Volume" value={usdCompact(stats.totalVolume)} tone="neutral" />
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
          <aside className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <PanelTitle title="Queue health" subtitle="What needs attention first." />
            <MetricRow label="Latest sealed" value={stats.latestSealed} />
            <MetricRow label="Oldest pending" value={stats.oldestPending} />
            <MetricRow label="Visible rows" value={String(filtered.length)} />
            <div className="border-t border-zinc-800 pt-4">
              <PanelTitle title="Filter" subtitle="Cut the noise fast." />
              <div className="mt-3 space-y-2">
                {(["all", "verified", "pending", "failed"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(value)}
                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                      status === value
                        ? "border-zinc-500 bg-zinc-900 text-zinc-50"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <span className="capitalize">{value}</span>
                    <span className="font-mono text-xs text-zinc-500">
                      {value === "all"
                        ? rows.length
                        : rows.filter((row) => row.status === value).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-950">
            <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                  Batch index
                </p>
                <p className="text-sm text-zinc-400">
                  Search by batch number, proof hash, settlement tx, or pair.
                </p>
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="4821, 0xb7c8, USDC/EURC"
                className="h-10 w-full rounded-md border border-zinc-800 bg-black px-3 font-mono text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-zinc-600 lg:max-w-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="border-b border-zinc-800 bg-black/60">
                  <tr className="text-left">
                    <Th className="sticky left-0 z-20 bg-black/95">Batch</Th>
                    <Th>Status</Th>
                    <Th>Sealed</Th>
                    <Th className="text-right">Fills</Th>
                    <Th className="text-right">Orders</Th>
                    <Th className="text-right">Volume</Th>
                    <Th>Pairs</Th>
                    <Th>Proof</Th>
                    <Th>Settlement</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const isActive = row.number === active?.number;
                    return (
                      <tr
                        key={row.number}
                        onClick={() => setSelected(row.number)}
                        className={`cursor-pointer border-b border-zinc-900 ${
                          isActive ? "bg-zinc-900/80" : "hover:bg-zinc-900/40"
                        }`}
                      >
                        <td className="sticky left-0 z-10 bg-inherit px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`h-2.5 w-2.5 rounded-full ${dotClass(row.status)}`} />
                            <span className="font-mono text-base text-zinc-100">
                              #{row.number}
                            </span>
                          </div>
                        </td>
                        <Td>
                          <StatusBadge status={row.status} />
                        </Td>
                        <Td className="font-mono text-zinc-400">
                          {relativeFromLatest(rows[0].sealedAt, row.sealedAt)}
                        </Td>
                        <Td className="text-right font-mono text-zinc-200">
                          {row.fillCount}
                        </Td>
                        <Td className="text-right font-mono text-zinc-200">
                          {row.orderCount}
                        </Td>
                        <Td className="text-right font-mono text-zinc-200">
                          {usdCompact(num(row.volumeUsd))}
                        </Td>
                        <Td>
                          <div className="flex flex-wrap gap-1">
                            {(row.pairs ?? []).slice(0, 3).map((pair) => (
                              <span
                                key={pair}
                                className="rounded border border-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400"
                              >
                                {pair}
                              </span>
                            ))}
                          </div>
                        </Td>
                        <Td className="font-mono text-zinc-400">
                          {shortHash(row.proofRef) ?? "pending"}
                        </Td>
                        <Td className="font-mono text-zinc-400">
                          {shortHash(row.settlementTx) ?? "pending"}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </main>

          <aside className="rounded-xl border border-zinc-800 bg-zinc-950">
            {active ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-zinc-800 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                    Active batch
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <h2 className="font-mono text-2xl text-zinc-50">#{active.number}</h2>
                    <StatusBadge status={active.status} />
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">
                    Sealed {stamp(active.sealedAt)}.
                  </p>
                </div>

                <div className="space-y-5 p-4">
                  <div>
                    <PanelTitle
                      title="Lifecycle"
                      subtitle="Queued, sealed, proven, settled. No giant donut."
                    />
                    <div className="mt-3 space-y-2">
                      {stepsFor(active).map((step) => (
                        <div
                          key={step.label}
                          className="flex items-start justify-between border-b border-zinc-900 pb-2 last:border-b-0"
                        >
                          <div>
                            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-zinc-300">
                              {step.label}
                            </p>
                            <p className="mt-1 text-sm text-zinc-500">{step.hint}</p>
                          </div>
                          <span
                            className={`font-mono text-xs ${
                              step.state === "done"
                                ? "text-emerald-400"
                                : step.state === "failed"
                                  ? "text-red-400"
                                  : "text-zinc-500"
                            }`}
                          >
                            {step.state}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MiniStat label="Fills" value={String(active.fillCount)} />
                    <MiniStat label="Orders" value={String(active.orderCount)} />
                    <MiniStat label="Pairs" value={String(active.pairs?.length ?? 0)} />
                    <MiniStat label="Volume" value={usdCompact(num(active.volumeUsd))} />
                  </div>

                  <div>
                    <PanelTitle title="Evidence" subtitle="Copyable, outbound-ready identifiers." />
                    <dl className="mt-3 space-y-3">
                      <Evidence label="Batch root" value={active.root} />
                      <Evidence label="Proof hash" value={active.proofRef ?? "pending"} />
                      <Evidence label="Settlement tx" value={active.settlementTx ?? "pending"} />
                    </dl>
                  </div>

                  {active.failureReason ? (
                    <div className="rounded-md border border-red-900 bg-red-950/30 p-3">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-300">
                        Failure reason
                      </p>
                      <p className="mt-2 text-sm text-red-200">{active.failureReason}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm text-zinc-500">No visible batch.</div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "verified" | "pending" | "failed" | "neutral";
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 font-mono text-lg ${toneText(tone)}`}>{value}</p>
    </div>
  );
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </p>
      <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900 py-2 last:border-b-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="font-mono text-sm text-zinc-200">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: BatchFixture["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.16em] ${badgeClass(
        status,
      )}`}
    >
      {status}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-black/50 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-mono text-base text-zinc-100">{value}</p>
    </div>
  );
}

function Evidence({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 break-all font-mono text-sm text-zinc-200">{value}</dd>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function stepsFor(row: BatchFixture) {
  return [
    { label: "Queued", hint: "Orders accepted into the batch window.", state: "done" },
    { label: "Sealed", hint: "Matching engine sealed the batch.", state: "done" },
    {
      label: "Proven",
      hint: row.proofRef ? "Attestation generated." : "Waiting on proof.",
      state: row.proofRef ? "done" : "waiting",
    },
    {
      label: "Settled",
      hint: row.settlementTx
        ? "Anchored on Ethereum L1."
        : row.failureReason
          ? row.failureReason
          : "Waiting on L1 submission.",
      state: row.failureReason ? "failed" : row.settlementTx ? "done" : "waiting",
    },
  ];
}

function num(value?: string | null) {
  return Number(value ?? "0");
}

function usdCompact(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function shortHash(value?: string | null) {
  if (!value) return null;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function stamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")} ${String(d.getUTCHours()).padStart(2, "0")}:${String(
    d.getUTCMinutes(),
  ).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")} UTC`;
}

function relativeFromLatest(latestIso: string, targetIso: string) {
  const latest = new Date(latestIso).getTime();
  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, Math.floor((latest - target) / 1000));
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function dotClass(status: BatchFixture["status"]) {
  if (status === "verified") return "bg-emerald-400";
  if (status === "failed") return "bg-red-400";
  return "bg-zinc-500";
}

function badgeClass(status: BatchFixture["status"]) {
  if (status === "verified") return "border-emerald-900 bg-emerald-950/40 text-emerald-300";
  if (status === "failed") return "border-red-900 bg-red-950/40 text-red-300";
  return "border-zinc-700 bg-zinc-900 text-zinc-300";
}

function toneText(tone: "verified" | "pending" | "failed" | "neutral") {
  if (tone === "verified") return "text-emerald-300";
  if (tone === "failed") return "text-red-300";
  if (tone === "pending") return "text-zinc-200";
  return "text-zinc-100";
}
