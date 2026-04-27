"use client";

import { useState, useEffect } from "react";
import OrderForm from "@/components/OrderForm";
import ExecutionContextStrip from "@/components/ExecutionContextStrip";
import PairDropdown from "@/components/PairDropdown";
import StatusBar from "@/components/StatusBar";
import ProtectedPage from "@/components/ProtectedPage";
import StaleDataOverlay from "@/components/StaleDataOverlay";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { useOrderBook } from "@/lib/hooks/useOrderBook";

/**
 * /trade — V1 action-first execution model. The order form is the
 * product; everything else is supporting context. This is Market
 * mode: a centred dominant swap card, generous negative space, no
 * chart, no public order book (the product is a dark pool), no
 * marquee, no global trades. The ExecutionContextStrip below the
 * card carries the quiet protocol-level execution context.
 *
 * Limit mode (added in a follow-up slice) will introduce a chart
 * and user-fills as supporting context, with the form remaining the
 * visually dominant surface.
 */
export default function TradeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { dataUpdatedAt } = useOrderBook();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ProtectedPage shellClassName="flex flex-col h-screen overflow-hidden bg-bg-base">
      {/* Centred execution column. Single dominant surface. */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[480px] px-4 sm:px-6 pt-10 pb-16 flex flex-col gap-4">
          <StaleDataOverlay lastUpdated={dataUpdatedAt || null} />

          {/* Pair anchor — small, mono, sits above the card. The
              ExecutionContextStrip carries the actual midpoint; this
              row is just the pair selector. */}
          <div className="flex items-center justify-between">
            <PairDropdown />
          </div>

          {/* Dominant swap card. */}
          <SectionErrorBoundary fallbackMessage="Order form unavailable">
            <div className="rounded-md border border-border bg-bg-surface p-5">
              <OrderForm isLoading={isLoading} />
            </div>
          </SectionErrorBoundary>

          {/* Quiet execution context. Bounded to the same width as
              the card; thin top separator; no card background of its
              own. Strictly secondary. */}
          <SectionErrorBoundary fallbackMessage="Execution context unavailable">
            <ExecutionContextStrip />
          </SectionErrorBoundary>
        </div>
      </main>

      <StatusBar />
    </ProtectedPage>
  );
}
