"use client";

import { useState } from "react";
import { Info, Lock } from "lucide-react";
import type { OrderType, Side } from "@/lib/types";
import { Skeleton } from "@/components/Skeleton";

export default function OrderForm({ isLoading }: { isLoading?: boolean }) {
  const [orderType] = useState<OrderType>("midpoint");
  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("1.0850");

  const midpointRate = 1.0856;
  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount ? (parsedAmount * 0.00005).toFixed(2) : "0.00";
  const feePercent = "0.005%";
  const estReceive = parsedAmount ? (parsedAmount * midpointRate).toFixed(2) : "0.00";
  const savingsPips = "+0.8";

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {/* Buy/Sell toggle */}
        <div className="flex gap-1">
          <Skeleton className="flex-1 h-[40px] rounded-md" />
          <Skeleton className="flex-1 h-[40px] rounded-md" />
        </div>

        {/* Amount label + input */}
        <div>
          <Skeleton className="h-[14px] w-[80px] mb-1.5" />
          <Skeleton className="h-[44px] rounded-md" />
        </div>

        {/* Percentage shortcuts */}
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-[30px] rounded-md" />
          <Skeleton className="flex-1 h-[30px] rounded-md" />
          <Skeleton className="flex-1 h-[30px] rounded-md" />
        </div>

        {/* Order details — row height matches text-body-sm line-height (21px) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center h-[21px]">
            <Skeleton className="h-[14px] w-[60px]" />
            <Skeleton className="h-[14px] w-[80px]" />
          </div>
          <div className="flex justify-between items-center h-[21px]">
            <Skeleton className="h-[14px] w-[60px]" />
            <Skeleton className="h-[14px] w-[80px]" />
          </div>
          <div className="flex justify-between items-center h-[21px]">
            <Skeleton className="h-[14px] w-[60px]" />
            <Skeleton className="h-[14px] w-[80px]" />
          </div>
          <div className="h-px bg-border-subtle" />
          <div className="flex justify-between items-center h-[21px]">
            <Skeleton className="h-[14px] w-[60px]" />
            <Skeleton className="h-[14px] w-[80px]" />
          </div>
        </div>

        {/* Submit button */}
        <Skeleton className="h-[44px] rounded-md" />

        {/* Privacy notice */}
        <Skeleton className="h-[14px] w-[250px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      {/* Buy/Sell toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 h-[40px] text-body-sm font-semibold rounded-md transition-fast ${
            side === "buy"
              ? "bg-success text-text-inverse"
              : "bg-bg-elevated text-text-muted hover:text-text-secondary"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 h-[40px] text-body-sm font-semibold rounded-md transition-fast ${
            side === "sell"
              ? "bg-error text-text-inverse"
              : "bg-bg-elevated text-text-muted hover:text-text-secondary"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Amount */}
      <div>
        <label className="text-label-uppercase text-text-muted mb-1.5 block">Amount (EUR)</label>
        <div
          className={`flex items-center h-[44px] bg-bg-base border rounded-md px-4 ${
            side === "sell" ? "border-error/30" : "border-border"
          }`}
        >
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-body-sm font-mono font-tabular outline-none text-text-primary placeholder:text-text-muted"
          />
          <span
            className={`text-body-sm font-medium ml-2 ${
              side === "sell" ? "text-error" : "text-accent"
            }`}
          >
            EUR
          </span>
        </div>
      </div>

      {/* Percentage shortcuts */}
      <div className="flex gap-2">
        {["25%", "50%", "MAX"].map((pct) => (
          <button
            key={pct}
            className="flex-1 h-[30px] text-body-sm font-mono text-text-muted border border-border rounded-md hover:bg-bg-elevated hover:text-text-primary transition-fast"
          >
            {pct}
          </button>
        ))}
      </div>

      {/* Price (limit only) */}
      {orderType === "limit" && (
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-label-uppercase text-text-muted">Limit Price</label>
            <span className="text-[11px] text-text-muted">
              Mid: {midpointRate.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center h-[44px] bg-bg-base border border-border rounded-md px-4">
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 bg-transparent text-body-sm font-mono font-tabular outline-none text-text-primary"
            />
            <span className="text-body-sm text-text-muted ml-2">USD</span>
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="flex flex-col gap-2.5 text-body-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Type</span>
            <Info size={12} className="text-accent/50" />
          </div>
          <span className="text-text-primary capitalize">{orderType}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Fee</span>
            <Info size={12} className="text-accent/50" />
          </div>
          <span className="text-text-primary font-mono font-tabular">
            ${fee} ({feePercent})
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Est. receive</span>
            <Info size={12} className="text-accent/50" />
          </div>
          <span className="text-text-primary font-mono font-tabular">
            ${estReceive}
          </span>
        </div>

        <div className="h-px bg-border-subtle" />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Est. savings vs Wise</span>
            <Info size={12} className="text-accent/50" />
          </div>
          <span className="text-success font-mono font-tabular">
            {savingsPips} pips
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        className={`h-[44px] w-full rounded-md text-body-sm font-semibold tracking-[0.08em] uppercase text-text-inverse transition-fast ${
          side === "buy"
            ? "bg-success hover:bg-success-hover active:bg-success-active"
            : "bg-error hover:bg-error-hover active:bg-error-active"
        }`}
      >
        {side === "buy" ? "Buy" : "Sell"} EUR / USD
      </button>

      {/* Privacy notice */}
      <p className="flex items-center gap-1.5 text-[12px] text-text-muted/60">
        <Lock size={12} />
        All orders execute privately at midpoint.{" "}
        <span className="underline cursor-pointer hover:text-text-muted">Learn more</span>
      </p>
    </div>
  );
}
