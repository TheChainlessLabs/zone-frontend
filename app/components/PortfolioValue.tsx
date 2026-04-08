"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { useAccountBalances } from "@/lib/hooks/useAccountBalances";
import { Skeleton } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";

const timeRanges = ["24H", "7D", "30D", "ALL"] as const;

export default function PortfolioValue() {
  const [range, setRange] = useState<string>("24H");
  const { accountId } = useWallet();
  const { balances, isLoading, isError } = useAccountBalances(accountId);

  const total = balances.reduce((sum, b) => sum + b.total, 0);

  if (isError) {
    return (
      <div className="bg-bg-surface border border-border rounded-lg">
        <ErrorState message="Failed to load portfolio data." />
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-6">
      <span className="text-label-uppercase text-text-muted">Total Portfolio Value</span>
      <div className="mt-2 flex items-baseline gap-4">
        {isLoading ? (
          <Skeleton className="h-[36px] w-[200px] rounded-md" />
        ) : (
          <span className="text-h1 font-mono font-tabular">
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        )}
        <span className="text-body-sm font-mono font-tabular text-text-muted">
          {"\u2014"}
        </span>
      </div>

      {/* Time range tabs */}
      <div className="flex gap-1 mt-4 bg-bg-base rounded-md p-1 w-fit">
        {timeRanges.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 h-[28px] text-body-sm font-medium rounded-sm transition-fast ${
              range === r
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Mini chart placeholder */}
      <div className="mt-4 h-[120px] bg-bg-base rounded-md flex items-center justify-center">
        <span className="text-text-muted text-body-sm">Equity chart</span>
      </div>
    </div>
  );
}
