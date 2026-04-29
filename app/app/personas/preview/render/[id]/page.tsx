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
import {
  batchesDetailFixtures,
  batchesListFixtures,
  portfolioFixtures,
} from "@/lib/fixtures";

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

/**
 * Several agent-produced redesigns destructure their fixture data from
 * props (some take `fixture`, some `data`, some specific shapes). We
 * pass the canonical fixture under multiple property names so each
 * variant finds what it expects without being patched individually.
 */
function defaultPropsFor(target: RenderTarget): Record<string, unknown> {
  if (target === "order-form") return ORDER_FORM_DEFAULT_PROPS;
  if (target === "batch-detail") {
    const f = batchesDetailFixtures.verified;
    return { id: "4821", fixture: f, data: f, batch: f.batch, fills: f.fills };
  }
  if (target === "portfolio-page") {
    const f = portfolioFixtures.default;
    return { fixture: f, data: f, ...f };
  }
  if (target === "batches-page") {
    const f = batchesListFixtures.default;
    return { fixture: f, data: f, batches: f.batches };
  }
  return {};
}

/**
 * Defer mount to the client. Several agent-produced redesigns use
 * non-deterministic patterns at render time (`window`, time-of-render
 * derivations, etc.) that crash on hydration when SSR's HTML doesn't
 * match the client's. Mounting after hydration sidesteps that — the
 * variant only ever runs client-side here.
 */
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
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
        <ClientOnly>
          <Component {...props} />
        </ClientOnly>
      </RenderBoundary>
    );
  }

  // OrderForm + BatchDetailView render in a centered container so the
  // component sits in a context similar to its production home.
  return (
    <RenderBoundary id={entry.id}>
      <ClientOnly>
        <div className="mx-auto max-w-[640px] px-4 py-8 md:py-12">
          <Component {...props} />
        </div>
      </ClientOnly>
    </RenderBoundary>
  );
}
