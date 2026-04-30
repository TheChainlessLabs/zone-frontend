"use client";

/**
 * WalletStatus — composite right-rail of the production Navbar.
 *
 * Renders one of five branches based on `useWalletState()`:
 *
 *   disconnected   → outline "Connect Wallet" button
 *   connecting     → outline button with spinner + "Awaiting signature"
 *   wrong-network  → destructive "Switch network" CTA + warning glyph
 *   no-nft-pass    → outline "Pass required" link to onboarding info
 *   connected      → DropdownMenu with truncated address + chain dot
 *
 * Drives the `ConnectWalletModal` end-to-end:
 *   click Connect Wallet → modal opens at `state="idle"`
 *   pick a connector → wallet.connect() → modal flips to `connecting`
 *   wallet provider mock resolves after 1500ms → modal at `connected`
 *   user clicks Disconnect inside the modal (or "Sign out" / "Wallet
 *   details" in the dropdown) → wallet.disconnect() → state resets
 *
 * Real wagmi wiring lands in M6 — for now `wallet.connect()` is a mocked
 * delay in WalletStateProvider. The same context shape carries forward.
 *
 * Copy follows omega-docs/03-brand/messaging.md (status lexicon).
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
  type WalletState,
} from "@/components/shell/WalletStateProvider";
import {
  ConnectWalletModal,
  type ConnectWalletState,
} from "@/components/modals";

const ETHERSCAN_BASE = "https://etherscan.io/address/";

const CONNECTOR_DISPLAY: Record<string, string> = {
  metamask: "MetaMask",
  walletconnect: "WalletConnect",
  coinbase: "Coinbase Wallet",
  injected: "Browser wallet",
};

/** Map the wallet-state machine to the modal's state machine.
 *  Returns `null` when the modal has nothing to display (e.g. wrong-network
 *  is handled by the navbar button + WrongNetworkBanner, not the modal). */
function modalStateFor(walletState: WalletState): ConnectWalletState | null {
  if (walletState === "connecting") return "connecting";
  if (walletState === "connected") return "connected";
  if (walletState === "no-nft-pass") return "no-nft-pass";
  return null;
}

export function WalletStatus() {
  const wallet = useWalletState();
  const { state, address, chainName, connector } = wallet;
  const [openRequested, setOpenRequested] = React.useState(false);

  // Auto-open the modal whenever the wallet enters a state the modal owns
  // (connecting / connected after click). Closes follow the same source of
  // truth: the user explicitly closes, or the wallet returns to a state the
  // modal has nothing to show for.
  const derivedModalState = modalStateFor(state);
  const modalOpen = openRequested || state === "connecting";
  const modalState: ConnectWalletState =
    derivedModalState ?? "idle";

  const handleConnectClick = React.useCallback(() => {
    setOpenRequested(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpenRequested(false);
  }, []);

  const handleSelectConnector = React.useCallback(
    (id: string) => {
      const display = CONNECTOR_DISPLAY[id] ?? id;
      wallet.connect(display);
    },
    [wallet]
  );

  const handleDisconnect = React.useCallback(() => {
    wallet.disconnect();
    setOpenRequested(false);
  }, [wallet]);

  const handleOpenWalletDetails = React.useCallback(() => {
    setOpenRequested(true);
  }, []);

  const truncated = address ? truncateAddress(address) : "—";

  return (
    <>
      {state === "disconnected" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnectClick}
          aria-label="Connect wallet"
        >
          <Icon.Wallet aria-hidden />
          <span>Connect Wallet</span>
        </Button>
      ) : null}

      {state === "connecting" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnectClick}
          aria-label="Awaiting wallet signature"
          aria-busy="true"
        >
          <ConnectingSpinner />
          <span>Awaiting signature…</span>
        </Button>
      ) : null}

      {state === "wrong-network" ? (
        <Button
          variant="destructive"
          size="sm"
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
        <Button asChild variant="outline" size="sm">
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
              variant="outline"
              size="sm"
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
            <DropdownMenuItem onSelect={handleOpenWalletDetails}>
              <Icon.Wallet aria-hidden />
              <span>Wallet details</span>
            </DropdownMenuItem>
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

      <ConnectWalletModal
        open={modalOpen}
        state={modalState}
        activeConnector={connector}
        address={address ? truncated : undefined}
        onClose={handleClose}
        onSelectConnector={handleSelectConnector}
        onDisconnect={state === "connected" ? handleDisconnect : undefined}
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
