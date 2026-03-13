"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import WalletModal from "./WalletModal";
import DepositModal from "./DepositModal";

const navLinks = [
  { label: "Trade", href: "/trade" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Explorer", href: "/explorer" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [connected, setConnected] = useState(true);

  const walletAddress = "0x7a3f...b2c1";

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
            onClick={() => setDepositOpen(true)}
            className="hidden md:flex items-center h-[30px] px-4 text-body-sm font-medium rounded-md bg-accent text-text-inverse hover:bg-accent-hover transition-fast"
          >
            Deposit
          </button>

          {/* Wallet / Connect */}
          {connected ? (
            <button
              onClick={() => setWalletOpen(true)}
              className="hidden md:flex items-center gap-2 h-[30px] px-4 text-body-sm rounded-md border border-border-subtle"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="font-mono text-[13px] text-text-secondary">
                {walletAddress}
              </span>
            </button>
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
            className="md:hidden text-text-secondary"
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
                  className={`block py-2.5 text-body-sm ${
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
                  setDepositOpen(true);
                }}
                className="w-full h-[40px] text-body-sm font-medium rounded-md bg-accent text-text-inverse"
              >
                Deposit
              </button>
              {!connected && (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setWalletOpen(true);
                  }}
                  className="w-full h-[40px] text-body-sm font-medium border border-border rounded-md text-text-primary"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
    </>
  );
}
