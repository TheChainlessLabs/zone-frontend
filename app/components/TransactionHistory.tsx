import { mockFundTransactions } from "@/lib/mockData";
import type { FundTransaction } from "@/lib/types";

const typeColors: Record<FundTransaction["type"], string> = {
  deposit: "text-success",
  withdraw: "text-error",
  transfer: "text-info",
};

const statusColors: Record<FundTransaction["status"], string> = {
  completed: "bg-success/20 text-success",
  pending: "bg-warning/20 text-warning",
  failed: "bg-error/20 text-error",
};

const modeColors: Record<FundTransaction["mode"], string> = {
  standard: "bg-bg-elevated text-text-secondary",
  privacy: "bg-info/20 text-info",
};

export default function TransactionHistory() {
  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-body-sm font-semibold">Transaction History</h3>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="flex items-center h-[33px] px-4 text-label-uppercase text-text-muted">
          <span className="w-[14%]">Type</span>
          <span className="w-[20%] text-right">Amount</span>
          <span className="w-[14%] text-right">Token</span>
          <span className="w-[16%] text-right">Status</span>
          <span className="w-[14%] text-right">Mode</span>
          <span className="w-[22%] text-right">Time</span>
        </div>
        {mockFundTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center px-4 h-[40px] text-body-sm hover:bg-bg-elevated transition-fast"
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
        {mockFundTransactions.map((tx) => (
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
    </div>
  );
}
