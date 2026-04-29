import { Suspense } from "react";

import { AppShell } from "@/components/shell/AppShell";
import { PageLayout } from "@/components/shell/PageLayout";
import { Card } from "@/components/ui/card";

import { PersonaPicker } from "./_components/PersonaPicker";
import { ContentTabs } from "./_components/ContentTabs";
import { Markdown } from "./_components/Markdown";
import { PERSONAS, personaById } from "./_data/manifest";
import { loadAllManifestos, loadPersonaArtefacts } from "./_data/load";

/**
 * /personas/preview — aggregator for the 20-persona design review.
 *
 * Each persona's manifesto, critique, inspirations, and redesign source
 * live under `tools/persona-review/runs/<id>/`. This page loads all
 * manifestos for the chip blurbs and the active persona's full artefact
 * set on each request. Production routes are untouched.
 */

export const dynamic = "force-dynamic";

const ATTITUDE_LABEL: Record<number, string> = {
  1: "Polish (1)",
  2: "Polish (2)",
  3: "Surgical (3)",
  4: "Reframe (4)",
  5: "Rebuild (5)",
};

export default function PersonasPreviewPage({
  searchParams,
}: {
  searchParams?: { persona?: string };
}) {
  const activeId = searchParams?.persona ?? PERSONAS[0].id;
  const active = personaById(activeId);
  const manifestos = loadAllManifestos();
  const artefacts = loadPersonaArtefacts(active.id, active.redesignFile);

  return (
    <AppShell route="/personas/preview">
      <PageLayout
        width="wide"
        title="Design review · 20 personas"
        description="Twenty independent agents reviewed the build through their own lens. Each produced a critique, an inspiration set, and one redesigned page."
      >
        <nav
          aria-label="Persona picker"
          className="surface-soft mb-6 rounded-[var(--radius-lg)] bg-[var(--card)] p-4"
        >
          <Suspense fallback={<div className="h-10" aria-hidden />}>
            <PersonaPicker
              personas={PERSONAS}
              activeId={active.id}
              manifestos={manifestos}
            />
          </Suspense>
          <PersonaSummaryLine persona={active} />
        </nav>

        <Card className="flex flex-col gap-2 p-6 md:p-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Persona {active.number} · {active.name} · {active.city}
          </span>
          <h2 className="font-serif text-xl italic leading-snug text-[var(--foreground)] md:text-2xl">
            &ldquo;{active.tagline}.&rdquo;
          </h2>
          {artefacts.manifesto ? (
            <div className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--muted-foreground)]">
              <Markdown source={artefacts.manifesto} />
            </div>
          ) : null}
        </Card>

        <section
          aria-label={`Critique, inspirations, and redesign for persona ${active.number}`}
          className="mt-6"
        >
          <ContentTabs
            personaId={active.id}
            critique={artefacts.critique}
            inspirations={artefacts.inspirations}
            redesignSource={artefacts.redesignSource}
            redesignFile={active.redesignFile}
          />
        </section>
      </PageLayout>
    </AppShell>
  );
}

function PersonaSummaryLine({
  persona,
}: {
  persona: ReturnType<typeof personaById>;
}) {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em]">
        Persona {persona.number}
      </span>
      <span>·</span>
      <span>
        Runtime <strong className="text-[var(--foreground)]">{persona.runtime}</strong>
      </span>
      <span>·</span>
      <span>
        Attitude{" "}
        <strong className="text-[var(--foreground)]">
          {ATTITUDE_LABEL[persona.attitude]}
        </strong>
      </span>
      <span>·</span>
      <span>
        Cares about{" "}
        <strong className="text-[var(--foreground)]">{persona.primaryValue}</strong>
      </span>
      <span>·</span>
      <span>
        Redesigned{" "}
        <strong className="text-[var(--foreground)]">{persona.target}</strong> ·{" "}
        <code className="font-mono text-[11px]">{persona.redesignFile}</code>
      </span>
    </p>
  );
}
