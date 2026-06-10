"use client";

/**
 * ConnectionStates — full-page guard surfaces shown by AppShell when an
 * auth-required route can't render its real content.
 *
 * Three branches:
 *   • DisconnectedState  — Tempo wallet not connected
 *   • NoNftPassState     — wallet connected, but no Phase-4 NFT pass (#12)
 *   • WrongNetworkBanner — sticky-top banner shown above any route while
 *                          the wallet is off Tempo
 *
 * Voice: omega-docs/03-brand/messaging.md — terse, no exclamation marks,
 * no anxiety verbs ("trapped", "lost"), no apology pile-up.
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import { useWalletState } from "@/components/shell/WalletStateProvider";
import { TempoWalletModal } from "@/components/modals";

export function DisconnectedState({ routeLabel }: { routeLabel?: string }) {
  const wallet = useWalletState();
  const [openRequested, setOpenRequested] = React.useState(false);

  // Mirror the WalletStatus modal-derivation logic: open when the user asks
  // or implicitly while we're mid-sign-up. Closes when the user dismisses,
  // or when the session lands on `connected` (AppShell swaps this surface
  // out automatically).
  const modalOpen =
    openRequested ||
    wallet.state === "signing-up" ||
    wallet.state === "connecting" ||
    Boolean(wallet.errorMessage);
  const modalState =
    wallet.errorMessage
      ? ("failed" as const)
      : wallet.state === "signing-up" || wallet.state === "connecting"
      ? ("connecting" as const)
      : wallet.state === "connected"
      ? ("connected" as const)
      : ("idle" as const);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span
        aria-hidden
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)]"
      >
        <Icon.Wallet size={18} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {routeLabel ?? "Sign in required"}
        </h1>
        <p className="text-2xl font-medium tracking-tight md:text-3xl">
          Connect Tempo Wallet
        </p>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--muted-foreground)]">
          Omega is read-only until your Tempo account is connected.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => setOpenRequested(true)}
        className="min-h-[44px] md:min-h-0"
      >
        <Icon.Wallet aria-hidden />
        <span>Tempo wallet</span>
      </Button>
      <TempoWalletModal
        open={modalOpen}
        state={modalState}
        address={wallet.address}
        errorMessage={wallet.errorMessage}
        onClose={() => {
          wallet.clearError();
          setOpenRequested(false);
        }}
        onCreateAccount={() => wallet.signUp()}
        onSignIn={() => wallet.connect("Tempo Wallet")}
        onDevSignIn={
          wallet.isDevWalletAvailable
            ? () => wallet.connect("Test Wallet (dev)")
            : undefined
        }
        onMakerSignIn={
          wallet.isMakerWalletAvailable
            ? () => wallet.connect("Maker Wallet (dev)")
            : undefined
        }
      />
    </main>
  );
}

export function NoNftPassState() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span
        aria-hidden
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)]"
      >
        <Icon.Unauthorised size={18} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Phase 4 — Closed access
        </h1>
        <p className="text-2xl font-medium tracking-tight md:text-3xl">
          Pass required
        </p>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--muted-foreground)]">
          Trading is gated to Phase-4 NFT pass holders. The connected wallet
          does not hold a pass.
        </p>
      </div>
      <Button asChild variant="outline" className="min-h-[44px] md:min-h-0">
        <a href="#nft-pass">
          <span>Learn about the pass</span>
          <Icon.External aria-hidden />
        </a>
      </Button>
    </main>
  );
}

/**
 * WrongNetworkBanner — sticky-top warning shown above the Navbar whenever
 * the wallet is on a chain Omega does not serve. Renders nothing when the
 * wallet is on the right chain (or disconnected).
 */
export function WrongNetworkBanner() {
  const { state, chainName, switchNetwork } = useWalletState();

  if (state !== "wrong-network") return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 flex flex-col items-stretch gap-2 border-b border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] px-4 py-2 text-[var(--destructive)] sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-8"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <Icon.Warning size={14} aria-hidden className="shrink-0" />
        <span className="font-medium">Wrong network.</span>
        <span className="text-[var(--destructive)]/80">
          You're on{" "}
          <span className="font-mono">{chainName ?? "an unsupported chain"}</span>
          . Switch to Omega Zone to continue.
        </span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => switchNetwork()}
        aria-label="Switch to Omega Zone"
        className="min-h-[44px] shrink-0 sm:min-h-0"
      >
        <span className="sm:hidden">Switch network</span>
        <span className="hidden sm:inline">Switch to Omega Zone</span>
      </Button>
    </div>
  );
}
