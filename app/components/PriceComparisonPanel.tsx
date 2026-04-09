"use client";

import { useState } from "react";
import { useOrderBook } from "@/lib/hooks/useOrderBook";
import { useVenueRates } from "@/lib/hooks/useVenueRates";
import { use1inchPrice } from "@/lib/hooks/use1inchPrice";

interface VenueLine {
  id: string;
  name: string;
  price: number | null;
}

const VENUE_DOT_COLORS: Record<string, string> = {
  omega: "bg-accent",
  "1inch": "bg-[#2F80ED]",
  wise: "bg-[#22C55E]",
  revolut: "bg-[#A855F7]",
  ofx: "bg-[#F97316]",
};

const VENUE_TEXT_COLORS: Record<string, string> = {
  omega: "text-accent",
  "1inch": "text-[#2F80ED]",
  wise: "text-[#22C55E]",
  revolut: "text-[#A855F7]",
  ofx: "text-[#F97316]",
};

/**
 * Compact horizontal venue comparison bar. Each venue is a toggle pill —
 * color dot, name, price. Enabled venues are fully opaque; disabled
 * venues dim. On mobile or narrow viewports the row scrolls horizontally
 * (no visible scrollbar via the `no-scrollbar` utility).
 *
 * The visually-hidden `<input type="checkbox">` inside each label keeps
 * the existing `getByLabelText("Toggle <name>")` contract for tests and
 * preserves keyboard/screen-reader access — clicking anywhere on the
 * pill flips the checkbox.
 */
export default function PriceComparisonPanel() {
  const { midpoint } = useOrderBook();
  const { venues: venueRates } = useVenueRates();
  const { rate: oneInchRate } = use1inchPrice();

  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    omega: true,
    "1inch": true,
    wise: false,
    revolut: false,
    ofx: false,
  });

  const venues: VenueLine[] = [
    { id: "omega", name: "Omega Midpoint", price: midpoint },
    { id: "1inch", name: "1inch (USDT/USDC)", price: oneInchRate },
    { id: "wise", name: "Wise", price: venueRates?.wise ?? null },
    { id: "revolut", name: "Revolut", price: venueRates?.revolut ?? null },
    { id: "ofx", name: "OFX", price: venueRates?.ofx ?? null },
  ];

  function toggleVenue(id: string) {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface px-3 py-2">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-medium whitespace-nowrap shrink-0 pr-1">
          Venue Comparison
        </h3>
        {venues.map((venue) => {
          const isOn = enabled[venue.id] ?? false;
          return (
            <label
              key={venue.id}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 cursor-pointer whitespace-nowrap shrink-0 transition-fast ${
                isOn
                  ? "border-border bg-bg-base"
                  : "border-border-subtle bg-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <input
                type="checkbox"
                checked={isOn}
                onChange={() => toggleVenue(venue.id)}
                className="sr-only"
                aria-label={`Toggle ${venue.name}`}
              />
              <span
                className={`w-1.5 h-1.5 rounded-full ${VENUE_DOT_COLORS[venue.id]}`}
                aria-hidden="true"
              />
              <span className="text-[11px] text-text-secondary">
                {venue.name}
              </span>
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  isOn ? VENUE_TEXT_COLORS[venue.id] : "text-text-muted"
                }`}
              >
                {venue.price !== null ? venue.price.toFixed(4) : "—"}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
