"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

import { LandingNav } from "@/components/landing/landing-nav";
import {
  MarketInstrument,
  type MarketInstrumentName,
} from "@/components/brand/market-instrument";
import { researchPosts } from "@/components/research/research-content";

const researchCast = ["taker", "maker", "omega"] as const satisfies ReadonlyArray<MarketInstrumentName>;

export function ResearchIndex() {
  const [hoveredInstrument, setHoveredInstrument] = useState<MarketInstrumentName | null>(null);
  const [navSolid, setNavSolid] = useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setNavSolid(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <LandingNav solid={navSolid} />

      <section className="mx-auto w-full max-w-[1120px] px-4 pb-24 pt-20 sm:px-8 sm:pt-28">
        <div className="grid overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--card)] lg:grid-cols-[minmax(0,32fr)_minmax(0,68fr)]">
          <div className="flex flex-col border-b border-[var(--border)] p-6 sm:p-8 lg:min-h-[680px] lg:border-b-0 lg:border-r">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Omega Markets / Public notes
            </p>
            <h1 className="mt-5 text-[clamp(48px,6vw,72px)] font-semibold leading-[0.9] tracking-[-0.06em]">
              Research
            </h1>
            <p className="mt-6 max-w-[320px] text-pretty text-[15px] leading-[1.7] text-[var(--muted-foreground)]">
              Field notes on private stablecoin market structure.
            </p>

            <ul
              aria-label="Market participants"
              className="mt-12 grid grid-cols-3 border-y border-[var(--border)] lg:mt-auto lg:grid-cols-1"
            >
              {researchCast.map((actor) => (
                <li
                  key={actor}
                  className={`flex min-w-0 flex-col gap-3 py-4 not-last:border-r not-last:border-[var(--border)] not-last:pr-4 not-first:pl-4 transition-opacity duration-200 lg:flex-row lg:items-center lg:gap-4 lg:not-last:border-b lg:not-last:border-r-0 lg:not-last:px-0 lg:not-first:pl-0 ${
                    hoveredInstrument && hoveredInstrument !== actor ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <MarketInstrument name={actor} size={28} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                    {actor}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <header className="grid gap-6 border-b border-[var(--border)] p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Notes Index / 02
              </p>
            </header>

            <ol aria-label="Research articles">
              {researchPosts.map((post, index) => (
                <li
                  key={post.href}
                  className="not-last:border-b not-last:border-[var(--border)]"
                >
                  <a
                    href={post.href}
                    className="group relative grid min-h-64 grid-cols-[2rem_42px_minmax(0,1fr)] gap-x-4 p-6 no-underline transition-colors duration-[var(--duration-small)] ease-[var(--ease-out)] hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-inset sm:p-8 lg:grid-cols-[2.5rem_42px_minmax(0,1fr)_auto]"
                    onMouseEnter={() => setHoveredInstrument(post.instrument)}
                    onMouseLeave={() => setHoveredInstrument(null)}
                  >
                    <span className="font-mono text-[10px] leading-[42px] text-[var(--muted-foreground)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex size-[42px] items-center justify-center">
                      <MarketInstrument name={post.instrument} size={42} />
                    </span>
                    <span className="col-span-3 mt-8 min-w-0 lg:col-span-1 lg:mt-0">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                        {post.eyebrow}
                      </span>
                      <span className="mt-5 block max-w-[520px] text-balance text-[clamp(26px,4vw,40px)] font-semibold leading-[1.02] tracking-[-0.045em]">
                        {post.title}
                      </span>
                      <span className="mt-5 block max-w-[560px] text-[14px] leading-[1.65] text-[var(--muted-foreground)] sm:text-[15px]">
                        {post.deck}
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="absolute right-6 top-6 size-4 transition-transform duration-[var(--duration-small)] ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:translate-none motion-reduce:transform-none sm:right-8 sm:top-8 lg:static"
                    />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
