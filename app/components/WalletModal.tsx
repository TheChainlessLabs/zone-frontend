"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnect } from "wagmi";
import Modal from "./Modal";
import { useToast } from "@/lib/useToast";

const connectorIcons: Record<string, string> = {
  MetaMask: "M",
  WalletConnect: "W",
  "Coinbase Wallet": "C",
  Injected: "B",
  "Browser Wallet": "B",
};

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { addToast } = useToast();
  const { connectors, connect, isPending } = useConnect({
    mutation: {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        addToast("error", "Connection Failed", error.message);
      },
    },
  });
  const [availableConnectorIds, setAvailableConnectorIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function detectConnectors() {
      const supported = await Promise.all(
        connectors.map(async (connector) => {
          try {
            const provider = await connector.getProvider();
            return provider ? connector.uid : null;
          } catch {
            return null;
          }
        })
      );

      if (!cancelled) {
        setAvailableConnectorIds(
          supported.filter((uid): uid is string => Boolean(uid))
        );
      }
    }

    detectConnectors();

    return () => {
      cancelled = true;
    };
  }, [connectors, isOpen]);

  const availableConnectors = useMemo(
    () => connectors.filter((connector) => availableConnectorIds.includes(connector.uid)),
    [availableConnectorIds, connectors]
  );

  const getConnectorLabel = (connectorName: string) => {
    if (connectorName === "Injected") return "Browser Wallet";
    return connectorName;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet">
      <p className="text-body-sm text-text-secondary mb-4">
        Connect your wallet to start trading on Omega Markets darkpool.
      </p>
      <div className="flex flex-col gap-2">
        {availableConnectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="flex items-center gap-3 h-[56px] px-4 bg-bg-base border border-border rounded-md hover:bg-bg-elevated transition-fast disabled:opacity-50"
            data-testid={`wallet-connector-${connector.uid}`}
          >
            <span className="w-8 h-8 rounded-md bg-bg-elevated flex items-center justify-center text-body-sm font-semibold text-text-secondary">
              {connectorIcons[getConnectorLabel(connector.name)] ?? connector.name[0]}
            </span>
            <span className="text-body-sm font-medium">
              {getConnectorLabel(connector.name)}
            </span>
          </button>
        ))}
      </div>
      {availableConnectors.length === 0 ? (
        <p className="mt-4 text-body-sm text-text-muted">
          No supported browser wallet was detected. Install an injected wallet to connect.
        </p>
      ) : null}
      <p className="text-body-sm text-text-muted mt-4">
        By connecting, you agree to the Terms of Service.
      </p>
    </Modal>
  );
}
