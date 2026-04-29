// Priya rewrite: turn /trade into a fixed-zone darkpool workstation so active traders keep chart-ticket-history muscle memory.
import * as React from "react";

type Mode = "market" | "limit";
type Side = "buy" | "sell";
type Panel = "orders" | "positions" | "fills";

const pairs = [
  { symbol: "USDC/EURC", midpoint: "0.9213", spread: "0.0002", change: "+0.04%" },
  { symbol: "USDC/USDT", midpoint: "0.9998", spread: "0.0001", change: "-0.01%" },
  { symbol: "USDT/EURC", midpoint: "0.9210", spread: "0.0003", change: "+0.06%" },
  { symbol: "ETH/USDC", midpoint: "3201.00", spread: "1.20", change: "+1.82%" },
];

const openOrders = [
  { id: "ord-01", side: "Buy", type: "Limit", amount: "250,000", price: "0.9208", status: "Working" },
  { id: "ord-02", side: "Sell", type: "Limit", amount: "500,000", price: "0.9221", status: "Partial" },
];

const positions = [
  { pair: "USDC/EURC", side: "Long", notional: "$230,400", entry: "0.9211", pnl: "+$184.20" },
  { pair: "USDC/USDT", side: "Short", notional: "$120,000", entry: "0.9999", pnl: "-$12.30" },
];

const fills = [
  { side: "Sell", pair: "USDC/EURC", amount: "500,000", price: "0.9213", status: "Settled", time: "14:02:11" },
  { side: "Buy", pair: "USDC/EURC", amount: "125,000", price: "0.9214", status: "Matched", time: "13:51:08" },
  { side: "Buy", pair: "USDC/USDT", amount: "200,000", price: "0.9998", status: "Settling", time: "13:19:44" },
];

