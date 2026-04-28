"use client";

/**
 * WalletStatus — composite right-rail of the production Navbar.
 *
 * Renders one of four branches based on `useWalletState()`:
 *
 *   disconnected   → outline "Connect Wallet" button
 *   wrong-network  → destructive "Switch network" CTA + warning glyph
 *   no-nft-pass    → outline "Pass required" link to onboarding info
 *   connected      → DropdownMenu with truncated address + chain dot
 *
 * Copy follows omega-docs/03-brand/messaging.md (status lexicon).
 *
 * Real wagmi wiring lands in M6 — for now the click handlers are no-ops
 * and the address/chain are mocked through WalletStateProvider.
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
import {
  truncateAddress,
  useWalletState,
} from "@/components/shell/WalletStateProvider";

const ETHERSCAN_BASE = "https://etherscan.io/address/";

export function WalletStatus() {
  const { state, address, chainName } = useWalletState();

  if (state === "disconnected") {
    return (
      <Button
        variant="outline"
        size="sm"
        // Connect modal lands in M6 — the button is wired but inert here.
        onClick={() => {}}
        aria-label="Connect wallet"
      >
        <Icon.Wallet aria-hidden />
        <span>Connect Wallet</span>
      </Button>
    );
  }

  if (state === "wrong-network") {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => {}}
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
    );
  }

  if (state === "no-nft-pass") {
    return (
      <Button asChild variant="outline" size="sm">
        <a href="#nft-pass" aria-label="Phase 4 NFT pass required">
          <Icon.Unauthorised aria-hidden />
          <span>Pass required</span>
        </a>
      </Button>
    );
  }

  // connected
  const truncated = address ? truncateAddress(address) : "—";
  return (
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
        <DropdownMenuItem
          onSelect={() => {
            if (address && typeof navigator !== "undefined" && navigator.clipboard) {
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
          <a href="/account">
            <Icon.Settings aria-hidden />
            <span>Account</span>
          </a>
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
        <DropdownMenuItem onSelect={() => {}}>
          <Icon.Disconnect aria-hidden />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
