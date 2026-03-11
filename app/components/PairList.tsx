import Link from "next/link";
import { mockPairs } from "@/lib/mockData";

export default function PairList() {
  return (
    <div className="flex flex-col">
      {mockPairs.map((pair) => (
        <Link
          key={pair.pair}
          href={`/trade/pair/${pair.pair.replace("/", "-")}`}
          className="flex items-center justify-between px-3 h-[44px] hover:bg-bg-elevated transition-fast border-b border-border-subtle"
        >
          <div className="flex flex-col">
            <span className="text-body-sm font-medium text-text-primary">{pair.pair}</span>
            <span className="text-label-uppercase text-text-muted" style={{ fontSize: "10px" }}>
              {pair.fullName}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-body-sm font-mono font-tabular text-text-primary">
              {pair.price.toFixed(4)}
            </span>
            <span
              className={`text-body-sm font-mono font-tabular ${
                pair.change >= 0 ? "text-success" : "text-error"
              }`}
              style={{ fontSize: "11px" }}
            >
              {pair.change >= 0 ? "+" : ""}
              {pair.change.toFixed(2)}%
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