export default function PriyaTradeRedesign() {
  const [mode, setMode] = React.useState<Mode>("limit");
  const [side, setSide] = React.useState<Side>("buy");
  const [panel, setPanel] = React.useState<Panel>("orders");
  const [pair, setPair] = React.useState(pairs[0]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-4 px-4 py-4 lg:px-6 lg:py-6">
        <header className="grid gap-3 rounded-[20px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--card)_86%,black)] p-3 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:items-center">
          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--muted)]/30 p-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Active market
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <div className="font-mono text-xl">{pair.symbol}</div>
                <div className="mt-1 flex gap-3 font-mono text-xs text-[var(--muted-foreground)]">
                  <span>mid {pair.midpoint}</span>
                  <span>spr {pair.spread}</span>
                  <span className="text-[var(--success)]">{pair.change}</span>
                </div>
              </div>
              <button className="rounded-full border border-[var(--border)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                switch
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Match model", value: "Private midpoint" },
              { label: "Liquidity view", value: "No public book" },
              { label: "Settlement", value: "Ethereum L1" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[16px] border border-[var(--border)] bg-[var(--muted)]/20 px-4 py-3"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  {item.label}
                </div>
                <div className="mt-2 font-mono text-sm">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[16px] border border-[color-mix(in_oklab,var(--success)_32%,transparent)] bg-[color-mix(in_oklab,var(--success)_10%,transparent)] p-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--success)]">
              Why this venue
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
              Hidden indications. Midpoint pricing. Only your matched activity is visible here.
            </p>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
          <aside className="order-2 flex flex-col gap-4 lg:order-1">
            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Market strip
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {pairs.map((candidate) => {
                  const active = candidate.symbol === pair.symbol;
                  return (
                    <button
                      key={candidate.symbol}
                      onClick={() => setPair(candidate)}
                      className={[
                        "flex items-center justify-between rounded-[14px] border px-3 py-3 text-left transition-colors",
                        active
                          ? "border-[var(--success)] bg-[color-mix(in_oklab,var(--success)_10%,transparent)]"
                          : "border-[var(--border)] bg-[var(--muted)]/20 hover:bg-[var(--muted)]/30",
                      ].join(" ")}
                    >
                      <span>
                        <span className="block font-mono text-sm">{candidate.symbol}</span>
                        <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                          midpoint {candidate.midpoint}
                        </span>
                      </span>
                      <span
                        className={[
                          "font-mono text-[11px]",
                          candidate.change.startsWith("+")
                            ? "text-[var(--success)]"
                            : "text-[var(--destructive)]",
                        ].join(" ")}
                      >
                        {candidate.change}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Private execution
              </div>
              <div className="mt-3 space-y-3">
                {[
                  ["Reference price", "Real-time midpoint"],
                  ["Visible liquidity", "None before match"],
                  ["Order state", "Working until counterpart"],
                  ["After match", "Own fills, batch, settlement"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                      {label}
                    </span>
                    <span className="font-mono text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <main className="order-1 flex flex-col gap-4 lg:order-2">
            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg">{pair.symbol}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      Midpoint reference
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["1m", "5m", "15m", "1h", "4h", "1d"].map((range, index) => (
                      <button
                        key={range}
                        className={[
                          "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
                          index === 1
                            ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                            : "border-[var(--border)] text-[var(--muted-foreground)]",
                        ].join(" ")}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-3xl">{pair.midpoint}</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                    midpoint · private execution anchor
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-3">
                <div className="relative h-[300px] overflow-hidden rounded-[12px] bg-[var(--muted)]/20 lg:h-[420px]">
                  <svg viewBox="0 0 860 420" className="h-full w-full">
                    {[72, 144, 216, 288, 360].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        x2="860"
                        y1={y}
                        y2={y}
                        stroke="var(--border)"
                        strokeDasharray="2 10"
                        strokeOpacity="0.55"
                      />
                    ))}
                    <line
                      x1="0"
                      x2="860"
                      y1="205"
                      y2="205"
                      stroke="rgba(250,250,250,0.4)"
                      strokeDasharray="8 8"
                    />
                    {Array.from({ length: 28 }).map((_, index) => {
                      const open = 170 + (index % 5) * 8 - (index % 3) * 6;
                      const close = open + (index % 2 === 0 ? -18 : 14);
                      const high = Math.min(open, close) - 18;
                      const low = Math.max(open, close) + 22;
                      const x = 28 + index * 29;
                      const color = close < open ? "var(--success)" : "var(--destructive)";
                      return (
                        <g key={x}>
                          <line x1={x} x2={x} y1={high} y2={low} stroke={color} strokeOpacity="0.8" />
                          <rect
                            x={x - 6}
                            y={Math.min(open, close)}
                            width="12"
                            height={Math.max(4, Math.abs(close - open))}
                            fill={color}
                            fillOpacity="0.8"
                          />
                        </g>
                      );
                    })}
                  </svg>
                  <div className="absolute bottom-3 left-3 rounded-full border border-[var(--border)] bg-[rgba(9,9,11,0.82)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                    midpoint line only · no public depth
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {[
                  ["Expected match", "Private counterflow"],
                  ["Fee", "0.005%"],
                  ["Protection", mode === "market" ? "0.08% slippage" : "Post if not crossed"],
                  ["Settlement path", "Batch then L1"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[14px] border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                      {label}
                    </div>
                    <div className="mt-2 font-mono text-sm">{value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  {[
                    ["orders", "Open orders"],
                    ["positions", "Positions"],
                    ["fills", "Own fills"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setPanel(value as Panel)}
                      className={[
                        "rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em]",
                        panel === value
                          ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)]",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  personal activity only
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-[16px] border border-[var(--border)]">
                <table className="w-full">
                  <thead className="bg-[var(--muted)]/20 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                    <tr>
                      {(panel === "orders"
                        ? ["Side", "Type", "Amount", "Price", "Status"]
                        : panel === "positions"
                          ? ["Pair", "Side", "Notional", "Entry", "PnL"]
                          : ["Side", "Pair", "Amount", "Price", "Status", "Time"]
                      ).map((label) => (
                        <th key={label} className="px-4 py-3 text-left font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    {panel === "orders" &&
                      openOrders.map((row) => (
                        <tr key={row.id} className="border-t border-[var(--border)]">
                          <td className="px-4 py-3 text-[var(--success)]">{row.side}</td>
                          <td className="px-4 py-3">{row.type}</td>
                          <td className="px-4 py-3">{row.amount}</td>
                          <td className="px-4 py-3">{row.price}</td>
                          <td className="px-4 py-3 text-[var(--muted-foreground)]">{row.status}</td>
                        </tr>
                      ))}
                    {panel === "positions" &&
                      positions.map((row) => (
                        <tr key={row.pair + row.side} className="border-t border-[var(--border)]">
                          <td className="px-4 py-3">{row.pair}</td>
                          <td className="px-4 py-3">{row.side}</td>
                          <td className="px-4 py-3">{row.notional}</td>
                          <td className="px-4 py-3">{row.entry}</td>
                          <td className={["px-4 py-3", row.pnl.startsWith("+") ? "text-[var(--success)]" : "text-[var(--destructive)]"].join(" ")}>{row.pnl}</td>
                        </tr>
                      ))}
                    {panel === "fills" &&
                      fills.map((row) => (
                        <tr key={row.time + row.amount} className="border-t border-[var(--border)]">
                          <td className={["px-4 py-3", row.side === "Buy" ? "text-[var(--success)]" : "text-[var(--destructive)]"].join(" ")}>{row.side}</td>
                          <td className="px-4 py-3">{row.pair}</td>
                          <td className="px-4 py-3">{row.amount}</td>
                          <td className="px-4 py-3">{row.price}</td>
                          <td className="px-4 py-3 text-[var(--muted-foreground)]">{row.status}</td>
                          <td className="px-4 py-3 text-[var(--muted-foreground)]">{row.time}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          <aside className="order-3 flex flex-col gap-4 lg:sticky lg:top-6 lg:h-fit">
            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Order ticket
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  {pair.symbol}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 rounded-[14px] bg-[var(--muted)]/30 p-1">
                {(["market", "limit"] as Mode[]).map((value) => (
                  <button
                    key={value}
                    onClick={() => setMode(value)}
                    className={[
                      "rounded-[12px] px-3 py-2 font-mono text-xs uppercase tracking-[0.16em]",
                      mode === value
                        ? "bg-[var(--background)] text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)]",
                    ].join(" ")}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["buy", "sell"] as Side[]).map((value) => (
                  <button
                    key={value}
                    onClick={() => setSide(value)}
                    className={[
                      "rounded-[14px] border px-3 py-3 font-mono text-sm uppercase tracking-[0.08em]",
                      side === value && value === "buy"
                        ? "border-[var(--success)] bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-[var(--success)]"
                        : side === value && value === "sell"
                          ? "border-[var(--destructive)] bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] text-[var(--destructive)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)]",
                    ].join(" ")}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {mode === "limit" ? (
                  <Field label="Limit price" value={pair.midpoint} suffix="EURC" helper="rest if not crossed" />
                ) : (
                  <Field label="Slippage cap" value="0.08" suffix="%" helper="hard fail beyond cap" />
                )}
                <Field label="Size" value="250000" suffix="USDC" helper="25% · 50% · 75% · max" />
                <Field label="Estimated receive" value="230325.00" suffix="EURC" helper="midpoint estimate" />
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {[
                  ["Execution", mode === "market" ? "Cross now" : "Rest private"],
                  ["Protection", mode === "market" ? "Slippage cap" : "Post only"],
                  ["Fees", "0.005%"],
                  ["Settlement", "Batch then L1"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[14px] border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                      {label}
                    </div>
                    <div className="mt-2 font-mono text-sm">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  mode === "market" ? "slippage protected" : "post only",
                  "reduce only",
                  "show settlement path",
                ].map((pill) => (
                  <div
                    key={pill}
                    className="rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
                  >
                    {pill}
                  </div>
                ))}
              </div>

              <button
                className={[
                  "mt-5 w-full rounded-[16px] px-4 py-3 font-mono text-sm uppercase tracking-[0.12em]",
                  side === "buy"
                    ? "bg-[var(--success)] text-[var(--success-foreground)]"
                    : "bg-[var(--destructive)] text-[var(--destructive-foreground)]",
                ].join(" ")}
              >
                {mode === "market" ? "submit market" : "place limit"}
              </button>

              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                {mode === "market"
                  ? "Market crosses private liquidity immediately or fails at your cap."
                  : "Limit rests as private interest and moves into Open orders after submit."}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  suffix,
  helper,
}: {
  label: string;
  value: string;
  suffix: string;
  helper: string;
}) {
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--muted)]/16 px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          {label}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          {helper}
        </div>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="font-mono text-2xl">{value}</div>
        <div className="font-mono text-sm uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          {suffix}
        </div>
      </div>
    </div>
  );
}
