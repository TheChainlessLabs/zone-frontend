"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { useToast } from "@/lib/useToast";
import WalletModal from "./WalletModal";
import DepositModal from "./DepositModal";
import WalletDropdown from "./WalletDropdown";

const navLinks = [
  { label: "Trade", href: "/trade" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Explorer", href: "/explorer" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { addToast } = useToast();
  const { address, expectedChainName, isConnected, isSupportedChain } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  const handleDepositClick = () => {
    if (!isConnected) {
      setWalletOpen(true);
      return;
    }

    if (!isSupportedChain) {
      addToast(
        "error",
        "Unsupported Network",
        `Switch to ${expectedChainName} before using wallet-funded actions.`
      );
      return;
    }

    setDepositOpen(true);
  };

  return (
    <>
      <header className="h-[48px] bg-bg-base border-b border-border-subtle flex items-center px-4 md:px-[60px]">
        <Link
          href="/"
          className="text-[18px] font-bold tracking-[-0.02em] text-text-primary"
        >
          OMEGA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center ml-8">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3 py-1.5 text-body-sm rounded-md transition-fast ${
                  isActive
                    ? "text-accent bg-accent-subtle font-medium"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Deposit button */}
          <button
            onClick={handleDepositClick}
            className="hidden md:flex items-center h-[30px] px-4 text-body-sm font-medium rounded-md bg-accent text-text-inverse hover:bg-accent-hover transition-fast"
          >
            Deposit
          </button>

          {/* Wallet / Connect */}
          {isConnected && address ? (
            <WalletDropdown
              address={address}
              isSupportedChain={isSupportedChain}
            />
          ) : (
            <button
              onClick={() => setWalletOpen(true)}
              className="hidden md:flex items-center h-[30px] px-4 text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast"
            >
              Connect Wallet
            </button>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-text-secondary -mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-[48px] left-0 right-0 bg-bg-surface border-b border-border p-4 md:hidden z-50">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`block py-3 min-h-[44px] flex items-center text-body-sm ${
                    isActive
                      ? "text-accent font-medium"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleDepositClick();
                }}
                className="w-full h-[40px] text-body-sm font-medium rounded-md bg-accent text-text-inverse"
              >
                Deposit
              </button>
              {!isConnected ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setWalletOpen(true);
                  }}
                  className="w-full h-[40px] text-body-sm font-medium border border-border rounded-md text-text-primary"
                >
                  Connect Wallet
                </button>
              ) : !isSupportedChain ? (
                <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-body-sm text-warning">
                  Switch to {expectedChainName} to trade.
                </div>
              ) : null}
            </div>
          </div>
        )}
      </header>

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
    </>
  );
}
