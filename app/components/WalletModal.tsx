"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnect } from "wagmi";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Modal from "./Modal";
import { useToast } from "@/lib/useToast";

type ConnectionState = "idle" | "connecting" | "connected" | "failed";

const connectorIcons: Record<string, string> = {
  MetaMask: "M",
  WalletConnect: "W",
  "Coinbase Wallet": "C",
  Injected: "B",
  "Browser Wallet": "B",
};

const connectorColors: Record<string, string> = {
  MetaMask: "bg-orange-500/20 text-orange-400",
  WalletConnect: "bg-blue-500/20 text-blue-400",
  "Coinbase Wallet": "bg-blue-600/20 text-blue-300",
  Injected: "bg-bg-elevated text-text-secondary",
  "Browser Wallet": "bg-bg-elevated text-text-secondary",
};

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { addToast } = useToast();
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [connectedAddress, setConnectedAddress] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeConnectorName, setActiveConnectorName] = useState<string>("");
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { connectors, connect, isPending } = useConnect({
    mutation: {
      onSuccess: (data) => {
        const account = data.accounts[0];
        const address = typeof account === "string" ? account : account?.address ?? "";
        setConnectedAddress(address);
        setConnectionState("connected");
        autoCloseTimerRef.current = setTimeout(() => {
          handleClose();
        }, 2000);
      },
      onError: (error) => {
        setErrorMessage(error.message);
        setConnectionState("failed");
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

  const resetState = useCallback(() => {
    setConnectionState("idle");
    setConnectedAddress("");
    setErrorMessage("");
    setActiveConnectorName("");
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  // Reset state when modal is closed externally
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const handleConnect = (connector: (typeof connectors)[number]) => {
    const label = getConnectorLabel(connector.name);
    setActiveConnectorName(label);
    setConnectionState("connecting");
    connect({ connector });
  };

  const handleRetry = () => {
    const connector = availableConnectors.find(
      (c) => getConnectorLabel(c.name) === activeConnectorName
    );
    if (connector) {
      setConnectionState("connecting");
      setErrorMessage("");
      connect({ connector });
    }
  };

  const renderContent = () => {
    switch (connectionState) {
      case "connecting":
        return (
          <div className="flex flex-col items-center justify-center py-8 gap-4" data-testid="connecting-state">
            <div className="flex items-center gap-3">
              <span
                className={`w-10 h-10 rounded-md flex items-center justify-center text-body-sm font-semibold ${
                  connectorColors[activeConnectorName] ?? "bg-bg-elevated text-text-secondary"
                }`}
              >
                {connectorIcons[activeConnectorName] ?? activeConnectorName[0]}
              </span>
              <span className="text-body-sm font-medium">{activeConnectorName}</span>
              <Loader2 size={20} className="animate-spin text-accent" />
            </div>
            <p className="text-body-sm text-text-secondary">
              Waiting for wallet approval...
            </p>
          </div>
        );

      case "connected":
        return (
          <div className="flex flex-col items-center justify-center py-8 gap-4" data-testid="connected-state">
            <CheckCircle2 size={48} className="text-success" />
            <p className="text-body-sm font-medium text-text-primary">
              {truncateAddress(connectedAddress)}
            </p>
            <p className="text-body-sm text-text-secondary">
              Wallet connected successfully.
            </p>
          </div>
        );

      case "failed":
        return (
          <div className="flex flex-col items-center justify-center py-8 gap-4" data-testid="failed-state">
            <XCircle size={48} className="text-error" />
            <p className="text-body-sm text-text-secondary text-center">
              {errorMessage}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleClose}
                className="flex-1 h-10 border border-border rounded-md text-body-sm font-medium text-text-secondary hover:bg-bg-elevated transition-fast"
              >
                Cancel
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 h-10 bg-accent rounded-md text-body-sm font-medium text-white hover:bg-accent/90 transition-fast"
              >
                Try Again
              </button>
            </div>
          </div>
        );

      default:
        return (
          <>
            <p className="text-body-sm text-text-secondary mb-4">
              Connect your wallet to start trading on Omega Markets darkpool.
            </p>
            <div className="flex flex-col gap-2" data-testid="connector-list">
              {availableConnectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="flex items-center gap-3 h-[56px] px-4 bg-bg-base border border-border rounded-md hover:bg-bg-elevated transition-fast disabled:opacity-50"
                  data-testid={`wallet-connector-${connector.uid}`}
                >
                  <span
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-body-sm font-semibold ${
                      connectorColors[getConnectorLabel(connector.name)] ?? "bg-bg-elevated text-text-secondary"
                    }`}
                  >
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
          </>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Connect Wallet">
      {renderContent()}
    </Modal>
  );
}
