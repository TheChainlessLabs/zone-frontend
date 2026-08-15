# Omega Market Instruments — Design Specification

**Status:** proposed for implementation
**Decision:** direction A, “Market Instruments”
**Surfaces:** `omega-docs` brand guidance, `zone-frontend` design system, `/research`

## Objective

Give Omega’s public research surfaces a proprietary cast of market actors without turning the product into a mascot brand or fragmenting the functional UI icon system.

The five actors explain the execution model through what they do:

| Actor | Meaning | Visual proposition |
| --- | --- | --- |
| Taker | Initiates private flow | A directional instruction entering a destination |
| Maker | Supplies two-sided depth | A balanced quote ladder with liquidity on both sides |
| Omega | Operates the dark pool | Public ingress crossing through an occluded center |
| Tempo | Carries settlement | Multiple flows converging onto settlement rails |
| Proof | Exposes the public artifact | A verified document leaving the private system |

## Brand-system contract

Omega has two distinct iconographic layers:

1. **Functional UI icons:** Lucide through `app/lib/icons.tsx`. These label actions, status, navigation, and product controls. They remain literal, familiar, and replaceable through semantic aliases.
2. **Market Instruments:** Omega-original editorial illustrations. These identify actors in Research, mechanism diagrams, campaign art, and other narrative brand moments. They are not button icons, status indicators, or replacements for Lucide.

This boundary is load-bearing. A Market Instrument must never appear as the sole label for an interactive product control.

## Construction language

- Monochrome and `currentColor`; no actor-specific colors.
- Shared `64 × 64` viewbox and optical center.
- `1.5px` non-scaling stroke, round linecaps and joins, matching Lucide’s perceived weight without copying its silhouettes.
- Filled nodes mark a private actor or terminal state; open lines show flow or public structure.
- One dominant gesture per actor. Avoid secondary decoration that disappears below `32px`.
- No containing circle by default. Containers come from the layout, not the glyph.
- No faces, human busts, coins, flags, chain logos, padlocks, shields, or generic crypto emblems.
- Minimum intended size: `24px`. Preferred editorial size: `42–72px`.

The five forms should remain recognizable when printed in one color, viewed without labels at `32px`, and reversed between Omega’s dark and light themes.

## Research index composition

Use the approved “Editorial field notes” layout:

- The index links exactly two article pages for now: Design Partners and Private Price Discovery. Do not add actor profiles, categories, pagination, a CMS, or additional Research routes.
- Desktop content width stays aligned to the existing `1120px` Research shell.
- The page body uses a `32 / 68` asymmetric split.
- The left context rail contains the Research title, short lede, and the Taker / Maker / Omega cast.
- The right field contains a short index introduction and article rows, not equal card tiles.
- Hairline dividers separate rows. Surfaces remain solid; liquid glass is not used for resting editorial content.
- Mono uppercase labels carry index numbers, categories, and actor roles. Geist Sans carries headings and body copy.
- The Mechanism row uses the Omega instrument; Design Partners uses Taker. Tempo and Proof remain available for the `/system` specimen and future content about settlement or attestation.

On mobile, the rail collapses above the index. The cast becomes a compact horizontally arranged role strip, followed by full-width article rows. The page must not scroll horizontally.

## Design Partners article

The public call publishes the selection logic and pilot structure, but not the internal shortlist, partner priorities, distribution sequence, or integration targets.

Use this approved copy:

**Eyebrow:** Design partners / Field note 01

**Title:** Bring us a corridor worth solving.

**Deck:** Omega is building a dark pool for stablecoin FX on Tempo. We are looking for a small number of teams with recurring conversion flow to test it against the execution paths they use today.

### Real flow, not a sandbox.

The useful conversations begin with one pair, a known cadence, measurable execution costs, and a fallback that already works.

Payment and treasury teams bring the flow. Makers bring committed inventory and the willingness to quote inside a private book.

### What we measure

We compare Omega with the existing path: all-in spread, slippage, rejection behavior, settlement time, and prefunding requirements.

If Omega does not improve a measured outcome—or reject predictably enough to fit the workflow—we stop.

### One pair. A defined test.

Discovery first. Then a private demonstration. If the fit is real, we run a controlled one-pair pilot with explicit success criteria and a stop condition.

Integration follows evidence.

**Index title:** Bring us a corridor worth solving.

**Index deck:** A private design-partner program for payment and treasury teams, makers, and desks with recurring stablecoin conversion flow.

**CTA heading:** Bring us a corridor.

Keep the existing request form fields, validation, submission path, status messages, and `Request Access` submit label unchanged.

## Interaction and motion

- Entire article rows remain links with visible focus treatment.
- Hover/focus may tint the row and translate only the outbound arrow by `2px` on each axis.
- Use the existing `--duration-small` and `--ease-out` tokens.
- Instruments remain static. No idle animation, morphing, pulsing, or looping line motion.
- `prefers-reduced-motion: reduce` removes the arrow transform.

## Accessibility

- Instruments are decorative when adjacent text names the actor or article; render them `aria-hidden`.
- Standalone branded specimens accept an accessible title and render with `role="img"`.
- Text and focus contrast must continue to meet the existing Omega token requirements in both themes.
- Meaning must never depend on the glyph alone.

## Source-of-truth responsibilities

### `omega-docs`

- Extend `03-brand/visual-identity.md` with the two-layer iconography model, usage boundaries, construction rules, actor meanings, and accessibility requirements.
- Store canonical SVG masters under `03-brand/assets/icons/market-instruments/`.
- Keep the existing Lucide guidance intact for functional UI icons.

### `zone-frontend`

- Add an internal typed `MarketInstrument` component that mirrors the canonical SVG geometry and supports `name`, `size`, `className`, and optional `title`.
- Document the editorial layer alongside—but separate from—the existing Lucide icon section on `/system`.
- Replace `/research`’s equal card grid with the approved `32 / 68` editorial index and responsive collapse.
- Preserve the two existing article routes and their destinations; do not introduce a generalized article system.
- Replace the Design Partners article copy with the approved public call while preserving the existing request-access form behavior.
- Reuse existing tokens and primitives. Do not add dependencies or modify product routes, wallet behavior, forms, API calls, or article destinations.

## Verification

- `omega-docs`: Markdown links resolve and each canonical SVG parses and renders.
- `zone-frontend`: `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
- Visual QA covers `/research` and the `/system` actor showcase at desktop and mobile widths.
- Keyboard focus, hover, light theme, dark theme, high contrast, and reduced motion are checked.
- No functional product behavior changes.
