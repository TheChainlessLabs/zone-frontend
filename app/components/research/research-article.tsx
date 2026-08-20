"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";

type ResearchArticleProps = {
  eyebrow: string;
  title: string;
  deck: string;
  children: React.ReactNode;
  rail?: React.ReactNode;
};

export function ResearchArticle({
  eyebrow,
  title,
  deck,
  children,
  rail,
}: ResearchArticleProps) {
  const [navSolid, setNavSolid] = React.useState(false);

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
      <LandingNav solid={navSolid} hideButtons={true} />

      <article className="mx-auto w-full max-w-[1120px] px-4 pb-28 pt-16 sm:px-8 sm:pt-24">
        <header className="max-w-[860px]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              {eyebrow}
            </p>
            <a
              href="/research"
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors no-underline"
            >
              Back
              <ArrowUpRight size={14} className="rotate-180" />
            </a>
          </div>
          <h1 className="mt-5 text-balance text-[clamp(42px,7vw,80px)] font-semibold leading-[0.94] tracking-[-0.055em]">
            {title}
          </h1>
          <p className="mt-7 max-w-[690px] text-pretty text-[18px] leading-[1.7] text-[var(--muted-foreground)] sm:text-[20px]">
            {deck}
          </p>
        </header>

        <div className="mt-16 grid gap-12 border-t border-[var(--border)] pt-12 lg:grid-cols-[minmax(0,1fr)_456px]">
          <div className="max-w-[680px] space-y-8 text-[16px] leading-[1.8] text-[var(--muted-foreground)]">
            {children}
          </div>
          {rail ? <aside className="lg:pt-1">{rail}</aside> : null}
        </div>
      </article>
    </main>
  );
}
