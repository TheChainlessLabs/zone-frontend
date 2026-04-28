"use client";

import {
  AnimatePresence as MotionAnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Animate — the only sanctioned way to add motion in design-V2.
 *
 * The five variants are the brand motion ladder, locked to
 * `omega-docs/03-brand/visual-identity.md` and the motion tokens in
 * `omega-docs/03-brand/assets/tokens.json`.
 *
 *   enter   — first mount, modal open, section reveal · 200ms ease-out
 *   exit    — dismissal · 150ms ease-in
 *   expand  — accordion / collapsible · 250ms ease-out, grid-row trick
 *   pop     — tap feedback · 100ms ease-out, scale 0.97 on press
 *   drawer  — mobile sheets · spring (stiffness 360, damping 32, mass 0.9)
 *
 * Reduced motion is a first-class path: enter/exit drop translation, expand
 * snaps instantly, pop is a no-op, drawer falls back to 100ms linear ease-out.
 * Outside this primitive, raw `motion.div` declarations should not be added
 * for new surfaces — M7 will lint-enforce.
 */
export type AnimateVariant = "enter" | "exit" | "expand" | "pop" | "drawer";

// Brand-locked motion ladder. Must stay in lockstep with
// `omega-docs/03-brand/assets/tokens.json` motion.{duration,ease,spring}.
// CSS variables carry the same numbers for non-JS surfaces.
const DURATION = {
  press: 0.1, // 100ms
  small: 0.15, // 150ms
  medium: 0.2, // 200ms
  large: 0.25, // 250ms
} as const;

const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.7, 0, 1, 0.5] as const,
} as const;

const DRAWER_SPRING = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.9,
} as const;

interface AnimateOwnProps {
  variant: AnimateVariant;
  /** Stagger by N seconds. Forwarded to motion `transition.delay`. */
  delay?: number;
}

// v1 renders as <div>. A polymorphic `as` prop can land in M5 if needed.
type AnimateProps = AnimateOwnProps &
  Omit<HTMLMotionProps<"div">, "variants" | keyof AnimateOwnProps>;

export function Animate({
  variant,
  delay = 0,
  className,
  children,
  ...rest
}: AnimateProps) {
  const reduce = useReducedMotion() ?? false;

  // `expand` uses the grid-template-rows trick — composite-friendly,
  // satisfies the 60fps-on-mobile rule from visual-identity.md.
  if (variant === "expand") {
    const transition: Transition = reduce
      ? { duration: 0.001 }
      : { duration: DURATION.large, ease: [...EASE.out], delay };

    return (
      <motion.div
        // 0fr ↔ 1fr; child wrapper clips during the transition.
        initial={{ gridTemplateRows: "0fr" }}
        animate={{ gridTemplateRows: "1fr" }}
        exit={{ gridTemplateRows: "0fr" }}
        transition={transition}
        {...rest}
        className={cn("grid", className)}
        style={{ display: "grid", ...rest.style }}
      >
        <div className="min-h-0 overflow-hidden">{children as React.ReactNode}</div>
      </motion.div>
    );
  }

  const props = buildVariantProps(variant, delay, reduce);

  return (
    <motion.div className={className} {...props} {...rest}>
      {children}
    </motion.div>
  );
}

type VariantProps = Pick<
  HTMLMotionProps<"div">,
  "initial" | "animate" | "exit" | "whileTap" | "transition"
>;

function buildVariantProps(
  variant: Exclude<AnimateVariant, "expand">,
  delay: number,
  reduce: boolean
): VariantProps {
  switch (variant) {
    case "enter":
      return {
        initial: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
        animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
        transition: { duration: DURATION.medium, delay, ...(reduce ? {} : { ease: [...EASE.out] }) },
      };
    case "exit":
      return {
        initial: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
        animate: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
        transition: { duration: DURATION.small, delay, ...(reduce ? {} : { ease: [...EASE.in] }) },
      };
    case "pop":
      // Reduced-motion: render-through; press handlers still fire.
      if (reduce) return {};
      return {
        whileTap: { scale: 0.97 },
        transition: { duration: DURATION.press, ease: [...EASE.out], delay },
      };
    case "drawer": {
      // Spring is reserved for tactile mobile gestures. Reduced-motion
      // falls back to linear ease-out — slide without overshoot.
      const transition: Transition = reduce
        ? { duration: DURATION.press, ease: "linear", delay }
        : { ...DRAWER_SPRING, delay };
      return {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition,
      };
    }
  }
}

/** Re-exported so consumers stay on the `@/components/ui/animate` import. */
export const AnimatePresence = MotionAnimatePresence;
