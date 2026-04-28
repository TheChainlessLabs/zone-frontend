"use client";

import { useSearchParams } from "next/navigation";

import type { PageState } from "./types";

const VALID_STATES: PageState[] = [
  "default",
  "empty",
  "loading",
  "error",
  "skeleton",
  "disconnected",
  "wrong-network",
];

/**
 * Resolve the current page state from `?state=…`.
 *
 * Pages opt in by reading this hook and indexing into their fixture map:
 *
 *   const state = usePageState();
 *   const fixture = portfolioFixtures[state] ?? portfolioFixtures.default;
 *
 * Unknown / missing values fall back to `defaultState` (which itself
 * defaults to `"default"`). This is intentionally permissive — the
 * worst case at review time is "I forgot to type the state name and
 * got the happy path".
 *
 * In M6 this hook is replaced by real data wiring; the `?state=` toggle
 * remains as a developer affordance for fault-injection.
 */
export function usePageState(
  defaultState: PageState = "default"
): PageState {
  const params = useSearchParams();
  const raw = params.get("state");
  if (raw && (VALID_STATES as string[]).includes(raw)) {
    return raw as PageState;
  }
  return defaultState;
}

export { VALID_STATES };
