"use client";

import Link from "next/link";
import { mockOrderDetail } from "@/lib/mockData";
import type { OrderStatus } from "@/lib/types";

const statusColors: Record<OrderStatus, string> = {
  open: "bg-info/20 text-info",
  filled: "bg-success/20 text-success",
  cancelled: "bg-error/20 text-error",
  "aggregation-locked": "bg-warning/20 text-warning",
};

interface OrderDetailProps {
  orderId: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  // In a real app, fetch by orderId. Using mock for now.
  const order = { ...mockOrderDetail, id: orderId };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/account"
        className="text-accent text-body-sm hover:text-accent-hover transition-fast w-fit"
      >
        &lt; Back to Orders
      </Link>

      <div className="flex items-center gap-4">
        <h2 className="text-h2 font-semibold">{order.id}</h2>
        <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[order.status]}`}>
          {order.status === "aggregation-locked" ? "Agg Lock" : order.status}
        </span>
      </div>

      {/* Order info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-surface border border-border rounded-lg p-6">
          <h3 className="text-label-uppercase text-text-muted mb-4">Order Details</h3>
          <div className="flex flex-col gap-3">
            <Row label="Pair" value={order.pair} />
            <Row label="Side" value={order.side} className={order.side === "buy" ? "text-success" : "text-error"} />
            <Row label="Type" value={order.type} />
            <Row label="Size" value={order.size.toLocaleString()} mono />
            <Row label="Price" value={order.price.toFixed(4)} mono />
            <Row label="Midpoint Rate" value={order.midpointRate.toFixed(4)} mono />
            <Row label="Slippage" value={`${order.slippage}%`} mono />
            <Row label="Filled" value={`${order.filledPercent}%`} mono />
            <Row label="Submitted" value={order.submittedAt} mono />
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-bg-surface border border-border rounded-lg p-6">
          <h3 className="text-label-uppercase text-text-muted mb-4">Pipeline</h3>
          <PipelineTimeline status={order.status} />
        </div>
      </div>

      {/* Fills */}
      {order.fills.length > 0 && (
        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-body-sm font-semibold">Fills</h3>
            <span className="text-body-sm text-text-muted">{order.fills.length} fills</span>
          </div>
          <div className="flex items-center h-[33px] px-4 text-label-uppercase text-text-muted">
            <span className="w-[25%]">Time</span>
            <span className="w-[25%] text-right">Price</span>
            <span className="w-[25%] text-right">Size</span>
            <span className="w-[25%] text-right">Batch</span>
          </div>
          {order.fills.map((fill, i) => (
            <div
              key={i}
              className="flex items-center px-4 h-[40px] text-body-sm font-mono font-tabular hover:bg-bg-elevated transition-fast"
            >
              <span className="w-[25%] text-text-secondary">{fill.time}</span>
              <span className="w-[25%] text-right text-text-primary">{fill.price.toFixed(4)}</span>
              <span className="w-[25%] text-right text-text-primary">{fill.size.toLocaleString()}</span>
              <span className="w-[25%] text-right">
                <Link
                  href={`/explorer/batch/${fill.batchId}`}
                  className="text-accent hover:text-accent-hover transition-fast"
                >
                  {fill.batchId}
                </Link>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className="flex justify-between text-body-sm">
      <span className="text-text-muted">{label}</span>
      <span className={`${mono ? "font-mono font-tabular" : ""} ${className ?? "text-text-primary"} capitalize`}>
        {value}
      </span>
    </div>
  );
}

function PipelineTimeline({ status }: { status: OrderStatus }) {
  const steps = [
    { key: "submitted", label: "Submitted" },
    { key: "matched", label: "Matched" },
    { key: "aggregation-locked", label: "Aggregation Locked" },
    { key: "batched", label: "Batched" },
    { key: "settled", label: "Settled" },
    { key: "proven", label: "Proven" },
  ];

  const statusMap: Record<OrderStatus, number> = {
    open: 0,
    filled: 5,
    cancelled: -1,
    "aggregation-locked": 2,
  };

  const currentIdx = statusMap[status];

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const isCompleted = i <= currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-body-sm ${
                  isCompleted
                    ? "bg-success text-text-inverse"
                    : isCurrent
                      ? "bg-accent text-text-inverse"
                      : "bg-bg-elevated text-text-muted"
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-px h-6 ${isCompleted ? "bg-success" : "bg-bg-elevated"}`} />
              )}
            </div>
            <span
              className={`text-body-sm pt-0.5 ${
                isCurrent ? "text-text-primary font-medium" : "text-text-muted"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
