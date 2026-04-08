"use client";

import { useState } from "react";
import { useOrderBook } from "@/lib/hooks/useOrderBook";
import { useVenueRates } from "@/lib/hooks/useVenueRates";
import { use1inchPrice } from "@/lib/hooks/use1inchPrice";

interface VenueLine {
  id: string;
  name: string;
  price: number | null;
  color: string;
}

const VENUE_COLORS: Record<string, string> = {
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
    {
      id: "omega",
      name: "Omega Midpoint",
      price: midpoint,
      color: "cyan",
    },
    {
      id: "1inch",
      name: "1inch (USDT/USDC)",
      price: oneInchRate,
      color: "blue",
    },
    {
      id: "wise",
      name: "Wise",
      price: venueRates?.wise ?? null,
      color: "green",
    },
    {
      id: "revolut",
      name: "Revolut",
      price: venueRates?.revolut ?? null,
      color: "purple",
    },
    {
      id: "ofx",
      name: "OFX",
      price: venueRates?.ofx ?? null,
      color: "orange",
    },
  ];

  function toggleVenue(id: string) {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-3">
      <h3 className="text-body-sm text-text-secondary mb-2 font-medium">
        Venue Comparison
      </h3>
      <div className="flex flex-col gap-1.5">
        {venues.map((venue) => (
          <label
            key={venue.id}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={enabled[venue.id] ?? false}
              onChange={() => toggleVenue(venue.id)}
              className="sr-only"
              aria-label={`Toggle ${venue.name}`}
            />
            <span
              className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                enabled[venue.id]
                  ? "border-accent bg-accent"
                  : "border-border bg-bg-base"
              }`}
            >
              {enabled[venue.id] && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M2 5L4 7L8 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span
              className={`w-4 h-0.5 rounded-full ${VENUE_COLORS[venue.id]}`}
            />
            <span className="text-body-sm text-text-secondary flex-1 group-hover:text-text-primary transition-colors">
              {venue.name}
            </span>
            <span
              className={`font-mono text-[13px] tabular-nums ${
                enabled[venue.id]
                  ? VENUE_TEXT_COLORS[venue.id]
                  : "text-text-muted"
              }`}
            >
              {venue.price !== null ? venue.price.toFixed(4) : "—"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
