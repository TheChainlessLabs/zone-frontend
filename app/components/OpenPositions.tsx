import { TrendingUp } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function OpenPositions() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center h-[36px] pb-2">
        <span className="text-body-sm font-medium">Open Positions</span>
      </div>

      <EmptyState
        icon={<TrendingUp size={20} />}
        title="No open positions yet"
        description="Your open positions will appear here. Start trading to build your portfolio."
        action={{ label: "Start Trading", href: "/trade" }}
      />
    </div>
  );
}
