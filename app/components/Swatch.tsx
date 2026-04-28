"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, Copy } from "lucide-react";

export function Swatch({
  name,
  value,
  variableName,
  description,
  size = "md",
}: {
  name: string;
  value: string;
  variableName?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    // Engineers want the variable name on the clipboard, not the unresolved
    // var() string. Falls back to the value when the swatch is a raw token.
    const payload = variableName ?? value;
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const sizeClasses = {
    sm: "h-12",
    md: "h-20",
    lg: "h-28",
  }[size];

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      onClick={copy}
      className="group flex w-full flex-col gap-2 text-left"
      aria-label={`Copy ${variableName ?? value}`}
    >
      <div
        className={`${sizeClasses} w-full rounded-[var(--radius-md)] border border-[var(--border)] transition-shadow group-hover:shadow-md`}
        style={{ background: value }}
      />
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-[var(--foreground)]">{name}</span>
        <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
          {copied ? (
            <Check size={10} className="text-[var(--success)]" />
          ) : (
            <Copy size={10} className="opacity-0 group-hover:opacity-100" />
          )}
          {variableName ?? value}
        </span>
      </div>
      {description ? (
        <span className="text-[11px] leading-snug text-[var(--muted-foreground)]/70">
          {description}
        </span>
      ) : null}
    </motion.button>
  );
}
