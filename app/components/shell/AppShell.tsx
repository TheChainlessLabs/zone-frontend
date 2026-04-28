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
 *   • disconnected    → on auth-required routes, replace `{children}` with
 *                        DisconnectedState; on public routes, render through
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
  DisconnectedState,
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

export function AppShell({ route, auth = false, children }: AppShellProps) {
  const { state } = useWalletState();

  let content: React.ReactNode = children;
  if (auth) {
    if (state === "disconnected") {
      content = <DisconnectedState routeLabel={route} />;
    } else if (state === "no-nft-pass") {
      content = <NoNftPassState />;
    }
    // wrong-network deliberately falls through — the banner explains the
    // problem and the underlying route is still navigable in read-only
    // form. Mutations live behind the per-action signing flow (M6).
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <WrongNetworkBanner />
      <Navbar />
      <div className="pb-[60px] md:pb-0">{content}</div>
      <MobileTabBar />
    </div>
  );
}
