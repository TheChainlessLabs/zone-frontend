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
