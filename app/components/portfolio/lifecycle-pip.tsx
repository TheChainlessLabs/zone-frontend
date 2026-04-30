"use client";

/**
 * LifecyclePip — four-dot mini progression of the batch lifecycle for
 * fill-row surfaces.
 *
 * Replaces the flat status chip on `/portfolio` recent-fills (and any
 * other surface that maps to the 4-stage `Queued → Sealed → Proven →
 * Settled` state machine) with a compact progression that mirrors the
 * `ProofGauge` ring on `/batches/[id]`.
 *
 * Visual coherence is the contract:
 *   • `var(--success)` for reached stages — same token the proof gauge
 *     uses, so the row dot and the page ring read as one system.
 *   • `var(--foreground)` for the *current* stage, slightly stronger so
 *     the eye lands on it without relying on motion.
 *   • `var(--border)` for unreached stages — outlined ring only, empty
 *     fill, so the future feels deferred without going invisible.
 *   • `var(--destructive)` for the failed stage; prior reached stages
 *     remain `var(--success)` so the failure is local, not a wipe.
 *
 * The tooltip carries the [what happened] [what to do next] sentence
 * from `app/lib/lifecycle-copy.ts`. Surface it on hover *and* through
 * `aria-describedby` so screen-reader users get the same context.
 *
 * Source signal: M4.9 / B06 (5 votes — Daniel, Amira, Yuki, Marcus,
 * Omar). Decision 3 = A: technical canonical labels (Queued / Sealed /
 * Proven / Settled), tooltip bridges to plain language.
 */

import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { copyForBatchStage } from "@/lib/lifecycle-copy";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Lexicon                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Canonical 4-stage state-machine keys. The on-surface label stays
 * technical (Decision 3 = A); the tooltip adds the plain-language
 * consequence pair.
 */
const STAGES = [
  { key: "queued", label: "Queued" },
  { key: "sealed", label: "Sealed" },
  { key: "proven", label: "Proven" },
  { key: "settled", label: "Settled" },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

/**
 * Map a fill / batch / portfolio status to the *current* stage in the
 * 4-stage progression, so we can light up reached / current / future
 * dots consistently across surfaces.
 *
 * Notes on the mapping:
 *   • `matched` is the legacy fill-row term for "sealed in batch" — it
 *     resolves to the `sealed` stage. The lifecycle-copy lookup already
 *     uses the same string for both.
 *   • `pending` (from BatchStatus) means the batch sealed but proof and
 *     L1 anchor are outstanding, so it sits *at* the `sealed` stage with
 *     `proven` and `settled` still ahead.
 *   • `verified` is the batch-detail end-state; equivalent to `settled`
 *     for the dot row.
 *   • `failed` returns its own marker so the row paints the failure on
 *     the appropriate stage. We default to the `settled` slot for
 *     callers that don't disambiguate, because the most common failure
 *     mode is L1 settlement reverting after proof generation.
 */
function resolveProgress(status: string): {
  /** Index of the *current* stage in STAGES. */
  current: number;
  /** True if the current stage failed (paints destructive). */
  failed: boolean;
} {
  const s = status.toLowerCase();
  if (s === "queued") return { current: 0, failed: false };
  if (s === "sealed" || s === "matched" || s === "pending") {
    return { current: 1, failed: false };
  }
  if (s === "proven") return { current: 2, failed: false };
  if (s === "settled" || s === "verified") {
    return { current: 3, failed: false };
  }
  if (s === "failed") return { current: 3, failed: true };
  // Unknown status → hold at queued, leaves the rest outlined.
  return { current: 0, failed: false };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Component                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export interface LifecyclePipProps {
  /** Maps to BatchStatus from fixtures or string literal: queued / sealed / proven / settled / failed / pending. */
  status: string;
  /** Compact rendering for dense rows. Default false. */
  compact?: boolean;
  /** Aria label override. */
  ariaLabel?: string;
}

const SIZES = {
  default: { dot: 6, gap: 4, stroke: 1 },
  compact: { dot: 4, gap: 3, stroke: 1 },
} as const;

const LifecyclePip = React.forwardRef<HTMLSpanElement, LifecyclePipProps>(
  function LifecyclePip({ status, compact = false, ariaLabel }, ref) {
    const { current, failed } = resolveProgress(status);
    const dims = compact ? SIZES.compact : SIZES.default;
    const reactId = React.useId();
    const tooltipId = `lifecycle-pip-tooltip-${reactId}`;

    const currentStage = STAGES[current];
    // The tooltip is anchored on the *current* stage — that's the slot
    // the user is reading when they hover the row. Failed paints the
    // failure copy for the same stage so the consequence is explicit.
    const stageCopy = copyForBatchStage(currentStage.key);
    const tooltip = failed
      ? `Failed at ${currentStage.label}. Settlement reverted on L1. Fills remain valid offchain — no action required.`
      : `${currentStage.label}. ${stageCopy}`;

    const accessibleLabel =
      ariaLabel ??
      `Lifecycle: ${failed ? "failed at " : ""}${currentStage.label} (${current + 1} of ${STAGES.length}). ${stageCopy}`;

    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              ref={ref}
              role="img"
              aria-label={accessibleLabel}
              aria-describedby={tooltipId}
              tabIndex={0}
              data-status={status.toLowerCase()}
              data-current={currentStage.key}
              className={cn(
                "inline-flex items-center align-middle",
                "rounded-full outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
              )}
              style={{ gap: `${dims.gap}px` }}
            >
              {STAGES.map((stage, i) => {
                const reached = i < current;
                const isCurrent = i === current;
                const isFailed = failed && isCurrent;
                const tone = pipTone({ reached, isCurrent, isFailed });
                return (
                  <span
                    key={stage.key}
                    aria-hidden
                    data-stage={stage.key}
                    data-state={
                      isFailed
                        ? "failed"
                        : isCurrent
                          ? "current"
                          : reached
                            ? "reached"
                            : "future"
                    }
                    style={{
                      width: `${dims.dot}px`,
                      height: `${dims.dot}px`,
                      borderRadius: "9999px",
                      backgroundColor: tone.bg,
                      boxShadow: tone.shadow,
                      border: tone.border,
                      boxSizing: "border-box",
                    }}
                  />
                );
              })}
            </span>
          </TooltipTrigger>
          <TooltipContent
            id={tooltipId}
            role="tooltip"
            className="max-w-[260px] text-xs leading-relaxed"
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

/**
 * Tone calculation. Kept pure so it's easy to verify in tests:
 *   • reached  → success fill, no border
 *   • current  → foreground fill, no border (the eye lands here)
 *   • failed   → destructive fill, no border
 *   • future   → empty centre, border ring (deferred)
 */
function pipTone({
  reached,
  isCurrent,
  isFailed,
}: {
  reached: boolean;
  isCurrent: boolean;
  isFailed: boolean;
}): { bg: string; border: string; shadow: string | undefined } {
  if (isFailed) {
    return {
      bg: "var(--destructive)",
      border: "0",
      shadow: undefined,
    };
  }
  if (isCurrent) {
    return {
      bg: "var(--foreground)",
      border: "0",
      shadow: undefined,
    };
  }
  if (reached) {
    return {
      bg: "var(--success)",
      border: "0",
      shadow: undefined,
    };
  }
  return {
    bg: "transparent",
    border: "1px solid var(--border)",
    shadow: undefined,
  };
}

export { LifecyclePip, STAGES };
export type { StageKey };
