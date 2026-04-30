import { NotFoundContents } from "@/components/NotFoundContents";
import { RouteAtmosphere } from "@/components/shell/RouteAtmosphere";

/**
 * Next.js App Router 404. Triggered by `notFound()` from any server component
 * and as the catch-all for unknown routes. See
 * https://nextjs.org/docs/app/api-reference/file-conventions/not-found.
 *
 * The RouteAtmosphere override pins `data-route="/404"` on `<body>` so
 * global CSS keeps the dot-grid here regardless of the originally
 * requested URL (which `usePathname()` would otherwise surface).
 */
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24">
      <RouteAtmosphere route="/404" />
      <BackdropDotGrid />
      <div className="relative">
        <NotFoundContents />
      </div>
    </main>
  );
}

/**
 * Mirrors the BackdropDotGrid from /brand. Decorative, masked to fade at the
 * edges so it never competes with the foreground stack.
 */
function BackdropDotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0",
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 80%)",
      }}
    />
  );
}
