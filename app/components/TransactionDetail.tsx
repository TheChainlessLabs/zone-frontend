"use client";

import Link from "next/link";
import { mockTxDetail } from "@/lib/mockData";
import type { BatchStatus } from "@/lib/types";

const batchStatusColors: Record<BatchStatus, string> = {
  processing: "bg-warning/20 text-warning",
  proposed: "bg-warning/20 text-warning",
  proved: "bg-info/20 text-info",
  settled: "bg-success/20 text-success",
  finalized: "bg-accent/20 text-accent",
};

interface TransactionDetailProps {
  txId: string;
}

export default function TransactionDetail({ txId }: TransactionDetailProps) {
  const tx = { ...mockTxDetail, id: txId };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/explorer"
        className="text-accent text-body-sm hover:text-accent-hover transition-fast w-fit"
      >
        &lt; Back to Explorer
      </Link>

      <div className="flex items-center gap-3">
        <h2 className="text-h2 font-semibold">{tx.id}</h2>
        <span className={`text-label-uppercase px-2 py-0.5 rounded-sm capitalize ${tx.side === "buy" ? "bg-success/20 text-success" : "bg-error/20 text-error"}`}>
          {tx.side}
        </span>
      </div>

      {/* TX details */}
      <div className="bg-bg-surface border border-border rounded-lg p-6">
        <h3 className="text-label-uppercase text-text-muted mb-4">Transaction Details</h3>
        <div className="flex flex-col gap-3">
          <Row label="Pair" value={tx.pair} />
          <Row label="Side" value={tx.side} className={tx.side === "buy" ? "text-success" : "text-error"} />
          <Row label="Amount" value={tx.amount.toLocaleString()} mono />
          <Row label="Price" value={tx.price.toFixed(4)} mono />
          <Row label="Total USD" value={`$${tx.totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} mono />
          <Row label="Order Type" value={tx.orderType} />
          <Row label="Mode" value={tx.mode} />
          <Row label="Submitted" value={tx.submittedAt} mono />
          <Row label="Matched" value={tx.matchedAt} mono />
        </div>
      </div>

      {/* Execution details — 3 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Midpoint Price" value={tx.midpointPrice.toFixed(4)} />
        <StatCard label="Price Improvement" value={`${tx.priceImprovement.toFixed(4)} (${(tx.priceImprovement / tx.price * 100).toFixed(3)}%)`} />
        <StatCard label="Slippage" value={`${tx.slippage.toFixed(2)}%`} />
      </div>

      {/* Batch info */}
      <div className="bg-bg-surface border border-border rounded-lg p-6">
        <h3 className="text-label-uppercase text-text-muted mb-4">Batch Info</h3>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-body-sm">
            <span className="text-text-muted">Batch ID</span>
            <Link
              href={`/explorer/batch/${tx.batchId}`}
              className="text-accent hover:text-accent-hover transition-fast font-mono font-tabular"
            >
              {tx.batchId}
            </Link>
          </div>
          <div className="flex justify-between text-body-sm items-center">
            <span className="text-text-muted">Batch Status</span>
            <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${batchStatusColors[tx.batchStatus]}`}>
              {tx.batchStatus}
            </span>
          </div>
          <Row label="Counterparty" value={tx.counterparty} />
          <Row label="Venue" value={tx.venue} />
          <Row label="Fee" value={`$${tx.fee.toFixed(2)}`} mono />
          <Row label="Settlement Chain" value={tx.settlementChain} />
          <div className="flex justify-between text-body-sm">
            <span className="text-text-muted">Proof Hash</span>
            <span className="font-mono font-tabular text-text-secondary text-right truncate max-w-[300px]">
              {tx.proofHash}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className="flex justify-between text-body-sm">
      <span className="text-text-muted">{label}</span>
      <span className={`${mono ? "font-mono font-tabular" : ""} ${className ?? "text-text-primary"} capitalize`}>
        {value}
      </span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-surface border border-border rounded-lg p-4">
      <span className="text-label-uppercase text-text-muted">{label}</span>
      <p className="text-h3 font-mono font-tabular mt-1">{value}</p>
    </div>
  );
}
