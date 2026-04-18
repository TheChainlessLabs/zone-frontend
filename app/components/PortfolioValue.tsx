"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { useAccountBalances } from "@/lib/hooks/useAccountBalances";
import { useOrderBook } from "@/lib/hooks/useOrderBook";
import { Skeleton } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";

const timeRanges = ["24H", "7D", "30D", "ALL"] as const;

export default function PortfolioValue() {
  const [range, setRange] = useState<string>("24H");
  const { accountId } = useWallet();
  const { balances, isLoading: balancesLoading, isError: balancesError } =
    useAccountBalances(accountId);
  const {
    midpoint,
    isLoading: bookLoading,
    isError: bookError,
  } = useOrderBook();

  // USDC/USDT price at ~$1. EURC is priced at the active EUR/USD market
  // midpoint; when the midpoint is unavailable we omit EURC from the total
  // rather than fabricate a rate.
  const totalUsd = balances.reduce((sum, b) => {
    if (b.symbol === "USDC" || b.symbol === "USDT") return sum + b.total;
    if (b.symbol === "EURC" && midpoint !== null) return sum + b.total * midpoint;
    return sum;
  }, 0);

  // Wait for the midpoint whenever the account actually holds a non-USD
  // stable that needs pricing. We block on `midpoint === null` regardless of
  // the book's reported isLoading — a thin or one-sided book can return a
  // null midpoint without isLoading being true — because silently dropping
  // EURC from the total would misrepresent the real portfolio value.
  const needsMidpoint = balances.some((b) => b.symbol === "EURC" && b.total > 0);
  const isLoading =
    balancesLoading || (needsMidpoint && midpoint === null && !bookError);
  const isError = balancesError || (needsMidpoint && bookError);

  if (isError) {
    return <ErrorState message="Failed to load portfolio data." />;
  }

  return (
    <div className="flex flex-col">
      <span className="text-label-uppercase text-text-muted">Total Portfolio Value</span>
      <div className="mt-2 flex items-baseline gap-4">
        {isLoading ? (
          <Skeleton className="h-[36px] w-[200px] rounded-md" />
        ) : (
          <span className="text-h1 font-mono font-tabular">
            ${totalUsd.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        )}
      </div>

      {/* Time range tabs — bumped to bg-bg-surface so the pill rail
          stays visible now that the hero no longer sits inside a card. */}
      <div className="flex gap-1 mt-4 bg-bg-surface rounded-md p-1 w-fit">
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

      {/* Mini chart placeholder — also on bg-bg-surface so the equity
          region reads as a distinct block against the flat page bg. */}
      <div className="mt-4 h-[120px] bg-bg-surface rounded-md flex items-center justify-center">
        <span className="text-text-muted text-body-sm">Equity chart</span>
      </div>
    </div>
  );
}
