/**
 * Dev-only logger. All calls are no-ops in production builds.
 * Next.js dead-code-eliminates the console calls when NODE_ENV !== "development".
 */

const isDev = process.env.NODE_ENV === "development";

const COLORS: Record<string, string> = {
  nonce: "color: #22C55E",        // green
  order: "color: #0EA5E9",        // cyan
  wallet: "color: #EAB308",       // yellow
  api: "color: #A78BFA",          // purple
  balance: "color: #F97316",      // orange
  signing: "color: #EC4899",      // pink
  registration: "color: #14B8A6", // teal
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
