"use client";

import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
}

export default function TradingViewChart({
  symbol = "FX:EURUSD",
  interval = "60",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.textContent = JSON.stringify({
      symbol,
      interval,
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "#0D0D0D",
      gridColor: "#1A1A1A",
      autosize: true,
      hide_top_toolbar: true,
      hide_side_toolbar: true,
      hide_volume: true,
      hide_legend: true,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      withdateranges: true,
      timezone: "Etc/UTC",
    });

    container.appendChild(script);

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [symbol, interval]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full h-full"
    />
  );
}
