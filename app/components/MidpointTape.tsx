"use client";

/**
 * MidpointTape — the refractable substrate behind the liquid-glass demo.
 * Renders a vertical tape of EUR/USD midpoint ticks with timestamps. The
 * brand commits to no public order book, so the substrate intentionally
 * shows what the dark pool *does* expose — the midpoint reference and
 * settled tx hashes — refracted through the privacy layer above.
 */

const TICKS = [
  { ts: "14:02:18.412", price: "1.0856", delta: "+0.0002" },
  { ts: "14:02:18.117", price: "1.0854", delta: "+0.0001" },
  { ts: "14:02:17.998", price: "1.0853", delta: "−0.0003" },
  { ts: "14:02:17.764", price: "1.0856", delta: "+0.0001" },
  { ts: "14:02:17.531", price: "1.0855", delta: "+0.0002" },
  { ts: "14:02:17.298", price: "1.0853", delta: "−0.0001" },
  { ts: "14:02:17.142", price: "1.0854", delta: "+0.0004" },
  { ts: "14:02:16.989", price: "1.0850", delta: "−0.0002" },
  { ts: "14:02:16.713", price: "1.0852", delta: "+0.0001" },
  { ts: "14:02:16.502", price: "1.0851", delta: "+0.0003" },
  { ts: "14:02:16.317", price: "1.0848", delta: "−0.0001" },
  { ts: "14:02:16.105", price: "1.0849", delta: "+0.0002" },
];

const HASHES = [
  "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853 · #48,201",
  "0x9a9f2ccfde556a7e9ff0848998aa4a0cfd8863ae · #48,200",
  "0x68b1d87f95878fe05b998f19b66f4baba5de1aed · #48,199",
  "0x4f1e2c8d9a3b5e7f1c0d6a8b3e9f2d1c4b5a6e8d · #48,198",
  "0xc7d2a9f1b3e5c8d4a6b9f2e7c1d3a5b8e0f4c7a2 · #48,197",
];

export function MidpointTape() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden text-[10px] leading-[18px] text-[var(--muted-foreground)]/40"
    >
      {/* Left column: midpoint ticks */}
      <div className="absolute inset-y-0 left-0 w-[42%] px-6 py-8 font-mono">
        <div className="mb-2 text-[9px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]/30">
          midpoint · EUR/USD
        </div>
        <ul className="flex flex-col gap-px">
          {TICKS.map((t) => (
            <li key={t.ts} className="flex items-baseline justify-between gap-3 font-tabular">
              <span className="text-[var(--muted-foreground)]/30">{t.ts}</span>
              <span>{t.price}</span>
              <span
                className={
                  t.delta.startsWith("+")
                    ? "text-[var(--success)]/30"
                    : "text-[var(--destructive)]/30"
                }
              >
                {t.delta}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right column: tx hashes */}
      <div className="absolute inset-y-0 right-0 w-[42%] px-6 py-8 font-mono">
        <div className="mb-2 text-right text-[9px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]/30">
          settled · L1
        </div>
        <ul className="flex flex-col gap-1 text-right">
          {HASHES.map((h) => (
            <li key={h} className="truncate font-tabular">
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
