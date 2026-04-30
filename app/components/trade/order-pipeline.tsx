"use client";

/**
 * OrderPipeline — in-ticket execution rail (M4.12).
 *
 * Five stages, lifecycle-canonical order:
 *   Sign → Queued → Matched → Settling → Settled
 *
 * Visual contract (omega-docs/03-brand/visual-identity.md):
 *   - Idle / future stages: outlined lozenge, muted-foreground text.
 *   - Completed stages: tinted muted (foreground colour at low opacity).
 *   - Current stage: tinted strong (accent-strong, ~28% fill, full label).
 *   - Failed stage: destructive-tinted; downstream stages stay outlined,
 *     the rail "stops" so the user reads "we stopped here".
 *   - Connectors are 1px hairlines at `var(--border)`; promote to
 *     `var(--foreground)` between completed lozenges so the path reads.
 *
 * Empty state (no order in flight): `Order pipeline · idle` rendered above
 * the rail in mono uppercase tracking, all five lozenges outlined.
 *
 * Animation: 200ms tinted pulse on stage transition. Reduced-motion snaps.
 *
 * Mobile: horizontal scroll inside the OrderForm card — the rail is wider
 * than ~360px viewports, so we let it overflow rather than crowd labels.
 *
 * Tooltip copy: pulled from `@/lib/lifecycle-copy` (M4.10 / PR #203). The
 * `sign` step has no first-class entry in the shared lexicon — the closest
 * neighbour `awaiting-signature` reads "Confirm in your wallet to proceed.",
 * which is operator-facing rather than user-facing. We keep a single inline
 * string for the `sign` stage so the in-ticket copy stays consistent with
 * what the rail label says ("Sign"). Every other stage maps to the shared
 * module so a future copy edit propagates everywhere.
 */

import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { LIFECYCLE_COPY as SHARED_LIFECYCLE_COPY } from "@/lib/lifecycle-copy";

export type PipelineStage =
  | "idle"
  | "sign"
  | "queued"
  | "matched"
  | "settling"
  | "settled"
  | "failed";

export type ActiveStage = Exclude<PipelineStage, "idle" | "failed">;

export interface OrderPipelineProps {
  stage: PipelineStage;
  /** When `stage === "failed"`, names which step failed. */
  failedAt?: ActiveStage;
}

/** Order-canonical sequence. Drives both render order and progress math. */
const STAGES: ReadonlyArray<{ key: ActiveStage; label: string }> = [
  { key: "sign", label: "Sign" },
  { key: "queued", label: "Queued" },
  { key: "matched", label: "Matched" },
  { key: "settling", label: "Settling" },
  { key: "settled", label: "Settled" },
];

/**
 * Stage tooltip copy. Pulls from the shared lifecycle lexicon for every
 * stage except `sign` (see file comment). `settling` maps to the shared
 * `proven` key — same lifecycle moment, different surface label.
 */
const PIPELINE_COPY: Record<ActiveStage | "failed", string> = {
  sign: "Wallet signature pending.",
  queued: SHARED_LIFECYCLE_COPY.queued,
  matched: SHARED_LIFECYCLE_COPY.matched,
  settling: SHARED_LIFECYCLE_COPY.proven,
  settled: SHARED_LIFECYCLE_COPY.settled,
  failed: SHARED_LIFECYCLE_COPY.failed,
};

type LozengeState = "idle" | "completed" | "current" | "failed" | "future";

function classifyStage(
  stage: PipelineStage,
  failedAt: ActiveStage | undefined,
  index: number,
): LozengeState {
  if (stage === "idle") return "idle";

  if (stage === "failed") {
    const failedIdx = failedAt
      ? STAGES.findIndex((s) => s.key === failedAt)
      : -1;
    if (failedIdx === -1) return "future";
    if (index < failedIdx) return "completed";
    if (index === failedIdx) return "failed";
    return "future";
  }

  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  if (index < currentIdx) return "completed";
  if (index === currentIdx) return "current";
  return "future";
}

