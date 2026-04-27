"use client";

import { useState, useEffect } from "react";
import BBOMarquee from "@/components/BBOMarquee";
import PairDropdown from "@/components/PairDropdown";
import OrderForm from "@/components/OrderForm";
import PriceChart from "@/components/PriceChart";
import BottomPanel from "@/components/BottomPanel";
import RecentTrades from "@/components/RecentTrades";
import StatusBar from "@/components/StatusBar";
import ProtectedPage from "@/components/ProtectedPage";
import StaleDataOverlay from "@/components/StaleDataOverlay";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { useOrderBook } from "@/lib/hooks/useOrderBook";

export default function TradeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { dataUpdatedAt } = useOrderBook();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ProtectedPage shellClassName="flex flex-col h-screen overflow-hidden">
      <BBOMarquee />

      {/* Main 2-column layout */}
      <div className="flex-1 flex min-h-0 flex-col lg:flex-row">
        {/* Left: Chart + Positions/Orders */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Pair dropdown + Chart. Venue comparison lives on /trade/pair/[pair]
              now — the BBOMarquee at the top of the page already carries the
              live venue pulse on /trade. */}
          <div className="relative flex flex-col min-h-0 flex-shrink-0 p-3 gap-3">
            <StaleDataOverlay lastUpdated={dataUpdatedAt || null} />
            <div className="flex items-center">
              <PairDropdown />
            </div>
            <SectionErrorBoundary fallbackMessage="Chart unavailable">
              <PriceChart />
            </SectionErrorBoundary>
          </div>

          {/* Bottom panel: Positions + Orders */}
          <div className="flex-1 px-3 pb-3 min-h-0 overflow-hidden">
            <SectionErrorBoundary fallbackMessage="Positions and orders unavailable">
              <BottomPanel isLoading={isLoading} />
            </SectionErrorBoundary>
          </div>
        </div>

        {/* Right: Order Form + Recent Fills (380px on desktop) */}
        <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-border overflow-y-auto shrink-0">
          <div className="p-4 flex flex-col gap-4">
            <SectionErrorBoundary fallbackMessage="Order form unavailable">
              <OrderForm isLoading={isLoading} />
            </SectionErrorBoundary>
            <SectionErrorBoundary fallbackMessage="Recent trades unavailable">
              <RecentTrades />
            </SectionErrorBoundary>
          </div>
        </div>
      </div>

      <StatusBar />
    </ProtectedPage>
  );
}
