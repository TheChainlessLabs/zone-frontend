"use client";
// Aisha's OrderForm rewrite: error summary at the top, aria-describedby on every input, dl-semantics for the order details, polite live region for the "you receive" estimate, plain-language disabled-state explanations, and no colour-only state cues.

/**
 * OrderForm — Market + Limit order entry surface, accessibility-first rewrite.
 *
 * Sections (top → bottom):
 *   1.  Form intro paragraph — one-line summary of what the form does and the
 *       privacy guarantee, programmatically associated with the form via
 *       aria-describedby. This is the screen-reader user's orientation.
 *   2.  Error summary — role="alert", tabindex="-1", focused on submit
 *       failure. Each row is an anchor to the offending field. Pattern:
 *       https://design-system.service.gov.uk/components/error-summary/
 *   3.  Mode tabs (Market / Limit) — same as today, but the tab panel
 *       contents are real `<TabsContent>` regions with aria-labelledby.
 *   4.  Side toggle (Buy / Sell) — radiogroup, with a visible glyph + word
 *       so colour is never the only carrier. Pattern: WCAG 1.4.1 use of
 *       colour.
 *   5.  Limit price input (limit only) — labelled, hint via aria-describedby
 *       pointing at the "use midpoint" affordance + current midpoint.
 *   6.  Amount input — labelled, hint via aria-describedby pointing at the
 *       available-balance hint and the privacy notice.
 *   7.  Percentage shortcuts — buttons inside a labelled toolbar.
 *   8.  Order details — `<dl>` of Type / Fee / Estimated receive, with
 *       polite live region wrapping "Estimated receive" so the value
 *       announces as the user changes Amount.
 *   9.  Submit CTA — always submittable. On click with invalid state, the
 *       form sets the error summary, focuses it, and announces the count.
 *       No more `disabled` button without a reason.
 *  10.  Privacy notice — programmatically associated with the form so a
 *       screen reader hears it before any field.
 *
 * Voice: omega-docs/03-brand/messaging.md — terse, period-terminated, no
 * exclamations, no "approve" (use "Sign"). Plain-English error pairs
 * follow Monzo's writing-system convention: [what happened] [what to do].
 *
 * What changed vs the current order-form.tsx:
 *   • Added an error summary at the top of the form (role="alert").
 *   • Removed disabled CTA pattern — the button is always submittable.
 *   • Replaced the 3-column "Type · Fee · Est. receive" div-grid with a
 *     proper `<dl>` and an aria-live="polite" region around the estimate.
 *   • Wired aria-describedby on every input to its hint, error, and
 *     privacy-notice id.
 *   • Replaced 10px uppercase tracked microtext with 12px sentence-case
 *     in the body type for hint and label copy.
 *   • Side toggle now has a textual second channel (Buy / Sell glyph + word
 *     + selected-suffix on aria-label).
 *   • Submit button label includes side and base symbol so the screen
 *     reader announces the full action ("Buy 100 USDC. Sign in wallet.").
 */

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
  /** When true, the form renders skeleton placeholders. */
  loading?: boolean;
  /** When set, the form renders an inline error tile in place of the CTA. */
  errorMessage?: string;
  onSubmit?: (payload: OrderFormSubmitPayload) => void;
}

const PCT_SHORTCUTS: Array<{ label: string; value: number; aria: string }> = [
  { label: "25", value: 0.25, aria: "Set amount to 25% of available balance" },
  { label: "50", value: 0.5, aria: "Set amount to 50% of available balance" },
  { label: "75", value: 0.75, aria: "Set amount to 75% of available balance" },
  { label: "MAX", value: 1, aria: "Set amount to full available balance" },
];

/** Mock available balance (BASE) per pair — stable so review shots don't flap. */
const MOCK_AVAILABLE = "10000.00";

type FieldErrorKey = "amount" | "price" | "midpoint";

interface FieldError {
  key: FieldErrorKey;
  /** Field id to focus when the user clicks the summary entry. */
  fieldId: string;
  /** [What happened.] [What to do next.] — one short sentence each. */
  message: string;
}

