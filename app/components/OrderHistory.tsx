"use client";

import { useState } from "react";
import { mockOrderHistory } from "@/lib/mockData";
import type { OrderStatus } from "@/lib/types";

type FilterTab = OrderStatus | "all";

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "filled", label: "Filled" },
  { key: "cancelled", label: "Cancelled" },
  { key: "aggregation-locked", label: "Agg Locked" },
];

const statusColors: Record<OrderStatus, string> = {
  open: "bg-info/20 text-info",
  filled: "bg-success/20 text-success",
  cancelled: "bg-error/20 text-error",
  "aggregation-locked": "bg-warning/20 text-warning",
};

export default function OrderHistory() {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = filter === "all"
    ? mockOrderHistory
    : mockOrderHistory.filter((o) => o.status === filter);

  return (
    <div className="bg-bg-surface border border-border rounded-lg">
      {/* Tab bar */}
      <div className="flex gap-1 p-2 border-b border-border-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 h-[28px] text-body-sm font-medium rounded-sm transition-fast ${
              filter === tab.key
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div className="flex h-[28px] items-center px-3 text-label-uppercase text-text-muted">
        <span className="w-[12%]">Time</span>
        <span className="w-[12%]">Pair</span>
        <span className="w-[10%]">Type</span>
        <span className="w-[8%]">Side</span>
        <span className="w-[14%] text-right">Amount</span>
        <span className="w-[14%] text-right">Price</span>
        <span className="w-[12%] text-right">Filled</span>
        <span className="w-[18%] text-right">Status</span>
      </div>

      {/* Rows */}
      <div className="max-h-[400px] overflow-y-auto">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="flex h-[32px] items-center px-3 text-body-sm font-mono font-tabular hover:bg-bg-elevated transition-fast"
          >
            <span className="w-[12%] text-text-secondary">{order.time}</span>
            <span className="w-[12%] font-display text-text-primary">{order.pair}</span>
            <span className="w-[10%] font-display text-text-muted capitalize">{order.type}</span>
            <span className={`w-[8%] font-display capitalize ${order.side === "buy" ? "text-success" : "text-error"}`}>
              {order.side}
            </span>
            <span className="w-[14%] text-right text-text-primary">
              {order.amount.toLocaleString()}
            </span>
            <span className="w-[14%] text-right text-text-primary">
              {order.price.toFixed(4)}
            </span>
            <span className="w-[12%] text-right text-text-secondary">
              {order.filledPercent}%
            </span>
            <span className="w-[18%] flex justify-end">
              <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[order.status]}`}>
                {order.status === "aggregation-locked" ? "Agg Lock" : order.status}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
