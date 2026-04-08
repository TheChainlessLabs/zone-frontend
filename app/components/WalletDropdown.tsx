"use client";

import { useState, useRef, useEffect } from "react";
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
      <button
        data-testid="wallet-dropdown-trigger"
        onClick={() => setOpen((v) => !v)}
        className={`hidden md:flex items-center gap-2 h-[30px] px-4 text-body-sm rounded-md border ${
          isSupportedChain
            ? "border-border-subtle"
            : "border-warning/40 bg-warning/10"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isSupportedChain ? "bg-success" : "bg-warning"
          }`}
        />
        <span className="font-mono text-[13px] text-text-secondary">
          {isSupportedChain ? truncateAddress(address) : "Wrong network"}
        </span>
      </button>

      {open && (
        <div
          data-testid="wallet-dropdown-menu"
          className="absolute right-0 top-full mt-2 min-w-[200px] bg-bg-elevated border border-border rounded-lg shadow-lg z-50 py-1"
        >
          <button
            data-testid="wallet-dropdown-copy"
            onClick={handleCopy}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-body-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-fast"
          >
            <Copy size={16} />
            Copy Address
          </button>
          <button
            data-testid="wallet-dropdown-etherscan"
            onClick={handleEtherscan}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-body-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-fast"
          >
            <ExternalLink size={16} />
            View on Etherscan
          </button>
          <div className="border-t border-border mx-2 my-1" />
          <button
            data-testid="wallet-dropdown-disconnect"
            onClick={handleDisconnect}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-body-sm text-error hover:bg-bg-surface transition-fast"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
