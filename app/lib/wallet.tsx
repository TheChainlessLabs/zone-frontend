"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAccount } from "wagmi";

interface WalletState {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  accountId: number | null;
  chainId: number | undefined;
}

const WalletContext = createContext<WalletState>({
  address: undefined,
  isConnected: false,
  accountId: null,
  chainId: undefined,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, chainId } = useAccount();
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

  const value: WalletState = mounted
    ? { address, isConnected, accountId, chainId }
    : { address: undefined, isConnected: false, accountId: null, chainId: undefined };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
