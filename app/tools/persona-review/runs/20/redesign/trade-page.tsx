"use client";

// Brian Osei pass: rebuild /trade as a mobile-first execution brief so balance, route, settlement, and proof are visible before side/size.

import * as React from "react";

type Side = "buy" | "sell";
type Mode = "market" | "limit";

const PAIRS = [
  { value: "USDC/EURC", midpoint: "0.9213", availableBase: "10,000.00", availableQuote: "45,971.00" },
  { value: "USDC/USDT", midpoint: "0.9998", availableBase: "18,450.00", availableQuote: "27,114.00" },
] as const;

const EXECUTION_STEPS = [
  {
    label: "Sign",
    detail: "Wallet request sent",
    status: "current",
  },
  {
    label: "Queued",
    detail: "Waiting for match window",
    status: "upcoming",
  },
  {
    label: "Matched",
    detail: "Counterparty found",
    status: "upcoming",
  },
  {
    label: "Sealed",
    detail: "Included in batch",
    status: "upcoming",
  },
  {
    label: "Usable",
    detail: "Externally verifiable",
    status: "upcoming",
  },
] as const;

const RECENT_ACTIVITY = [
  {
    pair: "USDC/EURC",
    side: "Sell",
    amount: "5,000.00",
    price: "0.9213",
    status: "Sealed",
    note: "Batch #4821 · usable for withdrawal",
  },
  {
    pair: "USDC/EURC",
    side: "Buy",
    amount: "1,250.00",
    price: "0.9214",
    status: "Matched",
    note: "Waiting for next settlement batch",
  },
] as const;

export default function BrianTradePageRedesign() {
  const [pair, setPair] = React.useState<(typeof PAIRS)[number]>(PAIRS[0]);
  const [side, setSide] = React.useState<Side>("buy");
  const [mode, setMode] = React.useState<Mode>("market");
  const [amount, setAmount] = React.useState("");
  const [price, setPrice] = React.useState(pair.midpoint);

  React.useEffect(() => {
    setPrice(pair.midpoint);
  }, [pair]);

  const amountNumber = Number(amount || "0");
  const priceNumber = Number((mode === "limit" ? price : pair.midpoint) || "0");
  const receive =
    amountNumber > 0 && priceNumber > 0
      ? (amountNumber * priceNumber).toFixed(2)
      : "0.00";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <header className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Trade corridor
              </p>
              <h1 className="mt-1 text-2xl font-semibold">Move size with fewer guesses.</h1>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300">
              Ethereum L1
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Available now" value={`$${pair.availableQuote}`} note="Ready to trade" />
            <Metric label="Locked until batch" value="$1,242.40" note="Next seal in ~3 min" />
          </div>
        </header>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between gap-3">
            <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Pair
            </label>
            <p className="font-mono text-xs text-[var(--muted-foreground)]">
              Midpoint {pair.midpoint}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {PAIRS.map((option) => {
              const active = option.value === pair.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPair(option)}
                  className={[
                    "rounded-2xl border px-3 py-3 text-left transition-colors",
                    active
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-[var(--border)] bg-[var(--muted)]/20",
                  ].join(" ")}
                >
                  <div className="text-sm font-medium">{option.value}</div>
                  <div className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
                    Mid {option.midpoint}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Execution path
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                What happens after you sign.
              </p>
            </div>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              public proof after seal
            </span>
          </div>

          <ol className="mt-4 flex flex-col gap-3">
            {EXECUTION_STEPS.map((step, index) => (
              <li
                key={step.label}
                className="grid grid-cols-[22px_1fr] gap-3"
              >
                <div className="flex flex-col items-center">
                  <span
                    className={[
                      "mt-0.5 h-[22px] w-[22px] rounded-full border",
                      step.status === "current"
                        ? "border-emerald-400 bg-emerald-400/20"
                        : "border-[var(--border)] bg-[var(--muted)]/20",
                    ].join(" ")}
                  />
                  {index < EXECUTION_STEPS.length - 1 ? (
                    <span className="mt-1 h-8 w-px bg-[var(--border)]" />
                  ) : null}
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{step.label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                      {index === 0 ? "now" : index === 1 ? "~ under 1 min" : "~ batch based"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Order ticket
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Available {pair.availableBase} {pair.value.split("/")[0]}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Segment
              active={mode === "market"}
              label="Market"
              onClick={() => setMode("market")}
            />
            <Segment
              active={mode === "limit"}
              label="Limit"
              onClick={() => setMode("limit")}
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Segment
              active={side === "buy"}
              label="Buy"
              tone="success"
              onClick={() => setSide("buy")}
            />
            <Segment
              active={side === "sell"}
              label="Sell"
              tone="danger"
              onClick={() => setSide("sell")}
            />
          </div>

          {mode === "limit" ? (
            <Field
              label="Limit price"
              helper={`Quote token ${pair.value.split("/")[1]}`}
              value={price}
              onChange={setPrice}
            />
          ) : null}

          <Field
            label="Amount"
            helper={`Base token ${pair.value.split("/")[0]}`}
            value={amount}
            onChange={setAmount}
          />

          <div className="mt-3 grid grid-cols-4 gap-2">
            {["25%", "50%", "75%", "Max"].map((label) => (
              <button
                key={label}
                type="button"
                className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--foreground)]"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[var(--muted-foreground)]">You receive</span>
              <span className="font-mono text-sm">
                {receive} {pair.value.split("/")[1]}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-3">
              <InlineStat label="Settlement rail" value="Ethereum L1 batch" />
              <InlineStat label="Service fee" value="0.005%" />
              <InlineStat label="Destination state" value="Usable after seal" />
              <InlineStat label="Proof" value="Public batch record" />
            </div>
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-4 text-base font-semibold text-white transition-opacity hover:opacity-95"
          >
            {side === "buy" ? "Buy" : "Sell"} {pair.value.split("/")[0]}
          </button>

          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            This trade matches privately. Funds become usable after the batch seals on Ethereum and the proof record lands.
          </p>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Recent activity
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Your own fills and settlement state only.
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              last 24h
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {RECENT_ACTIVITY.map((item) => (
              <article
                key={`${item.pair}-${item.amount}-${item.status}`}
                className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{item.pair}</div>
                    <div className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
                      {item.side} {item.amount} @ {item.price}
                    </div>
                  </div>
                  <span
                    className={[
                      "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
                      item.status === "Sealed"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300",
                    ].join(" ")}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{item.note}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{note}</p>
    </div>
  );
}

function Segment({
  active,
  label,
  onClick,
  tone = "neutral",
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tone?: "neutral" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? active
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
        : "border-[var(--border)] bg-[var(--muted)]/20 text-[var(--foreground)]"
      : tone === "danger"
        ? active
          ? "border-red-500/35 bg-red-500/10 text-red-200"
          : "border-[var(--border)] bg-[var(--muted)]/20 text-[var(--foreground)]"
        : active
          ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
          : "border-[var(--border)] bg-[var(--muted)]/20 text-[var(--foreground)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${toneClass}`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-4 block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          {helper}
        </span>
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        placeholder="0.00"
        className="mt-2 h-14 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-2xl outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-emerald-500/40"
      />
    </label>
  );
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
