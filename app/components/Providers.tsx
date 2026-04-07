"use client";

import { useState, type ReactNode } from "react";
import { WagmiProvider, type State } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmiConfig";
import { WalletProvider } from "@/lib/wallet";
import { ToastProvider } from "@/lib/useToast";
import { MarketProvider } from "@/lib/hooks/useMarket";
import { injectDevWallet } from "@/lib/devWallet";

// Inject dev wallet before wagmi initializes (dev mode only, no-op in prod)
if (typeof window !== "undefined") {
  injectDevWallet();
}

export default function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <MarketProvider>
          <WalletProvider>
            <ToastProvider>{children}</ToastProvider>
          </WalletProvider>
        </MarketProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
