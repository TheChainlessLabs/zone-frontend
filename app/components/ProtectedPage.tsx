"use client";

import { useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { useDisconnect, useSwitchChain } from "wagmi";
import Navbar from "./Navbar";
import WalletModal from "./WalletModal";
import DisconnectedState from "./DisconnectedState";
import { useWallet } from "@/lib/wallet";
import { useToast } from "@/lib/useToast";

interface ProtectedPageProps {
  children: ReactNode;
  shellClassName: string;
}

export default function ProtectedPage({
  children,
  shellClassName,
}: ProtectedPageProps) {
  const {
    isConnected,
    isHydrated,
    isSupportedChain,
    expectedChainId,
    expectedChainName,
  } = useWallet();
  const { addToast } = useToast();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const [walletOpen, setWalletOpen] = useState(false);

  const handleUnsupportedAction = () => {
    if (switchChain) {
      switchChain(
        { chainId: expectedChainId },
        {
          onError(error) {
            addToast("error", "Network Switch Failed", error.message);
          },
        }
      );
      return;
    }

    disconnect();
  };

  if (!isHydrated) {
    return (
      <div className={shellClassName}>
        <Navbar />
        <div
          className="flex-1 flex items-center justify-center px-4"
          data-testid="protected-loading"
        >
          <div className="rounded-lg border border-border bg-bg-surface px-6 py-5 text-center">
            <p className="text-body-sm font-medium text-text-primary">
              Checking wallet connection...
            </p>
            <p className="mt-2 text-body-sm text-text-muted">
              Restoring your session before showing protected content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <>
        <div className={shellClassName}>
          <Navbar />
          <DisconnectedState onAction={() => setWalletOpen(true)} />
        </div>
        <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
      </>
    );
  }

  if (!isSupportedChain) {
    return (
      <div className={shellClassName}>
        <Navbar />
        <DisconnectedState
          actionLabel={`Switch to ${expectedChainName}`}
          description={`This wallet is connected to the wrong network. Switch to ${expectedChainName} to access trading and account screens.`}
          icon={AlertTriangle}
          onAction={handleUnsupportedAction}
          testId="unsupported-network-state"
          title="Unsupported network"
        />
        {isSwitchingChain ? (
          <p className="pb-8 text-center text-body-sm text-text-muted">
            Switching network...
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <Navbar />
      {children}
    </div>
  );
}
