import { Lock } from "lucide-react";

const stats = [
  { label: "24H Volume", value: "$248M" },
  { label: "Trades Today", value: "12,847" },
  { label: "Savings Delivered", value: "$1.2M", highlight: true },
  { label: "Avg Spread", value: "0.3 pips" },
];

interface DisconnectedStateProps {
  onConnect: () => void;
}

export default function DisconnectedState({ onConnect }: DisconnectedStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-[64px] h-[64px] rounded-xl bg-bg-elevated flex items-center justify-center mb-6">
        <Lock size={28} className="text-accent" />
      </div>

      <h1 className="text-h2 md:text-h1 font-semibold text-center">
        Trade FX at the True Midpoint
      </h1>
      <p className="text-body-sm text-text-muted mt-3 text-center max-w-[460px]">
        Omega is a darkpool for stablecoin FX. Anonymous execution at midpoint
        pricing with zero information leakage.
      </p>

      <button
        onClick={onConnect}
        className="mt-8 h-[48px] px-8 text-body-sm font-medium rounded-md bg-accent text-text-inverse hover:bg-accent-hover transition-fast"
      >
        Connect Wallet to Get Started
      </button>

      <div className="flex items-center gap-0 mt-12">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center px-6 md:px-8 ${
              i < stats.length - 1 ? "border-r border-border" : ""
            }`}
          >
            <span
              className={`text-h3 md:text-h2 font-mono font-tabular ${
                stat.highlight ? "text-success" : "text-text-primary"
              }`}
            >
              {stat.value}
            </span>
            <span className="text-[11px] text-text-muted mt-1">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
