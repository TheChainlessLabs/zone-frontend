"use client";

import * as React from "react";

import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { BuiltFor, WhyOmega } from "@/components/landing/landing-sections";
import {
  LandingFooter,
  LandingRequestAccess,
} from "@/components/landing/landing-request-access";
import { OrderScrollStory } from "@/components/landing/order-scroll-story";

// Peak dot-grid opacity once fully scrolled past the hero — matches the
// shared `--route-dot-grid-opacity` used elsewhere (globals.css).
const DOT_GRID_PEAK = 0.7;

// Landing page (app.jsx App). Section order: sticky nav → hero → mechanism
// (pinned scroll story) → Why Omega → Built for → Request access → footer.
// Owns the two scroll behaviours from the kit: the sticky nav backdrop turns
// solid past the hero top, and the ambient dot-grid fades in (hidden in the
// hero, full by the mechanism) by writing the shared dot-grid opacity var.
export function LandingPage() {
  const [navSolid, setNavSolid] = React.useState(false);

  React.useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The landing starts with the dot-grid hidden (the hero owns the frame),
    // then fades it in. Restore the route default on unmount.
    const root = document.documentElement;
    const previousDots = root.style.getPropertyValue("--route-dot-grid-opacity");

    const onScroll = () => {
      const vh = window.innerHeight || 1;
      const t = Math.min(1, Math.max(0, (window.scrollY - vh * 0.45) / (vh * 0.5)));
      root.style.setProperty(
        "--route-dot-grid-opacity",
        (DOT_GRID_PEAK * (reduced ? 1 : t)).toFixed(3),
      );
      setNavSolid(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (previousDots) {
        root.style.setProperty("--route-dot-grid-opacity", previousDots);
      } else {
        root.style.removeProperty("--route-dot-grid-opacity");
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <LandingNav solid={navSolid} />
      <LandingHero />
      <OrderScrollStory />
      <WhyOmega />
      <BuiltFor />
      <LandingRequestAccess />
      <LandingFooter />
    </main>
  );
}
