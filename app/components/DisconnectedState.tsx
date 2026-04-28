"use client";

import * as React from "react";
import { type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * DisconnectedState — auth-required empty state for routes behind a wallet.
 *
 * Reused by /trade, /portfolio, /account. /batches is public and does not
 * use this. Voice rule (omega-docs/03-brand/messaging.md): "[What happened.]
 * [What to do next.]" — terse, period-terminated, no exclamation points.
 *
 * The component is generic. Consumers pass the variant they need:
 *   - default               → no wallet connected
 *   - wrong-network         → switch chain
 *   - no-NFT-pass           → phase-4 alpha gate
 * …or any other one-shot empty state with a single primary action.
 */
export interface DisconnectedStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Headline. Defaults to the alpha tagline. */
  title?: string;
  /** One-line description. Period-terminated. */
  description?: string;
  /** Primary CTA label. */
  actionLabel?: string;
  /** Primary CTA handler. Required — the surface is always actionable. */
  onAction: () => void;
  /**
   * Icon shown in the framed surface above the headline. Defaults to
   * `Icon.Wallet`. Pass `Icon.Warning` for wrong-network, `Icon.Info` for
   * informational gates (e.g. NFT pass).
   */
  icon?: LucideIcon;
}

export const DisconnectedState = React.forwardRef<
  HTMLDivElement,
  DisconnectedStateProps
>(function DisconnectedState(
  {
    title = "Anonymous spot FX. On-chain settlement.",
    description = "Connect a wallet to access trading and account screens.",
    actionLabel = "Connect Wallet",
    onAction,
    icon: IconComponent = Icon.Wallet,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      role="status"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-6 px-6 py-16 text-center",
        className,
      )}
      {...rest}
    >
      <div
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]"
      >
        <IconComponent className="h-5 w-5" />
      </div>
      <h2 className="max-w-[520px] text-xl font-medium leading-tight tracking-tight md:text-2xl">
        {title}
      </h2>
      <p className="max-w-[460px] text-sm leading-relaxed text-[var(--muted-foreground)]">
        {description}
      </p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
});
