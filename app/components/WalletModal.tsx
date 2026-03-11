"use client";

import Modal from "./Modal";
import { useToast } from "@/lib/useToast";

const wallets = [
  { name: "MetaMask", icon: "M" },
  { name: "WalletConnect", icon: "W" },
  { name: "Coinbase Wallet", icon: "C" },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { addToast } = useToast();

  function connect(name: string) {
    onClose();
    addToast("info", "Wallet", `${name} connection stub — not yet implemented`);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet">
      <p className="text-body-sm text-text-secondary mb-4">
        Connect your wallet to start trading on Omega Markets darkpool.
      </p>
      <div className="flex flex-col gap-2">
        {wallets.map((w) => (
          <button
            key={w.name}
            onClick={() => connect(w.name)}
            className="flex items-center gap-3 h-[56px] px-4 bg-bg-base border border-border rounded-md hover:bg-bg-elevated transition-fast"
          >
            <span className="w-8 h-8 rounded-md bg-bg-elevated flex items-center justify-center text-body-sm font-semibold text-text-secondary">
              {w.icon}
            </span>
            <span className="text-body-sm font-medium">{w.name}</span>
          </button>
        ))}
      </div>
      <p className="text-body-sm text-text-muted mt-4">
        By connecting, you agree to the Terms of Service.
      </p>
    </Modal>
  );
}
