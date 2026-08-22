import { scrollStates } from "./content";

// Reduced-motion fallback: static stacked steps (three-step variant).
export function ReducedMotionStory() {
  return (
    <section
      data-testid="new-mechanism-reduced-motion"
      aria-label="How Omega works"
      className="relative z-[1] mx-auto flex max-w-[760px] flex-col gap-8 px-8 py-16"
    >
      {scrollStates.map((state) => (
        <div key={state.id} className="flex gap-5">
          <span className="shrink-0 pt-1 font-mono text-[13px] text-[var(--muted-foreground)]">
            {state.step}
          </span>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              {state.label}
            </span>
            <h3 className="mt-1.5 text-[22px] font-semibold tracking-[-0.01em]">
              {state.title}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.6] text-[var(--muted-foreground)]">
              {state.body}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
