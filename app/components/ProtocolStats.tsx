import VolumeChart from "./VolumeChart";

const topPairs = [
  { pair: "EUR / USD", volume: "$89.2M" },
  { pair: "GBP / USD", volume: "$32.1M" },
  { pair: "USD / JPY", volume: "$21.2M" },
];

export default function ProtocolStats() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Volume Chart */}
      <div className="lg:col-span-2">
        <VolumeChart />
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        {/* Savings */}
        <div className="bg-bg-surface border border-border rounded-lg p-4">
          <span className="text-label-uppercase text-text-muted block mb-1">
            Total Savings vs Traditional FX
          </span>
          <span className="text-h2 font-mono font-tabular text-success">$847,230</span>
          <p className="text-[12px] text-text-muted mt-2">
            Cumulative savings delivered to traders compared to best external venue rates
            (Wise, OFX, Revolut).
          </p>
        </div>

        {/* Top Pairs */}
        <div className="bg-bg-surface border border-border rounded-lg p-4">
          <span className="text-label-uppercase text-text-muted block mb-3">
            Top Pairs by Volume
          </span>
          <div className="flex flex-col gap-2">
            {topPairs.map((p) => (
              <div key={p.pair} className="flex justify-between text-body-sm">
                <span className="text-text-primary">{p.pair}</span>
                <span className="font-mono font-tabular text-text-secondary">{p.volume}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
