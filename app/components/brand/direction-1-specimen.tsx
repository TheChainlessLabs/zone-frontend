"use client";

import { CheckCircle2, Download, ShieldCheck, WifiOff } from "lucide-react";
import type { PropsWithChildren } from "react";
import { OmegaMark } from "@/components/OmegaMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Receipt } from "@/components/ui/receipt";
import { Status } from "@/components/ui/status";

const VOICE_SAMPLES = [["Primary CTA", "Submit order"], ["Error", "Signature expired. Re-sign to confirm this ticket."], ["Empty", "No fills yet. Matched orders will print here."], ["Footer", "Darkpool FX. Onchain settlement."], ["Button", "View proof"]] as const;

export function Direction1Specimen() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8" data-testid="brand-specimen-1">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Fixture title="Navbar mockup">
          <div data-testid="fixture-navbar" className="space-y-5">
            <div className="brand-direction-1-navbar mx-auto flex max-w-lg items-center justify-between gap-3 px-3 py-2">
              <span className="flex items-center gap-2">
                <OmegaMark size={22} aria-hidden />
                <span className="brand-direction-1-wordmark">Omega Markets</span>
              </span>
              <div className="flex items-center gap-1">
                {["Trade", "Batches", "Account"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    data-active={item === "Trade"}
                    className={`brand-direction-1-nav-item px-3 py-1 text-sm ${
                      item === "Trade" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <span className="h-2.5 w-2.5 rounded-full border border-[var(--border)] bg-[var(--brand-accent)] shadow-[0_0_10px_color-mix(in_oklab,var(--brand-accent)_60%,transparent)]" />
            </div>
            <div className="space-y-3">
              <p className="brand-direction-1-eyebrow eyebrow text-[11px]">Proofline Blue</p>
              <h1 className="text-[clamp(3rem,6vw,4rem)] leading-[1.06] tracking-[-0.03em] text-[var(--foreground)]" style={{ fontFamily: "var(--brand-display)" }}>Darkpool FX.</h1>
              <p className="brand-direction-1-strapline">Quiet authority, attestation blue, and one evidence-like serif note under the line of trade.</p>
            </div>
          </div>
        </Fixture>

        <Fixture title="Order ticket card">
          <div data-testid="fixture-order-ticket" className="brand-direction-1-card p-4">
            <div className="mb-4 flex gap-2">
              <Chip active data-side="buy" className="brand-direction-1-chip brand-direction-1-scanline">
                Buy
              </Chip>
              <Chip data-side="sell" className="brand-direction-1-chip">Sell</Chip>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Chip active className="brand-direction-1-chip">
                Market
              </Chip>
              <Chip className="brand-direction-1-chip">Limit</Chip>
              <Chip active className="brand-direction-1-chip">
                Day
              </Chip>
              <Chip className="brand-direction-1-chip">IOC</Chip>
              <Chip className="brand-direction-1-chip">GTC</Chip>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input readOnly value="USDC/EURC" aria-label="Pair" />
              <Input readOnly value="10,000.00 USDC" aria-label="Amount" />
              <Input readOnly value="0.9213" aria-label="Price" />
              <Input readOnly value="Limit" aria-label="Order type" />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>Midpoint settlement</span>
              <Button size="sm" className="brand-direction-1-scanline" style={{ fontFamily: "var(--brand-display)" }}>
                <span>Submit order</span>
              </Button>
            </div>
          </div>
        </Fixture>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Fixture title="Disconnected state pattern">
          <div
            data-testid="fixture-disconnected"
            className="brand-direction-1-card flex min-h-48 flex-col items-center justify-center border-dashed px-6 py-8 text-center"
          >
            <WifiOff className="mb-3 h-5 w-5 text-[var(--muted-foreground)]" />
            <p className="text-sm font-medium">Wallet disconnected.</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Reconnect to sign and route this ticket.</p>
          </div>
        </Fixture>

        <Fixture title="Verified batch row">
          <div data-testid="fixture-verified-batch" className="brand-direction-1-card flex items-center justify-between px-4 py-3">
            <div>
              <p className="brand-direction-1-eyebrow eyebrow text-xs">Batch #4821</p>
              <p className="text-sm text-[var(--muted-foreground)]">USDC/EURC · 12 fills · 2026-05-01 09:16 UTC</p>
            </div>
            <Status state="proven" className="brand-direction-1-scanline" />
          </div>
        </Fixture>

        <Fixture title="Pending batch row">
          <div data-testid="fixture-pending-batch" className="brand-direction-1-card flex items-center justify-between px-4 py-3">
            <div>
              <p className="brand-direction-1-eyebrow eyebrow text-xs">Batch #2049</p>
              <p className="text-sm text-[var(--muted-foreground)]">USDC/EURC · queued for next proof window</p>
            </div>
            <Status state="pending" />
          </div>
        </Fixture>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Fixture title="Receipt/export panel">
          <div data-testid="fixture-receipt-export">
            <Receipt cta={{ label: "Export receipt", href: "#" }}>
              <Receipt.Header className="brand-direction-1-receipt-header" label="Settlement record" />
              <Receipt.Metadata>
                <Receipt.Row label="Pair" value="USDC/EURC" />
                <Receipt.Row label="Side" value="Buy" />
                <Receipt.Row label="Amount" value="10,000.00 USDC" />
                <Receipt.Row label="Proof" value="0x1f2d3b44ef7812c9b1fa4d27e39ae519d11ef4c3" />
              </Receipt.Metadata>
              <Receipt.Actions>
                <Receipt.Action number={1} label="Signed" payload="Wallet approval" />
                <Receipt.Action number={2} label="Matched" payload="Private midpoint" />
                <Receipt.Action number={3} label="Settled" payload="Batch finality" />
              </Receipt.Actions>
            </Receipt>
          </div>
        </Fixture>

        <Fixture title="Modal stepper preview">
          <div
            data-testid="fixture-modal-stepper"
            className="brand-direction-1-card relative p-5 shadow-[inset_0_1px_0_0_rgba(124,185,255,0.18),0_22px_48px_-28px_rgba(4,10,18,0.96),0_10px_22px_-18px_rgba(26,42,67,0.8)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="brand-direction-1-eyebrow eyebrow text-[10px]">
                  <span className="eyebrow" data-variant="route">
                    /TRADE
                  </span>
                  <span className="eyebrow ml-2">Order preview</span>
                </p>
                <h3 className="mt-2 text-lg text-[var(--foreground)]" style={{ fontFamily: "var(--brand-display)" }}>
                  Route USDC/EURC ticket
                </h3>
              </div>
              <ShieldCheck className="h-5 w-5 text-[var(--muted-foreground)]" />
            </div>
            <ol className="space-y-3">
              {["Sign", "Queue", "Match", "Settle"].map((step, index) => (
                <li key={step} className="brand-direction-1-card flex items-center gap-3 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--muted)] text-xs">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                  {index < 2 ? <CheckCircle2 className="ml-auto h-4 w-4 text-[var(--success)]" /> : null}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>Receipt ready after settlement.</span>
              <Download className="h-4 w-4" />
            </div>
          </div>
        </Fixture>
      </div>

      <Fixture title="Voice register">
        <div data-testid="fixture-voice-card" className="brand-direction-1-card grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
          {VOICE_SAMPLES.map(([label, copy]) => (
            <div key={label} className="rounded-[10px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_36%,var(--card)_64%)] px-3 py-3">
              <p className="brand-direction-1-eyebrow eyebrow text-[10px]">{label}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{copy}</p>
            </div>
          ))}
        </div>
      </Fixture>
    </div>
  );
}

function Fixture({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <Card className="brand-direction-1-card shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="brand-direction-1-eyebrow eyebrow text-[11px]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
