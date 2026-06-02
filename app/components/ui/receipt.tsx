"use client";

import * as React from "react";

import { OmegaMark } from "@/components/OmegaMark";
import { Icon } from "@/lib/icons";
import { truncateHash } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export interface ReceiptCta {
  label: string;
  href: string;
}

export interface ReceiptLinkedValue {
  display: string;
  full: string;
  etherscan?: string;
}

type ReceiptValue = React.ReactNode | string | number | ReceiptLinkedValue;

export interface ReceiptProps extends React.HTMLAttributes<HTMLDivElement> {
  cta?: ReceiptCta;
}

interface ReceiptHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

interface ReceiptRowProps {
  label: string;
  value: ReceiptValue;
}

interface ReceiptActionProps extends React.HTMLAttributes<HTMLLIElement> {
  number: number;
  label: string;
  payload?: React.ReactNode;
  failed?: boolean;
}

interface ReceiptFooterProps extends ReceiptCta {
  className?: string;
}

const ReceiptSectionContext = React.createContext<"metadata" | "totals">(
  "metadata",
);

const ReceiptRoot = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ className, children, cta, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "min-w-0 max-w-full overflow-hidden font-mono rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_var(--surface-edge)]",
        className,
      )}
      {...props}
    >
      {children}
      {cta ? <ReceiptFooter label={cta.label} href={cta.href} /> : null}
    </div>
  ),
);
ReceiptRoot.displayName = "ReceiptRoot";

function ReceiptHeader({
  className,
  children,
  label,
  ...props
}: ReceiptHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        {children ?? <DefaultWordmark />}
      </div>
      <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
        {label}
      </span>
    </div>
  );
}

function ReceiptMetadata({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDListElement>) {
  return (
    <ReceiptSectionContext.Provider value="metadata">
      <dl
        className={cn("flex flex-col gap-2 px-4 py-3 text-xs", className)}
        {...props}
      >
        {children}
      </dl>
    </ReceiptSectionContext.Provider>
  );
}

function ReceiptTotals({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDListElement>) {
  return (
    <ReceiptSectionContext.Provider value="totals">
      <dl
        className={cn(
          "flex flex-col gap-2 border-t border-[var(--border)] px-4 py-3 text-xs",
          className,
        )}
        {...props}
      >
        {children}
      </dl>
    </ReceiptSectionContext.Provider>
  );
}

function ReceiptRow({ label, value }: ReceiptRowProps) {
  const kind = React.useContext(ReceiptSectionContext);

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] items-start gap-x-4">
      <dt className="min-w-0 truncate text-[var(--muted-foreground)]">{label}</dt>
      <dd
        className={cn(
          "min-w-0 overflow-hidden text-right tabular-nums text-[var(--foreground)]",
          kind === "totals" ? "font-semibold" : "font-medium",
        )}
      >
        <ReceiptValueNode value={value} />
      </dd>
    </div>
  );
}

function ReceiptActions({
  className,
  children,
  ...props
}: React.OlHTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn(
        "flex list-none flex-col gap-2 border-t border-[var(--border)] px-4 py-3 text-xs",
        className,
      )}
      {...props}
    >
      {children}
    </ol>
  );
}

function ReceiptAction({
  className,
  number,
  label,
  payload,
  failed = false,
  ...props
}: ReceiptActionProps) {
  return (
    <li
      className={cn("grid grid-cols-[auto_1fr] items-start gap-x-3", className)}
      {...props}
    >
      <span className="pt-1 text-[var(--muted-foreground)]">{number}.</span>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-[var(--radius-sm)] bg-[var(--muted)]/30 px-2 py-0.5 text-[var(--foreground)]",
            failed &&
              "bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] text-[var(--destructive)]",
          )}
        >
          {label}
        </span>
        {payload ? (
          <span className="min-w-0 truncate text-[var(--muted-foreground)]">
            {payload}
          </span>
        ) : null}
      </div>
    </li>
  );
}

function ReceiptFooter({ label, href, className }: ReceiptFooterProps) {
  return (
    <div className={cn("border-t border-[var(--border)] px-4 py-3", className)}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground)] transition-colors duration-150 hover:text-[var(--muted-foreground)] motion-reduce:transition-none"
      >
        <span>{label}</span>
        <Icon.Caret.Right size={12} aria-hidden className="shrink-0" />
      </a>
    </div>
  );
}

function ReceiptValueNode({ value }: { value: ReceiptValue }) {
  if (React.isValidElement(value)) return value;
  if (isReceiptLinkedValue(value)) {
    return <ReceiptHashValue value={value} />;
  }
  if (typeof value === "number") {
    return <span className="block truncate" title={String(value)}>{value}</span>;
  }

  if (typeof value !== "string") {
    return <span className="block truncate">{value}</span>;
  }

  if (value.startsWith("0x") && value.length > 16) {
    return <ReceiptHashValue value={{ display: truncateHash(value), full: value }} />;
  }

  return <span className="block truncate" title={value}>{value}</span>;
}

function ReceiptHashValue({ value }: { value: ReceiptLinkedValue }) {
  const [copied, setCopied] = React.useState(false);
  const resetTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(value.full);
    setCopied(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  const trigger = value.etherscan ? (
    <a
      href={value.etherscan}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center justify-end gap-1 truncate underline-offset-4 hover:underline"
    >
      <span className="truncate">{value.display}</span>
      <Icon.External size={12} aria-hidden className="shrink-0" />
    </a>
  ) : (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex max-w-full items-center justify-end truncate rounded-[var(--radius-sm)] text-right underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      aria-label={`Copy ${value.full}`}
    >
      <span className="truncate">{value.display}</span>
    </button>
  );

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          role="tooltip"
          className="max-w-[280px] space-y-2 bg-[var(--foreground)] px-3 py-2 text-left text-[11px] leading-relaxed text-[var(--background)]"
        >
          <div className="break-all">{value.full}</div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[var(--background)]/80 transition-colors duration-150 hover:text-[var(--background)] motion-reduce:transition-none"
          >
            <Icon.Copy size={12} aria-hidden className="shrink-0" />
            {copied ? "Copied" : "Copy"}
          </button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DefaultWordmark() {
  return (
    <div className="inline-flex items-center gap-2">
      <OmegaMark size={16} className="shrink-0" />
      <span className="text-xs uppercase tracking-[0.22em] text-[var(--foreground)]">
        Omega
      </span>
    </div>
  );
}

function isReceiptLinkedValue(value: ReceiptValue): value is ReceiptLinkedValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "display" in value &&
    "full" in value
  );
}

type ReceiptComponent = React.ForwardRefExoticComponent<
  ReceiptProps & React.RefAttributes<HTMLDivElement>
> & {
  Header: typeof ReceiptHeader;
  Metadata: typeof ReceiptMetadata;
  Row: typeof ReceiptRow;
  Actions: typeof ReceiptActions;
  Action: typeof ReceiptAction;
  Totals: typeof ReceiptTotals;
  Footer: typeof ReceiptFooter;
};

const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ className, ...props }, ref) => (
    <ReceiptRoot ref={ref} className={className} {...props} />
  ),
) as ReceiptComponent;

Receipt.displayName = "Receipt";
Receipt.Header = ReceiptHeader;
Receipt.Metadata = ReceiptMetadata;
Receipt.Row = ReceiptRow;
Receipt.Actions = ReceiptActions;
Receipt.Action = ReceiptAction;
Receipt.Totals = ReceiptTotals;
Receipt.Footer = ReceiptFooter;

export { Receipt, type ReceiptValue };
