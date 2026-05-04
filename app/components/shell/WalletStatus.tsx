"use client";

/**
 * WalletStatus — composite right-rail of the production Navbar.
 *
 * Renders one of six branches based on `useWalletState()`:
 *
 *   disconnected     → outline "Sign up" button (opens EmailSignupModal)
 *   signing-up /
 *   magic-link-sent  → outline button with spinner + "Awaiting magic link"
 *   wrong-network    → destructive "Switch network" CTA + warning glyph
 *   no-nft-pass      → outline "Pass required" link to onboarding info
 *   connected        → DropdownMenu with truncated address + chain dot
 *
 * Drives the `EmailSignupModal` end-to-end:
 *   click Sign up → modal opens at `state="idle"`
 *   submit valid email → wallet.signUp() → modal flips through
 *   `submitting` → `sent`. Backend integration replaces the mock at M6.
 *
 * Copy follows omega-docs/03-brand/messaging.md (status lexicon). The
 * connect-wallet flow is preserved in `connect-wallet-modal.tsx` for
 * Phase-4 self-custody reactivation.
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/lib/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TransitionLink } from "@/components/shell/transition-link";
import {
  truncateAddress,
  useWalletState,
} from "@/components/shell/WalletStateProvider";
import { EmailSignupModal } from "@/components/modals";

const ETHERSCAN_BASE = "https://etherscan.io/address/";

export function WalletStatus() {
  const wallet = useWalletState();
  const { state, address, chainName, email } = wallet;
  const [openRequested, setOpenRequested] = React.useState(false);

  // Auto-open the modal whenever the session is mid-sign-up so the user can
  // see the live state. Closes follow explicit user action.
  const modalOpen =
    openRequested || state === "signing-up" || state === "magic-link-sent";
  const modalState =
    state === "signing-up"
      ? ("submitting" as const)
      : state === "magic-link-sent"
      ? ("sent" as const)
      : ("idle" as const);

  const handleSignUpClick = React.useCallback(() => {
    setOpenRequested(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpenRequested(false);
  }, []);

  const handleSubmitEmail = React.useCallback(
    (nextEmail: string) => {
      wallet.signUp(nextEmail);
    },
    [wallet],
  );

  const handleDisconnect = React.useCallback(() => {
    wallet.disconnect();
    setOpenRequested(false);
  }, [wallet]);

  const truncated = address ? truncateAddress(address) : "—";

  return (
    <>
      <div
        className={`glass-pill inline-flex items-center gap-2 rounded-full ${
          state === "connected" ? "p-0" : "px-3 py-1.5"
        }`}
      >
        {state === "disconnected" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignUpClick}
            aria-label="Sign up"
          >
            <Icon.Mail aria-hidden />
            <span>Sign up</span>
          </Button>
        ) : null}

        {state === "signing-up" || state === "magic-link-sent" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignUpClick}
            aria-label="Awaiting magic link"
            aria-busy="true"
          >
            <ConnectingSpinner />
            <span>
              {state === "signing-up" ? "Sending..." : "Magic link sent"}
            </span>
          </Button>
        ) : null}

        {state === "connecting" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignUpClick}
            aria-label="Awaiting wallet signature"
            aria-busy="true"
          >
            <ConnectingSpinner />
            <span>Awaiting signature…</span>
          </Button>
        ) : null}

        {state === "wrong-network" ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--destructive)] hover:text-[var(--destructive)]"
            onClick={() => wallet.switchNetwork()}
            aria-label={`Switch network from ${chainName ?? "current chain"}`}
          >
            <Icon.Warning aria-hidden />
            <span>Switch network</span>
            {chainName ? (
              <span className="ml-1 font-mono text-[10px] uppercase tracking-wider opacity-80">
                {chainName}
              </span>
            ) : null}
          </Button>
        ) : null}

        {state === "no-nft-pass" ? (
          <Button asChild variant="ghost" size="sm">
            <a href="#nft-pass" aria-label="Phase 4 NFT pass required">
              <Icon.Unauthorised aria-hidden />
              <span>Pass required</span>
            </a>
          </Button>
        ) : null}

        {state === "connected" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-11 rounded-full px-3 hover:bg-[var(--muted)]/50"
                aria-label={`Wallet menu for ${truncated}`}
              >
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--success)]"
                />
                <span className="font-mono text-xs">{truncated}</span>
                <Icon.Caret.Down aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[14rem]">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  {chainName ?? "Ethereum"}
                </span>
                <span className="font-mono text-xs text-[var(--foreground)]">
                  {truncated}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  if (
                    address &&
                    typeof navigator !== "undefined" &&
                    navigator.clipboard
                  ) {
                    void navigator.clipboard.writeText(address);
                  }
                }}
              >
                <Icon.Copy aria-hidden />
                <span>Copy address</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={address ? `${ETHERSCAN_BASE}${address}` : "#"}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon.External aria-hidden />
                  <span>View on Etherscan</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <TransitionLink href="/account">
                  <Icon.Settings aria-hidden />
                  <span>Account</span>
                </TransitionLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => {
                  // ThemeToggle owns the actual switch; keep the menu open and
                  // let its own button handle the click. Preventing the default
                  // close avoids a flicker between the menu collapsing and the
                  // theme actually flipping.
                  event.preventDefault();
                }}
                className="p-0"
              >
                <div className="flex w-full items-center justify-between px-2 py-1.5">
                  <span className="text-sm">Theme</span>
                  <ThemeToggle />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleDisconnect}>
                <Icon.Disconnect aria-hidden />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <EmailSignupModal
        open={modalOpen}
        state={modalState}
        email={email}
        onClose={handleClose}
        onSubmit={handleSubmitEmail}
      />
    </>
  );
}

/** Minimal CSS spinner — drives the navbar "Awaiting signature" pill.
 *  Mirrors the modal's spinner; honours `prefers-reduced-motion` via
 *  Tailwind's `motion-reduce:` utility. */
function ConnectingSpinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)] motion-reduce:animate-none"
    />
  );
}
