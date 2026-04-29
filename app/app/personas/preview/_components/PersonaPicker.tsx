"use client";

/**
 * PersonaPicker — chip bar that drives the active persona via `?persona=NN`.
 * Mirrors the /portfolio/preview and /batches/preview picker pattern.
 */

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import type { PersonaMeta } from "../_data/manifest";

const RUNTIME_GLYPH: Record<PersonaMeta["runtime"], string> = {
  "claude-code": "C",
  codex: "X",
};

const ATTITUDE_LABEL: Record<PersonaMeta["attitude"], string> = {
  1: "Polish",
  2: "Polish",
  3: "Surgical",
  4: "Reframe",
  5: "Rebuild",
};

export function PersonaPicker({
  personas,
  activeId,
  manifestos,
}: {
  personas: PersonaMeta[];
  activeId: string;
  manifestos: Record<string, string>;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const onPick = (id: string) => {
    const next = new URLSearchParams(params?.toString() ?? "");
    next.set("persona", id);
    router.replace(`/personas/preview?${next.toString()}`);
  };

  return (
    <div
      role="tablist"
      aria-label="Persona picker"
      className="flex flex-wrap items-stretch gap-1.5"
    >
      {personas.map((p) => {
        const isActive = p.id === activeId;
        const blurb = manifestos[p.id]?.slice(0, 90).trim() ?? "";
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onPick(p.id)}
            title={blurb ? `${blurb}…` : p.tagline}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-[var(--radius-md)] border px-2.5 py-1.5 text-left transition-colors",
              isActive
                ? "border-[var(--foreground)] bg-[var(--muted)]/40"
                : "border-[var(--border)] hover:bg-[var(--muted)]/20",
            )}
          >
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
              <span
                aria-hidden
                className={cn(
                  "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold",
                  p.runtime === "claude-code"
                    ? "bg-[var(--accent)] text-[var(--background)]"
                    : "bg-[var(--success)] text-[var(--background)]",
                )}
              >
                {RUNTIME_GLYPH[p.runtime]}
              </span>
              <span className="text-[var(--muted-foreground)]">{p.number}</span>
              <span>·</span>
              <span className="text-[var(--muted-foreground)]">
                {ATTITUDE_LABEL[p.attitude]}
              </span>
            </span>
            <span className="text-xs font-medium leading-none">{p.name}</span>
            <span className="text-[10px] leading-tight text-[var(--muted-foreground)]">
              {p.city}
            </span>
          </button>
        );
      })}
    </div>
  );
}
