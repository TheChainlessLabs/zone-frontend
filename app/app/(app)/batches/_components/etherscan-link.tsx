import * as React from "react";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { truncateHash } from "@/lib/format";
import { tempoTxUrl } from "@/lib/zone";

/**
 * Outbound link to a transaction on the configured Tempo explorer.
 */
export interface TempoTxLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> {
  hash: string;
  /** Optional override for the visible label; defaults to the truncated hash. */
  label?: string;
  /** Hide the trailing external-link glyph (e.g. when nested in a button). */
  hideIcon?: boolean;
}

export function TempoTxLink({
  hash,
  label,
  hideIcon,
  className,
  onClick,
  ...rest
}: TempoTxLinkProps) {
  const display = label ?? truncateHash(hash);
  return (
    <a
      href={tempoTxUrl(hash)}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs text-[var(--muted-foreground)] underline-offset-4 transition-colors hover:text-[var(--foreground)] hover:underline",
        className,
      )}
      {...rest}
    >
      <span>{display}</span>
      {hideIcon ? null : (
        <Icon.External className="h-3 w-3 shrink-0" aria-hidden />
      )}
    </a>
  );
}
