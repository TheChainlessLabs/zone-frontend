// Sectioned rewrite of components/trade/order-form.tsx — Caleb's lens.
// Promotes midpoint-match status and the matching engine from a 11px footer
// to the loudest part of the ticket; replaces the "Type · Fee · Est. receive"
// strip with "Match window · Counterparty · Settlement proof"; bakes the
// privacy claim into the CTA; wires a live next-batch countdown so the
// engine feels like it's running. Self-contained — props parallel the real
// OrderForm so a future PR can drop this in behind a flag.

"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  /** Live midpoint as a decimal string. Empty = unknown (em-dash). */
  midpoint: string;
  /** Seconds remaining until next match window. Drives the live countdown. */
  matchWindowSeconds?: number;
  /** Counterparty hint surfaced in the execution row. */
  counterpartyHint?: "internal" | "internal+solver" | "solver";
  /** Settlement ETA in batches (e.g., "T+3 batches · ~6 min"). */
  settlementEta?: string;
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

const COUNTERPARTY_LABELS: Record<
  NonNullable<OrderFormProps["counterpartyHint"]>,
  string
> = {
  internal: "internal · CLOB",
  "internal+solver": "internal + solver",
  solver: "solver · external",
};

export function OrderForm({
  pair,
  mode,
  onModeChange,
  midpoint,
  matchWindowSeconds = 42,
  counterpartyHint = "internal",
  settlementEta = "T+3 batches · ~6 min",
  loading = false,
  errorMessage,
  onSubmit,
}: OrderFormProps) {
  const [side, setSide] = React.useState<Side>("buy");
  const [amount, setAmount] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>(midpoint || "");

  // Live match-window countdown. Resets to matchWindowSeconds when it hits 0.
  // Caleb wants to see the engine running, not infer it from a microcopy line.
  const [secondsLeft, setSecondsLeft] = React.useState(matchWindowSeconds);
  React.useEffect(() => {
    setSecondsLeft(matchWindowSeconds);
  }, [matchWindowSeconds]);
  React.useEffect(() => {
    if (loading) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? matchWindowSeconds : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [loading, matchWindowSeconds]);

  React.useEffect(() => {
    if (mode === "limit" && !price && midpoint) {
      setPrice(midpoint);
    }
  }, [mode, midpoint, price]);

  const numericAmount = parseFloat(amount || "0");
  const numericPrice = parseFloat(
    (mode === "limit" ? price : midpoint) || "0",
  );
  const estReceive =
    Number.isFinite(numericAmount) &&
    Number.isFinite(numericPrice) &&
    numericAmount > 0 &&
    numericPrice > 0
      ? (numericAmount * numericPrice).toFixed(2)
      : "";

  const fee = "0.005%";
  const submitDisabled =
    loading || !!errorMessage || numericAmount <= 0 ||
    (mode === "limit" && numericPrice <= 0);

  const handlePct = (factor: number) => {
    const base = parseFloat(MOCK_AVAILABLE);
    const next = (base * factor).toFixed(2);
    setAmount(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitDisabled) return;
    onSubmit?.({
      mode,
      side,
      amount,
      price: mode === "limit" ? price : undefined,
    });
  };

  // CTA copy bakes the privacy claim into the action — no more 11px footer.
  // Pattern: "{Buy|Sell} {amount} {base} at midpoint · matches privately"
  // Falls back to a quieter form when amount is missing.
  const ctaCopy = (() => {
    const verb = side === "buy" ? "Buy" : "Sell";
    if (numericAmount > 0) {
      return `${verb} ${formatAmount(amount)} ${pair.base} · matches privately at midpoint`;
    }
    return `${verb} ${pair.base}`;
  })();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-[var(--radius-xl)] surface-soft bg-[var(--card)] p-5"
      aria-label="Order entry"
    >
      {/* SECTION 1 — Engine status. The loudest thing. */}
      <EngineStatusBar
        midpoint={midpoint}
        secondsLeft={secondsLeft}
        loading={loading}
        pair={pair}
      />

      {/* SECTION 2 — Mode tabs */}
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

      {/* SECTION 3 — Side */}
      <div
        role="radiogroup"
        aria-label="Side"
        className="grid grid-cols-2 gap-2"
      >
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

      {/* SECTION 4 — Limit price (limit only) */}
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

      {/* SECTION 5 — Amount */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)]">
          <label htmlFor="amount">Amount</label>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em]">
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
      </div>

      {/* SECTION 6 — Quick percent */}
      <div className="grid grid-cols-4 gap-2">
        {PCT_SHORTCUTS.map((s) => (
          <Button
            key={s.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePct(s.value)}
            disabled={loading}
            className="h-9 font-mono text-[11px] uppercase tracking-[0.1em]"
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* SECTION 7 — You receive */}
      <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2.5">
        <span className="text-xs text-[var(--muted-foreground)]">
          You receive
        </span>
        <span className="font-mono text-sm tabular-nums">
          {estReceive ? `${estReceive} ${pair.quote}` : "—"}
        </span>
      </div>

      {/* SECTION 8 — Execution context.
          Replaces "Type · Fee · Est. receive" (which was three footnotes)
          with the three things a crypto-native trader actually wants to
          know before signing: who matches it, when it settles, and what
          fee they're paying. */}
      <ExecutionRow
        matchWindow={
          midpoint
            ? `next match in ${formatCountdown(secondsLeft)}`
            : "—"
        }
        counterparty={midpoint ? COUNTERPARTY_LABELS[counterpartyHint] : "—"}
        settlement={midpoint ? `L1 attest · ${settlementEta}` : "—"}
        fee={fee}
      />

      {/* SECTION 9 — CTA. Privacy claim baked in; no footer line. */}
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 text-xs leading-relaxed text-[var(--destructive)]"
        >
          <Icon.Failed
            size={14}
            aria-hidden
            className="mt-0.5 shrink-0"
          />
          <span>{errorMessage}</span>
        </div>
      ) : (
        <Button
          type="submit"
          disabled={submitDisabled}
          className={cn(
            "h-14 w-full flex-col gap-0.5 text-sm font-medium leading-none",
            side === "buy"
              ? "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90"
              : "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
          )}
        >
          <span className="flex items-center gap-2">
            <Icon.Private size={12} aria-hidden />
            <span>{ctaCopy}</span>
          </span>
        </Button>
      )}
    </form>
  );
}

