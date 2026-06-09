import * as React from "react";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { truncateHash } from "@/lib/format";

/**
 * EtherscanLink — outbound link to a transaction or block on Etherscan.
 *
 * Wireframe-time the host is hard-coded to mainnet Etherscan. M6 swaps
 * this for a chain-aware resolver that picks the correct explorer based
 * on the connected chain ID.
 */
const ETHERSCAN_TX_BASE = "https://etherscan.io/tx";

export interface EtherscanTxLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> {
  hash: string;
  /** Optional override for the visible label; defaults to the truncated hash. */
  label?: string;
  /** Hide the trailing external-link glyph (e.g. when nested in a button). */
  hideIcon?: boolean;
}

export function EtherscanTxLink({
  hash,
  label,
  hideIcon,
  className,
  onClick,
  ...rest
}: EtherscanTxLinkProps) {
  const display = label ?? truncateHash(hash);
  return (
    <a
      href={`${ETHERSCAN_TX_BASE}/${hash}`}
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
