// @ts-nocheck
// Mobile-first /trade rebuild — pair-in-header, hero amount + inline keypad, sticky CTA above safe-area + tab bar, bottom-sheet confirm. Desktop is a centred mirror of the same surface.

"use client";

import * as React from "react";

import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  DEFAULT_PAIR,
  LAUNCH_PAIRS,
  tradeFixtures,
  usePageState,
  type LaunchPair,
} from "@/lib/fixtures";
import type { MarketPair, Side } from "@/lib/fixtures/types";

type Mode = "market" | "limit";
type SheetState = "idle" | "signing" | "submitting" | "failed";

const MOCK_AVAILABLE = "10000.00";

export default function TradePage() {
  return (
    <AppShell route="/trade" auth>
      <TaliaTradeSurface />
    </AppShell>
  );
}

function TaliaTradeSurface() {
  const state = usePageState("default");
  const fixture = tradeFixtures[state] ?? tradeFixtures.default;

  const [pair, setPair] = React.useState<MarketPair>(fixture.pair);
  const [mode, setMode] = React.useState<Mode>("market");
  const [side, setSide] = React.useState<Side>("buy");
  const [amount, setAmount] = React.useState<string>("");
  const [limitPrice, setLimitPrice] = React.useState<string>("");
  const [keypadOpen, setKeypadOpen] = React.useState<boolean>(true);
  const [pairPickerOpen, setPairPickerOpen] = React.useState<boolean>(false);
  const [sheetState, setSheetState] = React.useState<SheetState>("idle");
  const [pendingConfirm, setPendingConfirm] = React.useState<boolean>(false);

  const launchPair: LaunchPair =
    LAUNCH_PAIRS.find((p) => p.pair === pair) ?? DEFAULT_PAIR;

  const midpoint = state === "loading" || state === "error" ? "" : fixture.midpoint;
  React.useEffect(() => {
    if (mode === "limit" && !limitPrice && midpoint) setLimitPrice(midpoint);
  }, [mode, midpoint, limitPrice]);

  const numericAmount = parseFloat(amount || "0");
  const effectivePrice = parseFloat((mode === "limit" ? limitPrice : midpoint) || "0");
  const estReceive =
    Number.isFinite(numericAmount) && numericAmount > 0 && effectivePrice > 0
      ? (numericAmount * effectivePrice).toFixed(2)
      : "";

  const submitDisabled =
    state === "loading" ||
    state === "error" ||
    numericAmount <= 0 ||
    (mode === "limit" && effectivePrice <= 0);

  const handleKeypad = (k: string) => {
    setAmount((prev) => {
      if (k === "back") return prev.slice(0, -1);
      if (k === "clear") return "";
      if (k === ".") return prev.includes(".") ? prev : (prev || "0") + ".";
      const next = (prev + k).replace(/^0+(\d)/, "$1");
      return next;
    });
  };

  const handlePct = (factor: number) => {
    const base = parseFloat(MOCK_AVAILABLE);
    setAmount((base * factor).toFixed(2));
  };

  const handleSubmit = () => {
    if (submitDisabled) return;
    setPendingConfirm(true);
    setSheetState("idle");
  };

  const handleConfirm = () => {
    setSheetState("signing");
    window.setTimeout(() => setSheetState("submitting"), 600);
    window.setTimeout(() => {
      setPendingConfirm(false);
      setSheetState("idle");
      setAmount("");
    }, 1400);
  };

  const isLoading = state === "loading" || state === "skeleton";
  const tone = side === "buy" ? "var(--success)" : "var(--destructive)";
  const ctaLabel = `${side === "buy" ? "Buy" : "Sell"} ${launchPair.base}`;

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Compact pair pill in the header band — replaces the PairSwitcher card */}
      <PairHeaderPill
        pair={launchPair}
        midpoint={midpoint}
        onClick={() => setPairPickerOpen(true)}
      />

      {/* Hero amount — the only thing that actually matters on this screen */}
      <section
        className="mt-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] px-5 pb-5 pt-6"
        aria-label="Order amount"
      >
        {/* Mode + Side as a single segmented row — Market/Limit on left, Buy/Sell flip on right */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <ModeToggle value={mode} onChange={setMode} disabled={isLoading} />
          <SideFlip
            side={side}
            onFlip={() => setSide((s) => (s === "buy" ? "sell" : "buy"))}
            disabled={isLoading}
          />
        </div>

        {/* Limit price (limit mode only) — small inline row, not a full surface */}
        {mode === "limit" ? (
          <div className="mb-4 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Limit
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={midpoint || "0.0000"}
              className="w-32 bg-transparent text-right font-mono text-sm tabular-nums outline-none"
              aria-label="Limit price"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              {launchPair.quote}
            </span>
          </div>
        ) : null}

        {/* Hero amount display — the visual centre of the page */}
        <button
          type="button"
          onClick={() => setKeypadOpen(true)}
          className="block w-full text-left"
          aria-label="Edit amount"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              You {side === "buy" ? "spend" : "send"}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Available {MOCK_AVAILABLE} {launchPair.base}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={cn(
                "font-mono text-5xl tabular-nums leading-none",
                amount ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]/40",
              )}
            >
              {amount || "0"}
            </span>
            <span className="font-mono text-base uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              {launchPair.base}
            </span>
          </div>
          <div className="mt-2 font-mono text-xs tabular-nums text-[var(--muted-foreground)]">
            {estReceive ? `≈ ${estReceive} ${launchPair.quote}` : `≈ — ${launchPair.quote}`}
          </div>
        </button>

        {/* Percent shortcuts — 48 dp tap targets, full thumb-zone width */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {[
            { label: "25%", value: 0.25 },
            { label: "50%", value: 0.5 },
            { label: "75%", value: 0.75 },
            { label: "MAX", value: 1 },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handlePct(s.value)}
              disabled={isLoading}
              className="h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 font-mono text-xs uppercase tracking-[0.14em] text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] disabled:pointer-events-none disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* One collapsed summary line — tap to expand. No double "you receive" + 3-cell strip. */}
        <details className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-xs">
          <summary className="flex cursor-pointer items-center justify-between font-mono uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            <span>
              {mode === "limit" ? "Limit" : "Market"} · fee 0.005% ·{" "}
              {midpoint ? `mid ${midpoint}` : "mid —"}
            </span>
            <Icon.ChevronDown size={12} aria-hidden />
          </summary>
          <dl className="mt-2 grid grid-cols-2 gap-y-1 font-mono tabular-nums text-[var(--muted-foreground)]">
            <dt>Type</dt>
            <dd className="text-right text-[var(--foreground)]">
              {mode === "limit" ? "Limit" : "Market"}
            </dd>
            <dt>Fee</dt>
            <dd className="text-right text-[var(--foreground)]">0.005%</dd>
            <dt>Settlement</dt>
            <dd className="text-right text-[var(--foreground)]">Ethereum L1</dd>
            <dt>Est. receive</dt>
            <dd className="text-right text-[var(--foreground)]">
              {estReceive ? `${estReceive} ${launchPair.quote}` : "—"}
            </dd>
          </dl>
        </details>
      </section>

      {/* Privacy line lives outside the card — small, persistent, ungated */}
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-[var(--muted-foreground)]">
        <Icon.Private size={11} aria-hidden />
        Orders match privately at midpoint.
      </p>

      {/* Inline numeric keypad — slides up from above the tab bar; OS keyboard never appears */}
      {keypadOpen ? (
        <NumericKeypad
          onPress={handleKeypad}
          onClose={() => setKeypadOpen(false)}
        />
      ) : null}

      {/* Sticky CTA — sits above the bottom tab bar (60px) AND home-indicator inset */}
      <StickyCta
        label={ctaLabel}
        tone={tone}
        disabled={submitDisabled}
        onClick={handleSubmit}
      />

      {/* Pair picker bottom-sheet */}
      {pairPickerOpen ? (
        <PairPickerSheet
          current={pair}
          onPick={(p) => {
            setPair(p);
            setPairPickerOpen(false);
          }}
          onClose={() => setPairPickerOpen(false)}
        />
      ) : null}

      {/* Confirm bottom-sheet — replaces the centred OrderConfirmationModal */}
      {pendingConfirm ? (
        <ConfirmSheet
          state={sheetState}
          side={side}
          pair={launchPair}
          mode={mode}
          amount={amount}
          price={mode === "limit" ? limitPrice : midpoint}
          estReceive={estReceive}
          onConfirm={handleConfirm}
          onClose={() => {
            setPendingConfirm(false);
            setSheetState("idle");
          }}
        />
      ) : null}
    </div>
  );
}

