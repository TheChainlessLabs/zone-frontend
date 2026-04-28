"use client";

import { motion, useAnimate, useInView, type AnimationOptions } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Search,
  ShoppingCart,
  Wallet,
  XCircle,
} from "lucide-react";
import { Section } from "@/components/Section";
import { Swatch } from "@/components/Swatch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SectionNav } from "@/components/SectionNav";
import { MidpointTape } from "@/components/MidpointTape";
import { OmegaMark } from "@/components/OmegaMark";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";

const SECTIONS = [
  { id: "positioning", number: "01", label: "Brand" },
  { id: "palette", number: "02", label: "Palette" },
  { id: "typography", number: "03", label: "Typography" },
  { id: "liquid-glass", number: "04", label: "Material" },
  { id: "motion", number: "05", label: "Motion" },
  { id: "voice", number: "06", label: "Voice" },
  { id: "naming", number: "07", label: "Naming" },
] as const;

const PALETTE_TOKENS: { name: string; varName: string; description: string }[] = [
  {
    name: "Background",
    varName: "--background",
    description: "Page surface · zinc-950 in dark, zinc-50 in light",
  },
  {
    name: "Muted",
    varName: "--muted",
    description: "Quiet panels, hover, disabled chrome · zinc-900 / zinc-100",
  },
  {
    name: "Border",
    varName: "--border",
    description: "Hairlines, dividers · zinc-800 / zinc-200",
  },
  {
    name: "Foreground",
    varName: "--foreground",
    description: "Primary text · zinc-50 / zinc-950",
  },
  {
    name: "Muted Fg",
    varName: "--muted-foreground",
    description: "Quiet text, captions · zinc-400 / zinc-500",
  },
];

const SEMANTIC_ACCENTS: { name: string; varName: string; description: string }[] = [
  {
    name: "Success",
    varName: "--success",
    description: "Fill confirmations, proof-verified state · emerald",
  },
  {
    name: "Destructive",
    varName: "--destructive",
    description: "Errors, danger, sell-side · red",
  },
];

