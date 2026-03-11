import Link from "next/link";
import Navbar from "@/components/Navbar";
import PortfolioValue from "@/components/PortfolioValue";
import PortfolioBalances from "@/components/PortfolioBalances";
import OpenPositions from "@/components/OpenPositions";

export default function PortfolioPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 p-6 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-h2 font-semibold">Portfolio</h1>
          <div className="flex gap-2">
            <Link
              href="/funding"
              className="h-[32px] px-4 flex items-center text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast"
            >
              Deposit
            </Link>
            <Link
              href="/funding"
              className="h-[32px] px-4 flex items-center text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast"
            >
              Withdraw
            </Link>
            <Link
              href="/funding"
              className="h-[32px] px-4 flex items-center text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast"
            >
              Transfer
            </Link>
          </div>
        </div>

        <PortfolioValue />
        <PortfolioBalances />
        <OpenPositions />
      </div>
    </div>
  );
}
