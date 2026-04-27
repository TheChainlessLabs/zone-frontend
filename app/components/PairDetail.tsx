"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { mockPairs, mockMarketPrices } from "@/lib/mockData";
import { useMarket } from "@/lib/hooks/useMarket";
import { PAIR_MARKET_IDS } from "@/lib/marketIds";
import { TIMEFRAMES, type Timeframe } from "@/lib/chartData";
import { useMidpointHistory } from "@/lib/hooks/useMidpointHistory";

// lightweight-charts touches `document` on init — must be loaded
// client-only via next/dynamic to stay out of the SSR bundle.
const LightweightChart = dynamic(() => import("./LightweightChart"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      <span className="text-text-muted text-body-sm">Loading chart…</span>
    </div>
  ),
});

interface PairDetailProps {
  pairSlug: string;
}

/**
 * Chart body for an available market. Extracted into its own component so
 * `useMidpointHistory` (which transitively drives `useOrderBook` polling)
 * only runs when the page's pair actually maps to a backend market —
 * otherwise /trade/pair/gbp-usd would poll EUR/USD in the background and
 * pollute that market's sessionStorage history.
 */
function AvailableMarketChart({ timeframe }: { timeframe: Timeframe }) {
  const { points, isLoading, isError } = useMidpointHistory(timeframe);

  // Priority: keep the chart visible if we have cached points, even if
  // the latest refetch errored. Only escalate to the hard error state
  // when there is nothing to draw yet.
  if (points.length > 0) {
    return <LightweightChart points={points} />;
  }
  if (isError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
        <span className="text-error text-body-sm">
          Chart unavailable — could not fetch the order book
        </span>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-text-muted text-body-sm">
        {isLoading ? "Loading chart…" : "Collecting midpoint history…"}
      </span>
    </div>
  );
}

export default function PairDetail({ pairSlug }: PairDetailProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const { setMarketId } = useMarket();
  const pairName = pairSlug.replace("-", "/");
  const pair = mockPairs.find((p) => p.pair === pairName) ?? mockPairs[0];
  // True when the pair is present in mock metadata AND has a backend
  // market. When false we must not mount `AvailableMarketChart`, because
  // that would start polling another market's order book in the
  // background and silently mislabel the cached chart history.
  const marketAvailable = PAIR_MARKET_IDS[pair.pair] !== undefined;

  useEffect(() => {
    const id = PAIR_MARKET_IDS[pair.pair];
    if (id !== undefined) {
      setMarketId(id);
    }
  }, [pair.pair, setMarketId]);

  const stats = [
    { label: "24H Volume", value: "$12.4M" },
    { label: "24H Trades", value: "1,847" },
    { label: "Avg Spread", value: "0.3 pips" },
    { label: "24H High / Low", value: `${(pair.price * 1.0014).toFixed(4)} / ${(pair.price * 0.9978).toFixed(4)}` },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Link
        href="/trade"
        className="text-accent text-body-sm hover:text-accent-hover transition-fast w-fit"
      >
        &larr; Back to Trade
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-h3 md:text-h2 font-semibold">{pair.pair}</h2>
          <span className="text-h3 md:text-h2 font-mono font-tabular">{pair.price.toFixed(4)}</span>
        </div>
        <span className={`text-body-sm font-mono font-tabular ${pair.change >= 0 ? "text-success" : "text-error"}`}>
          {pair.change >= 0 ? "+" : ""}{(pair.price * pair.change / 100).toFixed(4)} ({pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%)
        </span>
      </div>

      {/* Stat cards — 2x2 grid on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-surface border border-border rounded-lg p-3 md:p-4">
            <span className="text-label-uppercase text-text-muted">{stat.label}</span>
            <p className="text-[16px] md:text-h3 font-mono font-tabular mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Venue comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          {/* Chart sits flat on the page background (no card wrapper),
              matching the Uniswap reference. Timeframe tabs keep a
              subtle bg-bg-surface pill so they still read as a toggle
              group. */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-body-sm font-semibold">Price Chart</span>
              <div className="flex gap-0.5 bg-bg-surface rounded-md p-0.5">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    disabled={!marketAvailable}
                    className={`px-2 md:px-3 h-[26px] text-[11px] md:text-body-sm font-medium rounded-sm transition-fast disabled:opacity-40 disabled:cursor-not-allowed ${
                      timeframe === tf
                        ? "bg-bg-elevated text-text-primary"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                    aria-pressed={timeframe === tf}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="relative aspect-[2/1] md:aspect-[3/1]"
              data-testid="price-chart"
            >
              {marketAvailable ? (
                <AvailableMarketChart timeframe={timeframe} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                  <span className="text-text-muted text-body-sm">
                    {pair.pair} is not yet listed on Omega
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Venue Comparison */}
        <div className="bg-bg-surface border border-border rounded-lg overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-label-uppercase text-text-muted">Venue Comparison</h3>
          </div>
          {mockMarketPrices.map((mp) => (
            <div
              key={mp.source}
              className={`flex items-center justify-between px-4 py-2.5 ${
                mp.source === "Omega" ? "bg-accent/5" : ""
              }`}
            >
              <div>
                <span className={`text-body-sm font-medium ${mp.source === "Omega" ? "text-accent" : "text-text-primary"}`}>
                  {mp.source === "Omega" ? "Omega Midpoint" : mp.source}
                </span>
                <span className="block text-[11px] text-text-muted">
                  {mp.source === "Omega" ? "Real-time" : `Last updated ${Math.floor(Math.random() * 5) + 1}s ago`}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-body-sm font-mono font-tabular ${mp.source === "Omega" ? "text-accent" : "text-text-primary"}`}>
                  {mp.source === "Omega" ? (mp.bid + mp.ask) / 2 : mp.ask}
                </span>
                <span className={`block text-[11px] font-mono font-tabular ${
                  mp.source === "Omega" ? "text-success" : "text-error"
                }`}>
                  {mp.source === "Omega" ? "Best price" : `-${(mp.spread * 10000).toFixed(1)} pips`}
                </span>
              </div>
            </div>
          ))}
          <div className="p-3 md:p-4 border-t border-border">
            <Link
              href="/trade"
              className="h-[44px] w-full flex items-center justify-center rounded-md text-body-sm font-semibold bg-accent text-text-inverse hover:bg-accent-hover transition-fast"
            >
              Trade {pair.pair}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
