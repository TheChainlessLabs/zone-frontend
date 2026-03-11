import Link from "next/link";
import { mockPortfolioBalances } from "@/lib/mockData";

export default function PortfolioBalances() {
  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-body-sm font-semibold">Balances</h3>
      </div>

      {/* Header */}
      <div className="flex items-center h-[33px] px-4 text-label-uppercase text-text-muted">
        <span className="w-[18%]">Token</span>
        <span className="w-[18%] text-right">Total</span>
        <span className="w-[18%] text-right">Available</span>
        <span className="w-[18%] text-right">Reserved</span>
        <span className="w-[18%] text-right">Pending Privacy</span>
        <span className="w-[10%] text-right">Action</span>
      </div>

      {/* Rows */}
      {mockPortfolioBalances.map((bal) => (
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
            {bal.reserved.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className="w-[18%] text-right font-mono font-tabular text-body-sm text-text-muted">
            {bal.pendingPrivacy > 0
              ? bal.pendingPrivacy.toLocaleString("en-US", { minimumFractionDigits: 2 })
              : "—"}
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
  );
}