/* ---------- Sectioned subcomponents ---------- */

function EngineStatusBar({
  midpoint,
  secondsLeft,
  loading,
  pair,
}: {
  midpoint: string;
  secondsLeft: number;
  loading: boolean;
  pair: LaunchPair;
}) {
  // The thing Caleb wants to feel: an engine running on the other side.
  // Live midpoint, live countdown to next match, batch-window framing.
  // Pulls the alpha from a 11px footer up to the eyebrow of the form.
  const pulse = !loading && !!midpoint;
  return (
    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            pulse
              ? "bg-[var(--success)] motion-safe:animate-pulse"
              : "bg-[var(--muted-foreground)]",
          )}
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          {pair.base}/{pair.quote} · midpoint
        </span>
        <span className="font-mono text-sm tabular-nums">
          {midpoint || "—"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          next match
        </span>
        <span className="font-mono text-sm tabular-nums">
          {midpoint ? formatCountdown(secondsLeft) : "—"}
        </span>
      </div>
    </div>
  );
}

function ExecutionRow({
  matchWindow,
  counterparty,
  settlement,
  fee,
}: {
  matchWindow: string;
  counterparty: string;
  settlement: string;
  fee: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
      <DetailCell label="Match window" value={matchWindow} />
      <DetailCell label="Counterparty" value={counterparty} />
      <DetailCell label="Settlement" value={settlement} />
      <DetailCell label="Fee" value={fee} />
    </div>
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
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
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

/* ---------- Format helpers ---------- */

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatAmount(raw: string): string {
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return raw;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
