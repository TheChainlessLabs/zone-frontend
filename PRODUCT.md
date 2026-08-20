# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Design partners:** Early-stage protocol participants evaluating Omega for integration into their trading or platform workflows. Decision-makers in funds, payment processors, and exchanges.

**Developers:** Technical teams building on top of Omega, seeking API documentation, technical specifications, and integration examples. Secondary audience; conversion is application to developer program.

## Product Purpose

The landing page introduces Omega Markets as institutional-grade infrastructure for private stablecoin FX execution. It educates visitors on the core mechanism (private intent → orderbook matching → liquidity access → verifiable settlement) and drives two conversions: design partner applications and developer access requests. The page establishes Omega as a technical, institutional product—not a retail trading platform.

## Positioning

Omega is the only private price discovery venue for stablecoin FX that matches orders without exposing flow to external venues or the market. Its differentiation is:
- **Private matching first:** Intent stays hidden from external market makers and bots.
- **Institutional rates:** Midpoint pricing without information leakage or slippage from order visibility.
- **Verifiable execution:** Cryptographic proof of correct settlement without compromising privacy.
- **Zero-knowledge infrastructure:** TEE-attested on-chain settlement with no pre-trade visibility.

## Operating Context

**Design partners:** Evaluate the protocol for product fit before committing; seek proof that private execution solves their FX and stablecoin routing challenges. May test against existing venues.

**Developers:** Need API documentation, contract interfaces, and SDK access. Seek clear technical specifications and integration examples; evaluate time-to-integration and support quality.

**Marketing context:** The landing page is part of M8 (landing page rebuild against M1 brand system). It is the public face of the protocol before the trading app itself is live. Conversion metrics: design partner sign-ups and developer access requests.

## Capabilities and Constraints

**Capabilities:**
- 4-step scroll-driven mechanism visualization (intent → matching → liquidity → settlement)
- Request access form (email submission)
- Design partner and developer CTA paths
- Reduced-motion fallbacks for all animations
- Dark mode + light mode support (theme-aware)

**Constraints:**
- Must honor M1 brand system (tokens.css: dark-first, glass material, minimalist palette)
- Next.js 14 / React 18 / Tailwind 4 stack
- No backend integration for data; forms submit via webhook
- Must work on desktop and mobile (viewport coverage per M4 milestone)
- All interactive states (hover, focus, active, loading, error) must ship with the feature

**Undecided:**
- Specific imagery or photography (currently copy-driven with abstract animations)
- Exact flow for design partner vs. developer signup divergence
- Whether to embed explainer video or keep pure HTML/SVG animations

## Brand Commitments

**M1 Brand System (omega-docs/03-brand/assets/tokens.json):**
- Dark-first minimalist palette: #09090b (background) to #fafafa (foreground)
- Glass material aesthetic: frosted surfaces with blur, saturation, edge detail
- Rounded corners scale: 6px (sm) to 20px (xl)
- Motion defaults: `ease-out` for entrance, `ease-inout` for transitions
- Typography: system sans-serif (Tailwind default) with existing type hierarchy
- High contrast requirement: 4.5:1 minimum text:background

**Voice & tone:** Terse, technical, institutional. No emoji, no exclamation. Positioning is private infrastructure, not a retail product.

## Evidence on Hand

- Landing page code (restored 4-step mechanism from prior iteration)
- Content structure: hero + mechanism + why/built-for + signup + footer
- Figma references: figma-landing-redesign-script.js (suggests Figma design exists)
- Proof of concept: landing-page-redesign.tsx (6-section alternate layout in branch)
- Design system: tokens.css, brand-directions.ts (4 alternative visual directions explored)

## Product Principles

1. **Private execution is the job.** Every visual choice reinforces the core mechanism: visibility hidden, matching private, outcomes verified. Abstract animation over concrete imagery.

2. **Institutional credibility over delight.** Clean, minimal, precise. Every detail earns its presence. No decorative elements; motion serves comprehension.

3. **Verification is the promise.** The landing must credibly demonstrate how Omega achieves zero-leakage execution. The mechanism scroll is non-negotiable.

4. **Technical clarity for developers.** Content must be precise enough for an engineer to sketch an integration. Vague positioning loses the audience.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum (inherited from M2 design system baseline)
- Reduced-motion: all animations have static fallbacks; scroll-driven animations disable under `prefers-reduced-motion`
- Keyboard navigation: all interactive elements focusable, tab order logical
- Color contrast: 4.5:1 text:background minimum (enforced by brand system)
- Semantic HTML: landmarks (header, main, footer), proper heading hierarchy, form labels
