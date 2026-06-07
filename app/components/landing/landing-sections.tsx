import {
  BadgeCheck,
  CreditCard,
  EyeOff,
  Landmark,
  LineChart,
  type LucideIcon,
  Maximize,
  Share2,
  Shield,
  ShieldCheck,
  TrendingDown,
  Wallet,
} from "lucide-react";

import {
  audiences,
  builtFor,
  featureBlocks,
  whyOmega,
} from "@/components/landing/content";

// Lucide name → component. Keeps content.ts data-only (icon names are strings)
// while rendering real Lucide glyphs per the kit's iconography.
const ICONS: Record<string, LucideIcon> = {
  Maximize,
  Share2,
  Shield,
  EyeOff,
  BadgeCheck,
  ShieldCheck,
  LineChart,
  Landmark,
  TrendingDown,
  CreditCard,
  Wallet,
};

// "Why Omega" — six numbered glass feature cards (app.jsx Features).
export function WhyOmega() {
  return (
    <section
      id="why"
      className="relative z-[1] mx-auto flex min-h-screen max-w-[1120px] flex-col justify-center px-8 py-24"
    >
      <div className="mb-11 text-center">
        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          {whyOmega.eyebrow}
        </span>
        <h2 className="mt-3.5 text-[clamp(28px,3.4vw,38px)] font-semibold tracking-[-0.02em]">
          {whyOmega.title}
        </h2>
        <p className="mx-auto mt-3.5 max-w-[560px] text-[16px] leading-[1.6] text-[var(--muted-foreground)]">
          {whyOmega.supporting}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featureBlocks.map((feature, index) => {
          const Icon = ICONS[feature.icon] ?? Shield;
          return (
            <div
              key={feature.title}
              className="glass relative overflow-hidden rounded-[var(--radius-xl)] px-6 pb-7 pt-[26px]"
            >
              <span className="mb-[18px] inline-flex size-11 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--glass-edge)] bg-[var(--glass-fill)] shadow-[inset_0_1px_0_0_var(--glass-highlight)]">
                <Icon aria-hidden className="size-[22px] text-[var(--foreground)]" strokeWidth={1.5} />
              </span>
              <div className="mb-3.5 flex items-baseline gap-3">
                <span className="shrink-0 font-mono text-[12px] font-medium text-[var(--muted-foreground)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[16px] font-semibold leading-[1.25] tracking-[-0.01em]">
                  {feature.title}
                </h3>
              </div>
              <p className="text-[14px] leading-[1.65] text-[var(--muted-foreground)]">
                {feature.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// "Built for" — six glass audience cards (app.jsx BuiltFor).
export function BuiltFor() {
  return (
    <section
      id="built-for"
      className="relative z-[1] mx-auto flex min-h-screen max-w-[1120px] flex-col justify-center px-8 py-24"
    >
      <div className="mb-11 text-center">
        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          {builtFor.eyebrow}
        </span>
        <h2 className="mt-3.5 text-[clamp(28px,3.4vw,38px)] font-semibold tracking-[-0.02em]">
          {builtFor.title}
        </h2>
        <p className="mx-auto mt-3.5 max-w-[560px] text-[16px] leading-[1.6] text-[var(--muted-foreground)]">
          {builtFor.supporting}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {audiences.map((audience) => {
          const Icon = ICONS[audience.icon] ?? Wallet;
          return (
            <div
              key={audience.name}
              className="glass flex flex-col gap-3.5 rounded-[var(--radius-xl)] px-[22px] pb-[26px] pt-6"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--glass-edge)] bg-[var(--glass-fill)] shadow-[inset_0_1px_0_0_var(--glass-highlight)]">
                <Icon aria-hidden className="size-5 text-[var(--foreground)]" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="text-[16px] font-semibold tracking-[-0.01em]">
                  {audience.name}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--muted-foreground)]">
                  {audience.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
