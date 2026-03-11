"use client";

import { mockBatches, mockBatchTransactions } from "@/lib/mockData";
import type { BatchStatus } from "@/lib/types";
import { Check } from "lucide-react";
import Link from "next/link";

const statusOrder: BatchStatus[] = ["processing", "proposed", "proved", "settled", "finalized"];

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
    <div className="flex flex-col gap-6">
      <Link
        href="/explorer"
        className="text-accent text-body-sm hover:text-accent-hover transition-fast w-fit"
      >
        &lt; Back to Explorer
      </Link>

      <h2 className="text-h2 font-semibold">{batch.id}</h2>

      {/* Side-by-side: Timeline + Info | Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {/* Status Timeline */}
          <div className="bg-bg-surface border border-border rounded-lg p-6">
            <h3 className="text-label-uppercase text-text-muted mb-4">Status</h3>
            <div className="flex flex-col gap-0">
              {timelineSteps.map((step, i) => {
                const stepIdx = statusOrder.indexOf(step.key);
                const isCompleted = stepIdx <= currentIdx;
                const isCurrent = stepIdx === currentIdx;

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-success text-text-inverse"
                            : "bg-bg-elevated text-text-muted"
                        }`}
                      >
                        {isCompleted ? <Check size={12} /> : (i + 1)}
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div className={`w-px h-6 ${isCompleted ? "bg-success" : "bg-bg-elevated"}`} />
                      )}
                    </div>
                    <span
                      className={`text-body-sm pt-0.5 ${
                        isCurrent ? "text-text-primary font-medium" : "text-text-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Batch info */}
          <div className="bg-bg-surface border border-border rounded-lg p-6">
            <h3 className="text-label-uppercase text-text-muted mb-4">Batch Info</h3>
            <div className="flex flex-col gap-3">
              <Row label="Batch ID" value={batch.id} mono />
              <Row label="Transaction Count" value={String(batch.txCount)} mono />
              <Row label="Settlement Chain" value="Ethereum" />
              <Row label="Timestamp" value={batch.timestamp} mono />
              {batch.proofLink && (
                <div className="flex justify-between text-body-sm">
                  <span className="text-text-muted">Proof</span>
                  <a
                    href={batch.proofLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent-hover transition-fast"
                  >
                    View on Etherscan
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-body-sm font-semibold">Transactions</h3>
            <span className="text-body-sm text-text-muted">{txs.length} txs</span>
          </div>
          {txs.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center justify-center h-[120px]">
              <span className="text-body-sm text-text-muted">No transactions</span>
            </div>
          )}
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
