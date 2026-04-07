"use client";

import { useState } from "react";
import { Lock, Check } from "lucide-react";
import BottomSheet from "./BottomSheet";
import { useWallet } from "@/lib/wallet";
import { useAccountBalances } from "@/lib/hooks/useAccountBalances";
import { getTokenIdBySymbol } from "@/lib/tokens";

type WithdrawalMode = "standard" | "privacy";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [token] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<WithdrawalMode>("standard");
  const [consent, setConsent] = useState(false);
  const { accountId } = useWallet();
  const { balances } = useAccountBalances(accountId);

  const tokenId = getTokenIdBySymbol(token);
  const tokenBalance = balances.find((b) => b.tokenId === tokenId);
  const available = tokenBalance?.available ?? 0;
  const networkFee = 2.5;
  const privacyFee = mode === "privacy" ? 1.2 : 0;
  const totalFee = networkFee + privacyFee;
  const numAmount = parseFloat(amount) || 0;
  const receive = Math.max(0, numAmount - totalFee);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Withdraw">
      <div className="flex flex-col gap-5">
        {/* Token + Amount */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-label-uppercase text-text-muted">Token & Amount</label>
            <span className="text-[12px] text-text-muted font-mono font-tabular">
              Available: {available.toLocaleString("en-US", { minimumFractionDigits: 2 })} {token}
            </span>
          </div>
          <div className="flex items-center h-[48px] bg-bg-base border border-border rounded-md">
            <span className="h-full px-4 flex items-center text-body-sm font-medium text-text-primary bg-bg-elevated rounded-l-md border-r border-border">
              {token}
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent px-4 text-[18px] font-mono font-tabular outline-none text-text-primary placeholder:text-text-muted"
            />
            <button
              onClick={() => setAmount(available.toFixed(2))}
              className="text-label-uppercase text-accent hover:text-accent-hover transition-fast px-4"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Withdrawal mode */}
        <div>
          <label className="text-label-uppercase text-text-muted mb-2 block">Withdrawal Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("standard")}
              className={`flex flex-col items-start p-3 rounded-md border transition-fast ${
                mode === "standard"
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-border-subtle"
              }`}
            >
              <span className="text-body-sm font-medium text-text-primary">Standard</span>
              <span className="text-[11px] text-text-muted">Faster, lower fee</span>
            </button>
            <button
              onClick={() => setMode("privacy")}
              className={`flex flex-col items-start p-3 rounded-md border transition-fast ${
                mode === "privacy"
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-border-subtle"
              }`}
            >
              <span className="text-body-sm font-medium text-text-primary flex items-center gap-1.5">
                <Lock size={12} className="text-accent" />
                Privacy
              </span>
              <span className="text-[11px] text-text-muted">ZK proof, no history leaked</span>
            </button>
          </div>
        </div>

        {/* Privacy consent */}
        {mode === "privacy" && (
          <button
            onClick={() => setConsent(!consent)}
            className="flex items-start gap-3 text-left"
          >
            <span
              className={`w-[18px] h-[18px] rounded-[4px] border shrink-0 mt-0.5 flex items-center justify-center transition-fast ${
                consent
                  ? "bg-accent border-accent"
                  : "border-border"
              }`}
            >
              {consent && <Check size={12} className="text-text-inverse" />}
            </span>
            <span className="text-[12px] text-text-muted leading-[1.5]">
              I understand privacy withdrawals generate a ZK proof and require an on-chain claim step. Additional fee applies.
            </span>
          </button>
        )}

        {/* Fee breakdown */}
        <div className="flex flex-col gap-1.5 text-[13px]">
          <div className="flex justify-between">
            <span className="text-text-muted">Network fee</span>
            <span className="font-mono font-tabular text-text-secondary">~${networkFee.toFixed(2)}</span>
          </div>
          {mode === "privacy" && (
            <div className="flex justify-between">
              <span className="text-text-muted">Privacy proof fee</span>
              <span className="font-mono font-tabular text-text-secondary">~${privacyFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <span className="text-text-muted">You receive</span>
            <span className="font-mono font-tabular text-text-primary">
              {numAmount > 0 ? `${receive.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${token}` : `0.00 ${token}`}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          disabled={mode === "privacy" && !consent}
          className="h-[48px] w-full rounded-md text-body-sm font-semibold bg-accent text-text-inverse hover:bg-accent-hover transition-fast disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm Withdrawal
        </button>
      </div>
    </BottomSheet>
  );
}
