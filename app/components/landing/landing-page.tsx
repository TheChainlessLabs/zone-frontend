"use client";

import * as React from "react";

import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";

// The public home route is deliberately a single identity frame. Longer-form
// explanation and access qualification live under Research.
export function LandingPage() {
  const [navSolid, setNavSolid] = React.useState(false);

  React.useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The landing starts with the dot-grid hidden (the hero owns the frame),
    // then fades it in. Restore the route default on unmount.
    const root = document.documentElement;

    const onScroll = () => {
      const vh = window.innerHeight || 1;
      const t = Math.min(1, Math.max(0, (window.scrollY - vh * 0.45) / (vh * 0.5)));
      // Drive the landing-local dot-grid (globals.css `.lp-dotgrid`): hidden in
      // the hero, full by the mechanism. 0 → 1; the CSS scales it to the kit's
      // 0.5 peak. Reduced motion shows it fully (no scroll-fade), like the kit.
      root.style.setProperty("--landing-dots", (reduced ? 1 : t).toFixed(3));
      setNavSolid(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.style.removeProperty("--landing-dots");
    };
  }, []);

  return (
    <main className="relative isolate min-h-[100dvh] text-[var(--foreground)]">
      {/* Ambient dot-grid — a dedicated fixed layer at z-0 (the shared global
          body::before is occluded by the opaque canvas and never shows). Sits
          behind the z-1 content wrapper, matching the kit's body::before. */}
      <div aria-hidden className="lp-dotgrid" />
      <div className="lp-content relative z-[1]">
        <LandingNav solid={navSolid} />
        <LandingHero />
      </div>
    </main>
  );
}
