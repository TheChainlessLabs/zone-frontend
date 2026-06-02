"use client";

/**
 * TransitionLink — app-local alias for `next/link`.
 *
 * Earlier builds wrapped nav clicks in the View Transitions API. On the
 * authenticated product shell that produced a visible flash between primary
 * tabs, so product navigation now uses Next's native client routing.
 */

import NextLink, { type LinkProps } from "next/link";
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
>(function TransitionLink({ href, replace, scroll, children, ...rest }, ref) {
  return (
    <NextLink
      ref={ref}
      href={href}
      replace={replace}
      scroll={scroll}
      {...rest}
    >
      {children}
    </NextLink>
  );
});
