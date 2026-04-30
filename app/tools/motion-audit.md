# Motion audit — omega-interface

Generated for M5.1 (#224). Drives M5.2 (#225) and M5.3 (#226).

This audit catalogues every motion usage in `app/` so M5.2 (dependency removal /
narrowing) and M5.3 (per-component migration) have a concrete work backlog.
Recommendations map to one of:

- `default-150ms` — replace with the stack default: a Tailwind `transition`
  class running on `--ease-standard` at `--duration-150`. No JS, no library.
- `press-down` — replace tap/scale feedback with the `.press-down` utility
  added in this slice (`translateY(0.5px)` on `:active`).
- `@starting-style` — replace mount-fade with CSS `@starting-style` once the
  consumer surfaces are ready (Chrome 117+, Safari 17.5+, Firefox 129+).
- `view-transition` — replace cross-route `layoutId` shared-element flips
  with the View Transitions API (`document.startViewTransition`).
- `radix-data-state` — replace open/close keyframes with Radix's
  `data-[state=open]` / `data-[state=closed]` attribute, driven by
  `tailwindcss-animate` (already installed).
- `@keyframes` — replace JS keyframes with a CSS `@keyframes` block plus a
  `prefers-reduced-motion` carve-out.
- `tailwind-animate-pulse` / `tailwind-animate-ping` — replace decorative
  pulse/ping with Tailwind's built-in animations (already in the stack).
- `leave-as-is` — usage is appropriate for the library's strengths (e.g.
  drag-to-dismiss spring physics, FLIP layout); keep for now.

## Library imports

| File | Line | Current pattern | Recommendation | Notes |
|---|---|---|---|---|
| `app/brand/page.tsx` | 3 | `import { motion, useAnimate, useInView, type AnimationOptions } from "motion/react"` | `leave-as-is` (review surface) | `/brand` is the design specimen page. Motion library is appropriate context — this surface exists to demo motion. Re-evaluate during M5.3 only if `/brand` itself is rewritten. |
| `app/system/page.tsx` | 3 | `import { motion, MotionConfig } from "motion/react"` | `leave-as-is` (review surface) | `/system` is the design-system specimen. Same rationale as `/brand`. |
| `components/ui/animate.tsx` | 4-9 | `motion`, `AnimatePresence`, `useReducedMotion`, `HTMLMotionProps`, `Transition` | `leave-as-is` | Centralised motion primitive. Keeping `motion/react` quarantined here is the explicit policy in `components/ui/animate.tsx:29` — outside this primitive, raw `motion.div` should not be added. M5.2 narrows the public API; M5.3 can replace internal mechanics with CSS but the surface stays. |
| `components/ui/__tests__/animate.test.tsx` | 3 | `import { MotionConfig } from "motion/react"` | `leave-as-is` | Test fixture for the primitive above. Stays as long as `Animate` does. |
| `components/trade/order-pipeline.tsx` | 36 | `import { useReducedMotion } from "motion/react"` | `default-150ms` | Only `useReducedMotion` is imported — already replaceable with `window.matchMedia('(prefers-reduced-motion: reduce)')` plus a tiny hook. M5.2 should swap to drop the per-page motion-lib payload. |
| `components/shell/Navbar.tsx` | 20 | `import { motion, useReducedMotion } from "motion/react"` | `view-transition` | See row in §Component motion. Active-tab indicator uses `layoutId` for a shared-element flip; View Transitions API is the modern path for nav indicators. |
| `components/shell/MobileTabBar.tsx` | 18 | `import { motion, useReducedMotion } from "motion/react"` | `view-transition` | Same pattern as `Navbar.tsx` — `layoutId="mobile-tab-active"`. |
| `components/ReviewNav.tsx` | 12 | `import { motion } from "motion/react"` | `view-transition` | Active-tab `layoutId="review-nav-active"`. View Transitions equivalent. |
| `components/SectionNav.tsx` | 4 | `import { motion } from "motion/react"` | `default-150ms` + `view-transition` | Two usages: a desktop progress tick (`scaleX` animate, default-150ms with `transform`/`transition` is enough) and a mobile underline `layoutId="mobile-section-underline"` (View Transitions). |
| `components/ThemeToggle.tsx` | 5 | `import { motion } from "motion/react"` | `press-down` | `whileTap={{ scale: 0.96 }}` is exactly what `.press-down` is for. Drop the import entirely. |
| `components/Swatch.tsx` | 4 | `import { motion } from "motion/react"` | `press-down` + `default-150ms` | `whileTap={{ scale: 0.99 }}` → `.press-down`. `whileHover={{ y: -2 }}` → CSS `hover:translate-y-[-2px]` plus the existing `transition` class. Drop the import. |