function PairHeaderPill({
  pair,
  midpoint,
  onClick,
}: {
  pair: LaunchPair;
  midpoint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left transition-colors hover:bg-[var(--muted)]/30"
      aria-label="Change trading pair"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm uppercase tracking-[0.14em] text-[var(--foreground)]">
          {pair.base}/{pair.quote}
        </span>
        <span className="font-mono text-sm tabular-nums text-[var(--muted-foreground)]">
          {midpoint || "—"}
        </span>
      </div>
      <Icon.ChevronDown size={14} aria-hidden className="text-[var(--muted-foreground)]" />
    </button>
  );
}

function ModeToggle({
  value,
  onChange,
  disabled,
}: {
  value: Mode;
  onChange: (m: Mode) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label="Order mode"
      className="inline-flex h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/40 p-1"
    >
      {(["market", "limit"] as Mode[]).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={value === m}
          onClick={() => onChange(m)}
          disabled={disabled}
          className={cn(
            "h-full rounded-[var(--radius-sm)] px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
            value === m
              ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted-foreground)]",
          )}
        >
          {m === "market" ? "Market" : "Limit"}
        </button>
      ))}
    </div>
  );
}

function SideFlip({
  side,
  onFlip,
  disabled,
}: {
  side: Side;
  onFlip: () => void;
  disabled?: boolean;
}) {
  const isBuy = side === "buy";
  const tone = isBuy ? "var(--success)" : "var(--destructive)";
  const Glyph = isBuy ? Icon.Buy : Icon.Sell;
  return (
    <button
      type="button"
      onClick={onFlip}
      disabled={disabled}
      aria-label={`Switch to ${isBuy ? "sell" : "buy"}`}
      className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] border px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors disabled:pointer-events-none disabled:opacity-50"
      style={{
        backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
        borderColor: `color-mix(in oklab, ${tone} 40%, transparent)`,
        color: tone,
      }}
    >
      <Glyph size={12} aria-hidden />
      <span>{isBuy ? "Buy" : "Sell"}</span>
      <Icon.Refresh size={12} aria-hidden className="opacity-60" />
    </button>
  );
}

