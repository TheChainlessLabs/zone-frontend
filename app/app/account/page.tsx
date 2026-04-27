"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import CancelAllModal from "@/components/CancelAllModal";
import ForcedWithdrawalModal from "@/components/ForcedWithdrawalModal";
import ProtectedPage from "@/components/ProtectedPage";
import { useUserOrders } from "@/lib/hooks/useUserOrders";
import { useOrderSigning } from "@/lib/hooks/useOrderSigning";
import { cancelOrder } from "@/lib/apiClient";
import { useWallet } from "@/lib/wallet";
import { useMarket } from "@/lib/hooks/useMarket";
import { useToast } from "@/lib/useToast";
import { useSignedOperationQueue } from "@/lib/hooks/useSignedOperationQueue";
import type { OrderStatus } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { ClipboardList } from "lucide-react";
import { devError } from "@/lib/devLog";
import { getFriendlyError } from "@/lib/errorMessages";
import { useNotifications } from "@/lib/useNotifications";

type FilterTab = OrderStatus | "all";

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "filled", label: "Filled" },
  { key: "cancelled", label: "Cancelled" },
  { key: "aggregation-locked", label: "Agg Locked" },
];

const statusColors: Record<OrderStatus, string> = {
  open: "bg-bg-elevated text-text-secondary",
  filled: "bg-success/20 text-success",
  cancelled: "bg-error/20 text-error",
  "aggregation-locked": "bg-warning/20 text-warning",
};

