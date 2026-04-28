import type { ReactNode } from "react";

export function Section({
  id,
  number,
  label,
  title,
  description,
  children,
}: {
  id: string;
  number: string;
  label: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-[var(--border)] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <header className="mb-10 flex flex-col gap-3 md:mb-14">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            <span>{number}</span>
            <span aria-hidden className="h-px w-8 bg-[var(--border)]" />
            <span>{label}</span>
          </div>
          <h2 className="text-2xl font-medium tracking-tight md:text-4xl">{title}</h2>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
              {description}
            </p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}
