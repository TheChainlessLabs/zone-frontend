"use client";

import * as React from "react";
import { type LucideIcon } from "lucide-react";

import { Animate } from "@/components/ui/animate";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * Status — brand-lexicon-aware status primitive.
 *
 * Higher-level than Badge. Encodes the 10 canonical states from
 * `omega-docs/03-brand/messaging.md` (Status labels) onto a Badge variant +
 * Icon + label triple. "Online" collapses into `connected`; "Proof generated"
 * / "Proof verified" collapse into `proven` for v1 — split if the order
 * timeline needs to distinguish them.
 */
export type StatusState =
  | "pending"
  | "submitting"
  | "awaiting-signature"
  | "matched"
  | "settled"
  | "proven"
  | "cancelled"
  | "failed"
  | "connected"
  | "wrong-network";

type Variant = NonNullable<BadgeProps["variant"]>;

interface StateSpec {
  label: string;
  variant: Variant;
  icon?: LucideIcon;
  /** When true, the badge renders a leading dot instead of an icon. */
  dot?: boolean;
}

const STATE_SPECS: Record<StatusState, StateSpec> = {
  pending: { label: "Pending", variant: "outline", icon: Icon.Pending },
  submitting: {
    label: "Submitting…",
    variant: "outline",
    icon: Icon.Pending,
  },
  "awaiting-signature": {
    label: "Awaiting signature",
    variant: "outline",
    icon: Icon.Sign,
  },
  matched: { label: "Matched", variant: "success", icon: Icon.Match },
  settled: { label: "Settled", variant: "success", icon: Icon.Settled },
  proven: { label: "Proven", variant: "success", icon: Icon.Proof },
  cancelled: { label: "Cancelled", variant: "default", icon: Icon.Cancelled },
  failed: { label: "Failed", variant: "destructive", icon: Icon.Failed },
  connected: { label: "Connected", variant: "success", dot: true },
  "wrong-network": {
    label: "Wrong network",
    variant: "destructive",
    icon: Icon.Warning,
  },
};

export interface StatusProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  state: StatusState;
  /** Override the default label (rare — only when context demands it). */
  label?: string;
  /** Use the glass substrate. Reserved for the order form and other glass
   *  surfaces per omega-docs/03-brand/visual-identity.md. */
  glass?: boolean;
}

const Status = React.forwardRef<HTMLSpanElement, StatusProps>(
  ({ state, label, glass = false, className, ...rest }, ref) => {
    const spec = STATE_SPECS[state];
    const variant: Variant = glass ? "glass" : spec.variant;
    const text = label ?? spec.label;
    const IconCmp = spec.icon;

    // Tiny pop on transition. The `state` prop drives the key so React
    // remounts the Animate node when the state actually changes — keeping
    // it from popping on every parent rerender.
    return (
      <Badge
        ref={ref}
        data-status={state}
        variant={variant}
        className={cn(className)}
        {...rest}
      >
        <Animate
          key={state}
          variant="pop"
          className="inline-flex items-center gap-1.5"
        >
          {spec.dot ? (
            <Badge.Dot />
          ) : IconCmp ? (
            <IconCmp size={12} aria-hidden className="shrink-0" />
          ) : null}
          <span>{text}</span>
        </Animate>
      </Badge>
    );
  }
);
Status.displayName = "Status";

export { Status, STATE_SPECS };
