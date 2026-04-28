"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ModalShell } from "./modal-shell";

/**
 * ConnectWalletModal — Phase-4 alpha entry point.
 *
 * States:
 *   idle         — connector picker
 *   connecting   — wallet signature pending
 *   connected    — success, auto-closes after 1.5s
 *   failed       — wallet rejected, retry / cancel
 *   no-nft-pass  — Phase-4 NFT pass missing (Decision #12)
 *
 * Voice rules from omega-docs/03-brand/messaging.md:
 *   - "Sign" / "Awaiting signature" — never "approve" / "authorise"
 *   - "Wallet rejected the signature." — direct, what + what-next
 *   - No exclamation, no marketing voice, no emoji.
 */
export type ConnectWalletState =
  | "idle"
  | "connecting"
  | "connected"
  | "failed"
  | "no-nft-pass";

export interface ConnectWalletModalProps {
  open: boolean;
  onClose: () => void;
  state: ConnectWalletState;
  /** Connector being awaited in `connecting` / shown in `connected`. */
  activeConnector?: string;
  /** Truncated wallet address for the connected state. */
  address?: string;
  /** Optional override for the failure copy. */
  errorMessage?: string;
  onSelectConnector?: (connector: ConnectorId) => void;
  onRetry?: () => void;
  /**
   * Optional disconnect handler. When provided AND `state === "connected"`,
   * the modal renders a Disconnect button below the success badge and
   * suppresses the 1.5s auto-close — the user closes manually or
   * disconnects from the popup itself.
   */
  onDisconnect?: () => void;
}

type ConnectorId = "metamask" | "walletconnect" | "coinbase" | "injected";

interface ConnectorSpec {
  id: ConnectorId;
  name: string;
  /** Tailwind text colour for the avatar letter. */
  accent: string;
}

const CONNECTORS: ConnectorSpec[] = [
  { id: "metamask", name: "MetaMask", accent: "text-[#f6851b]" },
  { id: "walletconnect", name: "WalletConnect", accent: "text-[#3b82f6]" },
  { id: "coinbase", name: "Coinbase Wallet", accent: "text-[#1652f0]" },
  { id: "injected", name: "Browser wallet", accent: "text-[var(--foreground)]" },
];

export function ConnectWalletModal({
  open,
  onClose,
  state,
  activeConnector,
  address = "0x7a25…E48f",
  errorMessage = "Wallet rejected the signature. Try again or check your wallet.",
  onSelectConnector,
  onRetry,
  onDisconnect,
}: ConnectWalletModalProps) {
  // Auto-close on success — matches the spec's 1.5s window. Suppressed
  // when an `onDisconnect` handler is supplied so the user can read and
  // act on the wallet popup (Disconnect / Close) manually.
  React.useEffect(() => {
    if (!open || state !== "connected" || onDisconnect) return;
    const id = window.setTimeout(onClose, 1500);
    return () => window.clearTimeout(id);
  }, [open, state, onClose, onDisconnect]);

  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={titleFor(state)}
      description={descriptionFor(state, activeConnector)}
    >
      {state === "idle" ? (
        <div className="flex flex-col gap-2">
          {CONNECTORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectConnector?.(c.id)}
              className="group flex h-12 items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-transparent px-3 text-left text-sm transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-3">
                <ConnectorAvatar name={c.name} accent={c.accent} />
                <span className="font-medium">{c.name}</span>
              </span>
              <Icon.Caret.Right
                size={14}
                aria-hidden
                className="text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5"
              />
            </button>
          ))}
          <p className="mt-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
            By connecting, you agree to the Terms.
          </p>
        </div>
      ) : null}

      {state === "connecting" ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <Spinner />
          <Status state="awaiting-signature" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Awaiting signature in {activeConnector ?? "your wallet"}.
          </p>
        </div>
      ) : null}

      {state === "connected" ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <Status state="connected" />
          <span className="font-mono text-sm tabular-nums text-[var(--foreground)]">
            {address}
          </span>
          {onDisconnect ? (
            <div className="mt-2 flex w-full items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="min-h-[44px] md:min-h-0"
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onDisconnect();
                  onClose();
                }}
                aria-label="Disconnect wallet"
                className="min-h-[44px] md:min-h-0"
              >
                <Icon.Disconnect aria-hidden />
                <span>Disconnect</span>
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {state === "failed" ? (
        <div className="flex flex-col gap-4">
          <Status state="failed" />
          <p className="text-sm text-[var(--foreground)]">{errorMessage}</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="min-h-[44px] md:min-h-0"
            >
              Cancel
            </Button>
            <Button onClick={onRetry} className="min-h-[44px] md:min-h-0">
              Retry
            </Button>
          </div>
        </div>
      ) : null}

      {state === "no-nft-pass" ? (
        <div className="flex flex-col gap-4">
          <Status state="pending" label="Alpha pass required" />
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            Omega is in private alpha. Connect a wallet that holds an Omega
            alpha pass, or join the waitlist to receive one.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="min-h-[44px] md:min-h-0"
            >
              Close
            </Button>
            <Button asChild className="min-h-[44px] md:min-h-0">
              <a href="#nft-pass">Join waitlist</a>
            </Button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

function titleFor(state: ConnectWalletState): string {
  switch (state) {
    case "idle":
      return "Connect wallet";
    case "connecting":
      return "Connecting";
    case "connected":
      return "Connected";
    case "failed":
      return "Connection failed";
    case "no-nft-pass":
      return "Alpha access only";
  }
}

function descriptionFor(
  state: ConnectWalletState,
  connector?: string
): React.ReactNode {
  switch (state) {
    case "idle":
      return "Sign in with your wallet to access the Omega trading desk.";
    case "connecting":
      return connector
        ? `Confirm the request in ${connector}.`
        : "Confirm the request in your wallet.";
    case "connected":
      return "You're signed in.";
    case "failed":
      return null;
    case "no-nft-pass":
      return "Phase-4 alpha pass required.";
  }
}

function ConnectorAvatar({
  name,
  accent,
}: {
  name: string;
  accent: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)] font-mono text-sm font-medium",
        accent
      )}
    >
      {name.charAt(0)}
    </span>
  );
}

/** Minimal CSS spinner — keeps the modal bundle small and respects reduced
 *  motion via the `motion-reduce:` Tailwind utility. */
function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)] motion-reduce:animate-none"
    />
  );
}