function NumericKeypad({
  onPress,
  onClose,
}: {
  onPress: (k: string) => void;
  onClose: () => void;
}) {
  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];
  return (
    <div
      role="group"
      aria-label="Numeric keypad"
      // Float above the bottom tab bar (60px) and the home indicator (env safe-area)
      className="fixed inset-x-0 z-30 mx-auto w-full max-w-md border-t border-[var(--border)] bg-[var(--background)]/98 px-4 pt-3 backdrop-blur"
      style={{
        bottom: "calc(60px + env(safe-area-inset-bottom) + 76px)",
        // 76px = sticky CTA region height. Keypad slides ABOVE the CTA so the user can see the amount update + tap submit without dismissing.
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          Keypad
        </span>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label="Close keypad"
        >
          Hide
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 pb-3">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onPress(k)}
            className="h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] font-mono text-lg tabular-nums text-[var(--foreground)] transition-colors active:bg-[var(--muted)]"
            aria-label={k === "back" ? "Backspace" : `Digit ${k}`}
          >
            {k === "back" ? "⌫" : k}
          </button>
        ))}
      </div>
    </div>
  );
}

function StickyCta({
  label,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  tone: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="fixed inset-x-0 z-40 mx-auto w-full max-w-md border-t border-[var(--border)] bg-[var(--background)]/95 px-4 pb-3 pt-3 backdrop-blur"
      style={{
        // 60px = MobileTabBar height. Keep the CTA above the bar AND above the home indicator.
        bottom: "calc(60px + env(safe-area-inset-bottom))",
      }}
    >
      <Button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="h-12 w-full text-sm font-medium"
        style={{ backgroundColor: tone, color: "var(--success-foreground)" }}
      >
        {label}
      </Button>
    </div>
  );
}

