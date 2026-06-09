# Design-System Convergence — Spec

**Date:** 2026-06-07
**Status:** Approved (approach), pre-implementation
**Owner:** Brian
**This document is the source-of-truth briefing for every convergence PR and every parallel subagent. A subagent starts with no memory of the conversation that produced this — read this whole file plus your surface section before touching code.**

---

## Goal

Bring the **Omega Markets Design System** kit (`/Users/bs/Downloads/Omega Markets Design System`) into the live **omega-interface** app, surface by surface, until every landing and app page renders to match the kit. Validate each surface against the kit before merge.

## The governing rule (UPDATED 2026-06-07 — "use the new design system completely")

Superseding the earlier cautious-convergence rule: Brian's directive is that the current frontend's design is wrong and the new design system must be used **completely**. **Port the kit's components in as the new UI** — the kit's components become the app's components.

> **Port the kit's components into the app as the real UI (JSX→TSX). The kit wins completely on design — layout, structure, components, copy, spacing, type, the liquid-glass look. Replace the current presentation; leave no remnants of the old design. Wire the ported components to the app's real data/wagmi/state. The app keeps its *behaviour* and *data*, not its old look.**

Concretely, in any conflict:
- **Kit wins (completely):** page/section structure, component breakdown, layout, copy/microcopy, spacing, radii, glass/material, motion feel, iconography (Lucide), voice — **and design-codifying tests.** A test that asserts the *old* design's behaviour (e.g. "nav collapses labels to icons when inactive") is **updated** to the kit's design, not used to block the port.
- **App wins (kept):** wagmi/viem wiring, react-query/data layer, EIP-712 signing, Radix a11y semantics, react-hook-form/zod, and **all states** (default/empty/loading/error/skeleton/disconnected/wrong-network) — these are *behaviour*, wired into the ported kit components. Functional / wiring / a11y tests stay green.
- **App keeps its product content:** the live **OALPHA/PATH.USD** alpha pair + real balances stay — wire them into the kit's components (the kit's `USDC/EURC` is demo data). Backend stays **deferred**.

