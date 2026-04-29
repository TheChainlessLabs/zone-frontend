// Sectioned rewrite of components/trade/order-form.tsx — adds an explicit Verify Order step (Schwab/Fidelity-style preview gate) between Edit and Submit, plus inline glossary definitions for retail traders new to off-exchange midpoint execution. No production wiring; this lives in tools/persona-review/runs/17/redesign/ as a reference implementation.

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Animate } from "@/components/ui/animate";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { LaunchPair } from "@/lib/fixtures/pairs";
import type { Side } from "@/lib/fixtures/types";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

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
  /** When true, the form renders skeleton placeholders. */
  loading?: boolean;
  /** When set, the form renders an inline error tile in place of the CTA. */
  errorMessage?: string;
  /** Available BASE balance in the trading account. */
  available?: string;
  onSubmit?: (payload: OrderFormSubmitPayload) => void;
}

/** Internal phase machine — Edit -> Verify -> Submit. */
type Phase = "edit" | "verify";

/* ------------------------------------------------------------------ */
/* Glossary — single source of truth for tooltip copy                  */
/* ------------------------------------------------------------------ */

const GLOSS = {
  market:
    "Match at the live midpoint between bid and ask when the next batch seals. No price guarantee; execution priority.",
  limit:
    "Set the worst price you will accept. Buy fills at your price or lower; sell fills at your price or higher. Execution is not guaranteed.",
  midpoint:
    "Halfway between the public bid and ask. Both sides get price improvement vs. taking the displayed quote.",
  batch:
    "Orders are matched in short windows (~2s) and settled together on Ethereum L1. You see the batch on /batches once it seals.",
  fee: "0.005% of notional. Charged in the BASE token at settlement. Network fee is separate, paid in ETH at L1 settlement.",
} as const;

/* ------------------------------------------------------------------ */
/* Risk-warning rules — Schwab "order warnings" equivalent             */
/* ------------------------------------------------------------------ */

interface Warning {
  id: string;
  level: "info" | "warn";
  body: string;
}

