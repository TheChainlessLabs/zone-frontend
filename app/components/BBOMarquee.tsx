"use client";

import { useOrderBook } from "@/lib/hooks/useOrderBook";
import { Skeleton } from "@/components/Skeleton";

// Hardcoded external venues — replace when oracle price feed is available
const EXTERNAL_VENUES = [
  { name: "Wise", price: "1.0851" },
  { name: "OFX", price: "1.0852" },
  { name: "Revolut", price: "1.0852" },
];

export default function BBOMarquee() {
  const { midpoint, isLoading, isError } = useOrderBook();

  let omegaPrice: string;
  if (isLoading) omegaPrice = "";
  else if (isError || midpoint === null) omegaPrice = "—";
  else omegaPrice = midpoint.toFixed(4);

  const venues = [
    ...EXTERNAL_VENUES.map((v) => ({ ...v, isOmega: false })),
    { name: "Omega", price: omegaPrice, isOmega: true },
  ];

  return (
    <div className="h-[40px] bg-bg-base border-b border-border-subtle flex items-center px-4 md:px-[60px] gap-0 overflow-x-auto shrink-0">
      {venues.map((venue, i) => (
        <div key={venue.name} className="flex items-center">
          {i > 0 && <span className="mx-3 w-px h-4 bg-border-subtle shrink-0" />}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-body-sm ${
                venue.isOmega ? "text-accent font-medium" : "text-text-secondary"
              }`}
            >
              {venue.name}
            </span>
            {venue.isOmega && isLoading ? (
              <Skeleton className="h-[14px] w-[60px]" />
            ) : (
              <span className="font-mono text-[13px] font-tabular text-text-primary">
                {venue.price}
              </span>
            )}
            {venue.isOmega ? (
              <span className="text-[10px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-accent-subtle text-accent">
                Best Price
              </span>
            ) : (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[10px] uppercase tracking-wider text-success">
                  Live
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
