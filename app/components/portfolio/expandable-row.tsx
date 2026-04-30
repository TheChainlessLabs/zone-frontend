"use client";

/**
 * ExpandableRow — institutional drill-down primitive (M4.15).
 *
 * The pattern Schwab / IBKR / Bloomberg lean on for dense tabular data:
 * a tappable row that reveals an inline panel with the full record. The
 * row stays scannable; the panel carries every detail a serious operator
 * needs without launching a modal or a separate page.
 *
 * On `/portfolio` we use this for Open positions, Recent fills, and
 * Transfers. The expanded panel hosts the full `OrderPipeline` rail
 * (its new home, post-M4.14 OrderForm refactor) plus stage timestamps
 * and identifying metadata.
 *
 * Behaviour contract:
 *   • Row is rendered as a `<button>` so click + keyboard activation
 *     come for free; `aria-expanded` and `aria-controls` are wired.
 *   • Independent expansion: rows do NOT collapse each other. Comparing
 *     two open positions side-by-side is the prevailing motion for
 *     dense lists.
 *   • Keyboard: Enter / Space toggle (native button), Esc collapses
 *     when focus is anywhere inside the open panel or its trigger.
 *   • Motion: 200ms height transition via grid-template-rows. Honours
 *     `prefers-reduced-motion` by snapping (`transition: none`).
 *   • Visual: chevron rotates 90° on expand. No left-border colour
 *     stripe — the chevron + tinted hover do the lift.
 *
 * Interactive children inside the row summary (e.g. CopyButton,
 * EtherscanTxLink) must call `event.stopPropagation()` themselves so
 * clicking them doesn't toggle the row. The components used on the
 * portfolio surface today already do.
 */

import * as React from "react";
import { useReducedMotion } from "motion/react";

import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface ExpandableRowProps {
  /** Stable id for `aria-controls` wiring. Must be unique per row. */
  id: string;
  /** Row summary — what the user sees when collapsed. */
  summary: React.ReactNode;
  /** Detail panel rendered below the summary when expanded. */
  detail: React.ReactNode;
  /** Optional default-open. Defaults to false. */
  defaultOpen?: boolean;
  /**
   * Accessible name for the toggle button. Should describe the row
   * ("Order o-9482 USDC/EURC sell limit"). The chevron itself is
   * aria-hidden.
   */
  ariaLabel: string;
  /** Class applied to the row summary `<button>`. */
  rowClassName?: string;
  /** Class applied to the expanded panel container. */
  panelClassName?: string;
}

export function ExpandableRow({
  id,
  summary,
  detail,
  defaultOpen = false,
  ariaLabel,
  rowClassName,
  panelClassName,
}: ExpandableRowProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  // Lazily mount the detail subtree on first expand — keeps the initial
  // page render light when a list has dozens of rows. Once mounted we
  // keep the subtree alive so re-expanding is instant and the close
  // transition has something to animate.
  const [hasOpened, setHasOpened] = React.useState(defaultOpen);
  const reduce = useReducedMotion() ?? false;
  const panelId = `expandable-row-panel-${id}`;
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Esc collapses when focus is anywhere inside the row's container.
  // We listen on the container (not document) so we don't fight other
  // Esc handlers on the page (modals, dropdowns).
  function onContainerKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;
    if (!open) return;
    event.stopPropagation();
    setOpen(false);
    // Pull focus back to the trigger so subsequent Tab traversal makes
    // sense — otherwise focus is left on whatever inside the panel was
    // active when it collapsed.
    buttonRef.current?.focus();
  }

  return (
    <div ref={containerRef} onKeyDown={onContainerKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={ariaLabel}
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (next) setHasOpened(true);
            return next;
          });
        }}
        className={cn(
          "flex w-full items-center gap-3 border-t border-[var(--border)] py-3 text-left text-sm transition-colors first:border-t-0 motion-reduce:transition-none",
          "hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
          rowClassName,
        )}
      >
        <span className="flex-1 min-w-0">{summary}</span>
        <Icon.Caret.Right
          aria-hidden
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-90",
          )}
        />
      </button>
      {/*
        Grid-template-rows trick for height animation: 0fr → 1fr lets the
        browser interpolate between collapsed (0px) and natural-content
        height without measuring. The inner overflow:hidden clips the
        content while it's expanding. Reduced-motion drops the transition.
      */}
      <div
        id={panelId}
        role="region"
        aria-label={`${ariaLabel} details`}
        aria-hidden={!open}
        data-state={open ? "open" : "closed"}
        className={cn(
          "grid",
          reduce ? "" : "transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          className={cn(
            "overflow-hidden",
            // visibility flip prevents focusable children from collecting
            // tab focus or announcing themselves while the panel is
            // visually collapsed. We still keep the node in the tree so
            // the height transition has something to interpolate to.
            open ? "visible" : "invisible",
          )}
        >
          <div className={cn("pb-4 pt-1", panelClassName)}>
            {hasOpened ? detail : null}
          </div>
        </div>
      </div>
    </div>
  );
}
