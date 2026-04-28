"use client";

import { useState } from "react";
import PortfolioValue from "@/components/PortfolioValue";
import PortfolioBalances from "@/components/PortfolioBalances";
import OpenPositions from "@/components/OpenPositions";
import ProtectedPage from "@/components/ProtectedPage";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";

export default function PortfolioPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  return (
    <ProtectedPage shellClassName="flex flex-1 flex-col">
      <div className="flex-1 p-4 md:p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-h2 font-semibold">Portfolio</h1>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setDepositOpen(true)}
              className="min-h-[44px] md:min-h-[32px] px-4 flex items-center text-body-sm font-medium rounded-md bg-accent text-text-inverse hover:bg-accent-hover transition-fast whitespace-nowrap shrink-0"
            >
              Deposit
            </button>
            <button
              onClick={() => setWithdrawOpen(true)}
              className="min-h-[44px] md:min-h-[32px] px-4 flex items-center text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast whitespace-nowrap shrink-0"
            >
              Withdraw
            </button>
            <button
              className="min-h-[44px] md:min-h-[32px] px-4 flex items-center text-body-sm font-medium border border-border rounded-md text-text-primary opacity-50 cursor-not-allowed transition-fast whitespace-nowrap shrink-0"
              title="Coming soon"
              disabled
            >
              Transfer
            </button>
          </div>
        </div>

        <SectionErrorBoundary fallbackMessage="Portfolio value unavailable">
          <PortfolioValue />
        </SectionErrorBoundary>

        {/* Responsive tables */}
        <div className="overflow-x-auto">
          <SectionErrorBoundary fallbackMessage="Balances unavailable">
            <PortfolioBalances />
          </SectionErrorBoundary>
        </div>
        <div className="overflow-x-auto">
          <SectionErrorBoundary fallbackMessage="Open positions unavailable">
            <OpenPositions />
          </SectionErrorBoundary>
        </div>
      </div>

      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </ProtectedPage>
  );
}
