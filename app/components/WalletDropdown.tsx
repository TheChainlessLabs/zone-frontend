"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDisconnect } from "wagmi";
import { Copy, ExternalLink, LogOut } from "lucide-react";
import { useToast } from "@/lib/useToast";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface WalletDropdownProps {
  address: `0x${string}`;
  isSupportedChain: boolean;
}

export default function WalletDropdown({
  address,
  isSupportedChain,
}: WalletDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { disconnect } = useDisconnect();
  const { addToast } = useToast();

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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    addToast("success", "Address copied", "Copied to clipboard");
    setOpen(false);
  };

  const handleEtherscan = () => {
    window.open(`https://etherscan.io/address/${address}`, "_blank");
    setOpen(false);
  };

  const handleDisconnect = () => {
    // Clear omega account data from localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith("omega_account_")) {
        localStorage.removeItem(key);
      }
    }
    disconnect();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <motion.button
        data-testid="wallet-dropdown-trigger"
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 h-[32px] px-3 md:px-4 text-body-sm rounded-md border transition-fast hover:bg-bg-elevated ${
          isSupportedChain
            ? "border-border"
            : "border-warning/40 bg-warning/10"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isSupportedChain ? "bg-success" : "bg-warning"
          }`}
          aria-hidden
        />
        <span className="font-mono text-[13px] text-text-secondary">
          {isSupportedChain ? truncateAddress(address) : "Wrong network"}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="wallet-dropdown-menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 min-w-[200px] origin-top-right bg-bg-elevated border border-border rounded-lg shadow-lg z-50 py-1"
          >
            <motion.button
              data-testid="wallet-dropdown-copy"
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              onClick={handleCopy}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-body-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-fast"
            >
              <Copy size={16} />
              Copy Address
            </motion.button>
            <motion.button
              data-testid="wallet-dropdown-etherscan"
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              onClick={handleEtherscan}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-body-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-fast"
            >
              <ExternalLink size={16} />
              View on Etherscan
            </motion.button>
            <div className="border-t border-border mx-2 my-1" />
            <motion.button
              data-testid="wallet-dropdown-disconnect"
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              onClick={handleDisconnect}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-body-sm text-error hover:bg-bg-surface transition-fast"
            >
              <LogOut size={16} />
              Disconnect
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
