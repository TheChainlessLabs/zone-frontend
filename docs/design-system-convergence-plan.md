# Design-System Convergence — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Read the spec first:** [`docs/design-system-convergence.md`](./design-system-convergence.md) — it is the governing briefing (the rule, token finding, source map, per-surface scope). This plan adds the execution mechanics.

**Goal:** Make every landing and app page in omega-interface render to match the Omega Markets Design System kit, surface by surface, without regressing the app's real wiring, states, or a11y.

**Architecture:** One worktree/branch/PR per surface. A serial **Foundation** barrier locks the shared core (navbar, wordmark font, `globals.css` material utilities, type classes, atmosphere, OmegaMark, `ui/*` primitives); then six **independent lanes** (Trade, Portfolio, Batches, Account, Landing, Prune) fan out in parallel as worktree-isolated subagents. Validation per surface = repo gate + preserved states + axe + full-page screenshot parity against a kit baseline captured up front.

**Tech Stack:** Next.js 14 App Router · React 18 · Tailwind 4 · TS 5.7 · pnpm workspace (`@omega/app`) · Radix UI · `motion` · `lucide-react` · Storybook + Vitest + Playwright + axe. Kit is CDN React/Babel JSX + `colors_and_type.css` at `/Users/bs/Downloads/Omega Markets Design System` (reference only — never imported).

---

## Dependency structure

```
Task 0a (baselines, read-only) ─┐
                                ├─► Task 0 FOUNDATION (barrier, merge first)
                                │        │
                                │        ▼ (after merge, cut lanes from updated main)
                                │   ┌────┴── parallel fan-out ──────────────┐
                                │   T1 Trade   T2 Portfolio   T3 Batches
                                │   T4 Account T5 Landing     T6 Prune
                                └──────────────────────────────────────────┘
```

- **Task 0a** (baseline capture) is read-only and can run anytime, ideally before Task 0.
- **Task 0** must **merge** before Tasks 1–6 start — they consume its shared core.
- **Tasks 1–6** are mutually independent (disjoint route/component dirs) → run concurrently.
- Within a lane, split sub-PRs (Portfolio/Batches/Landing) are **serial**.

## Shared definitions (DRY — referenced by every lane task)

### THE RULE (from spec)
Kit governs **visual design** (layout, sections, copy, spacing, type, glass/material, motion feel, Lucide icons, voice). App stays source of truth for **behavior** (wagmi/viem, react-query, EIP-712 signing, Radix a11y, react-hook-form/zod) and **all states** (default/empty/loading/error/skeleton/disconnected/wrong-network). **Keep the live OALPHA/PATH.USD alpha pair and real balances** — the kit's USDC/EURC is demo content; match its visual treatment, not its data. **Never regress working behavior to match a cosmetic kit.**

### THE GATE (a lane PR is done only when all are green)
- [ ] `pnpm typecheck && pnpm test && pnpm build` (pre-commit enforces; never `--no-verify`)
- [ ] All states for the touched route still reachable + correct (via existing `?state=`)
- [ ] `pnpm test:a11y` green; `pnpm test:visual` green for any touched primitive story
- [ ] Full-page screenshot parity vs the kit baseline (Task 0a output) at 1440×900 dark + 390×844 dark, within tolerance; documented deltas in the PR body
- [ ] Diff ≤400 LOC (or split into the sub-PRs named in the task)
- [ ] Conventional commits, **no AI-attribution / no Co-Authored-By**

### LOCAL GATE SETUP (this machine — `omega-docs` absent)
`omega-docs` (the token source `scripts/sync-tokens.mjs` reads) is **not** cloned on this MBP, so `pnpm build` and the pre-commit hook fail by default. For every gate run **and** commit, first:
```bash
export OMEGA_TOKENS_PATH="/Users/bs/Downloads/Omega Markets Design System/assets/tokens.json"
```
This reproduces the committed token values exactly (verified — only the `Source SHA` header comment changes to `unknown`). **Treat `app/app/_generated/tokens.css` as immutable:** after any build or commit, run `git checkout -- app/app/_generated/tokens.css` to drop the header-only churn. Never stage that file.

