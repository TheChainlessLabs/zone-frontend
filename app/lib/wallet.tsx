"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAccount } from "wagmi";
import { supportedChain, supportedChainId } from "./wagmiConfig";
import { useAccountRegistration } from "./hooks/useAccountRegistration";

interface WalletState {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  accountId: number | null;
  isRegistering: boolean;
  chainId: number | undefined;
  expectedChainId: number;
  expectedChainName: string;
  isSupportedChain: boolean;
  isHydrated: boolean;
}

const WalletContext = createContext<WalletState>({
  address: undefined,
  isConnected: false,
  accountId: null,
  isRegistering: false,
  chainId: undefined,
  expectedChainId: supportedChainId,
  expectedChainName: supportedChain.name,
  isSupportedChain: false,
  isHydrated: false,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, chainId, status } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [accountId, setAccountId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read accountId from localStorage when address changes
  useEffect(() => {
    if (!address) {
      setAccountId(null);
      return;
    }
    const stored = localStorage.getItem(`omega_account_${address}`);
    setAccountId(stored ? Number(stored) : null);
  }, [address]);

  // Auto-register account when wallet connects and no accountId exists
  const { isRegistering } = useAccountRegistration({
    address,
    accountId,
    setAccountId,
  });

  const isHydrated =
    mounted && status !== "connecting" && status !== "reconnecting";
  const isSupportedChain = isConnected && chainId === supportedChainId;

  const value: WalletState = {
    address,
    isConnected,
    accountId,
    isRegistering,
    chainId,
    expectedChainId: supportedChainId,
    expectedChainName: supportedChain.name,
    isSupportedChain,
    isHydrated,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
