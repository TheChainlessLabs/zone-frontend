import { Button } from "@/components/ui/button";
import { OmegaMark } from "@/components/OmegaMark";

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
  return (
    <main className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <nav className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-4 py-6 sm:px-8">
        <a href="/" className="inline-flex items-center gap-2.5 no-underline">
          <OmegaMark size={22} />
          <span className="font-wordmark text-[13px] font-semibold uppercase tracking-[0.12em]">
            Omega Markets
          </span>
        </a>
        <div className="flex items-center gap-2.5 sm:gap-7">
          <Button
            asChild
            variant="secondary"
            className="h-9 px-3 text-[12px] sm:h-10 sm:px-5 sm:text-[14px]"
          >
            <a href="/research">Research</a>
          </Button>
          <Button asChild className="h-9 px-3 text-[12px] sm:h-10 sm:px-5 sm:text-[14px]">
            <a href="/trade">Fund account</a>
          </Button>
        </div>
      </nav>

      <article className="mx-auto w-full max-w-[1120px] px-4 pb-28 pt-16 sm:px-8 sm:pt-24">
        <header className="max-w-[860px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            {eyebrow}
          </p>
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
