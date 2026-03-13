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
    <div className="flex flex-col h-screen">
      <Navbar />
      <BBOMarquee />

      {/* Main 2-column layout */}
      <div className="flex-1 flex min-h-0 flex-col lg:flex-row">
        {/* Left: Pair Selector + Chart + Positions/Orders */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Pair selector (collapsible on mobile) */}
          <div className="p-3 border-b border-border-subtle hidden lg:block">
            <PairSelector />
            <div className="mt-2 max-h-[200px] overflow-y-auto">
              <PairList />
            </div>
          </div>

          {/* Chart */}
          <div className="p-3 flex-shrink-0">
            <PriceChart />
          </div>

          {/* Bottom panel: Positions + Orders */}
          <div className="flex-1 px-3 pb-3 min-h-0">
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
