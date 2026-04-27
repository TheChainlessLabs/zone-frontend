"use client";

import { Lock, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface DisconnectedStateProps {
  onAction: () => void;
  actionLabel?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  testId?: string;
}

export default function DisconnectedState({
  onAction,
  actionLabel = "Connect Wallet",
  title = "Anonymous spot FX. On-chain settlement.",
  description = "Connect a wallet to access the order book, place limit and market orders, and view your fills.",
  icon: Icon = Lock,
  testId = "disconnected-state",
}: DisconnectedStateProps) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-4 py-16"
      data-testid={testId}
    >
      <div className="w-[44px] h-[44px] rounded-md border border-border bg-bg-surface flex items-center justify-center mb-6">
        <Icon size={20} className="text-text-secondary" aria-hidden />
      </div>

      <h1 className="text-h3 md:text-h2 font-semibold text-text-primary text-center max-w-[520px]">
        {title}
      </h1>
      <p className="text-body-sm text-text-secondary mt-3 text-center max-w-[460px]">
        {description}
      </p>

      <motion.button
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        onClick={onAction}
        className="mt-8 h-[44px] px-6 text-body-sm font-medium tracking-wide rounded-sm bg-accent text-text-inverse hover:bg-accent-hover transition-fast"
      >
        {actionLabel}
      </motion.button>
    </div>
  );
}
