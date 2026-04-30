"use client";

import * as React from "react";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";

/**
 * CopyButton — single-purpose icon button that copies a string to the
 * clipboard and surfaces a transient "copied" affirmation. Stays under
 * 24 px square so it can sit inline with monospace hashes without
 * disrupting the row baseline.
 *
 * Visual feedback (M5.3 — #226): a tiny mono "copied" label appears
 * absolutely-positioned next to the button for 2 s on success. No fade,
 * no checkmark swap, no toast — `@starting-style` handles the entry
 * easing. Reduced-motion is respected via the global motion override
 * shipped in M5.1.
 *
 * Falls back to a no-op when `navigator.clipboard` is unavailable
 * (older browsers, SSR). The button still renders so the layout stays
 * stable; the affirmation just never fires.
 */
export interface CopyButtonProps {
  value: string;
  /** Accessible label, e.g. "Copy batch ID". */
  label: string;
  className?: string;
}

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard({ timeout: 2000 });

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    void copy(value);
  }

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        title={copied ? "Copied" : label}
        onClick={handleClick}
        className={cn(
          "press-down inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] p-0 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        )}
      >
        <Icon.Copy className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 select-none whitespace-nowrap"
      >
        {copied ? (
          <span className="origin-left font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] transition-[opacity,scale] duration-[80ms] starting:opacity-0 starting:scale-[0.97]">
            copied
          </span>
        ) : null}
      </span>
    </span>
  );
}
