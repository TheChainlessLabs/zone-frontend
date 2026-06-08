"use client";

/**
 * AppShell — production wrapper for v0 routes (/trade, /portfolio,
 * /batches, /account).
 *
 * Composes Navbar + WrongNetworkBanner + main + MobileTabBar, and resolves
 * the connection-state UX:
 *
 *   • wrong-network   → sticky banner above the navbar (and the route's
 *                        own children still render below it)
 *   • disconnected    → auth routes still render their own (read-only)
 *                        content; the Tempo wallet connect is a modal popup
 *                        from the Navbar (WalletStatus), never a full page
 *   • no-nft-pass     → on auth-required routes, replace `{children}` with
 *                        NoNftPassState
 *
 * Per PRD (omega-docs#5), `/batches` is a public surface — it must render
 * regardless of wallet state. The `auth` prop opts a route into the guard.
 *
 * Routes that need the production chrome import this component themselves.
 * /brand and /system deliberately do not — they keep their existing
 * ReviewNav.
 */

import * as React from "react";
import { Navbar } from "@/components/shell/Navbar";
import { MobileTabBar } from "@/components/shell/MobileTabBar";
import {
  NoNftPassState,
  WrongNetworkBanner,
} from "@/components/shell/ConnectionStates";
import { useWalletState } from "@/components/shell/WalletStateProvider";

export interface AppShellProps {
  /** The route path, used as a label hint for guard surfaces. */
  route?: string;
  /** When `true`, the shell gates `{children}` on a connected, on-network
   *  wallet that holds an NFT pass. Defaults to `false` (public surface). */
  auth?: boolean;
  children: React.ReactNode;
}

export function AppShell({ auth = false, children }: AppShellProps) {
  const { state } = useWalletState();

  // Disconnected/connecting no longer takes over the page with a full-screen
  // connect surface — auth routes render their own (read-only) content and the
  // Tempo wallet connect is a modal popup from the Navbar (WalletStatus). Only
  // the NFT-pass gate stays a full-page surface; wrong-network shows a banner
  // above the still-navigable route.
  let content: React.ReactNode = children;
  if (auth && state === "no-nft-pass") {
    content = <NoNftPassState />;
  }

  return (
    <div className="min-h-screen text-[var(--foreground)]">
      <WrongNetworkBanner />
      <Navbar />
      <div className="pb-[calc(60px+env(safe-area-inset-bottom)+16px)] md:pb-0">
        {content}
      </div>
      <MobileTabBar />
    </div>
  );
}
