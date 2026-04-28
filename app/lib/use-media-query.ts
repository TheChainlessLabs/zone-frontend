"use client";

import * as React from "react";

/**
 * useMediaQuery — minimal SSR-safe matchMedia hook.
 *
 * Used by the modal components to swap between desktop Dialog (centered) and
 * mobile Drawer (vaul bottom-sheet) at the Tailwind `md` breakpoint (768px).
 *
 * SSR returns `false` to keep first paint deterministic — the desktop Dialog
 * is the safe default. The first effect tick reconciles to the real value.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();

    // Modern API only. Both Safari 14+ and all evergreen browsers support
    // addEventListener on MediaQueryList.
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Convenience: true when viewport is at least the Tailwind `md` breakpoint. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}
