/**
 * Production stub for testHooks.ts.
 * Webpack aliases this in place of the real testHooks in production client
 * builds when NEXT_PUBLIC_OMEGA_E2E_TEST is not "true". See next.config.mjs.
 */
import type { Config } from "wagmi";

export const isTestHooksEnabled = false;

export function initTestHooks(_config: Config): void {
  // no-op in production
}

export function TestStoreMirror(): null {
  return null;
}
