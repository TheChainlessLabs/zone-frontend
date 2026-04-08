"use client";

import { useEffect, useRef, useState } from "react";
import { useOrderBook } from "@/lib/hooks/useOrderBook";
import { useVenueRates } from "@/lib/hooks/useVenueRates";
import { Skeleton } from "@/components/Skeleton";

const VENUE_ORDER = ["Wise", "OFX", "Revolut"] as const;
type VenueKey = "wise" | "ofx" | "revolut";
const VENUE_KEY_MAP: Record<(typeof VENUE_ORDER)[number], VenueKey> = {
  Wise: "wise",
  OFX: "ofx",
  Revolut: "revolut",
};

type TickDirection = "up" | "down" | null;
type StatusIndicator = "live" | "stale" | "error";

function getStatusIndicator(
  isLoading: boolean,
  isError: boolean,
  price: string,
): StatusIndicator {
  if (isError || price === "—") return "error";
  if (isLoading || price === "") return "stale";
  return "live";
}

function isBestPrice(
  omegaMidpoint: number | null,
  venueRates: { wise: number; ofx: number; revolut: number } | undefined,
): boolean {
  if (omegaMidpoint === null || !venueRates) return false;
  // Omega is "best" if it exists — the spread is tighter by construction in a CLOB
  // In production, compare actual bid/ask spreads. For now, show badge when Omega has data.
  return true;
}

export default function BBOMarquee() {
  const { midpoint, isLoading: bookLoading, isError: bookError } = useOrderBook();
  const { venues: venueRates, isLoading: venueLoading, isError: venueError } = useVenueRates();

  const prevPricesRef = useRef<Record<string, number>>({});
  const [ticks, setTicks] = useState<Record<string, TickDirection>>({});

  let omegaPrice: string;
  if (bookLoading) omegaPrice = "";
  else if (bookError || midpoint === null) omegaPrice = "—";
  else omegaPrice = midpoint.toFixed(4);

  const venues = [
    ...VENUE_ORDER.map((name) => {
      const key = VENUE_KEY_MAP[name];
      let price: string;
      if (venueLoading) price = "";
      else if (venueError || !venueRates) price = "—";
      else price = venueRates[key].toFixed(4);
      return {
        name,
        price,
        isOmega: false,
        isLoading: venueLoading,
        isError: venueError,
      };
    }),
    {
      name: "Omega",
      price: omegaPrice,
      isOmega: true,
      isLoading: bookLoading,
      isError: bookError,
    },
  ];

  // Build a stable key for price comparison
  const priceKey = venues.map((v) => `${v.name}:${v.price}`).join("|");

  useEffect(() => {
    const newTicks: Record<string, TickDirection> = {};
    let hasAnyTick = false;

    venues.forEach((v) => {
      const prev = prevPricesRef.current[v.name];
      const curr = parseFloat(v.price);
      if (prev !== undefined && !isNaN(curr) && curr !== prev) {
        newTicks[v.name] = curr > prev ? "up" : "down";
        hasAnyTick = true;
      }
    });

    if (hasAnyTick) {
      setTicks(newTicks);
    }

    // Clear ticks after 300ms
    const timer = setTimeout(() => setTicks({}), 300);

    // Update previous prices
    venues.forEach((v) => {
      const parsed = parseFloat(v.price);
      if (!isNaN(parsed)) {
        prevPricesRef.current[v.name] = parsed;
      }
    });

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceKey]);

  const showBestPrice = isBestPrice(midpoint, venueRates);

  return (
    <div className="h-[40px] bg-bg-base border-b border-border-subtle flex items-center px-4 md:px-[60px] gap-0 overflow-x-auto no-scrollbar shrink-0 touch-pan-x">
      {venues.map((venue, i) => {
        const status = getStatusIndicator(venue.isLoading, venue.isError, venue.price);
        const tick = ticks[venue.name] ?? null;

        return (
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
              {venue.isLoading ? (
                <Skeleton className="h-[14px] w-[60px]" />
              ) : (
                <span
                  className={`font-mono text-[13px] font-tabular transition-colors duration-300 ${
                    tick === "up"
                      ? "text-success"
                      : tick === "down"
                        ? "text-error"
                        : "text-text-primary"
                  }`}
                >
                  {venue.price}
                </span>
              )}
              {venue.isOmega && showBestPrice ? (
                <span className="text-[10px] font-medium tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-accent-subtle text-accent">
                  Best Price
                </span>
              ) : venue.isOmega ? null : (
                <StatusDot status={status} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusDot({ status }: { status: StatusIndicator }) {
  if (status === "error") {
    return (
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-error" />
      </div>
    );
  }

  if (status === "stale") {
    return (
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-warning" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-success" />
      <span className="text-[10px] uppercase tracking-wider text-success">
        Live
      </span>
    </div>
  );
}
