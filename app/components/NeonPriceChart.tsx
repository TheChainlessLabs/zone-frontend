"use client";

import { useEffect, useRef } from "react";
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { ChartPoint } from "@/lib/chartData";

interface NeonPriceChartProps {
  points: ChartPoint[];
  /** Optional override for test environments. */
  className?: string;
}

/**
 * Canvas area chart rendered with `lightweight-charts` — the same library
 * shipped by the Uniswap web app. Styled with Omega's accent cyan gradient
 * and wrapped in a container that applies a CSS drop-shadow for the neon
 * glow (see `.neon-chart canvas` rule in globals.css).
 *
 * This component touches `document` on construction via `createChart`, so it
 * must be rendered client-side only. Import it via `next/dynamic` with
 * `ssr: false` from parent components.
 */
export default function NeonPriceChart({
  points,
  className = "h-full w-full",
}: NeonPriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  // Initialize the chart once on mount, tear it down on unmount.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#A0A0A0",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(51, 51, 51, 0.35)" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.15, bottom: 0.1 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: "#0EA5E9",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0EA5E9",
        },
        horzLine: {
          color: "#0EA5E9",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0EA5E9",
        },
      },
      handleScale: false,
      handleScroll: false,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#0EA5E9",
      topColor: "rgba(14, 165, 233, 0.35)",
      bottomColor: "rgba(14, 165, 233, 0.00)",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: "#0EA5E9",
      crosshairMarkerBackgroundColor: "#0D0D0D",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Push new data whenever the points prop changes.
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;

    series.setData(
      points.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })),
    );

    if (points.length > 0) {
      chart.timeScale().fitContent();
    }
  }, [points]);

  return (
    <div className={`neon-chart ${className}`} data-testid="neon-chart-canvas">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