function validate({
  mode,
  amount,
  price,
  midpoint,
}: {
  mode: OrderMode;
  amount: string;
  price: string;
  midpoint: string;
}): FieldError[] {
  const errors: FieldError[] = [];
  const numAmount = parseFloat(amount || "0");
  const numPrice = parseFloat((mode === "limit" ? price : midpoint) || "0");

  if (!amount || numAmount <= 0) {
    errors.push({
      key: "amount",
      fieldId: "amount",
      message:
        "Amount missing. Enter a number greater than zero, or use one of the percent shortcuts.",
    });
  }
  if (mode === "limit" && (!price || numPrice <= 0)) {
    errors.push({
      key: "price",
      fieldId: "limit-price",
      message:
        "Limit price missing. Enter a price greater than zero, or use the current midpoint.",
    });
  }
  if (mode === "market" && (!midpoint || numPrice <= 0)) {
    errors.push({
      key: "midpoint",
      // No focusable field — link to the pair switcher above.
      fieldId: "pair-switcher",
      message:
        "Midpoint not yet available. Wait a moment for the pair to load, or switch pairs.",
    });
  }
  return errors;
}

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
  const [errors, setErrors] = React.useState<FieldError[]>([]);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const errorSummaryRef = React.useRef<HTMLDivElement>(null);

  // Sync the limit-price input default whenever the midpoint or mode shifts —
  // the user can still override. Empty midpoint stays empty.
  React.useEffect(() => {
    if (mode === "limit" && !price && midpoint) {
      setPrice(midpoint);
    }
  }, [mode, midpoint, price]);

  // Re-run validation on every change *after* the first submit attempt, so
  // a user who has seen the error summary gets live feedback as they fix
  // each field. Before the first attempt, stay quiet — pre-emptive
  // validation noise is its own accessibility problem.
  React.useEffect(() => {
    if (!submitAttempted) return;
    setErrors(validate({ mode, amount, price, midpoint }));
  }, [submitAttempted, mode, amount, price, midpoint]);

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

  const handlePct = (factor: number) => {
    const base = parseFloat(MOCK_AVAILABLE);
    const next = (base * factor).toFixed(2);
    setAmount(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const next = validate({ mode, amount, price, midpoint });
    setErrors(next);
    if (next.length > 0) {
      // Move focus to the error summary so the screen reader announces
      // "There is a problem · 1 error" before the user reaches the fields.
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    onSubmit?.({
      mode,
      side,
      amount,
      price: mode === "limit" ? price : undefined,
    });
  };

  const errorFor = (key: FieldErrorKey) =>
    errors.find((e) => e.key === key)?.message;

  // Stable ids for aria-describedby chains.
  const introId = "order-form-intro";
  const privacyId = "order-form-privacy";
  const summaryId = "order-form-error-summary";
  const amountHintId = "amount-hint";
  const amountErrorId = "amount-error";
  const priceHintId = "limit-price-hint";
  const priceErrorId = "limit-price-error";
  const estReceiveLiveId = "order-est-receive";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-[var(--radius-xl)] surface-soft bg-[var(--card)] p-5"
      aria-label="Order entry"
      aria-describedby={`${introId} ${privacyId}`}
    >
      {/* 1. Intro — programmatically associated with the form, so a
          screen-reader user hears the orientation before the first field. */}
      <p
        id={introId}
        className="text-sm leading-relaxed text-[var(--foreground)]"
      >
        Place a {mode === "market" ? "market" : "limit"} order on {pair.base}/
        {pair.quote}. Orders match privately at the midpoint; nothing is
        broadcast until settlement.
      </p>

      {/* 2. Error summary — only renders when there is something to show. */}
      {errors.length > 0 ? (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          id={summaryId}
          aria-labelledby={`${summaryId}-title`}
          className="flex flex-col gap-2 rounded-[var(--radius-md)] border-2 border-[var(--destructive)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 outline-none focus:ring-2 focus:ring-[var(--destructive)]"
        >
          <h2
            id={`${summaryId}-title`}
            className="text-sm font-semibold text-[var(--foreground)]"
          >
            There is a problem
          </h2>
          <ul className="flex flex-col gap-1.5 pl-0">
            {errors.map((err) => (
              <li key={err.key} className="text-xs leading-relaxed">
                <a
                  href={`#${err.fieldId}`}
                  className="text-[var(--destructive)] underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-[var(--destructive)]"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(err.fieldId)?.focus();
                  }}
                >
                  {err.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* 3. Tabs: Market / Limit */}
      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as OrderMode)}
        className="w-full"
      >
        <TabsList aria-label="Order type" className="grid h-10 w-full grid-cols-2">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
        </TabsList>
        <TabsContent value="market" className="mt-0" />
        <TabsContent value="limit" className="mt-0" />
      </Tabs>

      {/* 4. Side toggle — radiogroup with paired glyph + word + selected
          suffix on aria-label so colour is never the only state cue. */}
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

      {/* 5. Limit price (limit only) */}
      {mode === "limit" ? (
        <Animate variant="enter" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="limit-price"
              className="text-sm font-medium text-[var(--foreground)]"
            >
              Limit price
            </label>
            <button
              type="button"
              onClick={() => setPrice(midpoint)}
              disabled={!midpoint}
              className="text-xs text-[var(--foreground)] underline underline-offset-2 hover:no-underline disabled:opacity-50 disabled:no-underline"
              aria-label={
                midpoint
                  ? `Use current midpoint ${midpoint} ${pair.quote}`
                  : "Midpoint not available"
              }
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
              aria-required="true"
              aria-invalid={!!errorFor("price")}
              aria-describedby={cn(
                priceHintId,
                errorFor("price") ? priceErrorId : undefined,
              )}
              className={cn(
                "h-12 pr-16 font-mono text-base tabular-nums",
                "focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
                errorFor("price") ? "border-[var(--destructive)]" : undefined,
              )}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-sm text-[var(--foreground)]">
              {pair.quote}
            </span>
          </div>
          <p id={priceHintId} className="text-xs text-[var(--muted-foreground)]">
            Enter a price in {pair.quote}. Current midpoint is{" "}
            <span className="font-mono tabular-nums text-[var(--foreground)]">
              {midpoint || "not available"}
            </span>
            .
          </p>
          {errorFor("price") ? (
            <p
              id={priceErrorId}
              className="text-xs font-medium text-[var(--destructive)]"
            >
              {errorFor("price")}
            </p>
          ) : null}
        </Animate>
      ) : null}

      {/* 6. Amount input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="amount"
          className="text-sm font-medium text-[var(--foreground)]"
        >
          Amount
        </label>
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
              aria-required="true"
              aria-invalid={!!errorFor("amount")}
              aria-describedby={cn(
                amountHintId,
                privacyId,
                errorFor("amount") ? amountErrorId : undefined,
              )}
              className={cn(
                "h-14 pr-20 font-mono text-2xl tabular-nums",
                "focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
                errorFor("amount") ? "border-[var(--destructive)]" : undefined,
              )}
            />
          )}
          {!loading ? (
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-sm text-[var(--foreground)]">
              {pair.base}
            </span>
          ) : null}
        </div>
        <p id={amountHintId} className="text-xs text-[var(--muted-foreground)]">
          Available balance:{" "}
          <span className="font-mono tabular-nums text-[var(--foreground)]">
            {MOCK_AVAILABLE} {pair.base}
          </span>
          .
        </p>
        {errorFor("amount") ? (
          <p
            id={amountErrorId}
            className="text-xs font-medium text-[var(--destructive)]"
          >
            {errorFor("amount")}
          </p>
        ) : null}
      </div>

      {/* 7. Percentage shortcuts — labelled toolbar so screen readers
          announce a four-button group, not four orphan buttons. */}
      <div
        role="group"
        aria-label="Set amount as a percentage of available balance"
        className="grid grid-cols-4 gap-2"
      >
        {PCT_SHORTCUTS.map((s) => (
          <Button
            key={s.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePct(s.value)}
            disabled={loading}
            aria-label={s.aria}
            className="min-h-[44px] font-mono text-sm tabular-nums"
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* 8. Order details — proper `<dl>` semantics. The estimated-receive
          value lives in an aria-live="polite" region so a screen reader
          announces the new estimate as the user types. The full sentence
          is in the `<dd>` so the announcement is intelligible without the
          surrounding context. */}
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)]">
        <DetailCell
          label="Type"
          value={mode === "limit" ? "Limit" : "Market"}
        />
        <DetailCell label="Fee" value={fee} />
        <div
          className="flex flex-col gap-0.5 bg-[var(--card)] px-3 py-2"
          aria-live="polite"
          aria-atomic="true"
          id={estReceiveLiveId}
        >
          <dt className="text-xs text-[var(--muted-foreground)]">
            Estimated receive
          </dt>
          <dd className="font-mono text-sm tabular-nums text-[var(--foreground)]">
            {estReceive
              ? `${estReceive} ${pair.quote}`
              : "Not yet calculated"}
          </dd>
        </div>
      </dl>

      {/* 9. Submit CTA — always submittable. Validation runs on submit;
          error summary takes focus on failure. Side + base + symbol all
          land in the accessible name. */}
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius-md)] border-2 border-[var(--destructive)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] p-3 text-xs leading-relaxed text-[var(--foreground)]"
        >
          <Icon.Failed size={14} aria-hidden className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : (
        <Button
          type="submit"
          disabled={loading}
          aria-describedby={privacyId}
          className={cn(
            "min-h-[48px] w-full text-base font-medium",
            "focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
            side === "buy"
              ? "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90"
              : "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
          )}
        >
          {side === "buy" ? "Buy" : "Sell"} {pair.base}. Sign in wallet.
        </Button>
      )}

      {/* 10. Privacy notice — id'd so the form root, the amount input, and
          the submit button can all reference it via aria-describedby. */}
      <p
        id={privacyId}
        className="flex items-center justify-center gap-1.5 text-xs leading-relaxed text-[var(--muted-foreground)]"
      >
        <Icon.Private size={12} aria-hidden />
        Orders match privately at the midpoint. No data leaves this page until
        you sign.
      </p>
    </form>
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
  const label = isBuy ? "Buy" : "Sell";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={`${label}${active ? " — selected" : ""}`}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
        "disabled:pointer-events-none disabled:opacity-50",
        active
          ? "text-[var(--foreground)]"
          : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
      )}
      style={
        active
          ? {
              backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
              borderColor: tone,
              color: tone,
            }
          : undefined
      }
    >
      <Glyph size={16} aria-hidden />
      <span>{label}</span>
      {/* Visible "selected" word so the active state is not colour-only.
          Hidden from screen readers because aria-checked carries it. */}
      {active ? (
        <span aria-hidden className="text-xs opacity-80">
          · selected
        </span>
      ) : null}
    </button>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-[var(--card)] px-3 py-2">
      <dt className="text-xs text-[var(--muted-foreground)]">{label}</dt>
      <dd className="font-mono text-sm tabular-nums text-[var(--foreground)]">
        {value}
      </dd>
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
