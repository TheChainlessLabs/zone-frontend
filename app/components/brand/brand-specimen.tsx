"use client";

import { CheckCircle2, Download, ShieldCheck, WifiOff } from "lucide-react";
import type { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Receipt } from "@/components/ui/receipt";
import { Status } from "@/components/ui/status";

export function BrandSpecimen({ direction }: { direction: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8" data-testid={`brand-specimen-${direction}`}>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Fixture title="Navbar mockup"><div data-testid="fixture-navbar" className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"><span className="font-mono text-[11px] uppercase tracking-[0.18em]">Omega desk</span><div className="flex gap-2"><Chip active>Trade</Chip><Chip>Batches</Chip><Chip>Account</Chip></div><span className="h-2.5 w-2.5 rounded-full border border-[var(--border)] bg-transparent" /></div></Fixture>
        <Fixture title="Order ticket card"><div data-testid="fixture-order-ticket" className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"><div className="mb-4 flex gap-2"><Chip active>Buy</Chip><Chip>Sell</Chip></div><div className="grid gap-3 md:grid-cols-2"><Input readOnly value="USDC/EURC" aria-label="Pair" /><Input readOnly value="10,000.00 USDC" aria-label="Amount" /><Input readOnly value="0.9213" aria-label="Price" /><Input readOnly value="Limit" aria-label="Order type" /></div><div className="mt-4 flex items-center justify-between text-xs text-[var(--muted-foreground)]"><span>Midpoint settlement</span><Button size="sm">Submit order</Button></div></div></Fixture>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Fixture title="Disconnected state pattern"><div data-testid="fixture-disconnected" className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-8 text-center"><WifiOff className="mb-3 h-5 w-5 text-[var(--muted-foreground)]" /><p className="text-sm font-medium">Wallet disconnected.</p><p className="mt-2 text-sm text-[var(--muted-foreground)]">Reconnect to sign and route this ticket.</p></div></Fixture>
        <Fixture title="Verified batch row"><div data-testid="fixture-verified-batch" className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"><div><p className="font-mono text-xs">Batch #2048</p><p className="text-sm text-[var(--muted-foreground)]">USDC/EURC · 12 fills · 2026-05-01 09:16 UTC</p></div><Status state="proven" /></div></Fixture>
        <Fixture title="Pending batch row"><div data-testid="fixture-pending-batch" className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"><div><p className="font-mono text-xs">Batch #2049</p><p className="text-sm text-[var(--muted-foreground)]">USDC/EURC · queued for next proof window</p></div><Status state="pending" /></div></Fixture>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Fixture title="Receipt/export panel"><div data-testid="fixture-receipt-export"><Receipt cta={{ label: "Export receipt", href: "#" }}><Receipt.Header label="SETTLEMENT RECORD" /><Receipt.Metadata><Receipt.Row label="Pair" value="USDC/EURC" /><Receipt.Row label="Side" value="Buy" /><Receipt.Row label="Amount" value="10,000.00 USDC" /><Receipt.Row label="Proof" value="0x1f2d3b44ef7812c9b1fa4d27e39ae519d11ef4c3" /></Receipt.Metadata><Receipt.Actions><Receipt.Action number={1} label="Signed" payload="Wallet approval" /><Receipt.Action number={2} label="Matched" payload="Private midpoint" /><Receipt.Action number={3} label="Settled" payload="Batch finality" /></Receipt.Actions></Receipt></div></Fixture>
        <Fixture title="Modal stepper preview"><div data-testid="fixture-modal-stepper" className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)]"><div className="mb-4 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Order preview</p><h3 className="mt-2 text-lg font-medium">Route USDC/EURC ticket</h3></div><ShieldCheck className="h-5 w-5 text-[var(--muted-foreground)]" /></div><ol className="space-y-3">{["Sign","Queue","Match","Settle"].map((step, index) => <li key={step} className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--muted)] text-xs">{index + 1}</span><span className="text-sm">{step}</span>{index < 2 ? <CheckCircle2 className="ml-auto h-4 w-4 text-[var(--success)]" /> : null}</li>)}</ol><div className="mt-4 flex items-center justify-between text-xs text-[var(--muted-foreground)]"><span>Receipt ready after settlement.</span><Download className="h-4 w-4" /></div></div></Fixture>
      </div>
    </div>
  );
}

function Fixture({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
