"use client";

import { useState } from "react";
import { mockFundTransactions } from "@/lib/mockData";
import type { FundTransaction } from "@/lib/types";

const typeColors: Record<FundTransaction["type"], string> = {
  deposit: "text-success",
  withdraw: "text-warning",
  transfer: "text-text-primary",
};

const statusColors: Record<FundTransaction["status"], string> = {
  completed: "bg-success/20 text-success",
  pending: "bg-warning/20 text-warning",
  claimable: "bg-accent/20 text-accent",
  failed: "bg-error/20 text-error",
};

const modeColors: Record<FundTransaction["mode"], string> = {
  standard: "bg-bg-elevated text-text-secondary",
  privacy: "bg-info/20 text-info",
};

export default function TransactionHistory() {
  const [tokenFilter, setTokenFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");

  const filtered = mockFundTransactions.filter((tx) => {
    if (tokenFilter !== "all" && tx.token !== tokenFilter) return false;
    if (modeFilter !== "all" && tx.mode !== modeFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col">
      <div className="pb-3 flex items-center justify-between">
        <h3 className="text-body-sm font-semibold">Transaction History</h3>
        <div className="flex gap-2">
          <select
            value={tokenFilter}
            onChange={(e) => setTokenFilter(e.target.value)}
            className="h-[32px] px-3 bg-bg-surface border border-border rounded-md text-body-sm text-text-secondary"
          >
            <option value="all">All Tokens</option>
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="EURC">EURC</option>
          </select>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="h-[32px] px-3 bg-bg-surface border border-border rounded-md text-body-sm text-text-secondary"
          >
            <option value="all">All Modes</option>
            <option value="standard">Standard</option>
            <option value="privacy">Privacy</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-8 text-center text-body-sm text-text-muted">
          No transactions match the selected filters.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="flex items-center h-[33px] border-b border-border-subtle text-label-uppercase text-text-muted">
              <span className="w-[14%]">Type</span>
              <span className="w-[20%] text-right">Amount</span>
              <span className="w-[14%] text-right">Token</span>
              <span className="w-[16%] text-right">Status</span>
              <span className="w-[14%] text-right">Mode</span>
              <span className="w-[22%] text-right">Time</span>
            </div>
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center h-[40px] text-body-sm hover:bg-bg-surface transition-fast rounded-md"
              >
                <span className={`w-[14%] capitalize font-medium ${typeColors[tx.type]}`}>
                  {tx.type}
                </span>
                <span className="w-[20%] text-right font-mono font-tabular text-text-primary">
                  {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="w-[14%] text-right text-text-secondary">{tx.token}</span>
                <span className="w-[16%] flex justify-end">
                  <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[tx.status]}`}>
                    {tx.status}
                  </span>
                </span>
                <span className="w-[14%] flex justify-end">
                  <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${modeColors[tx.mode]}`}>
                    {tx.mode}
                  </span>
                </span>
                <span className="w-[22%] text-right font-mono font-tabular text-text-muted">
                  {tx.time}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            {filtered.map((tx) => (
              <div key={tx.id} className="p-3 border-b border-border-subtle last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-body-sm capitalize font-medium ${typeColors[tx.type]}`}>
                      {tx.type}
                    </span>
                    <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${modeColors[tx.mode]}`}>
                      {tx.mode}
                    </span>
                  </div>
                  <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[tx.status]}`}>
                    {tx.status}
                  </span>
                </div>
                <div className="flex justify-between text-[12px] text-text-muted">
                  <span className="font-mono font-tabular text-text-primary">
                    {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {tx.token}
                  </span>
                  <span className="font-mono font-tabular">{tx.time}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
