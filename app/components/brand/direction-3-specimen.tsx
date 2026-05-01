"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Status } from "@/components/ui/status";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const VOICE_SAMPLES = ['Primary CTA: "Route order"', 'Error: "Ticket rejected. Check price, size, or wallet state."', 'Empty: "Nothing matched. Resting orders stay private until crossed."', 'Footer: "Midpoint execution. No broadcast intent."', 'Button: "Lock limit"'] as const;

type ChargePhase = "idle" | "charging" | "locked";

export function Direction3Specimen() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<ChargePhase>("idle");

  useEffect(() => {
    if (phase !== "charging") return;

    const timer = window.setTimeout(
      () => setPhase("locked"),
      reducedMotion ? 100 : 500,
    );
    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion]);

  const handleCharge = () => {
    if (reducedMotion) {
      setPhase("locked");
      return;
    }
    setPhase("charging");
  };

  return (
    <div
      className="brand-direction-3 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8"
      data-testid="brand-specimen-3"
    >
      <section className="brand-direction-3-card flex flex-col gap-8 p-5 md:p-6">
        <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Omega desk
            </p>
            <h1 className="brand-direction-3-display max-w-[10ch] text-[clamp(3.5rem,9vw,7rem)] leading-[0.92] text-[var(--foreground)]">
              acid witness
            </h1>
            <p className="max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">One aggressive move, held inside a risk-controlled frame.</p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2">
            <span className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--foreground)]">
              Trade
            </span>
            <span className="brand-direction-3-nav-active inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
              Route
            </span>
            <span className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Proof
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="brand-direction-3-card brand-direction-3-dominant p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="brand-direction-3-display text-[32px] leading-none text-[var(--foreground)]">
                  route order
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Active chamber
                </p>
              </div>
              <Status state="proven" label="Live proof" className="border-[var(--brand-accent)]/30 bg-[color-mix(in_oklab,var(--brand-accent)_16%,transparent)] text-[var(--foreground)]" />
            </div>

            <div className="mb-4 flex gap-2">
              <Chip active className="border border-[var(--border)] bg-[color-mix(in_oklab,var(--brand-accent)_10%,transparent)] text-[var(--foreground)]">
                Buy
              </Chip>
              <Chip className="border border-[var(--border)] bg-transparent text-[var(--muted-foreground)]">
                Sell
              </Chip>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input readOnly value="USDC/EURC" aria-label="Pair" className="h-11 rounded-[10px] border-[var(--input)] bg-[var(--bg-elevated)] font-mono text-sm" />
              <Input readOnly value="10,000.00 USDC" aria-label="Amount" className="h-11 rounded-[10px] border-[var(--input)] bg-[var(--bg-elevated)] font-mono text-sm" />
              <Input readOnly value="0.9213" aria-label="Price" className="h-12 rounded-[10px] border-[var(--input)] bg-[var(--bg-elevated)] font-mono text-2xl font-tabular" />
              <Input readOnly value="Limit" aria-label="Order type" className="h-12 rounded-[10px] border-[var(--input)] bg-[var(--bg-elevated)] font-mono text-sm uppercase tracking-[0.18em]" />
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-[var(--border)] py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              <div>
                <dt>Batch</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">#2048</dd>
              </div>
              <div>
                <dt>Midpoint</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">0.9213</dd>
              </div>
              <div>
                <dt>Wallet</dt>
                <dd className="mt-2 text-sm text-[var(--foreground)]">Ready</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[var(--muted-foreground)]">Midpoint execution. No broadcast intent.</p>
              <Button
                size="lg"
                onClick={handleCharge}
                data-phase={phase}
                className="brand-direction-3-charge min-w-[182px] rounded-[10px] border border-transparent font-mono text-[11px] uppercase tracking-[0.18em] shadow-none hover:bg-[var(--brand-accent)]"
              >
                {phase === "locked" ? "Lock limit" : "Route order"}
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="brand-direction-3-card flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-mono text-xs text-[var(--foreground)]">Batch #2048</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  USDC/EURC · 12 fills · 2026-05-01 09:16 UTC
                </p>
              </div>
              <Status state="proven" />
            </div>

            <div className="brand-direction-3-card flex min-h-40 flex-col items-center justify-center px-6 py-8 text-center">
              <WifiOff className="mb-3 h-5 w-5 text-[var(--muted-foreground)]" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--foreground)]">Nothing matched.</p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted-foreground)]">Resting orders stay private until crossed.</p>
            </div>

            <div className="brand-direction-3-card brand-direction-3-modal p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                    Sealed preview
                  </p>
                  <h2 className="brand-direction-3-display mt-3 text-3xl leading-none text-[var(--foreground)]">
                    lock limit
                  </h2>
                </div>
                <ShieldCheck className="h-5 w-5 text-[var(--muted-foreground)]" />
              </div>
              <div className="space-y-3">
                {["Sign", "Queue", "Match", "Settle"].map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-[10px] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-3 py-2"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--muted)] font-mono text-[10px] text-[var(--foreground)]">
                      {index + 1}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--foreground)]">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="brand-direction-3-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            Voice register
          </p>
          <ul className="mt-4 space-y-3">
            {VOICE_SAMPLES.map((sample) => (
              <li
                key={sample}
                className="rounded-[10px] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-3 py-3 text-sm leading-6 text-[var(--foreground)]"
              >
                {sample}
              </li>
            ))}
          </ul>
        </div>

        <div className="brand-direction-3-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Containment note</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[10px] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="brand-direction-3-display text-2xl text-[var(--foreground)]">raw heads</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">Lowercase Anton carries the raw headline voice.</p>
            </div>
            <div className="rounded-[10px] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="font-mono text-2xl font-tabular text-[var(--foreground)]">0.9213</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">Fragment Mono carries the formal data plane while lime stays contained to proof and routing.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
