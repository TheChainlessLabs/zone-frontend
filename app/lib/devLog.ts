/**
 * Dev-only logger. All calls are no-ops in production builds.
 * Next.js dead-code-eliminates the console calls when NODE_ENV !== "development".
 */

const isDev = process.env.NODE_ENV === "development";

const COLORS: Record<string, string> = {
  nonce: "color: #4D8C57",        // matte success green
  order: "color: #3A6EA5",        // calm steel-blue accent
  wallet: "color: #B88746",       // matte amber
  api: "color: #A78BFA",          // purple
  balance: "color: #A85A5A",      // matte error red
  signing: "color: #22D3EE",      // precision-strong cyan (signing is the precision moment)
  registration: "color: #A1A1A1", // text-secondary neutral
};

export function devLog(tag: string, message: string, data?: unknown) {
  if (!isDev) return;
  const color = COLORS[tag] ?? "color: #888";
  if (data !== undefined) {
    console.log(`%c[${tag}] ${message}`, color, data);
  } else {
    console.log(`%c[${tag}] ${message}`, color);
  }
}

export function devWarn(tag: string, message: string, data?: unknown) {
  if (!isDev) return;
  if (data !== undefined) {
    console.warn(`[${tag}] ${message}`, data);
  } else {
    console.warn(`[${tag}] ${message}`);
  }
}

export function devError(tag: string, message: string, data?: unknown) {
  if (!isDev) return;
  if (data !== undefined) {
    console.error(`[${tag}] ${message}`, data);
  } else {
    console.error(`[${tag}] ${message}`);
  }
}
