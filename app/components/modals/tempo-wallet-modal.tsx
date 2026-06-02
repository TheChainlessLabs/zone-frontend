"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { Icon } from "@/lib/icons";
import { truncateAddress } from "@/components/shell/WalletStateProvider";
import { ModalShell } from "./modal-shell";

export type TempoWalletState = "idle" | "connecting" | "connected" | "failed";

export interface TempoWalletModalProps {
  open: boolean;
  onClose: () => void;
  state: TempoWalletState;
  address?: string;
  errorMessage?: string;
  onCreateAccount?: () => void;
  onSignIn?: () => void;
}

export function TempoWalletModal({
  open,
  onClose,
  state,
  address,
  errorMessage = "Tempo Wallet could not complete the request. Try again.",
  onCreateAccount,
  onSignIn,
}: TempoWalletModalProps) {
  return (
    <ModalShell
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={titleFor(state)}
      description={descriptionFor(state)}
    >
      {state === "idle" ? (
        <div className="flex flex-col gap-3">
          <Button onClick={onCreateAccount} className="min-h-[44px] md:min-h-0">
            <Icon.Wallet aria-hidden />
            <span>Create Tempo account</span>
          </Button>
          <Button
            variant="outline"
            onClick={onSignIn}
            className="min-h-[44px] md:min-h-0"
          >
            <Icon.Sign aria-hidden />
            <span>Sign in with Tempo Wallet</span>
          </Button>
          <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
            Omega uses Tempo Wallet for the private-alpha testnet.
          </p>
        </div>
      ) : null}

      {state === "connecting" ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <Spinner />
          <Status state="awaiting-signature" label="Open Tempo Wallet" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Complete the request in Tempo Wallet.
          </p>
        </div>
      ) : null}

      {state === "connected" ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <Status state="connected" label="Tempo connected" />
          {address ? (
            <span className="font-mono text-sm tabular-nums text-[var(--foreground)]">
              {truncateAddress(address)}
            </span>
          ) : null}
          <Button
            variant="ghost"
            onClick={onClose}
            className="min-h-[44px] md:min-h-0"
          >
            Close
          </Button>
        </div>
      ) : null}

      {state === "failed" ? (
        <div className="flex flex-col gap-4">
          <Status state="failed" />
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            {errorMessage}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="min-h-[44px] md:min-h-0"
            >
              Cancel
            </Button>
            <Button onClick={onSignIn} className="min-h-[44px] md:min-h-0">
              Retry
            </Button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

function titleFor(state: TempoWalletState): string {
  switch (state) {
    case "idle":
      return "Tempo Wallet";
    case "connecting":
      return "Connecting";
    case "connected":
      return "Connected";
    case "failed":
      return "Connection failed";
  }
}

function descriptionFor(state: TempoWalletState): React.ReactNode {
  switch (state) {
    case "idle":
      return "Create or unlock the Tempo account used for Omega testnet trading.";
    case "connecting":
      return "Awaiting Tempo Wallet.";
    case "connected":
      return "Tempo account ready.";
    case "failed":
      return null;
  }
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)] motion-reduce:animate-none"
    />
  );
}
