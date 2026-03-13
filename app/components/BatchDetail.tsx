"use client";

import { mockBatches, mockBatchTransactions } from "@/lib/mockData";
import type { BatchStatus } from "@/lib/types";
import { Check, Shield } from "lucide-react";
import Link from "next/link";

const statusOrder: BatchStatus[] = ["processing", "proposed", "proved", "settled", "finalized"];

const statusColors: Record<BatchStatus, string> = {
  processing: "bg-warning/20 text-warning",
  proposed: "bg-warning/20 text-warning",
  proved: "bg-info/20 text-info",
  settled: "bg-success/20 text-success",
  finalized: "bg-accent/20 text-accent",
};

const timelineSteps: { key: BatchStatus; label: string }[] = [
  { key: "proposed", label: "Proposed" },
  { key: "proved", label: "Proved" },
  { key: "settled", label: "Settled" },
  { key: "finalized", label: "Finalized" },
];

interface BatchDetailProps {
  batchId: string;
}

export default function BatchDetail({ batchId }: BatchDetailProps) {
  const batch = mockBatches.find((b) => b.id === batchId);
  const txs = mockBatchTransactions[batchId] ?? [];

  if (!batch) {
    return (
      <div className="text-text-muted text-body-sm p-6">Batch not found</div>
    );
  }

  const currentIdx = statusOrder.indexOf(batch.status);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Link
        href="/explorer"
        className="text-accent text-body-sm hover:text-accent-hover transition-fast w-fit"
      >
        &larr; Back to Explorer
      </Link>

      <div className="flex items-center gap-3">
        <h2 className="text-h3 md:text-h2 font-semibold">{batch.id}</h2>
        <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[batch.status]}`}>
          {batch.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Status Timeline */}
          <div className="bg-bg-surface border border-border rounded-lg p-4 md:p-6">
            <h3 className="text-label-uppercase text-text-muted mb-4">Timeline</h3>
            <div className="flex flex-col gap-0">
              {timelineSteps.map((step, i) => {
                const stepIdx = statusOrder.indexOf(step.key);
                const isCompleted = stepIdx <= currentIdx;
                const isCurrent = stepIdx === currentIdx;

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-success text-text-inverse"
                            : "bg-bg-elevated text-text-muted"
                        }`}
                      >
                        {isCompleted ? <Check size={10} /> : null}
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div className={`w-px h-6 ${isCompleted ? "bg-success" : "bg-bg-elevated"}`} />
                      )}
                    </div>
                    <div className="flex flex-col -mt-0.5">
                      <span
                        className={`text-body-sm ${
                          isCurrent ? "text-text-primary font-medium" : isCompleted ? "text-success" : "text-text-muted"
                        }`}
                      >
                        {step.label}
                      </span>
                      {isCompleted && (
                        <span className="text-[11px] text-text-muted font-mono font-tabular">
                          {batch.timestamp}
                        </span>
                      )}
                      {isCurrent && !isCompleted && (
                        <span className="text-[11px] text-text-muted">In progress...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Batch info */}
          <div className="bg-bg-surface border border-border rounded-lg p-4 md:p-6">
            <h3 className="text-label-uppercase text-text-muted mb-4">Batch Info</h3>
            <div className="flex flex-col gap-3">
              <Row label="Transactions" value={String(batch.txCount)} mono />
              <Row label="Volume" value="$4.2M" mono />
              {batch.proofLink && (
                <div className="flex justify-between text-body-sm">
                  <span className="text-text-muted">Proof hash</span>
                  <a
                    href={batch.proofLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent-hover transition-fast font-mono font-tabular text-[12px]"
                  >
                    0x7a3f...c8d2
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-body-sm font-semibold">Transactions</h3>
            <button className="flex items-center gap-1.5 h-[28px] px-3 text-[11px] font-medium rounded-md border border-accent text-accent hover:bg-accent/10 transition-fast">
              <Shield size={12} />
              Decrypt Mine
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-bg-surface border border-border rounded-lg overflow-hidden">
            <div className="flex items-center h-[33px] px-4 text-label-uppercase text-text-muted">
              <span className="w-[25%]">Tx ID</span>
              <span className="w-[15%]">Pair</span>
              <span className="w-[12%]">Side</span>
              <span className="w-[22%] text-right">Amount</span>
              <span className="w-[26%] text-right">Price</span>
            </div>
            {txs.map((tx) => (
              <Link
                key={tx.id}
                href={`/explorer/tx/${tx.id}`}
                className="flex items-center px-4 h-[40px] text-body-sm font-mono font-tabular hover:bg-bg-elevated transition-fast"
              >
                <span className="w-[25%] font-display text-accent">{tx.id}</span>
                <span className="w-[15%] font-display text-text-primary">{tx.pair}</span>
                <span className={`w-[12%] font-display capitalize ${tx.side === "buy" ? "text-success" : "text-error"}`}>
                  {tx.side}
                </span>
                <span className="w-[22%] text-right text-text-primary">{tx.amount.toLocaleString()}</span>
                <span className="w-[26%] text-right text-text-primary">{tx.price.toFixed(4)}</span>
              </Link>
            ))}
          </div>

          {/* Mobile tx cards */}
          <div className="md:hidden">
            {txs.map((tx) => (
              <Link
                key={tx.id}
                href={`/explorer/tx/${tx.id}`}
                className="block py-3 border-b border-border-subtle last:border-b-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-text-primary">{tx.pair}</span>
                    <span className={`text-[13px] font-medium capitalize ${tx.side === "buy" ? "text-success" : "text-error"}`}>
                      {tx.side}
                    </span>
                  </div>
                  <span className="text-label-uppercase px-2 py-0.5 rounded-sm bg-success/20 text-success">
                    matched
                  </span>
                </div>
                <div className="flex justify-between text-[12px] text-text-muted font-mono font-tabular">
                  <span>€{tx.amount.toLocaleString()} @ {tx.price.toFixed(4)}</span>
                  <span className="truncate ml-2">{tx.id}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between text-body-sm">
      <span className="text-text-muted">{label}</span>
      <span className={`${mono ? "font-mono font-tabular" : ""} text-text-primary`}>{value}</span>
    </div>
  );
}
