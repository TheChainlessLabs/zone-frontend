import Navbar from "@/components/Navbar";
import BBOMarquee from "@/components/BBOMarquee";
import PairSelector from "@/components/PairSelector";
import PairList from "@/components/PairList";
import OrderForm from "@/components/OrderForm";
import PriceChart from "@/components/PriceChart";
import BottomPanel from "@/components/BottomPanel";
import RecentTrades from "@/components/RecentTrades";
import StatusBar from "@/components/StatusBar";

export default function TradePage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <BBOMarquee />

      {/* Main 2-column layout */}
      <div className="flex-1 flex min-h-0 flex-col lg:flex-row">
        {/* Left: Pair Sidebar + Chart + Positions/Orders */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Pair sidebar + Chart (horizontal on desktop) */}
          <div className="flex min-h-0 flex-shrink-0">
            {/* Pair sidebar — 240px, desktop only */}
            <div className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-border-subtle">
              <div className="p-3">
                <PairSelector />
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3">
                <PairList />
              </div>
            </div>

            {/* Chart */}
            <div className="flex-1 p-3 min-w-0">
              <PriceChart />
            </div>
          </div>

          {/* Bottom panel: Positions + Orders */}
          <div className="flex-1 px-3 pb-3 min-h-0 overflow-hidden">
            <BottomPanel />
          </div>
        </div>

        {/* Right: Order Form + Recent Fills (380px on desktop) */}
        <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-border overflow-y-auto shrink-0">
          <div className="p-4 flex flex-col gap-4">
            <OrderForm />
            <RecentTrades />
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
