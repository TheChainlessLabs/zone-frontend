"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VOICE_SAMPLES = [
  { label: "Primary CTA", copy: "Submit batch" },
  { label: "Error", copy: "Price moved outside tolerance. Amend and resubmit." },
  { label: "Empty", copy: "No settlement record for this filter." },
  { label: "Footer", copy: "Proof onchain. Counterparties absent by design." },
  { label: "Button", copy: "Read batch log" }
];

export function Direction4Specimen() {
  return (
    <div data-testid="direction-4-specimen" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card data-testid="offset-ledger-hero" className="rounded-[8px] border border-[var(--border)] bg-[var(--card)]">
        <CardContent className="grid gap-8 p-6 md:grid-cols-[0.85fr_1.15fr] md:items-end">
          <div className="space-y-4">
            <p data-direction-mono className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Exploration / direction 04</p>
            <div className="space-y-2">
              <p data-direction-display className="max-w-[8ch] text-[clamp(4.875rem,12vw,7rem)] leading-[0.9] tracking-[0.03em] text-[var(--foreground)]">Offset Ledger</p>
              <p className="max-w-sm font-serif text-base leading-relaxed text-[var(--muted-foreground)]">Museum-grade proof language pulled into an execution surface without losing operational clarity.</p>
            </div>
          </div>
          <div className="relative min-h-52 border-l border-[var(--border)] pl-5">
            <p data-testid="offset-ledger-hero-number" data-direction-display className="absolute -right-6 top-0 text-[clamp(7rem,18vw,11rem)] leading-[0.8] tracking-[0.01em] text-[color-mix(in_oklab,var(--brand-accent)_28%,transparent)]">2048</p>
            <div className="relative z-10 flex h-full flex-col justify-end gap-3 pb-1">
              <p data-direction-mono className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Overscaled batch numeral, intentionally off-grid</p>
              <p className="max-w-sm text-sm leading-6 text-[var(--foreground)]">Accent belongs on the frame, the plate, and the registration marks. The type does the heavy lift.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card data-testid="offset-ledger-voice-card" className="rounded-[8px] border border-[var(--border)] bg-[var(--card)]">
        <CardContent className="flex h-full flex-col gap-5 p-6">
          <div className="space-y-2">
            <p data-direction-mono className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Voice register</p>
            <p className="text-sm leading-6 text-[var(--foreground)]">Terse institutional copy, printed like captions rather than app hints.</p>
          </div>
          <ul className="space-y-3">
            {VOICE_SAMPLES.map((sample) => (
              <li key={sample.label} className="pt-3 first:border-t-0 first:pt-0">
                <p data-direction-mono className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{sample.label}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">{sample.copy}</p>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-4">
            <p data-direction-mono className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Powder-blue registration accent</p>
            <Button size="sm">
              Read batch log
              <ArrowUpRight />
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card data-testid="offset-ledger-motion-card" className="rounded-[8px] border border-[var(--border)] bg-[var(--popover)] xl:col-span-2">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div className="space-y-2">
            <p data-direction-mono className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Signature motion</p>
            <p data-direction-display className="text-[clamp(3.5rem,9vw,5.5rem)] leading-[0.88] tracking-[0.03em] text-[var(--foreground)]">Orthogonal slide</p>
            <p className="max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">Numerals and captions align like print layers locking into registration.</p>
          </div>
          <div className="grid gap-4 rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-end justify-between gap-4 border-b border-[var(--border)] pb-3">
              <span data-direction-display data-motion-layer="x" className="text-[clamp(3rem,8vw,5rem)] leading-[0.82] tracking-[0.03em] text-[var(--brand-accent)]">04</span>
              <span data-direction-mono data-motion-layer="caption" className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">registration layer</span>
            </div>
            <div className="grid gap-2">
              <span data-motion-layer="y" className="text-lg font-medium text-[var(--foreground)]">Settlement notice aligned</span>
              <span data-direction-mono data-motion-layer="caption" className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">100ms x-axis, 150ms y-axis, opacity-only in reduced motion</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
