// @ts-nocheck
// Elena redraws the trade ticket as one canonical execution object with shared state slots instead of adjacent mini-systems.
"use client";

import * as React from "react";

type OrderMode = "market" | "limit";
type OrderSide = "buy" | "sell";
type SurfaceState =
  | "default"
  | "empty"
  | "loading"
  | "error"
  | "skeleton"
  | "disconnected"
  | "allowlist-failure";

type Pair = {
  symbol: string;
  base: string;
  quote: string;
  midpoint: string;
};

type MetaField = {
  label: string;
  value: string;
};

const DEFAULT_PAIR: Pair = {
  symbol: "USDC/EURC",
  base: "USDC",
  quote: "EURC",
  midpoint: "0.9213",
};

const SHORTCUTS = ["25%", "50%", "75%", "Max"] as const;

export default function Persona15OrderFormRedesign() {
  const [mode, setMode] = React.useState<OrderMode>("market");
  const [side, setSide] = React.useState<OrderSide>("buy");
  const [surfaceState, setSurfaceState] = React.useState<SurfaceState>(
    "default",
  );

  const meta =
    mode === "market"
      ? [
          { label: "Reference", value: "Midpoint" },
          { label: "Fee", value: "0.005%" },
          { label: "Settlement", value: "Ethereum L1" },
        ]
      : [
          { label: "Reference", value: "Limit" },
          { label: "Fee", value: "0.005%" },
          { label: "Settlement", value: "Ethereum L1" },
        ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] px-6 py-10 text-[#f5f5f5]">
      <div className="mx-auto flex max-w-[520px] flex-col gap-4">
        <TicketShell>
          <TicketHeader
            pair={DEFAULT_PAIR}
            mode={mode}
            side={side}
            onModeChange={setMode}
            onSideChange={setSide}
          />
          <ExecutionPolicy meta={meta} />
          <OrderInputs
            mode={mode}
            side={side}
            pair={DEFAULT_PAIR}
            surfaceState={surfaceState}
          />
          <TicketFooter side={side} pair={DEFAULT_PAIR} />
        </TicketShell>

        <StateSwitcher value={surfaceState} onChange={setSurfaceState} />
      </div>
    </div>
  );
}

function TicketShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-[#0f1012] shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
      {children}
    </section>
  );
}

function TicketHeader({
  pair,
  mode,
  side,
  onModeChange,
  onSideChange,
}: {
  pair: Pair;
  mode: OrderMode;
  side: OrderSide;
  onModeChange: (mode: OrderMode) => void;
  onSideChange: (side: OrderSide) => void;
}) {
  return (
    <header className="border-b border-white/8 px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            Instrument
          </p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-medium">{pair.symbol}</h1>
            <span className="font-mono text-sm text-white/55">
              {pair.midpoint}
            </span>
          </div>
        </div>
        <div className="rounded-full border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
          Private execution
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <SegmentedPair
          value={mode}
          options={[
            { value: "market", label: "Market" },
            { value: "limit", label: "Limit" },
          ]}
          onChange={(next) => onModeChange(next as OrderMode)}
        />
        <SegmentedPair
          value={side}
          options={[
            { value: "buy", label: "Buy" },
            { value: "sell", label: "Sell" },
          ]}
          onChange={(next) => onSideChange(next as OrderSide)}
          tone={side}
        />
      </div>
    </header>
  );
}

