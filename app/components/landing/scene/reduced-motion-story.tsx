import { scrollStates } from "@/components/landing/content";

export function ReducedMotionStory() {
  return (
    <div
      data-testid="midpoint-singularity-reduced-motion"
      className="relative grid min-h-[420px] gap-px overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--border)] text-[var(--foreground)] md:min-h-[560px] md:grid-cols-2"
      aria-label="Static Omega order lifecycle"
    >
      {scrollStates.map((state) => (
        <article key={state.id} className="bg-[var(--background)] p-6 md:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            {state.step} {state.label}
          </p>
          <h3 className="mt-4 text-xl font-semibold leading-tight md:text-2xl">
            {state.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{state.body}</p>
        </article>
      ))}
    </div>
  );
}
