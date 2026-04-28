"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowDown, ArrowUp, Check, Search } from "lucide-react";

/* —— Glass primitives — used inside the brand-board §04 gallery to show
   liquid glass applied at smaller scales. These are showcase components,
   not the production primitive set (that lands in M2). They follow the
   same material rules: rare/purposeful, tasteful fallbacks for
   prefers-reduced-transparency and missing backdrop-filter support. */

export function GlassButton({
  children,
  intent = "primary",
}: {
  children: React.ReactNode;
  intent?: "primary" | "ghost" | "destructive";
}) {
  const intentClass = {
    primary: "text-[var(--foreground)]",
    ghost: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
    destructive: "text-[var(--destructive)]",
  }[intent];

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-pill inline-flex h-11 items-center gap-2 rounded-[var(--radius-lg)] px-5 text-sm font-medium tracking-wide transition-colors ${intentClass}`}
    >
      {children}
    </motion.button>
  );
}

export function GlassPillTabs() {
  const [active, setActive] = useState<"market" | "limit">("market");
  return (
    <div className="glass-pill inline-flex rounded-[var(--radius-xl)] p-1">
      {(["market", "limit"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className="relative inline-flex h-9 items-center px-5 text-xs font-medium uppercase tracking-[0.14em] transition-colors"
        >
          {active === tab && (
            <motion.span
              layoutId="glass-pill-tab"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-[var(--radius-lg)] bg-[var(--glass-highlight)]"
            />
          )}
          <span
            className={`relative ${
              active === tab
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            {tab}
          </span>
        </button>
      ))}
    </div>
  );
}

export function GlassInput() {
  return (
    <label className="glass-pill flex h-12 items-center gap-3 rounded-[var(--radius-lg)] px-4">
      <Search size={14} className="shrink-0 text-[var(--muted-foreground)]" />
      <input
        type="text"
        placeholder="Search market…"
        className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
      />
      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]/60">
        ⌘K
      </span>
    </label>
  );
}

export function GlassToggle() {
  const [on, setOn] = useState(true);
  return (
    <button
      onClick={() => setOn(!on)}
      aria-pressed={on}
      className="glass-pill relative inline-flex h-7 w-12 items-center rounded-full px-1"
    >
      <motion.span
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.9 }}
        className="absolute h-5 w-5 rounded-full bg-[var(--foreground)] shadow-md"
      />
    </button>
  );
}

export function GlassChip({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={`glass-pill inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs transition-colors ${
        active
          ? "text-[var(--foreground)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      }`}
    >
      {active && <Check size={12} className="text-[var(--success)]" />}
      {children}
    </motion.button>
  );
}

export function GlassPriceTicker() {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="glass-pill inline-flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-2 font-mono text-xs"
    >
      <span className="text-[var(--muted-foreground)]">USDC/EURC</span>
      <span className="font-tabular tabular-nums">0.9213</span>
      <span className="inline-flex items-center gap-0.5 text-[var(--success)]">
        <ArrowUp size={10} strokeWidth={2.5} />
        <span className="font-tabular">0.42%</span>
      </span>
    </motion.div>
  );
}

export function GlassPriceTickerDown() {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="glass-pill inline-flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-2 font-mono text-xs"
    >
      <span className="text-[var(--muted-foreground)]">USDT/EURC</span>
      <span className="font-tabular tabular-nums">0.9211</span>
      <span className="inline-flex items-center gap-0.5 text-[var(--destructive)]">
        <ArrowDown size={10} strokeWidth={2.5} />
        <span className="font-tabular">0.18%</span>
      </span>
    </motion.div>
  );
}