### THE LANE LOOP (every Wave-2 lane follows this; code-level steps are produced here by the lane's subagent after the audit — do not pre-invent them)
- [ ] **Worktree:** `git -C omega-interface worktree add ../worktrees/<surface>-convergence -b brian/<surface>-convergence main`
- [ ] **Audit:** open the kit screen (its `index.html`) and the live route side by side; read the exact app files (listed per task) and the kit source (listed per task); write a short delta list (structure, spacing, copy, glass usage, motion) in the PR description.
- [ ] **Parity-check-first (TDD-shaped):** add/extend a Playwright full-page screenshot test for the route at the two viewports + dark theme, and assert the route's states still render. Run it — capture the current (pre-change) diff vs the kit baseline as the starting delta.
- [ ] **Implement to match the kit** — the actual JSX/CSS edits, scoped to this lane's files. Consume `globals.css` utilities and `ui/*` primitives; **do not edit shared core** (see escalation rule).
- [ ] **Run THE GATE.** Iterate until green.
- [ ] **Open PR** with conventional title, Summary / Test plan / Risks, the delta list, and before/after screenshots. Label `human-in-loop` (visual taste) unless noted `subagent-eligible`.

### ESCALATION RULE (shared-state safety for parallel lanes)
`app/app/globals.css` and `app/components/ui/*` are the **shared core**, owned by Task 0. A Wave-2 lane that believes it needs to change a shared utility or primitive **stops and escalates** (opens a tiny foundation-follow-up PR or flags Brian) rather than editing shared state inside its own branch. Lanes only *consume* the shared core. This is what keeps the six lanes conflict-free.

---

## Task 0a: Capture kit baselines (read-only, parallelizable)

**Files:**
- Create: `omega-interface/docs/kit-baselines/{shell,trade,portfolio,batches,account,landing}/*.png`

- [ ] **Step 1:** Open `/Users/bs/Downloads/Omega Markets Design System/ui_kits/trading-app/index.html` in a browser (Claude preview/Chrome MCP or Playwright). Default dark mode.
- [ ] **Step 2:** Drive and screenshot each kit screen at 1440×900 and 390×844: Navbar/shell, Trade (market + limit), Portfolio (overview + Tokens + Orders + Activity), Batches (list + detail), Settings. Save to `docs/kit-baselines/<surface>/<screen>@<vw>.png`.
- [ ] **Step 3:** Open `ui_kits/landing-page/index.html`; screenshot the full scroll (hero, singularity, feature cards, solver band, observatory, footer) + each modal. Save to `docs/kit-baselines/landing/`.
- [ ] **Step 4:** Commit baselines on the foundation branch (Task 0). These are the parity targets for Tasks 1–6.

**Acceptance:** every in-scope screen has a dark-mode reference image at both viewports.

---

## Task 0: Foundation / shell (BARRIER — merge before Wave 2)

**Label:** `human-in-loop` (navbar, wordmark, atmosphere are taste calls)

**Files (read all before editing):**
- Modify: `app/app/layout.tsx` (wire Space Grotesk via `next/font/google`, expose `--font-wordmark`)
- Modify: `app/app/globals.css` (reconcile material utilities `.panel/.glass/.glass-pill/.surface-soft/.press-down` + `.t-*` type classes to kit structure; per-route dot-grid atmosphere)
- Modify: `app/components/shell/Navbar.tsx`, `app/components/shell/MobileTabBar.tsx`, `app/components/shell/RouteAtmosphere.tsx`
- Modify: `app/components/OmegaMark.tsx`
- Audit (modify only if a real delta vs kit `preview/*`): `app/components/ui/{button,card,badge,chip,status}.tsx` + their `.stories.tsx`
- Kit source: `ui_kits/trading-app/Navbar.jsx`, `OmegaMark.jsx`, `Primitives.jsx`, `colors_and_type.css`, `preview/*.html`
- Do **not** touch: `app/app/_generated/tokens.css` (generated)

