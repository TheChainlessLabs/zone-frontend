"use client";

import { useHashHighlight } from "@/lib/hooks/use-hash-highlight";

/**
 * HashHighlightMount — invisible client mount point for the
 * `useHashHighlight` hook (M5.5 — #228). Lives inside the root layout's
 * Suspense boundary so every route inherits the deep-link ring
 * choreography without each page wiring it up itself.
 *
 * The hook itself does the work; this component only exists because the
 * root layout is a server component and `usePathname()` requires a
 * client context.
 */
export function HashHighlightMount() {
  useHashHighlight();
  return null;
}
