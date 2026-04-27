/**
 * Dev-only logger. All calls are no-ops in production builds.
 * Next.js dead-code-eliminates the console calls when NODE_ENV !== "development".
 */

const isDev = process.env.NODE_ENV === "development";

const COLORS: Record<string, string> = {
  nonce: "color: #6FA07F",        // institutional green
  order: "color: #D4A847",        // heritage amber (was cyan)
  wallet: "color: #C97B3A",       // burnt orange
  api: "color: #A78BFA",          // purple
  balance: "color: #C97266",      // institutional red
  signing: "color: #EC4899",      // pink
  registration: "color: #B0A89E", // warm secondary
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
