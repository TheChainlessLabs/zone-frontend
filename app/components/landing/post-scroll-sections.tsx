import { audienceLine, featureBlocks } from "@/components/landing/content";
import { RequestAccessForm } from "@/components/landing/request-access-form";

export function PostScrollSections() {
  return (
    <section className="px-4 pb-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="border-t border-[var(--border)] pt-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Core Features
          </p>
          <div className="mt-6 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--border)] md:grid-cols-4">
            {featureBlocks.map((feature) => (
              <article key={feature.title} className="bg-[var(--background)] p-6">
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-8 border-t border-[var(--border)] py-16 md:grid-cols-[0.8fr_1.2fr]">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            Who It Is For
          </p>
          <p className="max-w-3xl text-2xl font-medium leading-tight text-[var(--foreground)] md:text-4xl">
            {audienceLine}
          </p>
        </div>

        <div
          id="request-access"
          className="grid gap-8 border-t border-[var(--border)] py-16 lg:grid-cols-[0.75fr_1.25fr]"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              Request Access
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[var(--foreground)] md:text-5xl">
              Join the private alpha.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)] md:text-base">
              Tell us who you are and how you plan to use private spot FX.
            </p>
          </div>
          <RequestAccessForm />
        </div>

        <footer className="border-t border-[var(--border)] py-8 font-mono text-[11px] text-[var(--muted-foreground)]">
          Omega Markets — Proven, not promised.
        </footer>
      </div>
    </section>
  );
}
