"use client";

import PortfolioValue from "@/components/PortfolioValue";
import PortfolioBalances from "@/components/PortfolioBalances";
import OpenPositions from "@/components/OpenPositions";
import ProtectedPage from "@/components/ProtectedPage";

export default function PortfolioPage() {
  return (
    <ProtectedPage shellClassName="flex flex-col min-h-screen">
      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-h2 font-semibold">Portfolio</h1>
          <div className="flex gap-2">
            <button className="h-[32px] px-4 flex items-center text-body-sm font-medium rounded-md bg-accent text-text-inverse hover:bg-accent-hover transition-fast">
              Deposit
            </button>
            <button className="h-[32px] px-4 flex items-center text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast">
              Withdraw
            </button>
            <button className="h-[32px] px-4 flex items-center text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast">
              Transfer
            </button>
          </div>
        </div>

        <PortfolioValue />

        {/* Responsive tables */}
        <div className="overflow-x-auto">
          <PortfolioBalances />
        </div>
        <div className="overflow-x-auto">
          <OpenPositions />
        </div>
      </div>
    </ProtectedPage>
  );
}
