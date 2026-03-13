"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CancelAllModal from "@/components/CancelAllModal";
import ForcedWithdrawalModal from "@/components/ForcedWithdrawalModal";
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

export default function AccountPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [cancelAllOpen, setCancelAllOpen] = useState(false);
  const [forceWithdrawOpen, setForceWithdrawOpen] = useState(false);

  const filtered = filter === "all"
    ? mockOrderHistory
    : mockOrderHistory.filter((o) => o.status === filter);

  const openCount = mockOrderHistory.filter((o) => o.status === "open").length;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <h1 className="text-h2 font-semibold">Orders</h1>
            <span className="text-body-sm text-text-muted">{openCount} open orders</span>
          </div>
          <button
            onClick={() => setCancelAllOpen(true)}
            className="h-[32px] px-4 text-body-sm font-medium border border-error rounded-md text-error hover:bg-error/10 transition-fast w-fit"
          >
            Cancel All
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-bg-surface border border-border rounded-md p-1">
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
          <select className="h-[32px] px-3 bg-bg-surface border border-border rounded-md text-body-sm text-text-secondary outline-none">
            <option>All Pairs</option>
            <option>EUR/USD</option>
            <option>GBP/USD</option>
          </select>
          <select className="h-[32px] px-3 bg-bg-surface border border-border rounded-md text-body-sm text-text-secondary outline-none">
            <option>All Dates</option>
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>

        {/* Orders — Desktop table */}
        <div className="hidden md:block bg-bg-surface border border-border rounded-lg overflow-hidden">
          <div className="flex items-center h-[33px] px-4 text-label-uppercase text-text-muted">
            <span className="w-[14%]">Pair</span>
            <span className="w-[8%]">Side</span>
            <span className="w-[10%]">Type</span>
            <span className="w-[14%] text-right">Size</span>
            <span className="w-[14%] text-right">Price</span>
            <span className="w-[10%] text-right">Filled</span>
            <span className="w-[16%] text-right">Status</span>
            <span className="w-[14%] text-right">Time</span>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filtered.map((order) => (
              <Link
                key={order.id}
                href={`/account/order/${order.id}`}
                className="flex items-center px-4 h-[40px] text-body-sm font-mono font-tabular hover:bg-bg-elevated transition-fast"
              >
                <span className="w-[14%] font-display text-text-primary">{order.pair}</span>
                <span className={`w-[8%] font-display capitalize ${order.side === "buy" ? "text-success" : "text-error"}`}>
                  {order.side}
                </span>
                <span className="w-[10%] font-display text-text-muted capitalize">{order.type}</span>
                <span className="w-[14%] text-right text-text-primary">{order.amount.toLocaleString()}</span>
                <span className="w-[14%] text-right text-text-primary">{order.price.toFixed(4)}</span>
                <span className="w-[10%] text-right text-text-secondary">{order.filledPercent}%</span>
                <span className="w-[16%] flex justify-end">
                  <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[order.status]}`}>
                    {order.status === "aggregation-locked" ? "Agg Lock" : order.status}
                  </span>
                </span>
                <span className="w-[14%] text-right text-text-secondary">{order.time}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Orders — Mobile cards */}
        <div className="md:hidden flex flex-col">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/account/order/${order.id}`}
              className="block py-3 border-b border-border-subtle last:border-b-0"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-text-primary">{order.pair}</span>
                  <span className={`text-[13px] font-medium capitalize ${order.side === "buy" ? "text-success" : "text-error"}`}>
                    {order.side}
                  </span>
                  <span className="text-[13px] text-text-muted capitalize">{order.type}</span>
                </div>
                <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[order.status]}`}>
                  {order.status === "aggregation-locked" ? "Agg Lock" : order.status}
                </span>
              </div>
              <div className="flex justify-between text-[12px] text-text-muted font-mono font-tabular">
                <span>{order.amount.toLocaleString()} @ {order.price.toFixed(4)}</span>
                <span>{order.filledPercent}% filled</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Force withdrawal banner */}
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <p className="text-body-sm font-medium text-warning">Force Withdrawal Available</p>
            <p className="text-body-sm text-text-muted mt-0.5">
              If the TEE is unresponsive, you can force withdraw your funds on-chain.
            </p>
          </div>
          <button
            onClick={() => setForceWithdrawOpen(true)}
            className="h-[32px] px-4 text-body-sm font-medium border border-warning rounded-md text-warning hover:bg-warning/10 transition-fast shrink-0"
          >
            Force Withdraw
          </button>
        </div>
      </div>

      <CancelAllModal isOpen={cancelAllOpen} onClose={() => setCancelAllOpen(false)} />
      <ForcedWithdrawalModal isOpen={forceWithdrawOpen} onClose={() => setForceWithdrawOpen(false)} />
    </div>
  );
}
