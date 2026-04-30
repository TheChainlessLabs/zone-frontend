"use client";

/**
 * ConnectionStates — full-page guard surfaces shown by AppShell when an
 * auth-required route can't render its real content.
 *
 * Three branches:
 *   • DisconnectedState  — wallet not connected
 *   • NoNftPassState     — wallet connected, but no Phase-4 NFT pass (#12)
 *   • WrongNetworkBanner — sticky-top banner shown above any route while
 *                          the wallet is on the wrong chain
 *
 * Voice: omega-docs/03-brand/messaging.md — terse, no exclamation marks,
 * no anxiety verbs ("trapped", "lost"), no apology pile-up.
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import { useWalletState } from "@/components/shell/WalletStateProvider";
import { EmailSignupModal } from "@/components/modals";

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
    wallet.state === "magic-link-sent";
  const modalState =
    wallet.state === "signing-up"
      ? ("submitting" as const)
      : wallet.state === "magic-link-sent"
      ? ("sent" as const)
      : ("idle" as const);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span
        aria-hidden
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)]"
      >
        <Icon.Mail size={18} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {routeLabel ?? "Sign in required"}
        </h1>
        <p className="text-2xl font-medium tracking-tight md:text-3xl">
          Sign up to continue
        </p>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--muted-foreground)]">
          Omega is read-only until you sign in with email. We'll send a
          magic link to activate your account.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => setOpenRequested(true)}
        className="min-h-[44px] md:min-h-0"
      >
        <Icon.Mail aria-hidden />
        <span>Sign up</span>
      </Button>
      <EmailSignupModal
        open={modalOpen}
        state={modalState}
        email={wallet.email}
        onClose={() => setOpenRequested(false)}
        onSubmit={(nextEmail) => wallet.signUp(nextEmail)}
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
          . Switch to Ethereum mainnet to continue.
        </span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => switchNetwork()}
        aria-label="Switch to Ethereum mainnet"
        className="min-h-[44px] shrink-0 sm:min-h-0"
      >
        <span className="sm:hidden">Switch network</span>
        <span className="hidden sm:inline">Switch to Ethereum mainnet</span>
      </Button>
    </div>
  );
}
