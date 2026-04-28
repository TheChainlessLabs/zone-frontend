"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * CopyButton — single-purpose icon button that copies a string to the
 * clipboard and surfaces a transient "Copied" affirmation. Stays under
 * 24 px square so it can sit inline with monospace hashes without
 * disrupting the row baseline.
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
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // Silent fail — clipboard permission denied, surface unchanged.
      });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      aria-label={label}
      title={copied ? "Copied" : label}
      onClick={handleClick}
      className={cn("h-6 w-6 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]", className)}
    >
      {copied ? (
        <Icon.Confirm className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Icon.Copy className="h-3.5 w-3.5" aria-hidden />
      )}
    </Button>
  );
}
