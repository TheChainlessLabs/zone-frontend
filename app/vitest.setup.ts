// Vitest setup — ensure jsdom exposes a spec-compliant Web Storage API.
//
// Under jsdom 26 + vitest 4, `window.localStorage` can surface without working
// mutator methods (`removeItem`/`setItem`), which throws
// `window.localStorage.removeItem is not a function` and crashes any code that
// persists to storage on mount (e.g. WalletStateProvider, omega-zone
// auth-token). When the environment's Storage is missing or incomplete, install
// a minimal in-memory implementation. This is test-harness plumbing only — it
// does not touch product behaviour.

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  } as Storage;
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  const existing = (globalThis as { [k: string]: unknown })[name] as
    | Storage
    | undefined;
  if (!existing || typeof existing.removeItem !== "function") {
    Object.defineProperty(globalThis, name, {
      value: createMemoryStorage(),
      writable: true,
      configurable: true,
    });
  }
}

// jsdom does not implement `window.matchMedia`. The Tempo Wallet connector's
// iframe dialog reads it (via `getReferrer()` → color-scheme detection) the
// moment the wagmi provider instantiates the connector, so any component test
// that mounts the app's WagmiProvider throws `window.matchMedia is not a
// function` without this. Install a minimal always-"no-match" stub. Harness
// plumbing only — it does not affect product behaviour.
if (
  typeof window !== "undefined" &&
  typeof window.matchMedia !== "function"
) {
  Object.defineProperty(window, "matchMedia", {
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
    writable: true,
    configurable: true,
  });
}

// jsdom does not implement `IntersectionObserver`. Scroll-reveal hooks and
// components use it for fade-in animations on scroll. Install a minimal
// no-op stub that immediately calls the callback as if all elements are
// intersecting. Harness plumbing only — does not affect product behaviour.
if (typeof window !== "undefined" && typeof IntersectionObserver === "undefined") {
  (globalThis as any).IntersectionObserver = class IntersectionObserver {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() {
      // No-op: immediately signal that element is intersecting
      const target = document.createElement("div");
      const rect = new DOMRect();
      const entry = {
        isIntersecting: true,
        target,
        boundingClientRect: rect,
        intersectionRatio: 1,
        intersectionRect: rect,
        rootBounds: rect,
        time: Date.now(),
      } as unknown as IntersectionObserverEntry;
      this.callback([entry], this as any);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}
