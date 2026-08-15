import { ArrowUpRight } from "lucide-react";

import { OmegaMark } from "@/components/OmegaMark";
import { researchPosts } from "@/components/research/research-content";

export function ResearchIndex() {
  return (
    <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <nav className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-4 py-6 sm:px-8">
        <a href="/" className="inline-flex items-center gap-2.5 no-underline">
          <OmegaMark size={22} />
          <span className="font-wordmark text-[13px] font-semibold uppercase tracking-[0.12em]">
            Omega Markets
          </span>
        </a>
        <a href="/trade" className="text-[13px] font-medium no-underline">
          Fund your account
        </a>
      </nav>

      <section className="mx-auto w-full max-w-[1120px] px-4 pb-24 pt-20 sm:px-8 sm:pt-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          Omega Markets / Public notes
        </p>
        <h1 className="mt-5 text-[clamp(48px,9vw,104px)] font-semibold leading-[0.9] tracking-[-0.06em]">
          Research
        </h1>
        <p className="mt-7 max-w-[590px] text-pretty text-[17px] leading-[1.7] text-[var(--muted-foreground)] sm:text-[19px]">
          Notes on private price discovery, stablecoin payment corridors, and
          the market structure Omega is building with design partners.
        </p>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2">
          {researchPosts.map((post) => (
            <a
              key={post.href}
              href={post.href}
              className="group flex min-h-72 flex-col bg-[var(--card)] p-6 no-underline transition-colors duration-[var(--duration-small)] hover:bg-[var(--muted)] sm:p-8"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                <span>{post.eyebrow}</span>
              </div>
              <h2 className="mt-auto max-w-[420px] pt-14 text-balance text-[28px] font-semibold leading-[1.05] tracking-[-0.035em]">
                {post.title}
              </h2>
              <p className="mt-4 max-w-[450px] text-[14px] leading-[1.65] text-[var(--muted-foreground)]">
                {post.deck}
              </p>
              <ArrowUpRight
                aria-hidden
                className="mt-6 size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
