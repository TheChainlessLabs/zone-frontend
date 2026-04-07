"use client";

import Link from "next/link";
import { useWallet } from "@/lib/wallet";
import { useAccountBalances } from "@/lib/hooks/useAccountBalances";
import { Skeleton } from "@/components/Skeleton";

export default function PortfolioBalances() {
  const { accountId } = useWallet();
  const { balances, isLoading } = useAccountBalances(accountId);

  const rows = balances.map((b) => ({
    token: b.symbol,
    color: b.color,
    total: b.total,
    available: b.available,
    reserved: b.collateral,
    pendingPrivacy: 0,
  }));

  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-body-sm font-semibold">Balances</h3>
      </div>

      {/* Desktop table header */}
      <div className="hidden md:flex items-center h-[33px] px-4 text-label-uppercase text-text-muted">
        <span className="w-[18%]">Token</span>
        <span className="w-[18%] text-right">Total</span>
        <span className="w-[18%] text-right">Available</span>
        <span className="w-[18%] text-right">Reserved</span>
        <span className="w-[18%] text-right">Pending Privacy</span>
        <span className="w-[10%] text-right">Action</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-1 p-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[40px] rounded-md" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop rows */}
          <div className="hidden md:block">
            {rows.map((bal) => (
              <div
                key={bal.token}
                className="flex items-center px-4 h-[40px] hover:bg-bg-elevated transition-fast"
              >
                <span className="w-[18%] flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: bal.color }}
                  />
                  <span className="text-body-sm font-medium text-text-primary">{bal.token}</span>
                </span>
                <span className="w-[18%] text-right font-mono font-tabular text-body-sm text-text-primary">
                  {bal.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="w-[18%] text-right font-mono font-tabular text-body-sm text-text-secondary">
                  {bal.available.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="w-[18%] text-right font-mono font-tabular text-body-sm text-text-secondary">
                  {bal.reserved > 0 ? bal.reserved.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "\u2014"}
                </span>
                <span className="w-[18%] text-right font-mono font-tabular text-body-sm text-text-muted">
                  {bal.pendingPrivacy > 0
                    ? bal.pendingPrivacy.toLocaleString("en-US", { minimumFractionDigits: 2 })
                    : "\u2014"}
                </span>
                <span className="w-[10%] text-right">
                  <Link
                    href="/trade"
                    className="text-body-sm text-accent hover:text-accent-hover transition-fast"
                  >
                    Trade
                  </Link>
                </span>
              </div>
            ))}
          </div>

          {/* Mobile card view */}
          <div className="md:hidden">
            {rows.map((bal) => (
              <div key={bal.token} className="p-4 border-b border-border-subtle last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: bal.color }}
                    />
                    <span className="text-body-sm font-medium text-text-primary">{bal.token}</span>
                  </div>
                  <span className="font-mono font-tabular text-body-sm text-text-primary">
                    {bal.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-[12px] text-text-muted">
                  <span>Available: {bal.available.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  {bal.reserved > 0 && (
                    <span className="text-warning">
                      Reserved: {bal.reserved.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
