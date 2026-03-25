"use client";

import { useState } from "react";
import { openPositions, mockOrderHistory, recentTrades } from "@/lib/mockData";
import type { OrderStatus } from "@/lib/types";
import { SkeletonRow } from "@/components/Skeleton";

const tabs = ["Positions", "Orders", "Trade History"] as const;

const statusColors: Record<OrderStatus, string> = {
  open: "bg-info/20 text-info",
  filled: "bg-success/20 text-success",
  cancelled: "bg-error/20 text-error",
  "aggregation-locked": "bg-warning/20 text-warning",
};

const positionSkeletonColumns = [
  { width: "16%" },
  { width: "12%" },
  { width: "18%", align: "right" as const },
  { width: "16%", align: "right" as const },
  { width: "16%", align: "right" as const },
  { width: "12%", align: "right" as const },
  { width: "10%", align: "right" as const },
];

export default function BottomPanel({ isLoading }: { isLoading?: boolean }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Positions");

  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden flex flex-col min-h-0">
      {/* Tab bar */}
      <div className="flex gap-1 p-2 border-b border-border shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 h-[28px] text-body-sm font-medium rounded-sm transition-fast ${
              activeTab === tab
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {activeTab === "Positions" && <PositionsTable isLoading={isLoading} />}
        {activeTab === "Orders" && <OrdersTable />}
        {activeTab === "Trade History" && <TradeHistoryTable />}
      </div>
    </div>
  );
}

function PositionsTable({ isLoading }: { isLoading?: boolean }) {
  return (
    <>
      <div className="flex items-center h-[28px] px-3 text-label-uppercase text-text-muted">
        <span className="w-[16%]">Pair</span>
        <span className="w-[12%]">Side</span>
        <span className="w-[18%] text-right">Size</span>
        <span className="w-[16%] text-right">Entry</span>
        <span className="w-[16%] text-right">Current</span>
        <span className="w-[12%] text-right">P&L</span>
        <span className="w-[10%] text-right">P&L%</span>
      </div>
      {isLoading ? (
        <div>
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonRow
              key={i}
              data-testid="skeleton-row"
              height="32px"
              columns={positionSkeletonColumns}
            />
          ))}
        </div>
      ) : (
        <div className="animate-fadeIn">
          {openPositions.length === 0 ? (
            <div className="flex items-center justify-center h-[80px]">
              <span className="text-body-sm text-text-muted">No open positions</span>
            </div>
          ) : (
            openPositions.map((pos, i) => (
              <div
                key={i}
                className="flex items-center h-[32px] px-3 text-body-sm font-mono font-tabular hover:bg-bg-elevated transition-fast"
              >
                <span className="w-[16%] font-display text-text-primary">{pos.pair}</span>
                <span className={`w-[12%] font-display capitalize ${pos.side === "long" ? "text-success" : "text-error"}`}>
                  {pos.side}
                </span>
                <span className="w-[18%] text-right text-text-secondary">{pos.size.toLocaleString()}</span>
                <span className="w-[16%] text-right text-text-secondary">{pos.entry.toFixed(4)}</span>
                <span className="w-[16%] text-right text-text-primary">{pos.current.toFixed(4)}</span>
                <span className={`w-[12%] text-right ${pos.pnl >= 0 ? "text-success" : "text-error"}`}>
                  {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)}
                </span>
                <span className={`w-[10%] text-right ${pos.pnlPercent >= 0 ? "text-success" : "text-error"}`}>
                  {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

function OrdersTable() {
  const recentOrders = mockOrderHistory.slice(0, 8);
  return (
    <>
      <div className="flex items-center h-[28px] px-3 text-label-uppercase text-text-muted">
        <span className="w-[14%]">Pair</span>
        <span className="w-[10%]">Side</span>
        <span className="w-[14%]">Type</span>
        <span className="w-[16%] text-right">Size</span>
        <span className="w-[16%] text-right">Price</span>
        <span className="w-[12%] text-right">Filled</span>
        <span className="w-[18%] text-right">Status</span>
      </div>
      {recentOrders.map((order) => (
        <div
          key={order.id}
          className="flex items-center h-[32px] px-3 text-body-sm font-mono font-tabular hover:bg-bg-elevated transition-fast"
        >
          <span className="w-[14%] font-display text-text-primary">{order.pair}</span>
          <span className={`w-[10%] font-display capitalize ${order.side === "buy" ? "text-success" : "text-error"}`}>
            {order.side}
          </span>
          <span className="w-[14%] font-display text-text-muted capitalize">{order.type}</span>
          <span className="w-[16%] text-right text-text-primary">{order.amount.toLocaleString()}</span>
          <span className="w-[16%] text-right text-text-primary">{order.price.toFixed(4)}</span>
          <span className="w-[12%] text-right text-text-secondary">{order.filledPercent}%</span>
          <span className="w-[18%] flex justify-end">
            <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[order.status]}`}>
              {order.status === "aggregation-locked" ? "Agg Lock" : order.status}
            </span>
          </span>
        </div>
      ))}
    </>
  );
}

function TradeHistoryTable() {
  return (
    <>
      <div className="flex items-center h-[28px] px-3 text-label-uppercase text-text-muted">
        <span className="w-[25%]">Time</span>
        <span className="w-[25%] text-right">Price</span>
        <span className="w-[25%] text-right">Size</span>
        <span className="w-[25%] text-right">Side</span>
      </div>
      {recentTrades.slice(0, 10).map((trade, i) => (
        <div
          key={i}
          className="flex items-center h-[28px] px-3 text-mono font-mono font-tabular hover:bg-bg-elevated transition-fast"
        >
          <span className="w-[25%] text-text-muted">{trade.time}</span>
          <span className={`w-[25%] text-right ${trade.side === "buy" ? "text-success" : "text-error"}`}>
            {trade.price.toFixed(4)}
          </span>
          <span className="w-[25%] text-right text-text-secondary">
            {trade.sizeFormatted ?? trade.size.toLocaleString()}
          </span>
          <span className={`w-[25%] text-right capitalize ${trade.side === "buy" ? "text-success" : "text-error"}`}>
            {trade.side}
          </span>
        </div>
      ))}
    </>
  );
}
