"use client";

import * as React from "react";

/**
 * useReducedMotion — SSR-safe `prefers-reduced-motion: reduce` hook.
 *
 * Mirrors the behavioural contract of `motion/react`'s hook of the same name
 * but with no JS dependency: a thin wrapper over `window.matchMedia`. Returns
 * `false` during server render (no `window`) and reconciles to the real value
 * on the first client effect tick.
 *
 * Surfaces should treat a `true` result as a hard request to skip non-essential
 * motion (snap to end-state, drop transitions). Decorative-only motion should
 * also rely on the global `prefers-reduced-motion` carve-out applied via
 * `app/globals.css` (M5.1) — this hook is for cases where JS branches on the
 * preference (e.g. toggling a CSS class vs. omitting it entirely).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mql.matches);
    update();

    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return reduced;
}