function ExecutionPolicy({ meta }: { meta: MetaField[] }) {
  return (
    <div className="grid grid-cols-3 border-b border-white/8">
      {meta.map((item) => (
        <div key={item.label} className="border-r border-white/8 px-5 py-4 last:border-r-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
            {item.label}
          </p>
          <p className="mt-1 text-sm">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function OrderInputs({
  mode,
  side,
  pair,
  surfaceState,
}: {
  mode: OrderMode;
  side: OrderSide;
  pair: Pair;
  surfaceState: SurfaceState;
}) {
  if (surfaceState === "loading" || surfaceState === "skeleton") {
    return <LoadingState />;
  }

  if (surfaceState === "disconnected") {
    return (
      <StatePanel
        eyebrow="Wallet required"
        title="Connect wallet to place an order"
        description="Read-only market data remains available. Signing is required before order entry unlocks."
        action="Connect wallet"
      />
    );
  }

  if (surfaceState === "allowlist-failure") {
    return (
      <StatePanel
        eyebrow="Access"
        title="Pass required"
        description="This wallet does not satisfy the current trading gate. Funding and reference data should remain visible; submission should not."
        action="View eligibility"
      />
    );
  }

  if (surfaceState === "error") {
    return (
      <StatePanel
        eyebrow="Execution unavailable"
        title="Quote context failed"
        description="The reference price could not be resolved. Retry before submitting any signed instruction."
        action="Retry"
        tone="critical"
      />
    );
  }

  if (surfaceState === "empty") {
    return (
      <StatePanel
        eyebrow="No available balance"
        title="Funding required before order entry"
        description="The ticket should remain fully legible even when there is nothing to trade. Keep execution policy visible; disable submission."
        action="Deposit funds"
      />
    );
  }

  return (
    <div className="px-5 py-5">
      <div className="space-y-4">
        {mode === "limit" ? (
          <Field
            label="Limit price"
            value={pair.midpoint}
            suffix={pair.quote}
            hint="Reference midpoint available"
          />
        ) : null}

        <Field
          label="Amount"
          value="0.00"
          suffix={pair.base}
          hint={`Available 10000.00 ${pair.base}`}
          emphasis
        />

        <div className="grid grid-cols-4 gap-2">
          {SHORTCUTS.map((shortcut) => (
            <button
              key={shortcut}
              type="button"
              className="rounded-[12px] border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/72 transition hover:border-white/20 hover:text-white"
            >
              {shortcut}
            </button>
          ))}
        </div>

        <div className="grid gap-3 rounded-[16px] border border-white/8 bg-white/[0.02] p-4">
          <ReviewRow label="Estimated receive" value={`— ${pair.quote}`} />
          <ReviewRow label="Instruction type" value={mode === "market" ? "Midpoint market" : "Limit order"} />
          <ReviewRow label="Action" value={side === "buy" ? `Buy ${pair.base}` : `Sell ${pair.base}`} />
        </div>
      </div>
    </div>
  );
}

function TicketFooter({
  side,
  pair,
}: {
  side: OrderSide;
  pair: Pair;
}) {
  const label = side === "buy" ? `Submit buy ${pair.base}` : `Submit sell ${pair.base}`;
  const tone =
    side === "buy"
      ? "bg-[#1a6f52] text-white hover:bg-[#20815f]"
      : "bg-[#8e3b3b] text-white hover:bg-[#a34545]";

  return (
    <footer className="border-t border-white/8 px-5 py-5">
      <button
        type="button"
        className={`w-full rounded-[14px] px-4 py-3 text-sm font-medium transition ${tone}`}
      >
        {label}
      </button>
      <p className="mt-3 text-center text-[12px] text-white/48">
        Orders match privately. Settlement remains on Ethereum L1.
      </p>
    </footer>
  );
}

function SegmentedPair({
  value,
  options,
  onChange,
  tone,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (next: string) => void;
  tone?: OrderSide;
}) {
  return (
    <div className="grid grid-cols-2 rounded-[14px] border border-white/8 bg-white/[0.03] p-1">
      {options.map((option) => {
        const active = option.value === value;
        const activeTone =
          tone === "sell"
            ? "bg-[#351919] text-[#ffb4b4]"
            : "bg-[#0f2d23] text-[#7ce0b8]";

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "rounded-[10px] px-3 py-2 text-sm transition",
              active
                ? tone
                  ? activeTone
                  : "bg-white/[0.06] text-white"
                : "text-white/55 hover:text-white",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  value,
  suffix,
  hint,
  emphasis = false,
}: {
  label: string;
  value: string;
  suffix: string;
  hint: string;
  emphasis?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white/72">{label}</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
          {hint}
        </p>
      </div>
      <div className="flex items-center justify-between rounded-[16px] border border-white/10 bg-[#0b0c0e] px-4 py-4">
        <span className={emphasis ? "font-mono text-[34px] leading-none" : "font-mono text-xl"}>
          {value}
        </span>
        <span className="font-mono text-sm uppercase tracking-[0.18em] text-white/55">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-white/55">{label}</p>
      <p className="font-mono text-sm text-white">{value}</p>
    </div>
  );
}

function StatePanel({
  eyebrow,
  title,
  description,
  action,
  tone = "neutral",
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  tone?: "neutral" | "critical";
}) {
  const toneClass =
    tone === "critical"
      ? "border-[#5b2727] bg-[#1a1010]"
      : "border-white/8 bg-white/[0.02]";

  return (
    <div className={`m-5 rounded-[16px] border p-5 ${toneClass}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-lg font-medium">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
      <button
        type="button"
        className="mt-4 rounded-[12px] border border-white/12 px-4 py-2 text-sm text-white transition hover:border-white/24"
      >
        {action}
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4 px-5 py-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[72px] rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-4"
        >
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
          <div className="mt-4 h-8 w-full animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function StateSwitcher({
  value,
  onChange,
}: {
  value: SurfaceState;
  onChange: (value: SurfaceState) => void;
}) {
  const options: SurfaceState[] = [
    "default",
    "empty",
    "loading",
    "skeleton",
    "error",
    "disconnected",
    "allowlist-failure",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition",
            option === value
              ? "border-white/22 bg-white/10 text-white"
              : "border-white/10 text-white/48 hover:text-white",
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
