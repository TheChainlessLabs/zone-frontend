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
```

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
