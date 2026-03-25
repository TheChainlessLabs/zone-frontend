"use client";

import { useQuery } from "@tanstack/react-query";

interface VenueRatesResponse {
  pair: string;
  timestamp: number;
  venues: {
    wise: number;
    revolut: number;
    ofx: number;
  };
}

async function fetchVenueRates(pair: string): Promise<VenueRatesResponse> {
  const res = await fetch(`/api/fx/rates?pair=${encodeURIComponent(pair)}`);
  if (!res.ok) throw new Error("Failed to fetch venue rates");
  return res.json();
}

export function useVenueRates(pair: string = "EUR/USD") {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["venueRates", pair],
    queryFn: () => fetchVenueRates(pair),
    refetchInterval: 30_000,
  });

  return {
    venues: data?.venues,
    isLoading,
    isError,
  };
}
