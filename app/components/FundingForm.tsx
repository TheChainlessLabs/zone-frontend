"use client";

import { useState } from "react";

type FundingTab = "deposit" | "withdraw" | "transfer";

const chains = [
  { name: "Ethereum", color: "#627EEA" },
  { name: "Polygon", color: "#8247E5" },
  { name: "Arbitrum", color: "#28A0F0" },
];

const assets = ["USDC", "USDT", "EURC"];

interface FundingFormProps {
  initialTab?: FundingTab;
}

export default function FundingForm({ initialTab = "deposit" }: FundingFormProps) {
  const [tab, setTab] = useState<FundingTab>(initialTab);
  const [chain, setChain] = useState("Ethereum");
  const [asset, setAsset] = useState("USDC");
  const [amount, setAmount] = useState("");

  const balance = 15000.00;
  const fee = tab === "transfer" ? 0 : 2.50;
  const receive = amount ? Math.max(0, parseFloat(amount) - fee) : 0;

  const labels: Record<FundingTab, { title: string; button: string }> = {
    deposit: { title: "Deposit Funds", button: "Confirm Deposit" },
    withdraw: { title: "Withdraw Funds", button: "Confirm Withdrawal" },
    transfer: { title: "Internal Transfer", button: "Confirm Transfer" },
  };

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-6 flex flex-col gap-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-bg-base rounded-md p-1">
        {(["deposit", "withdraw", "transfer"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 h-[32px] text-body-sm font-medium rounded-sm transition-fast capitalize ${
              tab === t
                ? "bg-bg-elevated text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <h3 className="text-h3 font-semibold">{labels[tab].title}</h3>

      {/* Chain selector */}
      {tab !== "transfer" && (
        <div>
          <label className="text-label-uppercase text-text-muted mb-2 block">Chain</label>
          <div className="flex gap-2">
            {chains.map((c) => (
              <button
                key={c.name}
                onClick={() => setChain(c.name)}
                className={`flex items-center gap-2 h-[36px] px-4 rounded-md text-body-sm transition-fast border ${
                  chain === c.name
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border text-text-muted hover:text-text-secondary"
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Asset selector */}
      <div>
        <label className="text-label-uppercase text-text-muted mb-2 block">Asset</label>
        <div className="flex gap-2">
          {assets.map((a) => (
            <button
              key={a}
              onClick={() => setAsset(a)}
              className={`h-[36px] px-4 rounded-md text-body-sm font-medium transition-fast border ${
                asset === a
                  ? "border-accent bg-accent/10 text-text-primary"
                  : "border-border text-text-muted hover:text-text-secondary"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-label-uppercase text-text-muted">Amount</label>
          <span className="text-body-sm text-text-muted">
            Balance: <span className="font-mono font-tabular">{balance.toLocaleString("en-US", { minimumFractionDigits: 2 })} {asset}</span>
          </span>
        </div>
        <div className="flex items-center h-[48px] bg-bg-base border border-border rounded-md px-4">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-[18px] font-mono font-tabular outline-none text-text-primary placeholder:text-text-muted"
          />
          <button
            onClick={() => setAmount(balance.toFixed(2))}
            className="text-label-uppercase text-accent hover:text-accent-hover transition-fast ml-2"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Fee summary */}
      <div className="bg-bg-base border border-border rounded-md p-4 flex flex-col gap-2">
        <div className="flex justify-between text-body-sm">
          <span className="text-text-muted">Network fee</span>
          <span className="font-mono font-tabular text-text-secondary">
            {fee > 0 ? `$${fee.toFixed(2)}` : "Free"}
          </span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between text-body-sm font-medium">
          <span className="text-text-primary">You receive</span>
          <span className="font-mono font-tabular text-text-primary">
            {receive > 0 ? `${receive.toFixed(2)} ${asset}` : `0.00 ${asset}`}
          </span>
        </div>
      </div>

      {/* Submit */}
      <button className="h-[44px] w-full rounded-md text-body-sm font-semibold bg-accent text-text-inverse hover:bg-accent-hover transition-fast">
        {labels[tab].button}
      </button>
    </div>
  );
}
