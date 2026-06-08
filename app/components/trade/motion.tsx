"use client";

/**
 * Trade motion layer — ported from the design-kit `Motion.jsx`.
 *
 *   • NumberTicker   — rolling-digit mono display that flashes up/down on change
 *   • useLiveMidpoint — a midpoint that drifts ±1–2 pips, giving the data a pulse
 *   • MatchToast     — the settlement moment (Matched → Settled → Proven)
 *
 * All motion is composite-only (transform/opacity) and honours
 * `prefers-reduced-motion`: the digit strip snaps, the live midpoint stops
 * drifting, and the toast appears in place. The kit owns the look; the app
 * wires these to real data (the page drives `MatchToast` from the live submit
 * result, and feeds the live midpoint into NumberTicker on the trade surface).
 */

import * as React from "react";

import { Status, type StatusState } from "@/components/ui/status";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

/** One vertical 0–9 strip that translates to the target digit. */
function Digit({ d }: { d: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        height: "1em",
        width: "1ch",
        overflow: "hidden",
        verticalAlign: "bottom",
      }}
    >
      <span
        style={{
          display: "block",
          transition: "transform var(--duration-medium) var(--ease-out)",
          transform: `translateY(${-d * 10}%)`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            style={{
              display: "block",
              height: "1em",
              lineHeight: "1em",
              textAlign: "center",
            }}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

export interface NumberTickerProps {
  /** The value to display. Digits roll; non-digits render flat. */
  value: string;
  /** Dim (muted-foreground) when idle instead of full foreground. */
  dim?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Rolling-digit number. Inherits font + size from its parent; flashes
 * success/destructive on change. Reduced-motion drops the digit-roll
 * transition (handled by the global reduced-motion carve-out) but keeps the
 * value readable.
 */
export function NumberTicker({ value, dim, className, style }: NumberTickerProps) {
  const prev = React.useRef(value);
  const [flash, setFlash] = React.useState<"up" | "down" | null>(null);

  React.useEffect(() => {
    const a = Number.parseFloat(prev.current);
    const b = Number.parseFloat(value);
    if (!Number.isNaN(a) && !Number.isNaN(b) && a !== b) {
      setFlash(b > a ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 520);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);

  const color =
    flash === "up"
      ? "var(--success)"
      : flash === "down"
        ? "var(--destructive)"
        : dim
          ? "var(--muted-foreground)"
          : "var(--foreground)";

  const chars = String(value).split("");
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        fontVariantNumeric: "tabular-nums",
        color,
        transition: "color var(--duration-medium) var(--ease-standard)",
        ...style,
      }}
    >
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <Digit key={i} d={Number.parseInt(c, 10)} />
        ) : (
          <span
            key={i}
            style={{
              display: "inline-block",
              height: "1em",
              lineHeight: "1em",
              textAlign: "center",
              verticalAlign: "bottom",
            }}
          >
            {c}
          </span>
        ),
      )}
    </span>
  );
}

/**
 * A midpoint that drifts ±1–2 pips around its base — the live heartbeat.
 * `base` is a decimal string; the drift respects its decimal precision.
 * Returns a formatted string at the same precision. Stops drifting under
 * reduced-motion (and returns the base verbatim).
 */
export function useLiveMidpoint(base: string): string {
  const reduce = useReducedMotion();
  const decimals = (String(base).split(".")[1] ?? "").length;
  const baseNum = Number.parseFloat(base);
  const [v, setV] = React.useState(baseNum);

  React.useEffect(() => {
    setV(baseNum);
    if (reduce || Number.isNaN(baseNum)) return;
    const pip = 1 / Math.pow(10, decimals);
    const id = setInterval(() => {
      setV((prev) => {
        const step =
          (Math.random() < 0.5 ? -1 : 1) * pip * (Math.random() < 0.28 ? 2 : 1);
        let next = prev + step;
        if (Math.abs(next - baseNum) > pip * 6) next = baseNum;
        return Math.round(next / pip) * pip;
      });
    }, 1900);
    return () => clearInterval(id);
  }, [base, baseNum, decimals, reduce]);

  if (Number.isNaN(baseNum)) return base;
  return v.toFixed(decimals);
}

export interface MatchToastFill {
  /** Settlement lifecycle state — drives both the badge and the copy. */
  status: Extract<StatusState, "matched" | "settled" | "proven">;
  /** Cleared midpoint price, formatted. Shown in the "Matched at" copy. */
  price: string;
}

/**
 * Settlement moment — slides up from the bottom and advances through the
 * lifecycle as the page updates `fill.status` (Matched → Settled → Proven).
 * Render with a `key` tied to the fill id so a new fill re-triggers the
 * slide-in. Returns null when there is no active fill.
 */
export function MatchToast({ fill }: { fill: MatchToastFill | null }) {
  if (!fill) return null;
  const text =
    fill.status === "matched"
      ? `Matched at midpoint ${fill.price}`
      : fill.status === "settled"
        ? "Settled onchain"
        : "Proof verified";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "omega-match-toast glass",
        "fixed bottom-7 left-1/2 z-[120] flex min-w-[280px] -translate-x-1/2 items-center justify-center gap-3 rounded-full px-[18px] py-3",
      )}
    >
      <Status state={fill.status} />
      <span className="whitespace-nowrap font-mono text-xs text-[var(--foreground)]">
        {text}
      </span>
    </div>
  );
}