- [ ] **Step 1 — Worktree:** `git -C omega-interface worktree add ../worktrees/foundation-convergence -b brian/foundation-convergence main`
- [ ] **Step 2 — Read & diff:** Read each app file above and its kit counterpart. Produce the delta list. Confirm the only token-level gap is the wordmark font (tokens otherwise already in sync per spec).
- [ ] **Step 3 — Wordmark font:** in `layout.tsx`, add `Space_Grotesk` from `next/font/google`, attach its CSS var on `<body>`, and add `--font-wordmark: var(--font-space-grotesk)` so `OmegaMark`/wordmark render in Space Grotesk tracked uppercase (kit `Navbar.jsx`). Storybook + `/brand` wordmark should pick it up.
- [ ] **Step 4 — Material utilities & type classes:** reconcile `globals.css` so `.panel`, `.glass`, `.glass-pill`, `.surface-soft`, `.press-down`, and `.t-*` classes match the kit's structure and the canonical token values (NOT the kit's richer standalone `colors_and_type.css` blur/saturate — token wins). Keep existing per-route atmosphere; align dot-grid spacing/opacity to kit.
- [ ] **Step 5 — Navbar/MobileTabBar/OmegaMark:** match the kit's floating glass-pill navbar (wordmark · segmented pill · WalletStatus) and OmegaMark monogram. Keep real `WalletStatus`/wagmi wiring and all connection states.
- [ ] **Step 6 — Primitive audit:** compare `ui/*` primitives to kit `preview/*.html`; change only on a real visual delta (additive variants, no API breaks). If primitives need substantial change, **split** into a `brian/foundation-primitives` PR.
- [ ] **Step 7 — Parity check:** Playwright screenshot of navbar + a representative route shell at both viewports; diff vs `docs/kit-baselines/shell/`.
- [ ] **Step 8 — THE GATE.** Iterate to green.
- [ ] **Step 9 — Commit & PR:** `feat(shell): converge navbar, wordmark font, material utilities to design kit`. Body: delta list + before/after. Label `human-in-loop`.

**Acceptance:** shell renders to kit parity; wordmark in Space Grotesk; material utilities + type classes available and matching; every existing route still builds, all states intact, axe green. **Merge before starting Wave 2.**

---

## Wave 2 — parallel lanes (each follows THE LANE LOOP + THE GATE)

### Task 1: Trade
**Label:** `human-in-loop` · **Split:** 1 PR (audit-led; app likely ≈parity since the kit came from it)
**App files:** `app/app/trade/page.tsx`, `app/components/trade/{OrderForm,OrderModeSelector,PairSwitcher,ChartPlaceholder,YourFills,order-pipeline}.tsx`, `app/components/modals/order-confirmation-modal.tsx`
**Kit source:** `ui_kits/trading-app/{OrderForm,OrderModeSelector,PairSwitcher,TradeAside,Modals,Motion}.jsx`
**Match:** market narrow column / limit wide split; mode glass-pill with sliding indicator; side tone-lock (buy emerald / sell red); amount + % shortcuts; midpoint-only chart (no public book); your-fills (user fills only); confirm modal "Sign"; Matched→Settled→Proven toast.
**Keep:** alpha pair, real order pipeline, EIP-712 sign flow, all 7 states.
**Baseline:** `docs/kit-baselines/trade/`.

### Task 2: Portfolio
**Label:** `human-in-loop` · **Split:** 2 PRs — (2a) layout + Holdings/Activity/right-rail; (2b) tabs + pagination + states + delete preview
**App files:** `app/app/portfolio/page.tsx`, `app/components/portfolio/*`, `app/components/modals/{deposit,withdraw}-modal.tsx`; **delete** `app/app/portfolio/preview/`
**Kit source:** `ui_kits/trading-app/Portfolio.jsx`
**Match:** value header + 30-day sparkline; **Holdings** centerpiece (per-token rows, allocation bars, value); **Activity** with per-fill *Saved* column; right rail Actions (Deposit/Withdraw equal) · Execution-quality card · Open-orders (cancelable); tabs Overview/Tokens/Orders/Activity; pagination; loading skeletons. Replace live "variant 11".
**Keep:** real balances/wiring, deposit/withdraw flows, all 6 states.
**Baseline:** `docs/kit-baselines/portfolio/`.

