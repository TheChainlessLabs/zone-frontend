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
  mechanismIntro,
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

export function MechanismIntro() {
  return (
    <section className="relative z-[1] mx-auto grid max-w-[1240px] grid-cols-1 items-end gap-8 px-4 pb-12 pt-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:pb-4 lg:pt-28">
      <div>
        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--success)]">
          {mechanismIntro.eyebrow}
        </span>
        <h2 className="mt-4 max-w-[620px] text-balance text-[clamp(32px,5vw,60px)] font-semibold leading-[0.96] tracking-[-0.05em]">
          {mechanismIntro.title}
        </h2>
      </div>
      <div className="glass rounded-[var(--radius-2xl)] p-5 sm:p-6">
        <p className="max-w-[560px] text-pretty text-[15px] leading-[1.75] text-[var(--muted-foreground)] sm:text-[16px]">
          {mechanismIntro.supporting}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
          {mechanismIntro.rails.map((rail) => (
            <div key={rail.label} className="bg-[var(--card)] p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {rail.label}
              </p>
              <p className="mt-2 text-sm font-medium tracking-[-0.01em]">
                {rail.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// "Why Omega" — six numbered glass feature cards (app.jsx Features).
export function WhyOmega() {
  return (
    <section
      id="why"
      className="relative z-[1] mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-10 px-4 py-24 sm:px-8 lg:grid-cols-[0.74fr_1.26fr] lg:py-36"
    >
      <div className="lg:sticky lg:top-28 lg:self-start lg:pt-8">
        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          {whyOmega.eyebrow}
        </span>
        <h2 className="mt-4 max-w-[460px] text-balance text-[clamp(34px,5vw,58px)] font-semibold leading-[0.98] tracking-[-0.045em]">
          {whyOmega.title}
        </h2>
        <p className="mt-5 max-w-[410px] text-pretty text-[16px] leading-[1.7] text-[var(--muted-foreground)]">
          {whyOmega.supporting}
        </p>
        <div className="mt-8 hidden max-w-[360px] flex-col gap-2 border-l border-[var(--border)] pl-4 lg:flex">
          {["Internal match first", "External exposure minimized", "Fill proof retained"].map(
            (item) => (
              <span
                key={item}
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
              >
                {item}
              </span>
            ),
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
        {featureBlocks.map((feature, index) => {
          const Icon = ICONS[feature.icon] ?? Shield;
          return (
            <div
              key={feature.title}
              className={`glass relative overflow-hidden rounded-[var(--radius-xl)] px-6 pb-7 pt-[26px] ${
                index === 0
                  ? "sm:col-span-2 lg:mr-12"
                  : index % 2 === 0
                    ? "lg:-translate-y-4"
                    : "lg:translate-y-5"
              }`}
            >
              <div className="mb-5 flex items-start justify-between gap-5">
                <span className="inline-flex size-11 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--glass-edge)] bg-[var(--glass-fill)] shadow-[inset_0_1px_0_0_var(--glass-highlight)]">
                  <Icon aria-hidden className="size-[22px] text-[var(--foreground)]" strokeWidth={1.5} />
                </span>
                <span className="shrink-0 font-mono text-[12px] font-medium text-[var(--muted-foreground)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mb-3.5 flex items-baseline gap-3">
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
      className="relative z-[1] mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-10 px-4 py-24 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:py-36"
    >
      <div className="lg:order-2 lg:pl-10 lg:pt-10">
        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          {builtFor.eyebrow}
        </span>
        <h2 className="mt-4 max-w-[520px] text-balance text-[clamp(34px,5vw,58px)] font-semibold leading-[0.98] tracking-[-0.045em]">
          {builtFor.title}
        </h2>
        <p className="mt-5 max-w-[430px] text-pretty text-[16px] leading-[1.7] text-[var(--muted-foreground)]">
          {builtFor.supporting}
        </p>
        <div className="mt-8 grid max-w-[430px] grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)]">
          {["Funds", "Treasuries", "Processors", "Exchanges"].map((label) => (
            <span
              key={label}
              className="bg-[var(--card)] px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted-foreground)]"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:order-1 lg:gap-4">
        {audiences.map((audience, index) => {
          const Icon = ICONS[audience.icon] ?? Wallet;
          return (
            <div
              key={audience.name}
              className={`flex flex-col gap-3.5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--card)]/70 px-[22px] pb-[26px] pt-6 ${
                index === 1 || index === 4 ? "sm:translate-y-7" : ""
              }`}
            >
              <span className="inline-flex size-10 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)] shadow-[inset_0_1px_0_0_var(--surface-edge)]">
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
