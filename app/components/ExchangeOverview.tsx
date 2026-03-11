import { mockExchangeStats } from "@/lib/mockData";

const statCards = [
  { label: "24h Volume", value: mockExchangeStats.volume },
  { label: "Total Trades", value: mockExchangeStats.trades.toLocaleString() },
  { label: "Active Pairs", value: String(mockExchangeStats.activePairs) },
  { label: "Batches", value: mockExchangeStats.batches.toLocaleString() },
  { label: "Avg Settlement", value: mockExchangeStats.avgSettlement },
];

export default function ExchangeOverview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-bg-surface border border-border rounded-lg p-4"
        >
          <span className="text-label-uppercase text-text-muted">{stat.label}</span>
          <p className="text-h3 font-mono font-tabular mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