### Task 3: Batches
**Label:** `human-in-loop` · **Split:** 2 PRs — (3a) list + stat strip + search + paginate + delete 10 preview variants; (3b) detail `[id]`
**App files:** `app/app/batches/{page.tsx,[id]/page.tsx}`, batches components; **delete** `app/app/batches/preview/` (all 10 `_variants/`)
**Kit source:** `ui_kits/trading-app/Batches.jsx`
**Match:** ExplorerHeader (live next-batch ~12s heartbeat) · StatStrip · searchable list (7/pg). Detail: lifecycle stepper Submitted→Proven→Settled · per-pair fill distribution · L1 tx / state root / proof system · Etherscan + Verify-proof · privacy note (aggregate + per-pair only, never counterparties).
**Keep:** public/no-auth, real data, all states.
**Baseline:** `docs/kit-baselines/batches/`.

### Task 4: Account
**Label:** `human-in-loop` · **Split:** 1 PR
**App files:** `app/app/account/page.tsx`, `app/components/ThemeToggle.tsx`, `app/components/omega-zone/OmegaZoneStatus.tsx`
**Kit source:** `ui_kits/trading-app/Settings.jsx`
**Match:** kit Settings layout — theme toggle (dark default), Tempo wallet identity (address, explorer link, session start), chain/connector info, sign-out.
**Keep:** OmegaZoneStatus widget, real disconnect, theme persistence.
**Baseline:** `docs/kit-baselines/account/`.

### Task 5: Landing
**Label:** `human-in-loop` · **Split:** 2–3 PRs — (5a) hero + section scaffold; (5b) feature cards + solver band + execution-cost observatory; (5c) Philosophy/Join-Alpha/Get-Updates modals + footer
**App files:** `app/app/page.tsx`, `app/components/landing/*` (`landing-page,landing-hero,hero-abstract-field,order-scroll-story,post-scroll-sections,request-access-form,content.ts,scene/*`), `app/app/api/request-access`
**Kit source:** `ui_kits/landing-page/app.jsx`, `scene.jsx`
**Match:** kit section set — hero (wordmark nav, Launch app + Request Access), singularity moment, feature cards grid, solver-recruitment band, execution-cost observatory (visual), modals, footer; voice/copy from kit.
**Keep:** the app's real blackhole `.webm` hero tech (more performant than the kit's CDN scene); the app's current observatory data behavior (do NOT wire new real price data here — see spec risk; file separately if wanted).
**Baseline:** `docs/kit-baselines/landing/`.

### Task 6: Prune personas
**Label:** `subagent-eligible` (mechanical deletion) · **Split:** 1 PR
**App files:** **delete** `app/app/personas/`, `app/tools/persona-review/`; **modify** `.claude/CLAUDE.md` (remove the "Persona-review pipeline" section); remove any nav/route reference; check `app/app/sitemap`/route lists if present.
**Kit source:** n/a (cleanup).
**Match:** app ships only the locked design — no persona-critique scaffolding. Keep `/brand` and `/system`.
**Acceptance:** `pnpm build` green with the routes gone; no dangling imports; CLAUDE.md accurate. Independent of all visual lanes — may run anytime after Foundation.

---

## Self-review (run against the spec)

**1. Spec coverage:**
- Rule / keep-alpha / never-regress → THE RULE + per-lane "Keep" lines. ✓
- No token work (already in sync) → Non-goals honored; only wordmark font added in Task 0. ✓
- Canonical convergence: landing/trade/portfolio/batches/account → Tasks 5/1/2/3/4. ✓
- Prune: batches preview → T3; portfolio preview → T2; personas → T6. ✓
- Keep /brand + /system → stated in T6 + spec; no task touches them. ✓
- Validation (gate + states + axe + screenshot parity + ≤400 LOC) → THE GATE + Task 0a baselines. ✓
- Parallel build → Dependency structure + ESCALATION RULE + worktree-isolated lanes. ✓
- Landing keeps `.webm`; observatory data unchanged → T5 "Keep". ✓

**2. Placeholder scan:** No "TBD/TODO". Code-level steps are intentionally produced just-in-time by each lane's subagent after the audit (stated up front) — this is a deliberate adaptation for visual convergence over unread components, not a placeholder. Task 0 (the only barrier) carries concrete, verifiable steps.

**3. Type/name consistency:** File paths sourced from the repo map; each lane re-verifies paths in its audit step. Branch naming `brian/<surface>-convergence` consistent. Worktree path `Chainless/worktrees/<surface>-convergence` consistent with repo rules.

**Gaps:** none blocking. The only deferred detail is per-component code, by design.
