"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { useWallet } from "@/lib/wallet";
import WalletModal from "./WalletModal";
import WalletDropdown from "./WalletDropdown";
import NotificationCenter from "./NotificationCenter";

const explorerEnabled = process.env.NEXT_PUBLIC_EXPLORER_ENABLED === "true";

const navLinks = [
  { label: "Trade", href: "/trade" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Account", href: "/account" },
  { label: "Funding", href: "/funding" },
  ...(explorerEnabled ? [{ label: "Explorer", href: "/explorer" }] : []),
];

/**
 * Navbar — V1 Institutional Calm.
 *
 * Quiet supportive chrome, never competing with the order form. The
 * Deposit button moved out of the navbar (it lives inside the wallet
 * dropdown and on /portfolio + /funding) because nav-bar real estate
 * shouldn't carry the loudest CTA on the page. Active nav links use
 * a 1.5 px accent underline rather than a coloured pill, so the eye
 * stops at the data plane, not the chrome. Mobile sheds the
 * hamburger entirely — `MobileTabBar` already handles navigation
 * at the bottom of the viewport.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, isSupportedChain } = useWallet();
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <>
      <header className="h-[56px] bg-bg-base border-b border-border-subtle flex items-center px-4 md:px-8">
        {/* Wordmark */}
        <Link
          href="/trade"
          className="font-mono text-[13px] font-semibold tracking-[0.18em] text-text-primary"
        >
          OMEGA
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center ml-10 h-full"
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative h-full px-4 inline-flex items-center text-body-sm transition-fast ${
                  isActive
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    aria-hidden
                    className="absolute left-4 right-4 bottom-0 h-[1.5px] rounded-full bg-accent"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <NotificationCenter />
          </div>

          {isConnected && address ? (
            <WalletDropdown
              address={address}
              isSupportedChain={isSupportedChain}
            />
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              onClick={() => setWalletOpen(true)}
              className="h-[32px] px-4 text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast"
            >
              Connect
            </motion.button>
          )}
        </div>
      </header>

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
}
