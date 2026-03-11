import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";
import PairSelector from "@/components/PairSelector";
import PairList from "@/components/PairList";
import OrderForm from "@/components/OrderForm";
import PriceChart from "@/components/PriceChart";
import BottomPanel from "@/components/BottomPanel";
import BBOPriceFeed from "@/components/BBOPriceFeed";
import RecentTrades from "@/components/RecentTrades";

export default function TradePage() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <BottomBar />

      {/* Main 3-column layout */}
      <div className="flex-1 flex min-h-0 flex-col lg:flex-row">
        {/* Left: Pair selector + Order form */}
        <div className="w-full lg:w-[280px] border-r border-border overflow-y-auto shrink-0">
          <div className="p-3 border-b border-border">
            <PairSelector />
          </div>
          <PairList />
          <div className="p-3">
            <OrderForm />
          </div>
        </div>

        {/* Center: Chart + Bottom panel */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="p-3 flex-shrink-0">
            <PriceChart />
          </div>
          <div className="flex-1 px-3 pb-3 min-h-0">
            <BottomPanel />
          </div>
        </div>

        {/* Right: BBO + Recent trades */}
        <div className="w-full lg:w-[300px] border-l border-border overflow-y-auto shrink-0">
          <div className="p-3 flex flex-col gap-3">
            <BBOPriceFeed />
            <RecentTrades />
          </div>
        </div>
      </div>
    </div>
  );
}