**Implication:** every surface task below is now a **port** (replace the current components with the kit's, wired to real data), not a cautious convergence. The ≤400 LOC guard is relaxed per surface — a full port is large; split into logical sub-PRs rather than artificially capping.

## Non-goals

- **No token work.** The kit's `assets/tokens.json` is already identical to the app's generated `app/app/_generated/tokens.css` (zinc scale; glass `0.04 / 0.10 / 0.14 · blur 24px · saturate 1.4`; radius `6/10/14/20`; motion `100/150/300/500` + eases). Tokens are in sync — do not touch `tokens.css` (generated) or chase token reconciliation. The only foundation-level token addition is the **wordmark font** (`--font-wordmark: Space Grotesk`), which the kit uses and the app currently lacks.
- **No backend/pair changes** (see rule above).
- **No new product features** beyond what the kit's designed surfaces define.
- `/brand` and `/system` showcase routes are **kept** (they are the in-app design-system reference). They are not converged and not pruned.

## Source map

- **Kit:** `/Users/bs/Downloads/Omega Markets Design System`
  - `colors_and_type.css` — full material utilities (`.glass`, `.glass-pill`, `.panel`, `.surface-soft`, `.press-down`) + `.t-*` type classes. Reference for visual treatment. (Note: its standalone glass is slightly richer — `blur ~30 / saturate ~1.9` — than the canonical token; **the canonical token wins**, this file is reference-only for structure/classes.)
  - `assets/` — `omega-mark.svg`, `omega-mark-glyph.svg`, `omega-mark.png`, `tokens.json`.
  - `ui_kits/landing-page/` — `index.html`, `app.jsx`, `scene.jsx`, `blackhole.png`, `README.md`.
  - `ui_kits/trading-app/` — `App / Navbar / OrderForm / OrderModeSelector / PairSwitcher / TradeAside / Portfolio / Batches / Settings / Modals / Motion / Primitives / Icons / OmegaMark` `.jsx`, `index.html`, `README.md`.
  - `preview/*.html` — component specimen cards (buttons, cards, chips, inputs, status, etc.).
  - `_adherence.oxlintrc.json` — kit lint rules (no raw hex, no raw px, only provided fonts, no emoji). Use as a checklist; do not wire into CI in this program.
- **App:** `/Users/bs/Develop/Chainless/omega-interface` — Next.js 14 App Router · React 18 · Tailwind 4 · TS 5.7 · pnpm workspace (`@omega/app`). Radix UI, `motion`, `lucide-react`, wagmi/viem, react-query, react-hook-form/zod, Storybook + Vitest + Playwright + axe.

## The program (per-surface PRs)

Each surface = one lane = its own worktree/branch/PR(s). Branch base is always `main`. Branch name `brian/<surface>-convergence`. Worktrees live under `Chainless/worktrees/<name>/` only. Conventional commits, no AI-attribution, ≤400 LOC per PR or split.

| # | Surface | Scope | Kit source | Split |
|---|---------|-------|-----------|-------|
| **0** | **Foundation/shell** | Navbar floating glass pill + **wordmark font (Space Grotesk via `next/font`, wire `--font-wordmark`)**, MobileTabBar, per-route dot-grid atmosphere, reconcile `globals.css` material utilities (`.panel/.glass/.glass-pill/.surface-soft/.press-down`) + `.t-*` type classes to kit structure, OmegaMark parity, audit shared `ui/*` primitives (Button/Card/Badge/Chip/Status) vs kit `preview/*` and lock them | `Navbar/OmegaMark/Primitives.jsx`, `colors_and_type.css`, `preview/*.html` | 1 |
| **1** | **Trade** | Audit `/trade` vs kit (app likely ≈parity, kit came from it): order form, mode glass-pill selector, pair switcher, chart placeholder (midpoint-only — no public book), your-fills, order-confirmation modal, Matched→Settled→Proven toast. Keep alpha pair + real order pipeline + all states | `OrderForm/OrderModeSelector/PairSwitcher/TradeAside/Modals/Motion.jsx` | 1 |
| **2** | **Portfolio** | Rebuild to kit's locked layout: value header + 30-day sparkline; **Holdings** centerpiece (per-token rows, allocation bars, value); **Activity** with per-fill *Saved* column; right rail: Actions (Deposit/Withdraw equal), Execution-quality card, Open-orders (cancelable); tabs Overview/Tokens/Orders/Activity; pagination; loading skeletons. Replace the live "variant 11"; **delete `app/app/portfolio/preview/`**. Keep real balances/wiring + all states | `Portfolio.jsx` | 2 (layout; tabs+states+prune) |
| **3** | **Batches** | List: ExplorerHeader (live next-batch ~12s heartbeat), StatStrip, search, paginate (7/pg). Detail (`[id]`): lifecycle stepper (Submitted→Proven→Settled), per-pair fill distribution, L1 tx / state root / proof system, Etherscan + Verify-proof actions, privacy note (aggregate + per-pair only, never counterparties). **Delete the 10 `app/app/batches/preview/` variants.** Keep public/no-auth + real data + all states | `Batches.jsx` | 2 (list+prune; detail) |
| **4** | **Account** | Converge `/account` to kit Settings: theme toggle (dark default), Tempo wallet identity (address, explorer link, session), chain/connector info, sign-out. Keep OmegaZoneStatus widget | `Settings.jsx` | 1 |
| **5** | **Landing** | Converge `/` to kit section set: hero (wordmark nav, Launch app + Request Access), singularity moment, feature cards grid, solver-recruitment band, **execution-cost observatory** (match kit's visual; keep the app's existing data behavior — see risk below), Philosophy / Join-Alpha / Get-Updates modals, footer. **Keep the app's real blackhole `.webm` hero tech** (more performant than the kit's CDN scene) and match the kit's surrounding structure + copy | `landing-page/app.jsx`, `scene.jsx` | 2–3 (hero+structure; sections; modals/observatory) |
| **6** | **Prune** | Remove `app/app/personas/` routes + `app/tools/persona-review/` tooling; update `.claude/CLAUDE.md` (drop the persona-review pipeline section) and any nav reference. Independent of visual work | — | 1 |

