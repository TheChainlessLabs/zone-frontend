"use client";

/**
 * ContentTabs — Live preview / Critique / Inspirations / Redesign source.
 * The live preview iframes /personas/preview/render/<id> so each redesign
 * mounts in isolation; runtime crashes inside a variant don't cascade
 * into the aggregator chrome.
 */

import * as React from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Markdown } from "./Markdown";
import { CodeBlock } from "./CodeBlock";

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", w: "100%", aspect: "16/10" },
  { id: "tablet", label: "Tablet", w: "768px", aspect: "3/4" },
  { id: "mobile", label: "Mobile", w: "390px", aspect: "390/844" },
] as const;

type ViewportId = (typeof VIEWPORTS)[number]["id"];

export function ContentTabs({
  personaId,
  critique,
  inspirations,
  redesignSource,
  redesignFile,
}: {
  personaId: string;
  critique: string;
  inspirations: string;
  redesignSource: string;
  redesignFile: string;
}) {
  const [vp, setVp] = React.useState<ViewportId>("desktop");
  const renderUrl = `/personas/preview/render/${personaId}`;
  const active = VIEWPORTS.find((v) => v.id === vp) ?? VIEWPORTS[0];

  return (
    <Tabs defaultValue="render" className="w-full">
      <TabsList>
        <TabsTrigger value="render">Live preview</TabsTrigger>
        <TabsTrigger value="critique">Critique</TabsTrigger>
        <TabsTrigger value="inspirations">Inspirations</TabsTrigger>
        <TabsTrigger value="redesign">Redesign source</TabsTrigger>
      </TabsList>
      <TabsContent value="render">
        <div className="flex flex-col gap-3">
          <div
            role="tablist"
            aria-label="Viewport"
            className="flex items-center gap-1 self-start rounded-full border border-[var(--border)] p-1"
          >
            {VIEWPORTS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={v.id === vp}
                onClick={() => setVp(v.id)}
                className={
                  v.id === vp
                    ? "rounded-full bg-[var(--accent)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--foreground)] transition-colors"
                    : "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                }
              >
                {v.label}
              </button>
            ))}
            <a
              href={renderUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="ml-2 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
            >
              Open in new tab
            </a>
          </div>
          <div
            className="mx-auto overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)]"
            style={{ width: active.w, aspectRatio: active.aspect, maxWidth: "100%" }}
          >
            <iframe
              src={renderUrl}
              title={`Persona ${personaId} live preview`}
              className="h-full w-full"
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="critique">
        <Markdown source={critique} />
      </TabsContent>
      <TabsContent value="inspirations">
        <Markdown source={inspirations} />
      </TabsContent>
      <TabsContent value="redesign">
        <CodeBlock source={redesignSource} filename={redesignFile} />
      </TabsContent>
    </Tabs>
  );
}
