"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useMarket } from "@/lib/hooks/useMarket";
import { mockPairs } from "@/lib/mockData";
import { PAIR_MARKET_IDS } from "@/lib/marketIds";

export default function PairDropdown() {
  const { marketId, setMarketId } = useMarket();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Find the currently selected pair
  const selectedPair = mockPairs.find((p) => PAIR_MARKET_IDS[p.pair] === marketId) ?? mockPairs[0];
  const [base, quote] = selectedPair.pair.split("/");

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-bg-elevated transition-fast"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-body-sm font-semibold text-text-primary">
          {base} / {quote}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="text-text-muted inline-flex"
          aria-hidden
        >
          <ChevronDown size={14} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 mt-1 z-50 w-[280px] origin-top bg-bg-elevated border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {mockPairs.map((pair) => {
              const pairMarketId = PAIR_MARKET_IDS[pair.pair];
              const isSelected = pairMarketId === marketId;
              const isAvailable = pairMarketId !== undefined;

              return (
                <motion.button
                  key={pair.pair}
                  role="option"
                  aria-selected={isSelected}
                  whileTap={isAvailable ? { scale: 0.98 } : undefined}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                  onClick={() => {
                    if (isAvailable) {
                      setMarketId(pairMarketId);
                      setOpen(false);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`flex items-center justify-between w-full px-3 py-2.5 text-left transition-fast ${
                    isSelected
                      ? "bg-accent/10"
                      : isAvailable
                        ? "hover:bg-bg-surface"
                        : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`text-body-sm font-medium ${isSelected ? "text-accent" : "text-text-primary"}`}
                    >
                      {pair.pair}
                    </span>
                    <span className="text-text-muted" style={{ fontSize: "10px" }}>
                      {pair.fullName}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-body-sm font-mono font-tabular text-text-primary">
                      {pair.price.toFixed(4)}
                    </span>
                    <span
                      className={`font-mono font-tabular ${
                        pair.change >= 0 ? "text-success" : "text-error"
                      }`}
                      style={{ fontSize: "11px" }}
                    >
                      {pair.change >= 0 ? "+" : ""}
                      {pair.change.toFixed(2)}%
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
