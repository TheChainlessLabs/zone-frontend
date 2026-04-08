"use client";

import { useState, useEffect, useRef } from "react";
import { useOrderBook } from "@/lib/hooks/useOrderBook";

type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

const DISCONNECT_THRESHOLD_MS = 15_000; // 3 poll intervals (5s each)

const statusConfig: Record<
  ConnectionStatus,
  { color: string; label: string }
> = {
  connected: { color: "bg-success", label: "TEE Connected" },
  reconnecting: { color: "bg-warning", label: "Reconnecting" },
  disconnected: { color: "bg-error", label: "Disconnected" },
};

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function StatusBar() {
  const { isError } = useOrderBook();

  const [status, setStatus] = useState<ConnectionStatus>("connected");
  const [elapsed, setElapsed] = useState(0);
  const lastSuccessRef = useRef(Date.now());
  const errorSinceRef = useRef<number | null>(null);

  // Track when errors start/stop
  useEffect(() => {
    if (!isError) {
      errorSinceRef.current = null;
      lastSuccessRef.current = Date.now();
      setElapsed(0);
      setStatus("connected");
    } else if (errorSinceRef.current === null) {
      errorSinceRef.current = Date.now();
      setStatus("reconnecting");
    }
  }, [isError]);

  // 1-second timer: update elapsed and check disconnect threshold
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const seconds = Math.floor(
        (now - lastSuccessRef.current) / 1000
      );
      setElapsed(seconds);

      // Promote reconnecting → disconnected after threshold
      if (
        errorSinceRef.current !== null &&
        now - errorSinceRef.current >= DISCONNECT_THRESHOLD_MS
      ) {
        setStatus("disconnected");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { color, label } = statusConfig[status];

  return (
    <div className="min-h-[28px] bg-bg-surface border-t border-border flex items-center px-4 md:px-[60px] text-[11px] font-mono text-text-muted shrink-0 lg:mb-0 mb-0">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
        <span className="whitespace-nowrap">{label}</span>
      </div>

      <span className="mx-2 md:mx-3 w-px h-3 bg-border-subtle shrink-0" />

      <div className="hidden md:flex items-center gap-2">
        <span className="font-tabular text-text-primary">Batch #1247</span>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-warning/20 text-warning">
          Processing
        </span>
      </div>

      <span className="ml-auto whitespace-nowrap text-[10px] md:text-[11px]">
        Last update {formatElapsed(elapsed)}
      </span>
    </div>
  );
}