export default function BrandBoard() {
  return (
    <main id="top" className="relative min-h-screen pb-32">
      <SectionNav items={[...SECTIONS]} />
      <Hero />

      <Section
        id="positioning"
        number="01"
        label="Brand"
        title={
          <>
            Anonymous spot FX. <span className="font-serif text-[var(--muted-foreground)]">On-chain settlement.</span>
          </>
        }
        description={
          <>
            An onchain darkpool for stablecoin FX. Built for sophisticated DeFi
            traders who care about execution quality, privacy, and trust over speed.{" "}
            <span className="font-serif text-[var(--foreground)]">
              Infrastructure, not a bank.
            </span>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          <ReferenceList
            label="We feel adjacent to"
            items={[
              { name: "Linear", note: "Design rigour, motion as language" },
              { name: "Vercel", note: "Modern, neutral, monochrome-default" },
              { name: "CoW Swap", note: "Centred, simple — action is the hero" },
              { name: "Polymarket", note: "Neutral brand, product carries it" },
            ]}
          />
          <ReferenceList
            label="We are NOT"
            items={[
              { name: "Binance / OKX", note: "Loud, marketing-saturated" },
              { name: "Robinhood", note: "Gamified, FOMO-driven" },
              { name: "Bloomberg Terminal", note: "Over-dense, B2B-only" },
              { name: "Crypto-degen DEX", note: "Rocket emojis, neon glows" },
            ]}
          />
          <PrincipleBlock />
        </div>
      </Section>

      <Section
        id="palette"
        number="02"
        label="Palette"
        title={
          <>
            Vercel · shadcn zinc,{" "}
            <span className="font-serif text-[var(--muted-foreground)]">dark by default.</span>
          </>
        }
        description={
          <>
            V1 commits to the zinc scale. <span className="font-serif text-[var(--foreground)]">No bespoke brand accent —</span>{" "}
            restraint is the feature. Two semantic accents (success, destructive) carry
            meaning; everything else stays neutral. Click any swatch to copy its token.
          </>
        }
      >
        <div className="mb-12">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Surface tokens
          </h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-5">
            {PALETTE_TOKENS.map((t) => (
              <Swatch
                key={t.varName}
                name={t.name}
                value={`var(${t.varName})`}
                variableName={t.varName}
                description={t.description}
                size="md"
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Semantic accents · used purposefully
          </h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            {SEMANTIC_ACCENTS.map((t) => (
              <Swatch
                key={t.varName}
                name={t.name}
                value={`var(${t.varName})`}
                variableName={t.varName}
                description={t.description}
                size="md"
              />
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="typography"
        number="03"
        label="Typography"
        title={
          <>
            Geist Sans + Geist Mono <span className="font-serif text-[var(--muted-foreground)]">+ a serif moment.</span>
          </>
        }
        description={
          <>
            Vercel's open-source pairing carries the work. Sans wraps; Mono dominates
            the data plane.{" "}
            <span className="font-serif text-[var(--foreground)]">Source Serif 4 italic</span>{" "}
            adds editorial personality — used sparingly, never on data, never on chrome.
          </>
        }
      >
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <TypeRow label="Display · 48 / 600" sample="Anonymous spot FX." className="text-5xl font-medium tracking-tight" />
            <TypeRow label="H1 · 28 / 600" sample="Match at midpoint." className="text-3xl font-medium" />
            <TypeRow label="H2 · 22 / 600" sample="Settle on chain." className="text-2xl font-medium" />
            <TypeRow label="Body · 14 / 400" sample="Privacy as a consequence, not the headline." className="text-sm leading-relaxed" />
            <TypeRow
              label="Caption · 11 / 500 / 0.18em"
              sample="Settlement"
              className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
            />
          </div>
          <div className="flex flex-col gap-6">
            <TypeRow
              label="Mono Tabular · 14 / 400"
              sample="0.9213  +0.42%  3,201.00"
              className="font-mono text-sm font-tabular"
            />
            <TypeRow
              label="Mono · 12 / 400"
              sample="0xa513…C853"
              className="font-mono text-xs"
            />
            <TypeRow
              label="OMEGA · ambient mark"
              sample="O M E G A"
              className="font-mono text-3xl tracking-[0.4em] text-[var(--muted-foreground)]"
            />
            <TypeRow
              label="Serif italic · editorial moment"
              sample="A precision instrument for stablecoin FX."
              className="font-serif text-2xl leading-snug text-[var(--foreground)]"
            />
            <TypeRow
              label="Geist 100 thin · scale contrast"
              sample="midpoint"
              className="text-4xl font-thin tracking-tight text-[var(--muted-foreground)]"
            />
          </div>
        </div>
      </Section>

      <Section
        id="liquid-glass"
        number="04"
        label="Material"
        title={
          <>
            Liquid glass — <span className="font-serif text-[var(--muted-foreground)]">refract the data,</span> not the decoration.
          </>
        }
        description={
          <>
            Translucent material with refraction and soft depth, applied to specific
            moments only. The order form, modals, sheets, settlement status,{" "}
            <span className="font-serif text-[var(--foreground)]">and now smaller controls.</span>{" "}
            Tables, charts, and chrome stay solid.
          </>
        }
      >
        {/* Surface — glass cards over real data substrate */}
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Surface · order form + settlement
        </h3>
        <div className="relative isolate mb-12 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] py-12 md:py-16">
          <MidpointTape />
          <div className="relative grid grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-12">
            <SwapCard />
            <StatusCard />
          </div>
        </div>

        {/* Smaller components — glass on buttons, pills, inputs, toggle, chips, tickers */}
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Components · controls in glass
        </h3>
        <div className="relative isolate overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] py-12 md:py-14">
          <MidpointTape />
          <div className="relative flex flex-col gap-10 px-6 md:px-12">
            {/* Buttons row */}
            <ComponentRow label="Buttons">
              <Button variant="glass">Submit order</Button>
              <Button variant="glass" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Cancel
              </Button>
              <Button variant="glass" className="text-[var(--destructive)]">
                Force withdraw
              </Button>
            </ComponentRow>

            {/* Tabs / pill switch */}
            <ComponentRow label="Tab switch">
              <Tabs defaultValue="market">
                <TabsList variant="glass">
                  <TabsTrigger
                    value="market"
                    className="text-xs uppercase tracking-[0.14em]"
                  >
                    market
                  </TabsTrigger>
                  <TabsTrigger
                    value="limit"
                    className="text-xs uppercase tracking-[0.14em]"
                  >
                    limit
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </ComponentRow>

            {/* Input + toggle */}
            <ComponentRow label="Input · toggle">
              <div className="w-full max-w-sm">
                <BrandGlassSearchInput />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted-foreground)]">Privacy mode</span>
                <BrandGlassPrivacyToggle />
              </div>
            </ComponentRow>

            {/* Chips */}
            <ComponentRow label="Filter chips">
              <Chip variant="glass" active>USDC/EURC</Chip>
              <Chip variant="glass">USDC/USDT</Chip>
              <Chip variant="glass">USDT/EURC</Chip>
              <Chip variant="glass">ETH/USDC</Chip>
            </ComponentRow>

            {/* Price tickers — ambient brand */}
            <ComponentRow label="Ambient ticker">
              <BrandPriceTicker direction="up" pair="USDC/EURC" price="0.9213" delta="0.42%" />
              <BrandPriceTicker direction="down" pair="USDT/EURC" price="0.9211" delta="0.18%" />
            </ComponentRow>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[var(--muted-foreground)]">
          Glass falls back to a solid{" "}
          <code className="font-mono text-[var(--foreground)]">--muted</code> surface when the user has{" "}
          <code className="font-mono text-[var(--foreground)]">prefers-reduced-transparency: reduce</code>{" "}
          or the browser lacks{" "}
          <code className="font-mono text-[var(--foreground)]">backdrop-filter</code> support. Component-scale
          glass uses a slightly tighter blur (16px vs 24px) to keep type crisp at small sizes.
        </p>
      </Section>

      <Section
        id="motion"
        number="05"
        label="Motion"
        title={
          <>
            Quiet curves. <span className="font-serif text-[var(--muted-foreground)]">Intentional duration.</span>
          </>
        }
        description={
          <>
            Every transition does a job — reveal state, confirm action, show hierarchy.{" "}
            <span className="font-serif text-[var(--foreground)]">No decorative motion.</span>{" "}
            Trading-critical surfaces stay anchored; supporting context fades and slides.
            Hover a square to replay the curve.
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <MotionDemo
            label="ease-out · 200ms"
            description="Entrance. Cards, modals, dropdowns. Default."
            variant="ease-out"
          />
          <MotionDemo
            label="ease-in · 150ms"
            description="Dismissal. Closes, collapses."
            variant="ease-in"
          />
          <MotionDemo
            label="spring · drawer"
            description="Tactile. Mobile sheets only — never on data."
            variant="spring"
          />
        </div>
      </Section>

      <Voice id="voice" />

      <Naming id="naming" />

      <footer className="border-t border-[var(--border)] py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 text-xs text-[var(--muted-foreground)] md:px-8">
          <div className="font-mono uppercase tracking-[0.18em]">Omega Markets · Brand Board v1</div>
          <p>
            Sourced from{" "}
            <a
              href="https://github.com/TheChainlessLabs/omega-docs/blob/main/03-brand"
              className="underline underline-offset-4 hover:text-[var(--foreground)]"
            >
              omega-docs/03-brand
            </a>
            . Brand changes go through the omega-docs PR flow — taste calls, human-in-loop.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Hero() {
  return (
    <header className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 py-32">
      <BackdropDotGrid />
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]"
          aria-hidden
        >
          <OmegaMark size={40} />
        </motion.div>
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--muted-foreground)]">
          Brand Board · v1
        </span>
        <h1 className="text-5xl font-medium tracking-tight md:text-7xl">
          Omega <span className="font-serif text-[var(--muted-foreground)]">Markets</span>
        </h1>
        <p className="max-w-xl font-serif text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
          A precision instrument for stablecoin FX. Quiet, durable, accurate. The interface gets
          out of the way; the data gets the floor.
        </p>
      </motion.div>
    </header>
  );
}

function ReferenceList({
  label,
  items,
}: {
  label: string;
  items: { name: string; note: string }[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <ul className="flex flex-col">
        {items.map((it, i) => (
          <li
            key={it.name}
            className={`grid grid-cols-[7rem_1fr] items-baseline gap-4 py-3 ${
              i < items.length - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            <span className="text-sm font-medium">{it.name}</span>
            <span className="text-xs text-[var(--muted-foreground)] leading-snug">{it.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrincipleBlock() {
  return (
    <div className="flex flex-col gap-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        Aesthetic principle
      </span>
      <p className="text-2xl font-medium leading-tight tracking-tight">
        Modern. Neutral. Precise.
      </p>
      <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
        Mono dominates the data plane. Display type wraps. Colour is restrained. Motion is intentional.
        The product itself is the brand expression.
      </p>
    </div>
  );
}

function TypeRow({
  label,
  sample,
  className,
}: {
  label: string;
  sample: string;
  className: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-4 last:border-b-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
      <span className={className}>{sample}</span>
    </div>
  );
}

function BackdropDotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0",
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 80%)",
      }}
    />
  );
}

function SwapCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass flex flex-col gap-4 rounded-[var(--radius-xl)] p-6"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Order form
        </span>
        <span className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
          <Lock size={10} />
          Private
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
          Sell
        </span>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-3xl font-tabular">10,000.00</span>
          <span className="text-sm text-[var(--muted-foreground)]">USDC</span>
        </div>
      </div>
      <div className="h-px w-full bg-[var(--glass-edge)]" />
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
          Receive
        </span>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-3xl font-tabular">9,213.40</span>
          <span className="text-sm text-[var(--muted-foreground)]">EURC</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 font-mono text-[11px]">
        <div className="flex flex-col">
          <span className="text-[var(--muted-foreground)]">Mid</span>
          <span className="font-tabular">0.9213</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[var(--muted-foreground)]">Fee</span>
          <span className="font-tabular">0.005%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[var(--muted-foreground)]">Saving vs Wise</span>
          <span className="font-tabular text-[var(--success)]">+12bps</span>
        </div>
      </div>
      <button className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] text-sm font-medium tracking-wide text-[var(--primary-foreground)] transition-opacity hover:opacity-90">
        Submit order
      </button>
    </motion.div>
  );
}

function StatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="glass flex flex-col gap-5 rounded-[var(--radius-xl)] p-6"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          Settlement status
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--success)]/30 bg-[var(--success)]/10 px-2 py-0.5 text-[11px] text-[var(--success)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          Settled
        </span>
      </div>
      <ul className="flex flex-col gap-3 text-xs">
        {[
          { icon: ShoppingCart, label: "Submitted", time: "0s" },
          { icon: CheckCircle2, label: "Matched at midpoint", time: "+2ms" },
          { icon: Wallet, label: "Batched", time: "+1.4s" },
          { icon: CheckCircle2, label: "Proven · SP1 attestation", time: "+8.2s" },
          { icon: ArrowUpRight, label: "Settled on Ethereum L1", time: "+14.6s" },
        ].map((step) => (
          <li key={step.label} className="flex items-center gap-3">
            <step.icon size={14} className="text-[var(--success)]" />
            <span className="flex-1">{step.label}</span>
            <span className="font-mono font-tabular text-[var(--muted-foreground)]">{step.time}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-[var(--glass-edge)] pt-3 font-mono text-[11px] text-[var(--muted-foreground)]">
        Tx <span className="text-[var(--foreground)]">0xa513…C853</span> · Batch{" "}
        <span className="text-[var(--foreground)]">#48,201</span>
      </div>
    </motion.div>
  );
}

function MotionDemo({
  label,
  description,
  variant,
}: {
  label: string;
  description: string;
  variant: "ease-out" | "ease-in" | "spring";
}) {
  // Idiomatic motion-library pattern: useAnimate gives us imperative animate()
  // for the play action, useInView gates the first-play. No remount keys, no
  // animate/whileHover array conflicts.
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-50px" });

  const transition: AnimationOptions =
    variant === "spring"
      ? { type: "spring", stiffness: 360, damping: 32, mass: 0.9 }
      : variant === "ease-out"
        ? { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
        : { duration: 0.18, ease: [0.7, 0, 1, 0.5] };

  function play() {
    if (!scope.current) return;
    void animate(scope.current, { x: [0, 64, 0] }, transition);
  }

  // Play once when first scrolled into view.
  useEffect(() => {
    if (inView) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={play}
      onFocus={play}
      tabIndex={0}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] p-5 outline-none transition-colors hover:bg-[var(--muted)]/30 focus-visible:bg-[var(--muted)]/30"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]/50 group-hover:text-[var(--muted-foreground)]">
          hover
        </span>
      </div>
      <div className="relative h-16">
        <motion.div
          ref={scope}
          initial={{ x: 0 }}
          className="absolute h-12 w-12 rounded-[var(--radius-md)] bg-[var(--primary)]"
        />
      </div>
      <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}

/* —— Section 06 · Voice ———————————————————————————————— */

function Voice({ id }: { id: string }) {
  return (
    <section id={id} className="border-t border-[var(--border)] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <header className="mb-10 flex flex-col gap-3 md:mb-14">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            <span>06</span>
            <span aria-hidden className="h-px w-8 bg-[var(--border)]" />
            <span>Voice</span>
          </div>
          <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
            Quiet. Precise. <span className="font-serif text-[var(--muted-foreground)]">Technical-fluent.</span>
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
            Numbers carry the message. Errors explain what + what next.{" "}
            <span className="font-serif text-[var(--foreground)]">Status is factual, not reassuring.</span>{" "}
            We sound like a senior trader explaining a setup to a peer.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-[6rem_1fr_1fr]">
          <ColumnLabel>Error</ColumnLabel>
          <VoiceLine
            tone="do"
            text="Insufficient balance. Available: 1,250.00 USDC."
          />
          <VoiceLine
            tone="dont"
            text="Oops! Something went wrong. Please try again later or contact support."
          />

          <ColumnLabel>Status</ColumnLabel>
          <VoiceLine
            tone="do"
            text="Order matched at midpoint 0.9213"
          />
          <VoiceLine
            tone="dont"
            text="Great! Your order filled successfully."
          />

          <ColumnLabel>Loading</ColumnLabel>
          <VoiceLine
            tone="do"
            text="Awaiting signature…"
          />
          <VoiceLine
            tone="dont"
            text="Loading…"
          />

          <ColumnLabel>Empty</ColumnLabel>
          <VoiceLine
            tone="do"
            text="No fills yet. Your matches will appear here."
          />
          <VoiceLine
            tone="dont"
            text="Looks like you haven&rsquo;t traded yet &mdash; let&rsquo;s change that today."
          />
        </div>
      </div>
    </section>
  );
}

function ColumnLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
      {children}
    </div>
  );
}

function VoiceLine({ tone, text }: { tone: "do" | "dont"; text: string }) {
  const isDo = tone === "do";
  return (
    <div className="flex flex-col gap-2">
      <span
        className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
          isDo ? "text-[var(--success)]" : "text-[var(--destructive)]"
        }`}
      >
        {isDo ? (
          <CheckCircle2 size={11} strokeWidth={2} />
        ) : (
          <XCircle size={11} strokeWidth={2} />
        )}
        {isDo ? "Do" : "Don't"}
      </span>
      <p className={`text-sm leading-relaxed ${isDo ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] line-through decoration-[var(--destructive)]/40 decoration-1"}`}>
        {text}
      </p>
    </div>
  );
}

/* —— Section 07 · Naming ———————————————————————————————— */

function Naming({ id }: { id: string }) {
  return (
    <section id={id} className="border-t border-[var(--border)] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <header className="mb-12 flex flex-col gap-3 md:mb-16">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            <span>07</span>
            <span aria-hidden className="h-px w-8 bg-[var(--border)]" />
            <span>Naming</span>
          </div>
          <h2 className="text-2xl font-medium tracking-tight md:text-4xl">
            Three forms. <span className="font-serif text-[var(--muted-foreground)]">One voice.</span>
          </h2>
          <p className="max-w-2xl text-sm text-[var(--muted-foreground)] md:text-base leading-relaxed">
            Long form for legal and marketing. Short form for product UI. All-caps tracking-wide for
            ambient brand presence.
          </p>
        </header>

        <div className="flex flex-col gap-16 md:gap-24">
          <NamingSpecimen
            usage="Long form · legal, marketing landing, T&Cs, footer attribution"
          >
            <span className="text-5xl font-medium tracking-tight md:text-7xl">
              Omega Markets
            </span>
          </NamingSpecimen>
          <NamingSpecimen
            usage="Short form · product UI, conversational, social handles, blog headlines"
          >
            <span className="text-5xl font-medium tracking-tight md:text-7xl">
              Omega
            </span>
          </NamingSpecimen>
          <NamingSpecimen
            usage="Editorial italic · long-form writing, blog ledes, marketing emphasis"
          >
            <span className="font-serif text-5xl text-[var(--foreground)] md:text-7xl">
              Omega Markets
            </span>
          </NamingSpecimen>
          <NamingSpecimen
            usage="Tracking-wide all-caps mono · 404 ghost, splash, ambient brand"
          >
            <span className="font-mono text-4xl tracking-[0.42em] text-[var(--muted-foreground)] md:text-6xl">
              OMEGA
            </span>
          </NamingSpecimen>
        </div>
      </div>
    </section>
  );
}

function NamingSpecimen({ usage, children }: { usage: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_18rem]">
      <div className="flex items-center">{children}</div>
      <div className="font-mono text-[11px] leading-relaxed text-[var(--muted-foreground)] md:max-w-xs md:text-right">
        {usage}
      </div>
    </div>
  );
}

function ComponentRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[8rem_1fr]">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/* —— /brand-only composed glass moments ————————————————————————
   These are display compositions, not new primitives. They reuse the M2.4
   variant API (Input variant="glass", a small <button> with .glass-pill).
   Kept inline rather than promoted to ui/ since they're brand-board
   specimen-pieces, not the production primitive set. */

function BrandGlassSearchInput() {
  return (
    <label className="relative flex items-center">
      <Search
        size={14}
        className="pointer-events-none absolute left-4 text-[var(--muted-foreground)]"
        aria-hidden
      />
      <Input
        variant="glass"
        type="text"
        placeholder="Search market…"
        className="h-12 pl-10 pr-14 text-sm"
      />
      <span className="pointer-events-none absolute right-4 font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]/60">
        ⌘K
      </span>
    </label>
  );
}

function BrandGlassPrivacyToggle() {
  // Switch-style toggle (sliding knob) is a different visual idiom than the
  // shadcn <Toggle> press-state pill, so we render the substrate directly
  // here. Both routes through the same .glass-pill utility, so the variant
  // system is consistent even where the geometry differs.
  const [on, setOn] = useState(true);
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      aria-pressed={on}
      aria-label="Privacy mode"
      className="glass-pill relative inline-flex h-7 w-12 items-center rounded-full px-1"
    >
      <motion.span
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.9 }}
        className="absolute h-5 w-5 rounded-full bg-[var(--foreground)] shadow-md"
      />
    </button>
  );
}

function BrandPriceTicker({
  direction,
  pair,
  price,
  delta,
}: {
  direction: "up" | "down";
  pair: string;
  price: string;
  delta: string;
}) {
  const Arrow = direction === "up" ? ArrowUp : ArrowDown;
  const tone = direction === "up" ? "text-[var(--success)]" : "text-[var(--destructive)]";
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="glass-pill inline-flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-2 font-mono text-xs"
    >
      <span className="text-[var(--muted-foreground)]">{pair}</span>
      <span className="font-tabular tabular-nums">{price}</span>
      <span className={`inline-flex items-center gap-0.5 ${tone}`}>
        <Arrow size={10} strokeWidth={2.5} />
        <span className="font-tabular">{delta}</span>
      </span>
    </motion.div>
  );
}
