import { scrollStates } from "@/components/landing/content";
import { MidpointSingularityScene } from "@/components/landing/scene/midpoint-singularity-scene";

export function OrderScrollStory() {
  return (
    <section
      id="mechanism"
      data-scroll-story
      className="relative px-4 py-32 md:px-8 md:py-40"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="grid gap-[18svh] lg:gap-[22svh] lg:py-24">
          {scrollStates.map((state) => (
            <article
              key={state.id}
              data-scroll-panel={state.id}
              className="flex min-h-[110svh] items-start pb-20 pt-[66svh] lg:items-center lg:pb-0 lg:pt-0"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  {state.step} {state.label}
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-[var(--foreground)] md:text-5xl">
                  {state.title}
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--muted-foreground)] md:text-base">
                  {state.body}
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="-order-1 sticky top-4 h-[58svh] min-h-[360px] lg:order-none lg:top-10 lg:h-[calc(100svh-5rem)]">
          <MidpointSingularityScene />
        </div>
      </div>
    </section>
  );
}