function computeWarnings(args: {
  mode: OrderMode;
  side: Side;
  amount: number;
  price: number;
  midpoint: number;
  available: number;
}): Warning[] {
  const out: Warning[] = [];
  const { mode, side, amount, price, midpoint, available } = args;

  if (amount <= 0) return out;

  // Notional > 25% of available
  if (available > 0 && amount > available * 0.25) {
    out.push({
      id: "size",
      level: "warn",
      body: `This order is ${Math.round((amount / available) * 100)}% of your available ${
        side === "buy" ? "balance" : "holdings"
      }. Confirm the size is intentional.`,
    });
  }

  // Selling more than holdings
  if (side === "sell" && available > 0 && amount > available) {
    out.push({
      id: "oversell",
      level: "warn",
      body: "Sell amount exceeds your available balance. The order will be reduced to what is available.",
    });
  }

  // Limit price far from midpoint
  if (mode === "limit" && price > 0 && midpoint > 0) {
    const drift = Math.abs(price - midpoint) / midpoint;
    if (drift > 0.005) {
      const bps = Math.round(drift * 10_000);
      out.push({
        id: "drift",
        level: "warn",
        body: `Your limit price is ${bps} bps from the live midpoint of ${midpoint.toFixed(4)}. Confirm this is intended.`,
      });
    }
  }

  // Market mode informational
  if (mode === "market") {
    out.push({
      id: "market-info",
      level: "info",
      body: "Market orders fill at the midpoint when the next batch seals. Final fill price may differ slightly from the quote shown.",
    });
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function OrderForm({
  pair,
  mode,
  onModeChange,
  midpoint,
  loading = false,
  errorMessage,
  available = "10000.00",
  onSubmit,
}: OrderFormProps) {
  const [phase, setPhase] = React.useState<Phase>("edit");
  const [side, setSide] = React.useState<Side>("buy");
  const [amount, setAmount] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>(midpoint || "");
  const [acked, setAcked] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (mode === "limit" && !price && midpoint) setPrice(midpoint);
  }, [mode, midpoint, price]);

  // Drop back into Edit if the user changes mode/side mid-verify.
  React.useEffect(() => {
    setPhase("edit");
    setAcked(false);
  }, [mode, side]);

  const numericAmount = parseFloat(amount || "0");
  const numericPrice = parseFloat(
    (mode === "limit" ? price : midpoint) || "0",
  );
  const numericMidpoint = parseFloat(midpoint || "0");
  const numericAvailable = parseFloat(available || "0");

  const estReceive =
    Number.isFinite(numericAmount) &&
    Number.isFinite(numericPrice) &&
    numericAmount > 0 &&
    numericPrice > 0
      ? (numericAmount * numericPrice).toFixed(2)
      : "";

  const fee = "0.005%";
  const feeUsd =
    estReceive && Number(estReceive) > 0
      ? `$${(Number(estReceive) * 0.00005).toFixed(2)}`
      : "—";

  const warnings = computeWarnings({
    mode,
    side,
    amount: numericAmount,
    price: numericPrice,
    midpoint: numericMidpoint,
    available: numericAvailable,
  });

  const editValid =
    numericAmount > 0 && (mode === "market" || numericPrice > 0);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editValid || loading || errorMessage) return;
    setAcked(false);
    setPhase("verify");
  };

  const handleConfirm = () => {
    if (!acked) return;
    onSubmit?.({
      mode,
      side,
      amount,
      price: mode === "limit" ? price : undefined,
    });
  };

  /* ---------- Verify view ---------- */

  if (phase === "verify") {
    const sideTone =
      side === "buy" ? "var(--success)" : "var(--destructive)";

    return (
      <section
        aria-label="Verify order"
        className="flex flex-col gap-5 rounded-[var(--radius-xl)] surface-soft bg-[var(--card)] p-5"
      >
        {/* Header — re-prints what the user is about to do */}
        <header className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            Step 2 of 2 — Verify
          </span>
          <h2 className="text-base font-medium">Read this before you sign.</h2>
        </header>

        {/* Read-back panel — side, pair, amount, type, price, fees */}
        <dl className="grid grid-cols-1 gap-2 rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-xs">
          <ReadRow label="Action">
            <span
              className="font-mono uppercase tracking-[0.14em]"
              style={{ color: sideTone }}
            >
              {side === "buy" ? "Buy" : "Sell"} {pair.base}
            </span>
          </ReadRow>
          <ReadRow label="Pair">
            <span className="font-mono">{pair.base}/{pair.quote}</span>
          </ReadRow>
          <ReadRow label="Type">
            <span className="font-mono">
              {mode === "limit" ? "Limit" : "Market (midpoint)"}
            </span>
          </ReadRow>
          {mode === "limit" ? (
            <ReadRow label="Limit price">
              <span className="font-mono tabular-nums">
                {price} {pair.quote}
              </span>
            </ReadRow>
          ) : (
            <ReadRow label="Reference midpoint">
              <span className="font-mono tabular-nums">
                {midpoint || "—"} {pair.quote}
              </span>
            </ReadRow>
          )}
          <ReadRow label="Amount">
            <span className="font-mono tabular-nums">
              {amount} {pair.base}
            </span>
          </ReadRow>
          <ReadRow label="Estimated receive">
            <span className="font-mono tabular-nums">
              {estReceive ? `${estReceive} ${pair.quote}` : "—"}
            </span>
          </ReadRow>
          <ReadRow label="Trading fee">
            <span className="font-mono">{fee}</span>
          </ReadRow>
          <ReadRow label="Network fee (settlement)">
            <span className="font-mono">{feeUsd}</span>
          </ReadRow>
          <ReadRow label="Settlement venue">
            <span className="font-mono">Ethereum L1</span>
          </ReadRow>
        </dl>

        {/* Buying-power read-back — what your balance looks like after this fills */}
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            After this order fills
          </p>
          <p className="mt-1 text-xs leading-relaxed">
            Your available {pair.base} drops from{" "}
            <span className="font-mono tabular-nums">
              {numericAvailable.toFixed(2)}
            </span>{" "}
            to{" "}
            <span className="font-mono tabular-nums">
              {Math.max(0, numericAvailable - numericAmount).toFixed(2)}
            </span>
            . You receive{" "}
            <span className="font-mono tabular-nums">
              {estReceive || "—"} {pair.quote}
            </span>{" "}
            on settlement.
          </p>
        </div>

        {/* Warnings — Schwab order-warning equivalent */}
        {warnings.length > 0 ? (
          <ul className="flex flex-col gap-2" aria-label="Order warnings">
            {warnings.map((w) => (
              <li
                key={w.id}
                className={cn(
                  "flex items-start gap-2 rounded-[var(--radius-md)] border p-3 text-xs leading-relaxed",
                  w.level === "warn"
                    ? "border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_8%,transparent)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--muted)]/40 text-[var(--muted-foreground)]",
                )}
              >
                {w.level === "warn" ? (
                  <Icon.Failed
                    size={14}
                    aria-hidden
                    className="mt-0.5 shrink-0 text-[var(--destructive)]"
                  />
                ) : (
                  <Icon.Info
                    size={14}
                    aria-hidden
                    className="mt-0.5 shrink-0 text-[var(--foreground)]"
                  />
                )}
                <span>{w.body}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Privacy reminder — sentence form, not chip */}
        <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">
          Your order is matched anonymously in a sealed batch. Only you and
          your counterparty see the fill. The batch's proof is published on
          Ethereum L1 — see /batches.
        </p>

        {/* Required acknowledgement — the gate */}
        <label className="flex items-start gap-2 text-xs leading-relaxed">
          <input
            type="checkbox"
            checked={acked}
            onChange={(e) => setAcked(e.target.checked)}
            className="mt-0.5 size-4 accent-[var(--foreground)]"
          />
          <span>
            I have reviewed the side, pair, amount, and price above.
          </span>
        </label>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPhase("edit")}
            className="h-12"
          >
            Edit order
          </Button>
          <Button
            type="button"
            disabled={!acked || loading}
            onClick={handleConfirm}
            className={cn(
              "h-12 text-sm font-medium",
              side === "buy"
                ? "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90"
                : "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
            )}
          >
            Sign and place {side === "buy" ? "buy" : "sell"}
          </Button>
        </div>
      </section>
    );
  }

  /* ---------- Edit view ---------- */

  return (
    <TooltipProvider delayDuration={120}>
      <form
        onSubmit={handleReview}
        className="flex flex-col gap-5 rounded-[var(--radius-xl)] surface-soft bg-[var(--card)] p-5"
        aria-label="Order entry"
      >
        <header className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            Step 1 of 2 — Build
          </span>
          <a
            href="/learn/orders"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
          >
            Order types
          </a>
        </header>

        {/* Tabs: Market / Limit */}
        <Tabs
          value={mode}
          onValueChange={(v) => onModeChange(v as OrderMode)}
          className="w-full"
        >
          <TabsList className="grid h-9 w-full grid-cols-2">
            <TabsTrigger value="market">
              <span className="flex items-center gap-1.5">
                Market
                <DefTip body={GLOSS.market} />
              </span>
            </TabsTrigger>
            <TabsTrigger value="limit">
              <span className="flex items-center gap-1.5">
                Limit
                <DefTip body={GLOSS.limit} />
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="market" className="mt-0" />
          <TabsContent value="limit" className="mt-0" />
        </Tabs>

        {/* Buy / Sell */}
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

        {/* Limit price */}
        {mode === "limit" ? (
          <Animate variant="enter" className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="limit-price"
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: "var(--accent-strong, #22d3ee)" }}
              >
                Limit price
                <DefTip body={GLOSS.limit} tone="accent" />
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
                className="h-12 pr-16 font-mono text-base tabular-nums"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {pair.quote}
              </span>
            </div>
          </Animate>
        ) : null}

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)]">
            <label htmlFor="amount">Amount</label>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
              Available {available} {pair.base}
            </span>
          </div>
          <div className="relative">
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
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-sm uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              {pair.base}
            </span>
          </div>
        </div>

        {/* Percentage shortcuts — MAX visually demoted */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "25", factor: 0.25, max: false },
            { label: "50", factor: 0.5, max: false },
            { label: "75", factor: 0.75, max: false },
            { label: "MAX", factor: 1, max: true },
          ].map((s) => (
            <Button
              key={s.label}
              type="button"
              variant={s.max ? "ghost" : "outline"}
              size="sm"
              onClick={() => {
                const next = (numericAvailable * s.factor).toFixed(2);
                if (s.max) {
                  if (
                    confirm(
                      `Use entire available balance (${available} ${pair.base})?`,
                    )
                  ) {
                    setAmount(next);
                  }
                } else {
                  setAmount(next);
                }
              }}
              disabled={loading}
              className={cn(
                "h-9 font-mono text-[11px] uppercase tracking-[0.14em]",
                s.max && "border border-dashed border-[var(--border)]",
              )}
            >
              {s.label}
            </Button>
          ))}
        </div>

        {/* You receive — never bare em-dash */}
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2.5">
          <span className="text-xs text-[var(--muted-foreground)]">
            You receive
          </span>
          <span className="font-mono text-sm tabular-nums">
            {estReceive ? (
              <>
                {estReceive} {pair.quote}{" "}
                <span className="text-[var(--muted-foreground)]">
                  at {numericPrice.toFixed(4)} {pair.quote}/{pair.base}
                </span>
              </>
            ) : (
              <span className="text-[var(--muted-foreground)]">
                Enter an amount
              </span>
            )}
          </span>
        </div>

        {/* Details strip — each cell carries a tooltip */}
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
          <DetailCell
            label="Type"
            value={mode === "limit" ? "Limit" : "Market"}
            tip={mode === "limit" ? GLOSS.limit : GLOSS.market}
          />
          <DetailCell label="Fee" value={fee} tip={GLOSS.fee} />
          <DetailCell
            label="Settles in"
            value="Next batch"
            tip={GLOSS.batch}
          />
        </div>

        {/* Error tile or Review CTA */}
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
            disabled={!editValid || loading}
            className="h-12 w-full text-sm font-medium"
          >
            Review {side === "buy" ? "buy" : "sell"} order
          </Button>
        )}

        {/* Privacy footer — sentence, not chip */}
        <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">
          Orders are matched anonymously at the{" "}
          <DefTip body={GLOSS.midpoint} inline>
            midpoint
          </DefTip>
          . Settlement is on Ethereum L1.
        </p>
      </form>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponents                                                       */
/* ------------------------------------------------------------------ */

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

function DetailCell({
  label,
  value,
  tip,
}: {
  label: string;
  value: string;
  tip?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 bg-[var(--card)] px-3 py-2">
      <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {label}
        {tip ? <DefTip body={tip} /> : null}
      </span>
      <span className="font-mono text-xs tabular-nums">{value}</span>
    </div>
  );
}

function ReadRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function DefTip({
  body,
  inline = false,
  tone,
  children,
}: {
  body: string;
  inline?: boolean;
  tone?: "accent";
  children?: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {inline ? (
          <button
            type="button"
            className="border-b border-dashed border-[var(--muted-foreground)] text-[var(--foreground)] underline-offset-2"
          >
            {children}
          </button>
        ) : (
          <button
            type="button"
            aria-label="Definition"
            className={cn(
              "inline-flex size-3.5 items-center justify-center rounded-full border text-[9px] leading-none",
              tone === "accent"
                ? "border-[var(--accent-strong,#22d3ee)] text-[var(--accent-strong,#22d3ee)]"
                : "border-[var(--border)] text-[var(--muted-foreground)]",
            )}
          >
            ?
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
        {body}
      </TooltipContent>
    </Tooltip>
  );
}
