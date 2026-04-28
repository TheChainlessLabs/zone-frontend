# Omega Interface

Frontend for the [Omega Markets](https://omegamarkets.com) protocol — an institutional-grade darkpool for stablecoin FX with anonymous execution at midpoint pricing and zero information leakage.

## Status

**This branch (`design-V2`) is a clean-room rebuild.** The legacy V1 implementation lives on `main` and is preserved as a reference. New work here goes through the milestone process below; nothing is ported wholesale from `main`.

## Sequential milestones

| # | Milestone | Output |
|---|---|---|
| **M1** | Brand system | Wordmark, voice, brand palette, type pairing, asset bundle, brand guidelines doc |
| **M2** | Design system | Tokens (color/type/spacing/motion) + primitives + Tailwind theme + Storybook + visual regression baseline + a11y baked in |
| **M3** | UX wireframes | Every page + modal, mobile + desktop, all states (default/empty/loading/error/skeleton/disconnected) |
| **M4** | Visual design | Apply M2 to M3 page-by-page; a page is *done* only when every state is shipped |
| **M5** | Motion + transitions | Page/modal/dropdown/tab/microinteractions + reduced-motion fallbacks audited + 60 fps verified on mobile |
| **M6** | Backend integration | Wallet → signing → orders → book → portfolio → bridge → explorer + error mapping for every API failure mode + e2e happy + edge paths |
| **M7** | Production hardening | a11y audit, perf budgets (Lighthouse ≥95, LCP <2.5s, INP <200ms, CLS <0.1, JS ≤200KB gz/route), cross-browser matrix, error boundaries, error reporting, CSP + dependency audit, deploy + custom domain + preview-per-PR, synthetic uptime, launch checklist |
| **M8** | Landing page | Brand-aligned marketing site rebuilt against the M1 brand system |

Milestone gating is sequential. Within a milestone, issues parallelise where the dependency graph allows.

## Repo layout (post-wipe)

```
omega-interface/
├── app/                  # Next.js 14 App Router · React 18 · Tailwind 4 · TS 5.7
│   ├── app/              # routes (currently: layout.tsx + page.tsx scaffold)
│   ├── public/           # static assets
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── package.json
├── .claude/CLAUDE.md     # project instructions for AI assistants
├── .githooks/pre-commit  # typecheck + test + build before every commit
├── package.json          # workspace root
├── pnpm-workspace.yaml
└── README.md
```

The legacy `landing/` and `design-system/` packages were removed. The design-system package is rebuilt in M2; the landing site is rebuilt in M8.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/) ≥ 9

### Install

```bash
pnpm install
```

### Develop

```bash
pnpm dev         # Next.js dev server on the default port
pnpm build       # Build the app
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest run
pnpm sync-tokens # Regenerate app/app/_generated/tokens.css from omega-docs
```

### Visual regression (M2.6)

```bash
pnpm --filter @omega/app test:visual         # diff every Storybook story against the committed baseline; fails on >0.1% pixel drift
pnpm --filter @omega/app test:visual:update  # accept the current state as the new baseline
```

Both scripts build a static Storybook (`storybook-static/`), serve it on port 6006, and run `@storybook/test-runner` (Playwright/Chromium) against every story. One PNG capture per story, diffed via `jest-image-snapshot`. Baselines live under `app/__snapshots__/` and are committed to the repo.

Re-run `:update` when a primitive's visual contract intentionally changes; commit the resulting PNG churn alongside the code change. Single-browser (Chromium) for V1 — cross-browser visual coverage and CI integration are M7 work.

## Design tokens

Canonical source: `omega-docs/03-brand/assets/tokens.json` (sibling repo). `omega-interface` consumes via `scripts/sync-tokens.mjs`, which writes `app/app/_generated/tokens.css`. Sync runs automatically before `pnpm dev` and `pnpm build`. Do not hand-edit `_generated/tokens.css` — it gets overwritten.

Adding or changing a token: edit `omega-docs/03-brand/assets/tokens.json`, ship via an `omega-docs` PR, then re-run `pnpm sync-tokens` here. The downstream PR cites the upstream omega-docs PR in its Summary. The generated header records the omega-docs source SHA for traceability.

If `omega-docs` is checked out somewhere other than the default sibling location, point the script at it explicitly: `OMEGA_TOKENS_PATH=/abs/path/to/tokens.json pnpm sync-tokens`.

## Workflow

Standard PR cycle:

```
plan → worktree → implement → typecheck/test/build
     → independent reviewer → open PR → human review (when human-in-loop)
     → squash-merge into design-V2
```

- **Branch base:** always `design-V2`. Never `main`. Never another feature branch.
- **Worktrees:** under `Chainless/worktrees/<name>/`.
- **Commits:** Conventional. No `Co-Authored-By` trailers, no AI attribution.
- **Diff size:** ≤400 LOC per PR or split.
- **Pre-commit:** `pnpm typecheck && pnpm test && pnpm build` runs automatically.

Issues are tagged `human-in-loop` (taste calls — Brian reviews each PR) or `subagent-eligible` (mechanical work — can run as parallel subagents with auto-merge). Default to `human-in-loop` when in doubt.

## License

[BSL 1.1](LICENSE) — Business Source License
