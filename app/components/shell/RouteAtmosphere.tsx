"use client";

/**
 * RouteAtmosphere — sets `data-route` on `<body>` so global CSS can render a
 * per-route surface treatment. Product routes (`/trade`, `/portfolio`, …)
 * fall through to a subtle radial vignette on the body itself; brand and
 * review routes (`/brand`, `/system`, `/404`) re-enable the legacy
 * dot-grid via `body::before`. See `app/globals.css`.
 *
 * The not-found page renders this with `route="/404"` explicitly because
 * `usePathname()` returns the originally requested URL (anything that
 * 404'd), not a stable sentinel.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface RouteAtmosphereProps {
  /** Override the detected pathname. Used by `not-found.tsx` to set "/404". */
  route?: string;
}

export function RouteAtmosphere({ route }: RouteAtmosphereProps) {
  const pathname = usePathname();
  const value = route ?? pathname ?? "/";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = document.body.getAttribute("data-route");
    document.body.setAttribute("data-route", value);
    return () => {
      // Restore the prior value on unmount so a transient mount (e.g., the
      // not-found override) doesn't leave a stale attribute behind.
      if (previous === null) {
        document.body.removeAttribute("data-route");
      } else {
        document.body.setAttribute("data-route", previous);
      }
    };
  }, [value]);

  return null;
}
