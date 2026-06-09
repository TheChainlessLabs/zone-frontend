"use client";

/**
 * (app) route group layout — the persistent production shell.
 *
 * Rendering the AppShell here (rather than inside each page) keeps the chrome
 * — Navbar, MobileTabBar, wrong-network banner — mounted across navigations
 * between /trade, /portfolio, /batches and /account. That persistence is what
 * lets the Navbar's active-tab indicator slide between tabs (the same way the
 * order-mode toggle slides within a page); when the shell remounted per route
 * the indicator could only ever snap.
 *
 * `auth` is derived from the route: /batches is a public surface (omega-docs#5)
 * and renders regardless of wallet state; the rest gate on the NFT pass.
 * /brand and /system live outside this group and keep their ReviewNav.
 */

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";

export default function AppGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const auth = !pathname.startsWith("/batches");
  return <AppShell auth={auth}>{children}</AppShell>;
}
