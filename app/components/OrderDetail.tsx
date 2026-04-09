"use client";

import Link from "next/link";
import { mockOrderDetail } from "@/lib/mockData";
import type { OrderStatus } from "@/lib/types";
import { Check } from "lucide-react";

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
  const order = { ...mockOrderDetail, id: orderId };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Link
        href="/account"
        className="text-accent text-body-sm hover:text-accent-hover transition-fast w-fit"
      >
        &larr; Back to Orders
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-h3 md:text-h2 font-semibold">#{order.id}</h2>
          <span className={`text-label-uppercase px-2 py-0.5 rounded-sm ${statusColors[order.status]}`}>
            {order.status === "aggregation-locked" ? "Agg Lock" : order.status}
          </span>
        </div>
        {order.status === "open" && (
          <button className="h-[32px] px-4 text-body-sm font-medium border border-error rounded-md text-error hover:bg-error/10 transition-fast">
            Cancel
          </button>
        )}
      </div>

      {/* Horizontal Pipeline — mobile */}
      <div className="md:hidden">
        <h3 className="text-label-uppercase text-text-muted mb-3">Order Pipeline</h3>
        <HorizontalPipeline status={order.status} />
      </div>

      {/* Desktop: side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Order Details */}
        <div className="flex flex-col">
          <h3 className="text-label-uppercase text-text-muted mb-4">Order Details</h3>
          <div className="flex flex-col gap-3">
            <Row label="Pair" value={order.pair} />
            <Row label="Side" value={order.side} className={order.side === "buy" ? "text-success" : "text-error"} />
            <Row label="Type" value={order.type === "midpoint" ? "Midpoint Peg" : order.type} />
            <Row label="Size" value={`€${order.size.toLocaleString()}.00`} mono />
            <Row label="Midpoint Rate" value={order.midpointRate.toFixed(4)} mono />
            <Row label="Slippage" value={`${order.slippage}%`} mono />
            <Row label="Filled" value={`${order.filledPercent}%`} mono className={order.filledPercent > 0 ? "text-success" : undefined} />
            <Row label="Submitted" value={order.submittedAt} mono />
          </div>
        </div>

        {/* Pipeline — desktop only */}
        <div className="hidden md:block">
          <h3 className="text-label-uppercase text-text-muted mb-4">Pipeline</h3>
          <VerticalPipeline status={order.status} />
        </div>
      </div>

      {/* Fills */}
      {order.fills.length > 0 && (
        <div className="flex flex-col">
          <div className="pb-3">
            <h3 className="text-body-sm font-semibold">Fills</h3>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="flex items-center h-[33px] border-b border-border-subtle text-label-uppercase text-text-muted">
              <span className="w-[25%]">Time</span>
              <span className="w-[25%] text-right">Price</span>
              <span className="w-[25%] text-right">Size</span>
              <span className="w-[25%] text-right">Batch</span>
            </div>
            {order.fills.map((fill, i) => (
              <div
                key={i}
                className="flex items-center h-[40px] text-body-sm font-mono font-tabular hover:bg-bg-surface transition-fast rounded-md"
              >
                <span className="w-[25%] text-text-secondary">{fill.time}</span>
                <span className="w-[25%] text-right text-text-primary">{fill.price.toFixed(4)}</span>
                <span className="w-[25%] text-right text-text-primary">{fill.size.toLocaleString()}</span>
                <span className="w-[25%] text-right">
                  <Link href={`/explorer/batch/${fill.batchId}`} className="text-accent hover:text-accent-hover transition-fast">
                    {fill.batchId}
                  </Link>
                </span>
              </div>
            ))}
          </div>

          {/* Mobile fills */}
          <div className="md:hidden">
            {order.fills.map((fill, i) => (
              <div key={i} className="p-4 border-b border-border-subtle last:border-b-0">
                <div className="flex justify-between mb-1">
                  <span className="text-body-sm text-text-secondary font-mono font-tabular">{fill.time}</span>
                  <Link href={`/explorer/batch/${fill.batchId}`} className="text-body-sm text-accent hover:text-accent-hover transition-fast">
                    {fill.batchId}
                  </Link>
                </div>
                <span className="text-body-sm font-mono font-tabular text-text-primary">
                  €{fill.size.toLocaleString()} @ {fill.price.toFixed(4)}
                </span>
              </div>
            ))}
            {order.filledPercent < 100 && (
              <div className="px-4 py-3 text-[12px] text-text-muted italic">
                Remaining €{(order.size * (1 - order.filledPercent / 100)).toLocaleString()} in aggregation queue...
              </div>
            )}
          </div>
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

function HorizontalPipeline({ status }: { status: OrderStatus }) {
  const steps = [
    { key: "submitted", label: "Submit" },
    { key: "matched", label: "Match" },
    { key: "aggregation-locked", label: "Agg Lock" },
    { key: "batched", label: "Batch" },
    { key: "settled", label: "Settle" },
    { key: "proven", label: "Prove" },
  ];

  const statusMap: Record<OrderStatus, number> = {
    open: 0,
    filled: 5,
    cancelled: -1,
    "aggregation-locked": 2,
  };

  const currentIdx = statusMap[status];

  return (
    <div className="flex items-start">
      {steps.map((step, i) => {
        const isCompleted = i <= currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "bg-success text-text-inverse"
                    : isCurrent
                      ? "bg-accent text-text-inverse"
                      : "bg-bg-elevated text-text-muted"
                }`}
              >
                {isCompleted ? <Check size={10} /> : null}
              </div>
              <span className={`text-[9px] mt-1 text-center leading-tight ${
                isCurrent ? "text-accent font-medium" : isCompleted ? "text-success" : "text-text-muted"
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 -mt-3 ${isCompleted ? "bg-success" : "bg-bg-elevated"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function VerticalPipeline({ status }: { status: OrderStatus }) {
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
                {isCompleted ? <Check size={12} /> : (i + 1)}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-px h-6 ${isCompleted ? "bg-success" : "bg-bg-elevated"}`} />
              )}
            </div>
            <span className={`text-body-sm pt-0.5 ${isCurrent ? "text-text-primary font-medium" : "text-text-muted"}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
