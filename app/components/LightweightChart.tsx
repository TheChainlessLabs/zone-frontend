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

interface LightweightChartProps {
  points: ChartPoint[];
  /** Optional override for test environments. */
  className?: string;
}

/**
 * Canvas area chart rendered with `lightweight-charts` (same library the
 * Uniswap web app ships). Quiet by design — no glow, no halo. The
 * crosshair is a muted dashed line, the area fill is a low-alpha amber
 * wash, and the trend line uses the heritage accent only for the
 * current-price highlight.
 *
 * `createChart` touches `document` on construction, so this component
 * must be rendered client-side only — import it via `next/dynamic` with
 * `ssr: false` from parent components.
 */
export default function LightweightChart({
  points,
  className = "h-full w-full",
}: LightweightChartProps) {
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
        textColor: "#B5B5B5",
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(51, 51, 51, 0.5)" },
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
          color: "#707070",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#232323",
        },
        horzLine: {
          color: "#707070",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#232323",
        },
      },
      handleScale: false,
      handleScroll: false,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#0EA5E9",
      topColor: "rgba(14, 165, 233, 0.18)",
      bottomColor: "rgba(14, 165, 233, 0.00)",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: "#0EA5E9",
      crosshairMarkerBackgroundColor: "#0A0A0A",
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
    <div className={className} data-testid="lightweight-chart-canvas">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
