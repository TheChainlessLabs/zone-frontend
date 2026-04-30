"use client";

/**
 * TransitionLink — drop-in replacement for `next/link` that wraps the client
 * navigation in `document.startViewTransition()` when the browser supports
 * the View Transitions API (Chromium today; Safari/Firefox fall back to
 * instant navigation).
 *
 * Use only on surfaces where a 200ms cross-fade between routes adds clarity:
 * Navbar / MobileTabBar primary tabs, batches list → batch detail. Marketing
 * links, footer links, dropdown items, and links inside tooltips/modals
 * should keep using `next/link` directly.
 *
 * Browser-support strategy: capability detection, no feature flag. If
 * `startViewTransition` is missing the click flows through `next/link` as
 * usual. SSR-safe: every guard short-circuits before touching `document`.
 *
 * Modifier-click pass-through: Cmd/Ctrl/Shift/Alt clicks and middle-clicks
 * stay native so "open in new tab" / "open in new window" continue to work.
 */

import NextLink, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

type AnchorPropsWithoutHref = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
>;

export type TransitionLinkProps = LinkProps &
  AnchorPropsWithoutHref & {
    children?: React.ReactNode;
  };

export const TransitionLink = React.forwardRef<
  HTMLAnchorElement,
  TransitionLinkProps
>(function TransitionLink({ href, onClick, replace, scroll, children, ...rest }, ref) {
  const router = useRouter();

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // Modifier clicks and non-primary buttons should follow native behaviour
    // (new tab / new window / download).
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // External / non-string hrefs go through `next/link` unchanged.
    if (typeof href !== "string") return;
    // SSR + capability guard.
    if (typeof document === "undefined") return;
    if (!("startViewTransition" in document)) return;

    event.preventDefault();
    const navigate = () => {
      if (replace) {
        router.replace(href, scroll === false ? { scroll: false } : undefined);
      } else {
        router.push(href, scroll === false ? { scroll: false } : undefined);
      }
    };
    document.startViewTransition(navigate);
  };

  return (
    <NextLink
      ref={ref}
      href={href}
      replace={replace}
      scroll={scroll}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </NextLink>
  );
});
