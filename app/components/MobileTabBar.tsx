"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Wallet, Search } from "lucide-react";

const tabs = [
  { label: "Trade", href: "/trade", icon: TrendingUp },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "Explorer", href: "/explorer", icon: Search },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-bg-surface border-t border-border flex items-center justify-around z-40 pb-safe">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-col items-center gap-1 py-2 px-4 ${
              isActive ? "text-accent" : "text-text-muted"
            }`}
          >
            <Icon size={20} />
            <span className="text-[11px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
