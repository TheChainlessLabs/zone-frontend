/**
 * Test-only globals exposed to Playwright specs.
 *
 * Gated by the webpack alias in next.config.mjs: only loaded when
 * NEXT_PUBLIC_OMEGA_E2E_TEST=true at build time. Every import site resolves
 * to testHooksStub.ts in a production build, so this file's contents are
 * dead-coded out of the client bundle.
 *
 * Mirrors the devWallet / devWalletStub pattern elsewhere in this repo.
 *
 * All the side-effect work lives inside TestStoreMirror's useEffect rather
 * than in a top-level init function. Webpack's minifier aggressively strips
 * `globalThis.* = value` writes whose targets aren't read back in the
 * bundle, but it preserves React effect callbacks.
 */
import { useEffect } from "react";
import type { Config } from "wagmi";
import { useMarket } from "@/lib/hooks/useMarket";
import { useWallet } from "@/lib/wallet";

type TestStore = {
  wallet?: ReturnType<typeof useWallet>;
  market?: ReturnType<typeof useMarket>;
};

declare global {
  // eslint-disable-next-line no-var
  var __TEST_WAGMI_CONFIG__: Config | undefined;
  // eslint-disable-next-line no-var
  var __TEST_STORE__: TestStore | undefined;
  // eslint-disable-next-line no-var
  var __TEST_SKIP_ONBOARDING: boolean | undefined;
}

export const isTestHooksEnabled = true;

/**
 * Invoked once at module init from Providers.tsx; stashes the wagmi config
 * so TestStoreMirror can expose it on window after render.
 */
let capturedConfig: Config | undefined;

export function initTestHooks(config: Config): void {
  capturedConfig = config;
}

/**
 * React component that publishes wallet + market + wagmi config onto
 * window.__TEST_* on every render. Renders nothing.
 *
 * Placed inside the Providers tree so it can call the context hooks. In
 * production builds the webpack alias replaces it with the stub's no-op
 * version, so it drops out of the client bundle.
 */
export function TestStoreMirror(): null {
  const wallet = useWallet();
  const market = useMarket();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Wagmi config — stable reference across renders.
    if (capturedConfig !== undefined) {
      globalThis.__TEST_WAGMI_CONFIG__ = capturedConfig;
    }

    // Context state mirror.
    const store: TestStore = globalThis.__TEST_STORE__ ?? {};
    store.wallet = wallet;
    store.market = market;
    globalThis.__TEST_STORE__ = store;

    // Onboarding bypass: URL query param ?__test_skip_onboarding=1 OR a
    // pre-existing global (e.g. set via page.addInitScript before React
    // hydrates).
    const url = new URL(window.location.href);
    const urlFlag = url.searchParams.get("__test_skip_onboarding") === "1";
    globalThis.__TEST_SKIP_ONBOARDING =
      globalThis.__TEST_SKIP_ONBOARDING === true || urlFlag;
  }, [wallet, market]);

  return null;
}