export default function AccountPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [cancelAllOpen, setCancelAllOpen] = useState(false);
  const [forceWithdrawOpen, setForceWithdrawOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelAllProgress, setCancelAllProgress] = useState<{ done: number; failed: number; total: number } | null>(null);

  const { accountId } = useWallet();
  const { marketId } = useMarket();
  const { orders, openOrders, isLoading, isError } = useUserOrders(accountId, marketId);
  const { signCancel } = useOrderSigning();
  const { addToast } = useToast();
  const { execute: executeSignedOp } = useSignedOperationQueue();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  const openCount = openOrders.length;

  const handleCancel = useCallback(async (orderId: number) => {
    setCancellingId(orderId);
    try {
      await executeSignedOp(async () => {
        const signed = await signCancel({ marketId, orderId });
        await cancelOrder({ market_id: marketId, order_id: orderId, nonce: signed.nonce, signature: signed.signature });
        addToast("success", "Order Cancelled", `Order #${orderId} cancelled`);
        addNotification("order_cancelled", "Order Cancelled", `Order #${orderId} has been cancelled`);
        queryClient.invalidateQueries({ queryKey: ["orders", marketId] });
        queryClient.invalidateQueries({ queryKey: ["book", marketId] });
      });
    } catch (err) {
      devError("cancel", "cancel order failed", err);
      if (err instanceof Error && err.message === "Another signed operation is in progress") {
        addToast("warning", "Please Wait", "Another operation is in progress...");
      } else if (!(err instanceof Error && err.message.includes("User rejected"))) {
        const raw = err instanceof Error ? err.message : "Unknown error";
        addToast("error", "Cancel Failed", getFriendlyError(raw));
      }
    } finally {
      setCancellingId(null);
    }
  }, [marketId, signCancel, executeSignedOp, addToast, queryClient]);

  const handleCancelAll = useCallback(async () => {
    const orders = [...openOrders];
    const total = orders.length;
    if (total === 0) return;

    try {
      await executeSignedOp(async () => {
        setCancelAllProgress({ done: 0, failed: 0, total });
        let done = 0;
        let failed = 0;

        for (const order of orders) {
          try {
            const signed = await signCancel({ marketId, orderId: order.id });
            await cancelOrder({ market_id: marketId, order_id: order.id, nonce: signed.nonce, signature: signed.signature });
            done++;
          } catch (err) {
            if (err instanceof Error && err.message.includes("User rejected")) {
              // User rejected signing — stop the whole batch
              break;
            }
            failed++;
          }
          setCancelAllProgress({ done: done + failed, failed, total });
        }

        if (failed === 0 && done > 0) {
          addToast("success", "All Orders Cancelled", `${done} order${done > 1 ? "s" : ""} cancelled`);
        } else if (done > 0 && failed > 0) {
          addToast("warning", "Partial Cancel", `Cancelled ${done} of ${total}, ${failed} failed`);
        } else if (failed > 0 && done === 0) {
          addToast("error", "Cancel Failed", `All ${failed} cancellations failed`);
        }

        queryClient.invalidateQueries({ queryKey: ["orders", marketId] });
        queryClient.invalidateQueries({ queryKey: ["book", marketId] });
        setCancelAllProgress(null);
        setCancelAllOpen(false);
      });
    } catch (err) {
      if (err instanceof Error && err.message === "Another signed operation is in progress") {
        addToast("warning", "Please Wait", "Another operation is in progress...");
      }
      setCancelAllProgress(null);
    }
  }, [openOrders, marketId, signCancel, executeSignedOp, addToast, queryClient]);

  return (
    <ProtectedPage shellClassName="flex flex-col min-h-screen">
      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-4 md:gap-6">
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
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="flex gap-1 bg-bg-surface border border-border rounded-md p-1 overflow-x-auto no-scrollbar w-full md:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 min-h-[44px] md:min-h-[28px] text-body-sm font-medium rounded-sm transition-fast whitespace-nowrap ${
                  filter === tab.key
                    ? "bg-bg-elevated text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select className="min-h-[44px] md:min-h-[32px] px-3 bg-bg-surface border border-border rounded-md text-body-sm text-text-secondary outline-none flex-1 md:flex-none">
            <option>All Pairs</option>
            <option>EUR/USD</option>
            <option>GBP/USD</option>
          </select>
          <select className="min-h-[44px] md:min-h-[32px] px-3 bg-bg-surface border border-border rounded-md text-body-sm text-text-secondary outline-none flex-1 md:flex-none">
            <option>All Dates</option>
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>

        {/* Orders — Desktop table */}
        <SectionErrorBoundary fallbackMessage="Orders unavailable">
        <div className="hidden md:block">
          <div className="flex items-center h-[33px] border-b border-border-subtle text-label-uppercase text-text-muted">
            <span className="w-[13%]">Pair</span>
            <span className="w-[8%]">Side</span>
            <span className="w-[10%]">Type</span>
            <span className="w-[13%] text-right">Size</span>
            <span className="w-[13%] text-right">Price</span>
            <span className="w-[9%] text-right">Filled</span>
            <span className="w-[14%] text-right">Status</span>
            <span className="w-[13%] text-right">Time</span>
            <span className="w-[7%]"></span>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-[120px]">
                <span className="text-body-sm text-text-muted">Loading orders...</span>
              </div>
            ) : isError ? (
              <ErrorState message="Failed to load orders." />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<ClipboardList size={24} />}
                title="No orders yet"
                description="When you place trades, your order history will be displayed here."
              />
            ) : (
              filtered.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center h-[40px] text-body-sm font-mono font-tabular hover:bg-bg-surface transition-fast rounded-md"
                >
                  <Link href={`/account/order/${order.id}`} className="flex items-center w-[93%]">
                    <span className="w-[14%] font-display text-text-primary">{order.pair}</span>
                    <span className={`w-[8.5%] font-display capitalize ${order.side === "buy" ? "text-success" : "text-error"}`}>
                      {order.side}
                    </span>
                    <span className="w-[10.5%] font-display text-text-muted capitalize">{order.type}</span>
                    <span className="w-[14%] text-right text-text-primary">{order.amount.toLocaleString()}</span>
                    <span className="w-[14%] text-right text-text-primary">{order.price.toFixed(4)}</span>
                    <span className="w-[10%] text-right text-text-secondary">{order.filledPercent}%</span>
                    <span className="w-[15%] flex justify-end">
                      <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </span>
                    <span className="w-[14%] text-right text-text-secondary">{order.time}</span>
                  </Link>
                  <span className="w-[7%] flex justify-end">
                    {order.status === "open" && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                        className="w-[44px] h-[44px] md:w-[24px] md:h-[24px] flex items-center justify-center rounded-sm text-text-muted hover:text-error hover:bg-error/10 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cancel order"
                      >
                        {cancellingId === order.id ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-[14px] font-medium">&times;</span>
                        )}
                      </button>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        </SectionErrorBoundary>

        {/* Orders — Mobile cards */}
        <SectionErrorBoundary fallbackMessage="Orders unavailable">
        <div className="md:hidden flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center h-[120px]">
              <span className="text-body-sm text-text-muted">Loading orders...</span>
            </div>
          ) : isError ? (
            <ErrorState message="Failed to load orders." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={24} />}
              title="No orders yet"
              description="When you place trades, your order history will be displayed here."
            />
          ) : (
            filtered.map((order) => (
              <div
                key={order.id}
                className="py-3 border-b border-border-subtle last:border-b-0"
              >
                <Link href={`/account/order/${order.id}`} className="block">
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
                  <div className="flex justify-between text-[12px] text-text-muted font-mono font-tabular">
                    <span>{order.amount.toLocaleString()} @ {order.price.toFixed(4)}</span>
                    <span>{order.filledPercent}% filled</span>
                  </div>
                </Link>
                {order.status === "open" && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancellingId === order.id}
                      className="h-[28px] px-3 text-body-sm font-medium border border-error/50 rounded-md text-error hover:bg-error/10 transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingId === order.id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        </SectionErrorBoundary>

        {/* Force withdrawal banner */}
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 justify-between">
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

      <CancelAllModal
        isOpen={cancelAllOpen}
        onClose={() => setCancelAllOpen(false)}
        openOrders={openOrders}
        onCancelAll={handleCancelAll}
        progress={cancelAllProgress}
      />
      <ForcedWithdrawalModal isOpen={forceWithdrawOpen} onClose={() => setForceWithdrawOpen(false)} />
    </ProtectedPage>
  );
}
