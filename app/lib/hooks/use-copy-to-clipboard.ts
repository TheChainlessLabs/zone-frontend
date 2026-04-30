"use client";

import * as React from "react";

/**
 * useCopyToClipboard — small reusable hook for click-to-copy surfaces.
 *
 * Returns `{ copied, copy }`. After a successful copy the `copied` flag
 * flips true and resets to false after `timeout` ms. Cleanup on unmount
 * cancels the pending reset so consumers don't update state on a torn-down
 * component.
 *
 * Silent no-op when `navigator.clipboard.writeText` is unavailable
 * (older browsers, SSR) — the surface still renders, the affirmation
 * just never fires.
 */
export interface UseCopyToClipboardOptions {
  timeout?: number;
}

export interface UseCopyToClipboardResult {
  copied: boolean;
  copy: (value: string) => Promise<void>;
}

export function useCopyToClipboard(
  { timeout = 2000 }: UseCopyToClipboardOptions = {},
): UseCopyToClipboardResult {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = React.useCallback(
    async (value: string) => {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        return;
      }
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
      } catch {
        // Silent fail — clipboard permission denied; surface unchanged.
      }
    },
    [timeout],
  );

  return { copied, copy };
}
