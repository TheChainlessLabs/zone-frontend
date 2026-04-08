"use client";

import { useState, useEffect } from "react";

interface StaleDataOverlayProps {
  lastUpdated: number | null;
  thresholdMs?: number;
  criticalMs?: number;
  onRetry?: () => void;
}

type StaleState = "fresh" | "warning" | "critical";

export default function StaleDataOverlay({
  lastUpdated,
  thresholdMs = 10_000,
  criticalMs = 30_000,
  onRetry,
}: StaleDataOverlayProps) {
  const [state, setState] = useState<StaleState>("fresh");

  useEffect(() => {
    if (lastUpdated === null) {
      setState("fresh");
      return;
    }

    function check() {
      const elapsed = Date.now() - lastUpdated!;
      if (elapsed >= criticalMs) {
        setState("critical");
      } else if (elapsed >= thresholdMs) {
        setState("warning");
      } else {
        setState("fresh");
      }
    }

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated, thresholdMs, criticalMs]);

  if (state === "fresh") return null;

  return (
    <div
      data-testid="stale-overlay"
      className={`absolute inset-0 z-10 flex items-start justify-center pt-3 rounded-lg ${
        state === "critical"
          ? "bg-error/5"
          : "bg-warning/5"
      }`}
      style={{ pointerEvents: "none" }}
    >
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-body-sm font-medium backdrop-blur-sm ${
          state === "critical"
            ? "bg-error/15 text-error border border-error/25"
            : "bg-warning/15 text-warning border border-warning/25"
        }`}
      >
        {state === "critical" ? (
          <>
            <span>Connection lost</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-1 px-2 py-0.5 rounded text-xs font-semibold bg-error/20 hover:bg-error/30 transition-colors"
                style={{ pointerEvents: "auto" }}
              >
                Retry
              </button>
            )}
          </>
        ) : (
          <span>Data may be stale</span>
        )}
      </div>
    </div>
  );
}
