"use client";

/**
 * Receipt — local scaffold (M4.17).
 *
 * TODO: replace with `@/components/ui/receipt` once M4.16 lands the shared
 * primitive. The composable subcomponent shapes here intentionally mirror
 * the M4.16 spec (Header / Metadata / Row / Actions / Action / Totals /
 * Total / Footer) so the swap-out is a one-line import change.
 *
 * Visual contract (paper-receipt artefact, Tempo-style):
 *   • Mono everywhere — labels, values, action names.
 *   • Flat surface, 1px hairline border, 4px-rounded, no drop shadow.
 *   • Labels left muted, values right mono. Numbered actions, fee + total
 *     at the bottom, single right-arrow CTA in the footer.
 *
 * The component sits inside a Sheet/Drawer surface that's already flat,
 * so the receipt itself drops its outer border in that context (the host
 * passes `bare`). When rendered standalone (e.g. inside an OrderConf
 * modal in a future PR) it keeps the outer hairline.
 */

import * as React from "react";

import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const RECEIPT_MONO = "font-mono tabular-nums";
const RECEIPT_LABEL =
  "font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]";

export interface ReceiptRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Drop the outer hairline + ring — for use inside a Sheet/Drawer surface. */
  bare?: boolean;
}

function ReceiptRoot({
  className,
  bare = false,
  ...rest
}: ReceiptRootProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-5",
        RECEIPT_MONO,
        bare
          ? null
          : "rounded-[4px] border border-[var(--border)] bg-[var(--card)] ring-1 ring-inset ring-[color-mix(in_oklab,var(--foreground)_4%,transparent)]",
        className,
      )}
      {...rest}
    />
  );
}

interface ReceiptHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Right-side eyebrow, e.g. "OPEN ORDER #o-1". */
  label?: React.ReactNode;
}

function ReceiptHeader({
  className,
  label,
  children,
  ...rest
}: ReceiptHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-3 border-b border-dashed border-[var(--border)] pb-3",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden
        className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--foreground)]"
      >
        OMEGA
      </span>
      {label ? (
        <span className={cn(RECEIPT_LABEL, "text-right")}>{label}</span>
      ) : null}
      {children}
    </header>
  );
}

function ReceiptMetadata({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDListElement>) {
  return (
    <dl
      className={cn(
        "grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-xs",
        className,
      )}
      {...rest}
    />
  );
}

interface ReceiptRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Tint the value muted for tertiary metadata (e.g. timestamps). */
  muted?: boolean;
}

function ReceiptRow({ label, value, muted = false }: ReceiptRowProps) {
  return (
    <>
      <dt className={cn(RECEIPT_LABEL, "self-center")}>{label}</dt>
      <dd
        className={cn(
          "min-w-0 self-center text-right",
          RECEIPT_MONO,
          muted && "text-[var(--muted-foreground)]",
        )}
      >
        {value}
      </dd>
    </>
  );
}

function ReceiptActions({
  className,
  ...rest
}: React.OlHTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn(
        "flex flex-col gap-1.5 border-t border-dashed border-[var(--border)] pt-3 text-xs",
        className,
      )}
      {...rest}
    />
  );
}

interface ReceiptActionProps {
  index: number;
  label: React.ReactNode;
  /** Right-aligned timestamp / payload. */
  payload?: React.ReactNode;
  /** `reached` paints foreground; `failed` paints destructive; default muted. */
  state?: "future" | "reached" | "failed";
}

function ReceiptAction({
  index,
  label,
  payload,
  state = "future",
}: ReceiptActionProps) {
  const failed = state === "failed";
  const reached = state === "reached";
  return (
    <li
      data-state={state}
      className="flex items-center justify-between gap-3"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border text-[10px]",
            failed
              ? "border-[color-mix(in_oklab,var(--destructive)_45%,transparent)] bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] text-[var(--destructive)]"
              : reached
                ? "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]"
                : "border-dashed border-[var(--border)] text-[var(--muted-foreground)]",
          )}
        >
          {index}
        </span>
        <span
          className={cn(
            "font-mono text-[11px] uppercase tracking-[0.16em]",
            failed
              ? "text-[var(--destructive)]"
              : reached
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)]",
          )}
        >
          {label}
        </span>
      </span>
      {payload ? (
        <span
          className={cn(
            RECEIPT_MONO,
            "text-right text-[var(--muted-foreground)]",
            !reached && !failed && "opacity-60",
          )}
        >
          {payload}
        </span>
      ) : null}
    </li>
  );
}

function ReceiptNote({
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs leading-relaxed text-[var(--muted-foreground)]",
        className,
      )}
      {...rest}
    />
  );
}

function ReceiptTotals({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDListElement>) {
  return (
    <dl
      className={cn(
        "flex flex-col gap-1 border-t border-dashed border-[var(--border)] pt-3 text-xs",
        className,
      )}
      {...rest}
    />
  );
}

interface ReceiptTotalProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Heavier weight for the bottom "Total" row. */
  emphasis?: boolean;
}

function ReceiptTotal({ label, value, emphasis = false }: ReceiptTotalProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt
        className={cn(
          RECEIPT_LABEL,
          emphasis && "text-[var(--foreground)]",
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          RECEIPT_MONO,
          "text-right",
          emphasis ? "text-sm text-[var(--foreground)]" : "text-xs",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

interface ReceiptFooterProps {
  /** Footer text — usually "View on Etherscan". */
  children: React.ReactNode;
  /** Outbound URL. Renders as an external link with right-arrow glyph. */
  href?: string;
  /** Treat as button (e.g. open a sub-modal). Mutually exclusive with href. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Suppress the trailing external-link glyph. */
  hideExternalGlyph?: boolean;
}

function ReceiptFooter({
  children,
  href,
  onClick,
  hideExternalGlyph,
}: ReceiptFooterProps) {
  const baseClass = cn(
    "inline-flex w-full items-center justify-between gap-2 border-t border-dashed border-[var(--border)] pt-3 text-xs font-mono uppercase tracking-[0.18em] text-[var(--foreground)] transition-colors hover:text-[var(--accent-foreground)]",
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={baseClass}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="inline-flex items-center gap-2">
          {children}
          {hideExternalGlyph ? null : (
            <Icon.External aria-hidden className="h-3 w-3" />
          )}
        </span>
        <span aria-hidden className="font-mono text-base leading-none">→</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseClass}>
      <span className="inline-flex items-center gap-2">{children}</span>
      <span aria-hidden className="font-mono text-base leading-none">→</span>
    </button>
  );
}

/** Receipt namespace — composable subcomponents. */
export const Receipt = Object.assign(ReceiptRoot, {
  Header: ReceiptHeader,
  Metadata: ReceiptMetadata,
  Row: ReceiptRow,
  Actions: ReceiptActions,
  Action: ReceiptAction,
  Note: ReceiptNote,
  Totals: ReceiptTotals,
  Total: ReceiptTotal,
  Footer: ReceiptFooter,
});
