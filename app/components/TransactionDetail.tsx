"use client";

import Link from "next/link";
import { mockTxDetail } from "@/lib/mockData";
import type { BatchStatus } from "@/lib/types";

const batchStatusColors: Record<BatchStatus, string> = {
  processing: "bg-warning/20 text-warning",
  proposed: "bg-warning/20 text-warning",
  proved: "bg-bg-elevated text-text-secondary",
  settled: "bg-success/20 text-success",
  finalized: "bg-accent/20 text-accent",
};

const modeColors: Record<string, string> = {
  standard: "bg-bg-elevated text-text-secondary",
  privacy: "bg-bg-elevated text-text-secondary",
};

interface TransactionDetailProps {
  txId: string;
}

export default function TransactionDetail({ txId }: TransactionDetailProps) {
  const tx = { ...mockTxDetail, id: txId };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Link
        href="/explorer"
        className="text-accent text-body-sm hover:text-accent-hover transition-fast w-fit"
      >
        &larr; Back to Batch
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-h3 md:text-h2 font-semibold font-mono">TX {tx.id.length > 16 ? `${tx.id.slice(0, 8)}...${tx.id.slice(-4)}` : tx.id}</h2>
        <span className={`text-label-uppercase px-2 py-0.5 rounded-sm bg-success/20 text-success`}>
          matched
        </span>
      </div>

      {/* TX details */}
      <div className="flex flex-col">
        <h3 className="text-label-uppercase text-text-muted mb-4">Transaction Details</h3>
        <div className="flex flex-col gap-3">
          <Row label="Pair" value={tx.pair} />
          <Row label="Side" value={tx.side} className={tx.side === "buy" ? "text-success" : "text-error"} />
          <Row label="Amount" value={`€${tx.amount.toLocaleString()}.00`} mono />
          <Row label="Price" value={tx.price.toFixed(4)} mono />
          <Row label="Total (USD)" value={`$${tx.totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} mono />
          <Row label="Order Type" value={tx.orderType === "midpoint" ? "Midpoint Peg" : tx.orderType} />
          <div className="flex justify-between text-body-sm items-center">
            <span className="text-text-muted">Mode</span>
            <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${modeColors[tx.mode]}`}>
              {tx.mode}
            </span>
          </div>
          <Row label="Submitted" value={tx.submittedAt} mono />
          <Row label="Matched" value={tx.matchedAt} mono />
        </div>
      </div>

      {/* Execution stats — 3 cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <StatCard label="Midpoint" value={tx.midpointPrice.toFixed(4)} />
        <StatCard label="Savings" value={`+${(tx.priceImprovement * 10000 / tx.price).toFixed(1)} pips`} highlight />
        <StatCard label="Slippage" value={`${tx.slippage.toFixed(2)}%`} />
      </div>

      {/* Batch info */}
      <div className="flex flex-col">
        <h3 className="text-label-uppercase text-text-muted mb-4">Batch</h3>
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
            <span className="text-text-muted">Status</span>
            <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${batchStatusColors[tx.batchStatus]}`}>
              {tx.batchStatus}
            </span>
          </div>
          <Row label="Counterparty" value={tx.counterparty === "Anonymous" ? "Hidden — darkpool" : tx.counterparty} />
          <Row label="Venue" value={tx.venue} />
          <Row label="Fee" value={`$${tx.fee.toFixed(2)} (0.005%)`} mono />
          <Row label="Settlement" value={tx.settlementChain} />
          <div className="flex justify-between text-body-sm">
            <span className="text-text-muted">Proof hash</span>
            <span className="font-mono font-tabular text-accent text-[12px] truncate max-w-[160px] sm:max-w-[300px]">
              {tx.proofHash.slice(0, 8)}...{tx.proofHash.slice(-4)}
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

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-bg-surface border border-border rounded-lg p-3 md:p-4">
      <span className="text-label-uppercase text-text-muted">{label}</span>
      <p className={`text-[16px] md:text-h3 font-mono font-tabular mt-1 ${highlight ? "text-success" : "text-text-primary"}`}>
        {value}
      </p>
    </div>
  );
}