## Component motion (`<motion.…>`, `AnimatePresence`)

| File | Line | Current pattern | Recommendation | Notes |
|---|---|---|---|---|
| `components/ThemeToggle.tsx` | 27-36 | `<motion.button whileTap={{ scale: 0.96 }} transition={{ duration: 0.1, ease: "easeOut" }}>` | `press-down` | Replace with plain `<button>` plus `class="press-down"`. Already has `transition-colors` for the colour state. |
| `components/Swatch.tsx` | 38-66 | `<motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.15, ease: [...] }}>` | `press-down` + Tailwind hover | Replace with plain `<button class="press-down hover:-translate-y-0.5 transition-transform duration-150 ease-[var(--ease-standard)]">`. |
| `components/ReviewNav.tsx` | 52-57 | `<motion.span layoutId="review-nav-active" transition={{ duration: 0.25, ease: [...] }}>` | `view-transition` | Active-tab pill flip. View Transitions (`view-transition-name: review-nav-active`) is the modern equivalent. M5.3 work. |
| `components/SectionNav.tsx` | 57-62 | `<motion.span animate={{ scaleX: isActive ? 1 : 0.25 }} transition={{ duration: 0.25, ease: [...] }}>` | `default-150ms` | Single-axis scale with no FLIP. Replace with a CSS class that toggles `scale-x-100` / `scale-x-25` and `transition-transform duration-150 ease-[var(--ease-standard)]`. |
| `components/SectionNav.tsx` | 94-99 | `<motion.span layoutId="mobile-section-underline" transition={{ duration: 0.2, ease: [...] }}>` | `view-transition` | Same FLIP pattern as nav. M5.3 work. |
| `components/shell/Navbar.tsx` | 68-77 | `<motion.span layoutId="navbar-active" transition={...}>` | `view-transition` | Navbar active-tab indicator. M5.3 work. |
| `components/shell/MobileTabBar.tsx` | 54-64 | `<motion.span layoutId="mobile-tab-active" transition={...}>` | `view-transition` | Mobile tab bar active indicator. M5.3 work. |
| `components/ui/animate.tsx` | 83-94 | Internal `<motion.div>` for `expand` variant (grid-row trick) | `leave-as-is` (M5.3 candidate) | Could be replaced with CSS grid `grid-template-rows: 0fr → 1fr` transition (Chrome 122+, Safari 17.4+). Worth attempting in M5.3. |
| `components/ui/animate.tsx` | 101-103 | Internal `<motion.div>` for `enter`/`exit`/`pop`/`drawer` variants | `leave-as-is` | The `drawer` variant uses spring physics for tactile gestures and is the primary justification for keeping `motion/react`. Other variants are CSS-replaceable, but the primitive's whole point is a single quarantine point. |
| `app/brand/page.tsx` | 411-944 | Eight `<motion.…>` blocks demonstrating motion variants | `leave-as-is` (review surface) | This page IS the motion specimen — keep until `/brand` itself is replaced. |
| `app/system/page.tsx` | 1267-1566 | `<motion.div>` blocks + `<AnimatePresence>` demonstrating the `Animate` primitive | `leave-as-is` (review surface) | Same rationale. |
| `components/ui/animate.stories.tsx` | 4, 64-137 | Storybook fixture using `<AnimatePresence>` | `leave-as-is` | Storybook for the motion primitive. Stays with the primitive. |

## Custom durations (>150ms or arbitrary `[Nms]`)

