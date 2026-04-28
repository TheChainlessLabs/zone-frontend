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

import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import { useWalletState } from "@/components/shell/WalletStateProvider";

export function DisconnectedState({ routeLabel }: { routeLabel?: string }) {
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
          {routeLabel ?? "Wallet required"}
        </h1>
        <p className="text-2xl font-medium tracking-tight md:text-3xl">
          Connect a wallet to continue
        </p>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--muted-foreground)]">
          Omega is read-only until your wallet signs in. No data leaves the
          page until you authorise.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => {}}>
        <Icon.Wallet aria-hidden />
        <span>Connect Wallet</span>
      </Button>
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
      <Button asChild variant="outline" size="sm">
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
  const { state, chainName } = useWalletState();

  if (state !== "wrong-network") return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-[color-mix(in_oklab,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] px-4 py-2 text-[var(--destructive)] md:px-8"
    >
      <div className="flex items-center gap-2 text-xs">
        <Icon.Warning size={14} aria-hidden />
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
        onClick={() => {}}
        aria-label="Switch to Ethereum mainnet"
      >
        Switch to Ethereum mainnet
      </Button>
    </div>
  );
}
