"use client";

import { useState } from "react";
import Link from "next/link";
import { mockBatches } from "@/lib/mockData";
import type { BatchStatus } from "@/lib/types";

const statusColors: Record<BatchStatus, string> = {
  processing: "bg-warning/20 text-warning",
  proposed: "bg-warning/20 text-warning",
  proved: "bg-bg-elevated text-text-secondary",
  settled: "bg-success/20 text-success",
  finalized: "bg-accent/20 text-accent",
};

const PAGE_SIZE = 6;

export default function BatchExplorer() {
  const [page, setPage] = useState(0);
  const totalBatches = 1247;
  const totalPages = Math.ceil(mockBatches.length / PAGE_SIZE);
  const displayed = mockBatches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex flex-col">
      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="flex h-[33px] items-center border-b border-border-subtle text-label-uppercase text-text-muted">
          <span className="w-[20%]">Batch ID</span>
          <span className="w-[15%] text-right">Tx Count</span>
          <span className="w-[18%] text-right">Status</span>
          <span className="w-[27%] text-right">Timestamp</span>
          <span className="w-[20%] text-right">Proof</span>
        </div>
        {displayed.map((batch) => (
          <Link
            key={batch.id}
            href={`/explorer/batch/${batch.id}`}
            className="flex h-[40px] items-center text-body-sm hover:bg-bg-surface transition-fast rounded-md"
          >
            <span className="w-[20%] text-accent hover:text-accent-hover transition-fast">
              {batch.id}
            </span>
            <span className="w-[15%] text-right font-mono font-tabular text-text-secondary">
              {batch.txCount}
            </span>
            <span className="w-[18%] flex justify-end">
              <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[batch.status]}`}>
                {batch.status}
              </span>
            </span>
            <span className="w-[27%] text-right font-mono font-tabular text-text-secondary">
              {batch.timestamp}
            </span>
            <span className="w-[20%] text-right">
              {batch.proofLink ? (
                <span className="text-accent text-body-sm">View proof</span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </span>
          </Link>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {displayed.map((batch) => (
          <Link
            key={batch.id}
            href={`/explorer/batch/${batch.id}`}
            className="block p-3 border-b border-border-subtle last:border-b-0"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-body-sm text-accent font-medium">{batch.id}</span>
              <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[batch.status]}`}>
                {batch.status}
              </span>
            </div>
            <div className="flex justify-between text-[12px] text-text-muted font-mono font-tabular">
              <span>{batch.txCount} txs</span>
              <span>{batch.timestamp}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between h-[44px] border-t border-border-subtle text-body-sm mt-2">
        <span className="text-text-muted">
          Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, mockBatches.length)} of {totalBatches.toLocaleString()} batches
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="w-[32px] h-[32px] flex items-center justify-center border border-border rounded-md text-text-secondary hover:bg-bg-elevated transition-fast disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            &lt;
          </button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-[32px] h-[32px] flex items-center justify-center rounded-md text-body-sm font-medium transition-fast ${
                page === i
                  ? "bg-accent text-text-inverse"
                  : "border border-border text-text-secondary hover:bg-bg-elevated"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="w-[32px] h-[32px] flex items-center justify-center border border-border rounded-md text-text-secondary hover:bg-bg-elevated transition-fast disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
