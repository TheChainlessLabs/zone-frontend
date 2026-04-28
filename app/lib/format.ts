/**
 * Display formatters used across explorer + portfolio surfaces.
 *
 * Centralised so the rules ("truncate hashes as 0x1234…abcd", "show relative
 * time but tooltip the full ISO") are applied identically everywhere. The
 * locale is `en-US` for stable visual-regression snapshots — production
 * localisation lands in M7.
 */

/** Truncate a hex string (address, tx hash, root) to `0x1234…abcd`. */
export function truncateHash(hex: string, lead = 6, tail = 4): string {
  if (!hex.startsWith("0x")) return hex;
  if (hex.length <= lead + tail + 1) return hex;
  return `${hex.slice(0, lead)}…${hex.slice(-tail)}`;
}

/**
 * Relative time, terse English. "30s ago", "5m ago", "2h ago", "3d ago".
 *
 * Falls back to the absolute date for anything older than a week so the user
 * never sees "37d ago" — at that point the calendar reading is more useful.
 * `now` is injectable for deterministic tests.
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  if (Number.isNaN(diffMs)) return "—";

  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return then.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Full timestamp in YYYY-MM-DD HH:mm:ss UTC for tooltip overlays. */
export function formatAbsoluteTime(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;
  const yyyy = then.getUTCFullYear();
  const mm = String(then.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(then.getUTCDate()).padStart(2, "0");
  const hh = String(then.getUTCHours()).padStart(2, "0");
  const mi = String(then.getUTCMinutes()).padStart(2, "0");
  const ss = String(then.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} UTC`;
}

/**
 * Cluster the integer part of a number with thousands separators. Decimal
 * portion is preserved as-typed so fixed-point precision survives the round-
 * trip.
 */
export function formatThousands(value: string): string {
  const [intPart, fracPart] = value.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fracPart ? `${grouped}.${fracPart}` : grouped;
}

/**
 * USD-equivalent volume for a batch. The fixture data is in base-token units
 * (e.g. "5000.00" USDC). For wireframe purposes we treat each fill as USD-1:1
 * — the real conversion lands in M6 against the price oracle.
 */
export function formatUSD(value: string): string {
  const [intPart, fracPart = ""] = value.split(".");
  const cents = (fracPart + "00").slice(0, 2);
  return `$${formatThousands(intPart)}.${cents}`;
}
