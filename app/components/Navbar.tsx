"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import WalletModal from "./WalletModal";

const navLinks = [
  { label: "Trade", href: "/trade" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Account", href: "/account" },
  { label: "Funding", href: "/funding" },
  { label: "Explorer", href: "/explorer" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <>
      <header className="h-[48px] bg-bg-surface border-b border-border flex items-center px-4">
        <Link href="/" className="text-body-sm font-semibold tracking-[0.08em]">
          OMEGA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-8">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3 h-[32px] flex items-center text-body-sm rounded-md transition-fast ${
                  isActive
                    ? "text-text-primary bg-bg-elevated"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Connect Wallet */}
          <button
            onClick={() => setWalletOpen(true)}
            className="hidden md:flex items-center h-[32px] px-4 text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast"
          >
            Connect Wallet
          </button>

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
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block py-2 text-body-sm text-text-secondary hover:text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                setWalletOpen(true);
              }}
              className="mt-3 w-full h-[40px] text-body-sm font-medium border border-border rounded-md text-text-primary"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </header>

      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
}
