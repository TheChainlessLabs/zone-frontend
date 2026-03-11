"use client";

import { useState } from "react";
import type { OrderType, Side } from "@/lib/types";

const slippageOptions = ["0.1", "0.5", "1.0"];

export default function OrderForm() {
  const [orderType, setOrderType] = useState<OrderType>("midpoint");
  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("1.0850");
  const [slippage, setSlippage] = useState("0.1");

  const midpointRate = 1.0851;
  const estReceive = amount ? (parseFloat(amount) * midpointRate).toFixed(2) : "0.00";

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-4 flex flex-col gap-4">
      {/* Buy/Sell toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 h-[36px] text-body-sm font-semibold rounded-md transition-fast ${
            side === "buy"
              ? "bg-success text-text-inverse"
              : "bg-bg-base text-text-muted hover:text-text-secondary"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 h-[36px] text-body-sm font-semibold rounded-md transition-fast ${
            side === "sell"
              ? "bg-error text-text-inverse"
              : "bg-bg-base text-text-muted hover:text-text-secondary"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order type tabs */}
      <div className="flex gap-1 bg-bg-base rounded-md p-1">
        {(["midpoint", "limit", "twap"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`flex-1 h-[28px] text-body-sm font-medium rounded-sm transition-fast uppercase ${
              orderType === t
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-label-uppercase text-text-muted">Amount</label>
          <button className="text-label-uppercase text-accent hover:text-accent-hover transition-fast">
            MAX
          </button>
        </div>
        <div className="flex items-center h-[44px] bg-bg-base border border-border rounded-md px-4">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-body-sm font-mono font-tabular outline-none text-text-primary placeholder:text-text-muted"
          />
          <span className="text-body-sm text-text-muted ml-2">EUR</span>
        </div>
      </div>

      {/* Price (limit only) */}
      {orderType === "limit" && (
        <div>
          <label className="text-label-uppercase text-text-muted mb-1 block">Price</label>
          <div className="flex items-center h-[44px] bg-bg-base border border-border rounded-md px-4">
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 bg-transparent text-body-sm font-mono font-tabular outline-none text-text-primary placeholder:text-text-muted"
            />
            <span className="text-body-sm text-text-muted ml-2">USD</span>
          </div>
        </div>
      )}

      {/* Slippage */}
      <div>
        <label className="text-label-uppercase text-text-muted mb-1 block">Slippage Tolerance</label>
        <div className="flex gap-1 bg-bg-base rounded-md p-1">
          {slippageOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSlippage(opt)}
              className={`flex-1 h-[28px] text-body-sm font-mono rounded-sm transition-fast ${
                slippage === opt
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {opt}%
            </button>
          ))}
        </div>
      </div>

      {/* Estimate */}
      <div className="flex flex-col gap-2 text-body-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Est. receive</span>
          <span className="font-mono font-tabular text-text-primary">${estReceive}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Midpoint rate</span>
          <span className="font-mono font-tabular text-text-primary">{midpointRate.toFixed(4)}</span>
        </div>
      </div>

      {/* Info */}
      <p className="text-body-sm text-text-muted px-1">
        Anonymous midpoint execution
      </p>

      {/* Submit */}
      <button
        className={`h-[44px] w-full rounded-md text-body-sm font-semibold tracking-[0.08em] uppercase text-text-inverse transition-fast ${
          side === "buy"
            ? "bg-success hover:bg-success-hover active:bg-success-active"
            : "bg-error hover:bg-error-hover active:bg-error-active"
        }`}
      >
        {side === "buy" ? "Buy" : "Sell"} EUR/USD
      </button>
    </div>
  );
}