function PairPickerSheet({
  current,
  onPick,
  onClose,
}: {
  current: MarketPair;
  onPick: (p: MarketPair) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet onClose={onClose} title="Select pair">
      <ul className="flex flex-col">
        {LAUNCH_PAIRS.map((p) => (
          <li key={p.pair}>
            <button
              type="button"
              onClick={() => onPick(p.pair)}
              className={cn(
                "flex w-full items-center justify-between border-b border-[var(--border)] px-1 py-4 text-left",
                current === p.pair ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]",
              )}
            >
              <span className="font-mono text-sm uppercase tracking-[0.14em]">
                {p.base}/{p.quote}
              </span>
              {current === p.pair ? (
                <Icon.Check size={14} aria-hidden className="text-[var(--success)]" />
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}

function ConfirmSheet({
  state,
  side,
  pair,
  mode,
  amount,
  price,
  estReceive,
  onConfirm,
  onClose,
}: {
  state: SheetState;
  side: Side;
  pair: LaunchPair;
  mode: Mode;
  amount: string;
  price: string;
  estReceive: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const tone = side === "buy" ? "var(--success)" : "var(--destructive)";
  const busy = state === "signing" || state === "submitting";
  return (
    <BottomSheet
      onClose={busy ? () => {} : onClose}
      title={`Confirm ${side === "buy" ? "buy" : "sell"}`}
    >
      <dl className="grid grid-cols-2 gap-y-3 font-mono text-sm tabular-nums">
        <dt className="text-[var(--muted-foreground)]">Pair</dt>
        <dd className="text-right">{pair.base}/{pair.quote}</dd>
        <dt className="text-[var(--muted-foreground)]">Type</dt>
        <dd className="text-right">{mode === "limit" ? "Limit" : "Market"}</dd>
        <dt className="text-[var(--muted-foreground)]">You {side === "buy" ? "spend" : "send"}</dt>
        <dd className="text-right">
          {amount || "0"} {pair.base}
        </dd>
        <dt className="text-[var(--muted-foreground)]">Price</dt>
        <dd className="text-right">{price || "—"}</dd>
        <dt className="text-[var(--muted-foreground)]">Est. receive</dt>
        <dd className="text-right">
          {estReceive ? `${estReceive} ${pair.quote}` : "—"}
        </dd>
      </dl>
      <Button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className="mt-5 h-12 w-full"
        style={{ backgroundColor: tone, color: "var(--success-foreground)" }}
      >
        {state === "idle"
          ? `Sign ${side === "buy" ? "buy" : "sell"}`
          : state === "signing"
          ? "Awaiting signature…"
          : state === "submitting"
          ? "Submitting…"
          : "Retry"}
      </Button>
      <p className="mt-3 text-center text-[11px] text-[var(--muted-foreground)]">
        Match privately at midpoint. No order book is shown to counterparties.
      </p>
    </BottomSheet>
  );
}

function BottomSheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)] px-5 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[var(--muted-foreground)]/30" aria-hidden />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            aria-label="Close sheet"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
