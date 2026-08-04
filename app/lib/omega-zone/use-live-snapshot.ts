"use client";

import * as React from "react";

export type ZoneLiveSnapshotState = "idle" | "loading" | "ready" | "error";

export function useZoneLiveSnapshot({
  enabled,
  identity,
  load,
}: {
  enabled: boolean;
  identity?: string;
  load: () => Promise<void>;
}) {
  const loadRef = React.useRef(load);
  loadRef.current = load;

  const [state, setState] = React.useState<ZoneLiveSnapshotState>("idle");
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (!enabled) {
      setState("idle");
      setError(undefined);
      return;
    }

    let cancelled = false;

    async function loadSnapshot() {
      setState("loading");
      setError(undefined);
      try {
        await loadRef.current();
        if (!cancelled) setState("ready");
      } catch (cause) {
        if (!cancelled) {
          setError(getErrorMessage(cause));
          setState("error");
        }
      }
    }

    void loadSnapshot();
    return () => {
      cancelled = true;
    };
  }, [enabled, identity]);

  return { state, error } as const;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Omega Zone request failed.";
}