| File | Line | Current pattern | Recommendation | Notes |
|---|---|---|---|---|
| `components/ui/sheet.tsx` | 40 | `data-[state=closed]:duration-300 data-[state=open]:duration-500` | `radix-data-state` (acceptable) | Radix Sheet open/close is one of the few moments where 300/500ms reads correctly (drawer-scale slide). Keep but anchor to `--duration-500` token in M5.3 by replacing `duration-500` with `duration-[var(--duration-500)]` for explicit traceability. |
| `components/ui/dialog.tsx` | 47 | `duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out` | `default-150ms` | 200ms is barely above default. Drop to `duration-150` (the new token's default rung) to align with the brand motion ladder's `small` step. |
| `components/ui/receipt.tsx` | 212 | `transition-colors duration-200 hover:text-[var(--muted-foreground)] motion-reduce:transition-none` | `default-150ms` | Hover colour-shift on a link. 150ms is the standard, 200ms is gratuitous. |
| `components/ui/receipt.tsx` | 294 | `transition-colors duration-200 hover:text-[var(--background)] motion-reduce:transition-none` | `default-150ms` | Same as above. |
| `components/trade/order-pipeline.tsx` | 161 | `transition-colors duration-200 motion-reduce:transition-none` | `default-150ms` | Pipeline tick colour change. Same rationale. |
| `components/trade/order-pipeline.tsx` | 197 | `transition-colors duration-200 motion-reduce:transition-none` | `default-150ms` | Pipeline lozenge colour change. Same rationale. |

## Bouncy / spring easings

| File | Line | Current pattern | Recommendation | Notes |
|---|---|---|---|---|
| `app/brand/page.tsx` | 642 | `{ type: "spring", stiffness: 360, damping: 32, mass: 0.9 }` | `leave-as-is` (review surface) | Spec demo. |
| `app/brand/page.tsx` | 912 | `transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.9 }}` | `leave-as-is` (review surface) | Spec demo. |
| `components/ui/animate.tsx` | 49-54 | `DRAWER_SPRING = { type: "spring", stiffness: 360, damping: 32, mass: 0.9 }` | `leave-as-is` | Drawer spring is the primary reason `motion/react` exists in this app. Tactile mobile gesture only. |

References to "spring", "drawer", "bounce" in `app/brand/page.tsx:377-379`,
`app/system/page.tsx:803,870,1485,1587-1589` are descriptive copy / labels —
not motion bindings. Excluded from migration scope.

## CSS keyframes already in place

`app/app/globals.css` already defines two keyframe blocks
(`omega-pipeline-pulse`, `omega-pipeline-pulse-fail`) with their own
`prefers-reduced-motion` carve-out. These are correctly modelled and need no
migration; they serve as the template for any future keyframe additions
(e.g. when M5.3 replaces a `motion.div` with a `@keyframes` rule).

## Summary

Counts feeding the M5.2 dep-removal scope decision:

- **Total motion-library usages:** 11 files import from `motion/react`
  (`app/brand/page.tsx`, `app/system/page.tsx`, `components/ui/animate.tsx`,
  `components/ui/__tests__/animate.test.tsx`, `components/trade/order-pipeline.tsx`,
  `components/shell/Navbar.tsx`, `components/shell/MobileTabBar.tsx`,
  `components/ReviewNav.tsx`, `components/SectionNav.tsx`,
  `components/ThemeToggle.tsx`, `components/Swatch.tsx`).
  Plus `components/ui/animate.stories.tsx` which imports from the primitive,
  not the library directly.
- **Total custom-duration usages:** 6 occurrences across 4 files
  (`components/ui/sheet.tsx` ×1, `components/ui/dialog.tsx` ×1,
  `components/ui/receipt.tsx` ×2, `components/trade/order-pipeline.tsx` ×2).
- **Total bouncy-easing usages:** 3 spring declarations across 2 files
  (`app/brand/page.tsx` ×2 in review-surface demos,
  `components/ui/animate.tsx` ×1 in the `drawer` variant — all `leave-as-is`).

### Implication for M5.2 (dep narrowing)

Eight import sites are mechanically replaceable today (`ThemeToggle`,
`Swatch`, `SectionNav` desktop tick, `order-pipeline`'s
`useReducedMotion`-only import, plus the four `layoutId` flips once View
Transitions ship). Three review surfaces (`brand`, `system`, `animate.stories`)
and the centralised `Animate` primitive are intentional carve-outs.

The dependency itself (`motion`) cannot be dropped in M5.2 because the
`drawer` variant in `Animate` uses true spring physics. Net of M5.2: roughly
half the import sites collapse, but the package stays. Full removal is
post-M5.3 territory and depends on whether `/brand`, `/system`, and the
drawer spring all get replaced.

### Implication for M5.3 (per-component migration)

Migration order, ranked by user-facing impact / smallest-diff-first:

1. `ThemeToggle` and `Swatch` — drop the import entirely, replace with
   `.press-down`. Trivial diff, sets the pattern.
2. `SectionNav` desktop tick — `default-150ms` Tailwind transition.
3. `order-pipeline` — replace `useReducedMotion` with the local hook.
4. Four `layoutId` flips (`Navbar`, `MobileTabBar`, `ReviewNav`,
   `SectionNav` mobile underline) — View Transitions API. Larger diff,
   needs browser-support guardrails.
5. Custom-duration sweep across `dialog`, `receipt`, `order-pipeline` —
   align hover/colour transitions to `--duration-150`.
6. (Optional) `Animate.expand` migrated to CSS `grid-template-rows`
   transition; `enter`/`exit`/`pop` to CSS classes. Drawer spring stays.
