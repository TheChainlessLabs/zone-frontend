"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { openPositions } from "@/lib/mockData";
import type { OrderStatus } from "@/lib/types";
import { useUserOrders } from "@/lib/hooks/useUserOrders";
import { useOrderFillDetector } from "@/lib/hooks/useOrderFillDetector";
import { useOrderSigning } from "@/lib/hooks/useOrderSigning";
import { cancelOrder } from "@/lib/apiClient";
import { useWallet } from "@/lib/wallet";
import { useMarket } from "@/lib/hooks/useMarket";
import { useToast } from "@/lib/useToast";
import { SkeletonRow } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { useTrades } from "@/lib/hooks/useTrades";
import { TrendingUp, ClipboardList } from "lucide-react";

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
    <div className="flex flex-col min-h-0">
      {/* Tab bar */}
      <div className="flex gap-1 pb-2 border-b border-border-subtle shrink-0 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 min-h-[44px] md:min-h-[28px] text-body-sm font-medium rounded-sm transition-fast whitespace-nowrap ${
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
      {/* Desktop table */}
      <div className="hidden md:block">
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
              <EmptyState
                icon={<TrendingUp size={24} />}
                title="No open positions"
                description="Your open positions will appear here. Start trading to build your portfolio."
              />
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
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="p-3 space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="animate-pulse bg-bg-elevated rounded-md h-[60px]" />
            ))}
          </div>
        ) : (
          <div className="animate-fadeIn">
            {openPositions.length === 0 ? (
              <EmptyState
                icon={<TrendingUp size={24} />}
                title="No open positions"
                description="Your open positions will appear here. Start trading to build your portfolio."
              />
            ) : (
              openPositions.map((pos, i) => (
                <div key={i} className="px-3 py-2.5 border-b border-border-subtle last:border-b-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-text-primary">{pos.pair}</span>
                      <span className={`text-[13px] font-medium capitalize ${pos.side === "long" ? "text-success" : "text-error"}`}>
                        {pos.side}
                      </span>
                    </div>
                    <span className={`text-[13px] font-mono font-tabular font-medium ${pos.pnl >= 0 ? "text-success" : "text-error"}`}>
                      {pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(2)} ({pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px] text-text-muted font-mono font-tabular">
                    <span>{pos.size.toLocaleString()} @ {pos.entry.toFixed(4)}</span>
                    <span>Now {pos.current.toFixed(4)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

function OrdersTable() {
  const { accountId } = useWallet();
  const { marketId } = useMarket();
  const { orders, openOrders, isLoading, isError } = useUserOrders(accountId, marketId);
  useOrderFillDetector(orders);
  const { signCancel } = useOrderSigning();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const recentOrders = openOrders.slice(0, 8);

  const handleCancel = useCallback(async (orderId: number) => {
    setCancellingId(orderId);
    try {
      const signed = await signCancel({ marketId, orderId });
      await cancelOrder({ market_id: marketId, order_id: orderId, nonce: signed.nonce, signature: signed.signature });
      addToast("success", "Order Cancelled", `Order #${orderId} cancelled`);
      queryClient.invalidateQueries({ queryKey: ["orders", marketId] });
      queryClient.invalidateQueries({ queryKey: ["book", marketId] });
    } catch (err) {
      if (!(err instanceof Error && err.message.includes("User rejected"))) {
        addToast("error", "Cancel Failed", err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setCancellingId(null);
    }
  }, [marketId, signCancel, addToast, queryClient]);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="flex items-center h-[28px] px-3 text-label-uppercase text-text-muted">
          <span className="w-[13%]">Pair</span>
          <span className="w-[9%]">Side</span>
          <span className="w-[12%]">Type</span>
          <span className="w-[15%] text-right">Size</span>
          <span className="w-[15%] text-right">Price</span>
          <span className="w-[10%] text-right">Filled</span>
          <span className="w-[16%] text-right">Status</span>
          <span className="w-[10%]"></span>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-[80px]">
            <span className="text-body-sm text-text-muted">Loading orders...</span>
          </div>
        ) : isError ? (
          <ErrorState message="Failed to load orders." />
        ) : recentOrders.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={24} />}
            title="No orders yet"
            description="When you place trades, your order history will be displayed here."
          />
        ) : (
          recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center h-[32px] px-3 text-body-sm font-mono font-tabular hover:bg-bg-elevated transition-fast"
            >
              <span className="w-[13%] font-display text-text-primary">{order.pair}</span>
              <span className={`w-[9%] font-display capitalize ${order.side === "buy" ? "text-success" : "text-error"}`}>
                {order.side}
              </span>
              <span className="w-[12%] font-display text-text-muted capitalize">{order.type}</span>
              <span className="w-[15%] text-right text-text-primary">{order.amount.toLocaleString()}</span>
              <span className="w-[15%] text-right text-text-primary">{order.price.toFixed(4)}</span>
              <span className="w-[10%] text-right text-text-secondary">{order.filledPercent}%</span>
              <span className="w-[16%] flex justify-end">
                <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </span>
              <span className="w-[10%] flex justify-end">
                {order.status === "open" && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    disabled={cancellingId === order.id}
                    className="w-[44px] h-[44px] md:w-[22px] md:h-[22px] flex items-center justify-center rounded-sm text-text-muted hover:text-error hover:bg-error/10 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Cancel order"
                  >
                    {cancellingId === order.id ? (
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-[13px] font-medium">&times;</span>
                    )}
                  </button>
                )}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-[80px]">
            <span className="text-body-sm text-text-muted">Loading orders...</span>
          </div>
        ) : isError ? (
          <ErrorState message="Failed to load orders." />
        ) : recentOrders.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={24} />}
            title="No orders yet"
            description="When you place trades, your order history will be displayed here."
          />
        ) : (
          recentOrders.map((order) => (
            <div key={order.id} className="px-3 py-2.5 border-b border-border-subtle last:border-b-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-text-primary">{order.pair}</span>
                  <span className={`text-[13px] font-medium capitalize ${order.side === "buy" ? "text-success" : "text-error"}`}>
                    {order.side}
                  </span>
                  <span className="text-[13px] text-text-muted capitalize">{order.type}</span>
                </div>
                <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-text-muted font-mono font-tabular">
                  {order.amount.toLocaleString()} @ {order.price.toFixed(4)} &middot; {order.filledPercent}% filled
                </span>
                {order.status === "open" && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    disabled={cancellingId === order.id}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm text-error text-[13px] font-medium"
                  >
                    {cancellingId === order.id ? (
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Cancel"
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

const tradeSkeletonColumns = [
  { width: "25%" },
  { width: "25%", align: "right" as const },
  { width: "25%", align: "right" as const },
  { width: "25%", align: "right" as const },
];

function TradeHistoryTable() {
  const { trades, isLoading, isError } = useTrades();

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="flex items-center h-[28px] px-3 text-label-uppercase text-text-muted">
          <span className="w-[25%]">Time</span>
          <span className="w-[25%] text-right">Price</span>
          <span className="w-[25%] text-right">Size</span>
          <span className="w-[25%] text-right">Side</span>
        </div>
        {isLoading ? (
          <div>
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonRow key={i} height="28px" columns={tradeSkeletonColumns} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-[80px]">
            <span className="text-body-sm text-text-muted">Data unavailable</span>
          </div>
        ) : trades.length === 0 ? (
          <div className="flex items-center justify-center h-[80px]">
            <span className="text-body-sm text-text-muted">No trades yet</span>
          </div>
        ) : (
          trades.slice(0, 10).map((trade, i) => (
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
          ))
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="animate-pulse bg-bg-elevated rounded-md h-[40px]" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-[80px]">
            <span className="text-body-sm text-text-muted">Data unavailable</span>
          </div>
        ) : trades.length === 0 ? (
          <div className="flex items-center justify-center h-[80px]">
            <span className="text-body-sm text-text-muted">No trades yet</span>
          </div>
        ) : (
          trades.slice(0, 10).map((trade, i) => (
            <div key={i} className="px-3 py-2 border-b border-border-subtle last:border-b-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-text-muted">{trade.time}</span>
                <span className={`text-[13px] font-mono font-tabular capitalize ${trade.side === "buy" ? "text-success" : "text-error"}`}>
                  {trade.side}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className={`text-[13px] font-mono font-tabular ${trade.side === "buy" ? "text-success" : "text-error"}`}>
                  {trade.price.toFixed(4)}
                </span>
                <span className="text-[13px] font-mono font-tabular text-text-secondary">
                  {trade.sizeFormatted ?? trade.size.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
