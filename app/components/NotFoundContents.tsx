"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * NotFoundContents — visual body of the /not-found route.
 *
 * Extracted into its own component so the /system review surface can render
 * the same composition inline (next to DisconnectedState variants) without
 * navigating to a bogus URL. The route page wraps this in a full-viewport
 * layout; /system wraps it in a framed preview.
 *
 * Voice (omega-docs/03-brand/messaging.md): "[What happened.] [What to do
 * next.]" Two short sentences, period-terminated, no exclamation points.
 *
 * Ambient OMEGA mark (omega-docs/03-brand/naming.md): tracking-wide all-caps
 * mono, very low opacity, decorative only — sits behind the 404 numeral.
 */
export function NotFoundContents({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-6 text-center",
        className,
      )}
    >
      <div className="relative flex h-40 items-center justify-center md:h-48">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-mono text-3xl uppercase tracking-[0.4em] text-[var(--muted-foreground)] opacity-[0.08] md:text-5xl md:tracking-[0.5em]"
        >
          OMEGA
        </span>
        <span className="relative font-mono text-7xl font-thin tracking-tight text-[var(--foreground)] md:text-8xl">
          404
        </span>
      </div>

      <h1 className="text-2xl font-medium leading-tight tracking-tight md:text-3xl">
        Page not found.
      </h1>
      <p className="max-w-[460px] text-sm leading-relaxed text-[var(--muted-foreground)]">
        The route you tried doesn&apos;t exist. Head back to /trade.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button asChild>
          <Link href="/trade">Back to /trade</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/brand">View brand board</Link>
        </Button>
      </div>
    </div>
  );
}
