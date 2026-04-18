"use client";

import { useState, type ReactNode } from "react";
import { WagmiProvider, type State } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmiConfig";
import { WalletProvider } from "@/lib/wallet";
import { ToastProvider } from "@/lib/useToast";
import { NotificationProvider } from "@/lib/useNotifications";
import { MarketProvider } from "@/lib/hooks/useMarket";
import { injectDevWallet } from "@/lib/devWallet";
import { initTestHooks, TestStoreMirror } from "@/lib/testHooks";

// Inject dev wallet before wagmi initializes (dev mode only, no-op in prod)
if (typeof window !== "undefined") {
  injectDevWallet();
  // Populate __TEST_WAGMI_CONFIG__ / __TEST_STORE__ / __TEST_SKIP_ONBOARDING
  // for Playwright specs. Production builds resolve this to a no-op via
  // the testHooks → testHooksStub webpack alias (see next.config.mjs).
  initTestHooks(config);
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
            <NotificationProvider>
              <ToastProvider>
                <TestStoreMirror />
                {children}
              </ToastProvider>
            </NotificationProvider>
          </WalletProvider>
        </MarketProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