Per-surface preview pruning (`portfolio/preview`, `batches/preview`) is folded into that surface's lane (PR 2, PR 3). The standalone Prune lane (PR 6) is personas-only and fully independent.

## Validation (the gate per PR)

A surface is **done** only when, for the touched routes:
1. `pnpm typecheck && pnpm test && pnpm build` green (pre-commit enforces this anyway).
2. **All states preserved** (default / empty / loading / error / skeleton / disconnected / wrong-network where the route has them) — reachable via the existing `?state=` mechanism.
3. **axe a11y green** (`pnpm test:a11y`) and Storybook visual-regression green for any touched primitive (`pnpm test:visual`).
4. **Full-page screenshot parity vs the kit reference.** Baselines are captured up front (step below) by opening each kit `index.html` screen; each surface PR screenshots the live route at the same viewport + dark theme and diffs against the kit baseline. Match within visual tolerance; deltas are documented in the PR.
5. Diff ≤400 LOC (or split). No `--no-verify`. No AI-attribution.

**Baseline capture (program step 0, read-only, parallelizable):** open `ui_kits/trading-app/index.html` and `ui_kits/landing-page/index.html`, drive each screen (Trade market+limit, Portfolio overview+tabs, Batches list+detail, Settings, Landing full scroll), capture reference screenshots into `omega-interface/docs/kit-baselines/<surface>/`. These are the validation targets for Wave 2.

## Parallelization

- **Wave 1 — barrier:** PR 0 (Foundation/shell). Must merge before Wave 2 fans out; it locks the shared core (navbar, wordmark font, `globals.css` utilities, type classes, atmosphere, OmegaMark, `ui/*` primitives) that every other lane consumes.
- **Wave 2 — parallel fan-out:** lanes 1–6 run concurrently, each a worktree-isolated subagent cut from post-foundation `main`. They touch disjoint route/component dirs.
  - Shared-file discipline: Wave 2 lanes **consume** `globals.css` utilities and `ui/*` primitives, they do not edit them. A lane that thinks it needs a shared-primitive change stops and escalates (fold into a foundation follow-up) rather than editing shared state in its own branch.
  - Within a lane, the 2–3 sub-PRs of a split surface are **serial**.
  - Merges serialize through Brian's review (`human-in-loop` surfaces). Rebases across disjoint dirs are trivial.

## Risks / open items

- **>400 LOC splits:** Portfolio, Batches, Landing must split (column counts in table). Foundation may also approach the limit if `ui/*` primitives need real changes — split primitives from shell if so.
- **Landing execution-cost observatory:** the app has untracked `app/app/api/prices/`, `useHistoricalPrices.ts`, `useUniswapPrice.ts`, `venueSelection.ts` — there may be real price data to wire. The kit mocks it. Default: **match the kit's visual; keep whatever data behavior the app currently has** (mock or real). If wiring real data is desired, file it as a separate follow-up, not part of visual convergence.
- **Prune touches `.claude/CLAUDE.md`** (persona-review section) — update docs in the same PR so the repo doc stays accurate.
- **`globals.css` is the one genuinely shared file.** Foundation must finalize shared utilities; if Wave 2 contention appears, that's the signal a change belonged in foundation.
- **Untracked working-tree files** currently in the app (`app/app/api/prices/`, three lib files) are unrelated to this program — leave them; don't fold them into convergence PRs.

## Out of scope

- Token values (already in sync), backend, the alpha pair, `/brand`, `/system`, real price-data wiring for the observatory.
