"use client";

// Rafael pass: add a visible execution rail and stronger ticket feedback so submit never feels frozen.

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Status } from "@/components/ui/status";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Animate } from "@/components/ui/animate";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { LaunchPair } from "@/lib/fixtures/pairs";
import type { Side } from "@/lib/fixtures/types";

export type OrderMode = "market" | "limit";

export interface OrderFormSubmitPayload {
  mode: OrderMode;
  side: Side;
  amount: string;
  price?: string;
}

export interface OrderFormProps {
  pair: LaunchPair;
  mode: OrderMode;
  onModeChange: (mode: OrderMode) => void;
  midpoint: string;
  loading?: boolean;
  errorMessage?: string;
  onSubmit?: (payload: OrderFormSubmitPayload) => void;
}

const PCT_SHORTCUTS: Array<{ label: string; value: number }> = [
  { label: "25", value: 0.25 },
  { label: "50", value: 0.5 },
  { label: "75", value: 0.75 },
  { label: "MAX", value: 1 },
];

const MOCK_AVAILABLE = "10000.00";

export function OrderForm({
  pair,
  mode,
  onModeChange,
  midpoint,
  loading = false,
  errorMessage,
  onSubmit,
}: OrderFormProps) {
  const [side, setSide] = React.useState<Side>("buy");
  const [amount, setAmount] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>(midpoint || "");
  const [handoffState, setHandoffState] = React.useState<"idle" | "wallet">(
    "idle",
  );

  React.useEffect(() => {
    if (mode === "limit" && !price && midpoint) {
      setPrice(midpoint);
    }
  }, [mode, midpoint, price]);

  React.useEffect(() => {
    if (handoffState !== "wallet") return;
    const timer = window.setTimeout(() => setHandoffState("idle"), 1200);
    return () => window.clearTimeout(timer);
  }, [handoffState]);

  const numericAmount = parseFloat(amount || "0");
  const activePrice = mode === "limit" ? price : midpoint;
  const numericPrice = parseFloat(activePrice || "0");
  const estReceive =
    Number.isFinite(numericAmount) &&
    Number.isFinite(numericPrice) &&
    numericAmount > 0 &&
    numericPrice > 0
      ? (numericAmount * numericPrice).toFixed(2)
      : "";

  const fee = "0.005%";
  const submitDisabled =
    loading ||
    !!errorMessage ||
    numericAmount <= 0 ||
    (mode === "limit" && numericPrice <= 0);

  const handlePct = (factor: number) => {
    const base = parseFloat(MOCK_AVAILABLE);
    setAmount((base * factor).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitDisabled) return;
    setHandoffState("wallet");
    onSubmit?.({
      mode,
      side,
      amount,
      price: mode === "limit" ? price : undefined,
    });
  };

  const quoteKnown = Boolean(midpoint);
  const statusTone = loading
    ? "awaiting-signature"
    : handoffState === "wallet"
      ? "submitting"
      : quoteKnown
        ? "connected"
        : "pending";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-[var(--radius-xl)] surface-soft bg-[var(--card)] p-5"
      aria-label="Order entry"
    >
      <ExecutionRail
        midpoint={midpoint}
        settlement="Ethereum L1"
        mode={mode}
        state={statusTone}
      />

      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as OrderMode)}
        className="w-full"
      >
        <TabsList className="grid h-9 w-full grid-cols-2">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
        </TabsList>
        <TabsContent value="market" className="mt-0" />
        <TabsContent value="limit" className="mt-0" />
      </Tabs>

      <div role="radiogroup" aria-label="Side" className="grid grid-cols-2 gap-2">
        <SideButton
          side="buy"
          active={side === "buy"}
          onClick={() => setSide("buy")}
          disabled={loading}
        />
        <SideButton
          side="sell"
          active={side === "sell"}
          onClick={() => setSide("sell")}
          disabled={loading}
        />
      </div>

      {mode === "limit" ? (
        <Animate variant="enter" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="limit-price"
              className="text-xs font-medium"
              style={{ color: "var(--accent-strong, #22d3ee)" }}
            >
              Limit price
            </label>
            <button
              type="button"
              onClick={() => setPrice(midpoint)}
              disabled={!midpoint}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] disabled:opacity-50"
            >
              Use midpoint
            </button>
          </div>
          <div className="relative">
            <Input
              id="limit-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={midpoint || "0.0000"}
              disabled={loading}
              className={cn(
                "h-12 pr-16 font-mono text-base tabular-nums",
                "focus-visible:ring-1",
              )}
              style={{
                ["--tw-ring-color" as string]: "var(--accent-strong, #22d3ee)",
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              {pair.quote}
            </span>
          </div>
        </Animate>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)]">
          <label htmlFor="amount">Amount</label>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
            Available {MOCK_AVAILABLE} {pair.base}
          </span>
        </div>
        <div className="relative">
          {loading ? (
            <Skeleton className="h-14 w-full rounded-[var(--radius-md)]" />
          ) : (
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading}
              className="h-14 pr-20 font-mono text-2xl tabular-nums"
            />
          )}
          {!loading ? (
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-sm uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              {pair.base}
            </span>
          ) : null}
        </div>
        <LiveQuoteNote
          side={side}
          amount={numericAmount}
          pair={pair}
          displayPrice={activePrice}
          estReceive={estReceive}
          mode={mode}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PCT_SHORTCUTS.map((s) => (
          <Button
            key={s.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePct(s.value)}
            disabled={loading}
            className="h-9 font-mono text-[11px] uppercase tracking-[0.14em]"
          >
            {s.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2.5">
        <span className="text-xs text-[var(--muted-foreground)]">You receive</span>
        <span className="font-mono text-sm tabular-nums">
          {estReceive ? `${estReceive} ${pair.quote}` : "—"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
        <DetailCell label="Type" value={mode === "limit" ? "Limit" : "Market"} />
        <DetailCell label="Fee" value={fee} />
        <DetailCell
          label="Reference"
          value={activePrice ? `${activePrice} ${pair.quote}` : "—"}
        />
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 text-xs leading-relaxed text-[var(--destructive)]"
        >
          <Icon.Failed size={14} aria-hidden className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            disabled={submitDisabled}
            className={cn(
              "h-14 w-full flex-col items-start px-4 text-left text-sm font-medium",
              side === "buy"
                ? "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90"
                : "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
            )}
          >
            <span className="w-full text-center text-base">
              {handoffState === "wallet"
                ? "Handing off to wallet"
                : `${side === "buy" ? "Buy" : "Sell"} ${pair.base}`}
            </span>
            <span className="w-full text-center text-[11px] uppercase tracking-[0.14em] opacity-80">
              {mode === "limit" ? "Review limit order" : "Review midpoint order"}
            </span>
          </Button>
          <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2 text-[11px]">
            <span className="font-mono uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Submit path
            </span>
            <span className="text-[var(--foreground)]">
              {handoffState === "wallet"
                ? "Wallet request sent. Waiting on signature."
                : "Sign, queue, match, settle."}
            </span>
          </div>
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
        <Icon.Private size={11} aria-hidden />
        Orders match privately at midpoint.
      </p>
    </form>
  );
}

function ExecutionRail({
  midpoint,
  settlement,
  mode,
  state,
}: {
  midpoint: string;
  settlement: string;
  mode: OrderMode;
  state: "pending" | "connected" | "awaiting-signature" | "submitting";
}) {
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
      <RailCell
        label="Midpoint"
        value={midpoint || "Waiting"}
        helper={midpoint ? "Live reference" : "Fetching quote"}
      />
      <RailCell
        label="Path"
        value={mode === "limit" ? "Queue first" : "Take now"}
        helper="Sign then handoff"
      />
      <div className="flex flex-col gap-1 bg-[var(--card)] px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          State
        </span>
        <Status
          state={state}
          label={
            state === "connected"
              ? settlement
              : state === "awaiting-signature"
                ? "Waiting"
                : state === "submitting"
                  ? "Queued"
                  : "Booting"
          }
          className="w-fit"
        />
      </div>
    </div>
  );
}

function RailCell({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-[var(--card)] px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="font-mono text-xs tabular-nums">{value}</span>
      <span className="text-[11px] text-[var(--muted-foreground)]">{helper}</span>
    </div>
  );
}

function LiveQuoteNote({
  side,
  amount,
  pair,
  displayPrice,
  estReceive,
  mode,
}: {
  side: Side;
  amount: number;
  pair: LaunchPair;
  displayPrice: string;
  estReceive: string;
  mode: OrderMode;
}) {
  const action = side === "buy" ? "buying" : "selling";
  if (!displayPrice || amount <= 0 || !estReceive) {
    return (
      <p className="text-[11px] text-[var(--muted-foreground)]">
        Midpoint moves first. Keep the ticket alive while the wallet catches up.
      </p>
    );
  }

  return (
    <p className="text-[11px] text-[var(--muted-foreground)]">
      {mode === "limit" ? "Limit" : "Midpoint"} {action} {amount.toFixed(2)}{" "}
      {pair.base} around {displayPrice} for about {estReceive} {pair.quote}.
    </p>
  );
}

function SideButton({
  side,
  active,
  onClick,
  disabled,
}: {
  side: Side;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isBuy = side === "buy";
  const tone = isBuy ? "var(--success)" : "var(--destructive)";
  const Glyph = isBuy ? Icon.Buy : Icon.Sell;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        active
          ? "text-[var(--foreground)]"
          : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
      )}
      style={
        active
          ? {
              backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
              borderColor: `color-mix(in oklab, ${tone} 40%, transparent)`,
              color: tone,
            }
          : undefined
      }
    >
      <Glyph size={14} aria-hidden />
      <span>{isBuy ? "Buy" : "Sell"}</span>
    </button>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-[var(--card)] px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className="font-mono text-xs tabular-nums">{value}</span>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block animate-pulse rounded-[var(--radius-md)] bg-[var(--muted)] motion-reduce:animate-none",
        className,
      )}
    />
  );
}
