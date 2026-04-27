"use client";

import { useState } from "react";
import { motion } from "motion/react";
import BottomSheet from "./BottomSheet";
import { useWallet } from "@/lib/wallet";
import { useAccountBalances } from "@/lib/hooks/useAccountBalances";
import { useTokenBalance } from "@/lib/hooks/useTokenBalance";
import { getTokenIdBySymbol } from "@/lib/tokens";
import { config } from "@/lib/config";
import type { Address } from "viem";

const chains = [
  { name: "Ethereum", color: "#627EEA" },
  { name: "Polygon", color: "#8247E5" },
];

const tokens = ["USDC", "USDT", "EURC"];

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [chain, setChain] = useState("Ethereum");
  const [token, setToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const { accountId, address } = useWallet();
  const { balances } = useAccountBalances(accountId);

  const tokenAddressMap: Record<string, Address> = {
    USDC: config.usdcAddress as Address,
    USDT: config.usdtAddress as Address,
  };
  const selectedTokenAddress = tokenAddressMap[token];
  const { formatted: walletBalance } = useTokenBalance(selectedTokenAddress, address, 6);

  const tokenId = getTokenIdBySymbol(token);
  const tokenBalance = balances.find((b) => b.tokenId === tokenId);
  const balance = tokenBalance?.available ?? 0;
  const fee = 2.5;
  const numAmount = parseFloat(amount) || 0;
  const receive = Math.max(0, numAmount - fee);

  const handleShortcut = (pct: number) => {
    setAmount((walletBalance * pct).toFixed(2));
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Deposit">
      <div className="flex flex-col gap-5">
        {/* Chain selector */}
        <div>
          <label className="text-label-uppercase text-text-muted mb-2 block">Select Chain</label>
          <div className="flex gap-2">
            {chains.map((c) => (
              <motion.button
                key={c.name}
                data-testid={`deposit-modal-chain-${c.name.toLowerCase()}`}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                onClick={() => setChain(c.name)}
                className={`flex items-center gap-2 h-[40px] px-4 rounded-md text-body-sm transition-fast border flex-1 ${
                  chain === c.name
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border text-text-muted hover:text-text-secondary"
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                {c.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Token selector */}
        <div>
          <label className="text-label-uppercase text-text-muted mb-2 block">Select Token</label>
          <div className="flex gap-2">
            {tokens.map((t) => (
              <motion.button
                key={t}
                data-testid={`deposit-modal-token-${t.toLowerCase()}`}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                onClick={() => setToken(t)}
                className={`h-[40px] px-4 rounded-md text-body-sm font-medium transition-fast border ${
                  token === t
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border text-text-muted hover:text-text-secondary"
                }`}
              >
                {t}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-label-uppercase text-text-muted">Amount</label>
            <span className="text-[12px] text-text-muted font-mono font-tabular">
              Wallet: {walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center h-[48px] bg-bg-base border border-border rounded-md px-4">
            <input
              data-testid="deposit-modal-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-[18px] font-mono font-tabular outline-none text-text-primary placeholder:text-text-muted"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              onClick={() => setAmount(walletBalance.toFixed(2))}
              className="text-label-uppercase text-accent hover:text-accent-hover transition-fast ml-2"
            >
              MAX
            </motion.button>
          </div>
        </div>

        {/* Percentage shortcuts */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "25%", pct: 0.25 },
            { label: "50%", pct: 0.5 },
            { label: "75%", pct: 0.75 },
            { label: "MAX", pct: 1 },
          ].map((s) => (
            <motion.button
              key={s.label}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              onClick={() => handleShortcut(s.pct)}
              className="h-[36px] border border-border rounded-md text-body-sm text-text-secondary hover:bg-bg-elevated transition-fast"
            >
              {s.label}
            </motion.button>
          ))}
        </div>

        {/* Fee summary */}
        <div className="flex flex-col gap-1.5 text-[13px]">
          <div className="flex justify-between">
            <span className="text-text-muted">Network fee</span>
            <span className="font-mono font-tabular text-text-secondary">~${fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-text-muted">You receive</span>
            <span className="font-mono font-tabular text-text-primary">
              {numAmount > 0 ? `${receive.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${token}` : `0.00 ${token}`}
            </span>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          data-testid="deposit-modal-submit"
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          className="h-[48px] w-full rounded-md text-body-sm font-semibold bg-accent text-text-inverse hover:bg-accent-hover transition-fast"
        >
          Confirm Deposit
        </motion.button>
      </div>
    </BottomSheet>
  );
}