export function OrderPipeline({ stage, failedAt }: OrderPipelineProps) {
  const reduce = useReducedMotion();
  const isIdle = stage === "idle";

  return (
    <TooltipProvider delayDuration={150}>
      <div
        role="group"
        aria-label="Order execution pipeline"
        className="flex flex-col gap-2"
      >
        {isIdle ? (
          <span
            data-testid="pipeline-idle-label"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]"
          >
            Order pipeline · idle
          </span>
        ) : null}

        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <ol
            className="flex min-w-max items-center gap-1"
            aria-live="polite"
          >
            {STAGES.map((s, i) => {
              const lozengeState = classifyStage(stage, failedAt, i);
              const nextLozengeState =
                i < STAGES.length - 1
                  ? classifyStage(stage, failedAt, i + 1)
                  : null;
              const connectorActive =
                lozengeState === "completed" &&
                (nextLozengeState === "completed" ||
                  nextLozengeState === "current");
              return (
                <React.Fragment key={s.key}>
                  <li className="shrink-0">
                    <StageLozenge
                      label={s.label}
                      state={lozengeState}
                      tooltip={PIPELINE_COPY[s.key]}
                      reduceMotion={reduce}
                    />
                  </li>
                  {i < STAGES.length - 1 ? (
                    <li
                      aria-hidden
                      className={cn(
                        "h-px w-2 shrink-0 transition-colors duration-200 motion-reduce:transition-none sm:w-3",
                        connectorActive
                          ? "bg-[var(--foreground)]"
                          : "bg-[var(--border)]",
                      )}
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </ol>
        </div>
      </div>
    </TooltipProvider>
  );
}

interface StageLozengeProps {
  label: string;
  state: LozengeState;
  tooltip: string;
  reduceMotion: boolean;
}

function StageLozenge({
  label,
  state,
  tooltip,
  reduceMotion,
}: StageLozengeProps) {
  // `data-state` drives both the visual treatment and the test surface;
  // CSS-only styling keeps the rail composite-friendly on mobile.
  // Lozenge sizing: 56px min-width is the floor that keeps "MATCHED",
  // "SETTLING", "SETTLED" legible at 9px tracking. The rail still falls back
  // to horizontal scroll on viewports below ~360px wide.
  const baseClass =
    "inline-flex h-7 min-w-[56px] items-center justify-center rounded-full border px-2 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]";

  const stateClass = (() => {
    switch (state) {
      case "current":
        return cn(
          "text-[var(--foreground)]",
          // Tinted-strong fill via foreground mix; ring tone stays neutral.
          // Pulse on transition is opt-in via the `pulse` data attribute.
        );
      case "completed":
        return "border-[var(--foreground)]/40 bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] text-[var(--foreground)]";
      case "failed":
        return "border-[color-mix(in_oklab,var(--destructive)_45%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_14%,transparent)] text-[var(--destructive)]";
      case "future":
      case "idle":
      default:
        return "border-[var(--border)] bg-transparent text-[var(--muted-foreground)]";
    }
  })();

  // Inline style only for `current` so the tinted-strong fill mixes
  // against the live foreground colour rather than baking a hex.
  const inlineStyle: React.CSSProperties | undefined =
    state === "current"
      ? {
          borderColor:
            "color-mix(in oklab, var(--foreground) 55%, transparent)",
          backgroundColor:
            "color-mix(in oklab, var(--foreground) 16%, transparent)",
        }
      : undefined;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          tabIndex={0}
          // aria-label names the stage; the tooltip content is attached via
          // Radix's aria-describedby so screen readers read both. Keeping the
          // label short avoids name-collision with other Submit-containing
          // controls in the form (the CTA copy starts with "Submit ·").
          aria-label={`${label} stage`}
          data-stage={label.toLowerCase()}
          data-state={state}
          data-pulse={
            !reduceMotion && (state === "current" || state === "failed")
              ? "on"
              : "off"
          }
          className={cn(
            baseClass,
            stateClass,
            !reduceMotion && state === "current" && "omega-pipeline-pulse",
            !reduceMotion && state === "failed" && "omega-pipeline-pulse-fail",
          )}
          style={inlineStyle}
        >
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={6}
        className="max-w-[220px] text-center"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
