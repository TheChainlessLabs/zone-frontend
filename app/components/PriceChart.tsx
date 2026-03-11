interface PriceChartProps {
  pair?: string;
}

export default function PriceChart({ pair = "EUR/USD" }: PriceChartProps) {
  return (
    <div className="bg-bg-elevated rounded-lg flex items-center justify-center aspect-video">
      <span className="text-text-muted text-body-sm">TradingView — {pair}</span>
    </div>
  );
}
