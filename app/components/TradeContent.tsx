"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import OrderForm from "@/components/OrderForm";
import ExecutionContextStrip from "@/components/ExecutionContextStrip";
import PriceChart from "@/components/PriceChart";
import PairDropdown from "@/components/PairDropdown";
import MyFills from "@/components/MyFills";
import StatusBar from "@/components/StatusBar";
import ProtectedPage from "@/components/ProtectedPage";
import StaleDataOverlay from "@/components/StaleDataOverlay";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { useOrderBook } from "@/lib/hooks/useOrderBook";
import type { OrderType } from "@/lib/types";

/**
 * /trade — V1 action-first execution model. The order form is the
 * product; everything else is supporting context.
 *
 * Two modes, progressive disclosure, no route change:
 *
 * - Market (default) — centred dominant swap card with a quiet
 *   protocol-level execution context strip below. No chart, no
 *   public book (the product is a dark pool), no marquee, no global
 *   trades.
 *
 * - Limit — the same card remains the visually dominant surface and
 *   anchors left at desktop ≥1024px; a muted price chart fades in to
 *   the right as supporting context, and the user's own order
 *   history fades in below. No public order book. The form's price-
 *   input focus ring and the active LIMIT tab carry the precision-
 *   strong cyan accent — every other surface stays on calm steel
 *   blue.
 *
 * Mode transition: 200ms ease-out, opacity + translateY(16px). The
 * order form does NOT animate (trading-critical, must stay anchored).
 */
export default function TradeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [orderType, setOrderType] = useState<OrderType>("midpoint");
  const { dataUpdatedAt } = useOrderBook();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const isLimit = orderType === "limit";

  return (
    <ProtectedPage shellClassName="flex flex-col h-screen overflow-hidden bg-bg-base">
      <main className="flex-1 overflow-y-auto">
        <div
          className={`mx-auto w-full px-4 sm:px-6 pt-10 pb-16 transition-[max-width] duration-200 ease-out ${
            isLimit ? "max-w-[1100px]" : "max-w-[480px]"
          }`}
        >
          <StaleDataOverlay lastUpdated={dataUpdatedAt || null} />

          {/* On desktop in Limit mode the form anchors left and the
              chart sits in the right column. On mobile or in Market
              mode the layout is a single column. */}
          <div
            className={`grid gap-6 ${
              isLimit
                ? "lg:grid-cols-[480px_minmax(0,1fr)] lg:items-start"
                : "grid-cols-1"
            }`}
          >
            {/* Left column — pair, swap card, execution strip. The
                column itself does NOT animate across modes; only the
                supporting surfaces fade in/out. */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <PairDropdown />
              </div>

              <SectionErrorBoundary fallbackMessage="Order form unavailable">
                <div className="rounded-md border border-border bg-bg-surface p-5">
                  <OrderForm
                    isLoading={isLoading}
                    orderType={orderType}
                    onOrderTypeChange={setOrderType}
                  />
                </div>
              </SectionErrorBoundary>

              <SectionErrorBoundary fallbackMessage="Execution context unavailable">
                <ExecutionContextStrip />
              </SectionErrorBoundary>
            </div>

            {/* Right column — supporting context. Mounted only in
                Limit mode; fades in with the brief's motion spec
                (200ms ease-out, opacity + translateY 16 → 0). The
                left column never animates — the order form must
                stay anchored across mode changes. */}
            <AnimatePresence initial={false}>
              {isLimit && (
                <motion.div
                  key="limit-supporting"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-col gap-6"
                >
                  <SectionErrorBoundary fallbackMessage="Chart unavailable">
                    <div className="rounded-md border border-border-subtle bg-bg-surface/60 p-4 lg:min-h-[320px]">
                      <PriceChart />
                    </div>
                  </SectionErrorBoundary>

                  <SectionErrorBoundary fallbackMessage="Order history unavailable">
                    <MyFills />
                  </SectionErrorBoundary>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <StatusBar />
    </ProtectedPage>
  );
}
