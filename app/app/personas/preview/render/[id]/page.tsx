"use client";

/**
 * /personas/preview/render/[id] — renders one persona's redesign in a
 * sandboxed surface (intended to be embedded as an iframe by the
 * aggregator). No AppShell wrapper — the redesigns either bring their
 * own (full-page rebuilds) or render as a standalone component
 * (OrderForm-targeted).
 *
 * If the redesign throws at render time (broken imports, runtime type
 * errors, missing props), the error boundary surfaces a fallback that
 * tells the reviewer to read the source instead.
 */

import * as React from "react";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";

import { REGISTRY, type RenderTarget } from "../_registry";

const FULL_PAGE_TARGETS: RenderTarget[] = [
  "trade-page",
  "portfolio-page",
  "batches-page",
  "account-page",
];

const ORDER_FORM_DEFAULT_PROPS: Record<string, unknown> = {
  pair: "USDC/EURC",
  mode: "market",
  onModeChange: () => {},
  midpoint: "0.9213",
  loading: false,
};

const BATCH_DETAIL_DEFAULT_PROPS: Record<string, unknown> = {
  id: "4821",
};

function defaultPropsFor(target: RenderTarget): Record<string, unknown> {
  if (target === "order-form") return ORDER_FORM_DEFAULT_PROPS;
  if (target === "batch-detail") return BATCH_DETAIL_DEFAULT_PROPS;
  return {};
}

class RenderBoundary extends React.Component<
  { children: React.ReactNode; id: string },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (typeof console !== "undefined") {
      console.error(`[persona-render] persona ${this.props.id} crashed:`, error);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <Card className="m-6 flex flex-col gap-3 p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Persona {this.props.id} · render unavailable
          </span>
          <p className="text-sm text-[var(--foreground)]">
            This redesign threw at render time. The agent's source code is
            still useful — open the &ldquo;Redesign source&rdquo; tab on the
            aggregator to read it.
          </p>
          <pre className="overflow-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--muted)]/30 p-3 font-mono text-[11px] leading-relaxed text-[var(--muted-foreground)]">
            {String(this.state.error.message)}
          </pre>
        </Card>
      );
    }
    return this.props.children;
  }
}

export default function PersonaRenderPage({
  params,
}: {
  params: { id: string };
}) {
  const entry = REGISTRY[params.id];
  if (!entry) notFound();

  const Component = entry.Component;
  const props = defaultPropsFor(entry.target);

  if (FULL_PAGE_TARGETS.includes(entry.target)) {
    return (
      <RenderBoundary id={entry.id}>
        <Component {...props} />
      </RenderBoundary>
    );
  }

  // OrderForm + BatchDetailView render in a centered container so the
  // component sits in a context similar to its production home.
  return (
    <RenderBoundary id={entry.id}>
      <div className="mx-auto max-w-[640px] px-4 py-8 md:py-12">
        <Component {...props} />
      </div>
    </RenderBoundary>
  );
}
