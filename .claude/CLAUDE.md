# Omega Interface — Project Instructions (design-V2)

## Status

This branch (`design-V2`) is a **clean-room rebuild** of the omega-interface frontend. The legacy implementation lives on `main` and is preserved as a reference, but no code from `main` should be ported wholesale into `design-V2` without going through the milestone process below.

`design-V2` is the default branch on the remote. All new feature branches cut from `design-V2`. Do **not** branch from `main`.

## Product

Omega Markets is a TEE-attested CLOB for private stablecoin FX trading. Anonymous execution with zero information leakage. Settlement on Ethereum L1 via TEE attestation. The frontend is a Next.js trading UI that talks to the `omega-markets` backend over REST and to `omega-core-contracts` on-chain via wagmi/viem.

The product is positioned as **infrastructure, not a bank** — institutional execution surface, not a crypto-degen DEX.

## Repo structure

After the design-V2 wipe, the repo is:

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
├── .claude/CLAUDE.md     # this file
├── .githooks/pre-commit  # typecheck + test + build before every commit
├── package.json          # workspace root
├── pnpm-workspace.yaml
└── README.md
```

The legacy `landing/` and `design-system/` packages were removed. Both will be rebuilt in their respective milestones (M2 for the design-system tokens + primitives package, M8 for the landing site).

## Sequential milestones

Brian's directive: build production-grade UI, super-polished. Sequential gates, no shortcuts.

| # | Milestone | Output |
|---|---|---|
| **M1** | Brand system | wordmark, voice, brand palette, type pairing, asset bundle, brand guidelines doc |
| **M2** | Design system | tokens (color/type/spacing/motion) + primitives (Button/Input/Modal/Toast/Toggle/Tabs/Dropdown/Sheet) + Tailwind theme + Storybook showcase + visual regression baseline + a11y baked in |
| **M3** | UX wireframes | every page + modal, mobile + desktop, **all states** (default/empty/loading/error/skeleton/disconnected) |
| **M4** | Visual design | apply M2 to M3 page-by-page; a page is *done* only when every state is shipped |
| **M5** | Motion + transitions | page/modal/dropdown/tab/microinteractions + reduced-motion fallbacks audited + 60fps verified on mobile |
| **M6** | Backend integration | wallet → signing → orders → book → portfolio → bridge → explorer + error mapping for every API failure mode + e2e happy + edge paths |
| **M7** | Production hardening | a11y audit (axe + manual screen reader pass), perf budgets (Lighthouse ≥95, LCP <2.5s, INP <200ms, CLS <0.1, JS ≤200KB gz/route), cross-browser/device QA matrix, error boundaries on every route, Sentry-style client error reporting (privacy-first), CSP + dependency audit, Vercel deploy + custom domain + preview-per-PR, synthetic uptime checks, launch checklist sign-off |
| **M8** | Landing page | Astro marketing site rebuilt against the M1 brand system, hosted alongside or separately from the app |

**Polish thread (across all milestones):** every PR ships with passing axe + visual regression. No surface lands without all states. No motion lands without reduced-motion path. No fetch lands without error/loading/empty mapping.

Milestone gating: M2 cannot start until M1 is signed off, M3 until M2, etc. Within a milestone, issues can run in parallel where the dependency graph allows.

## Human-in-the-loop vs subagent-eligible

Mark every issue with one of these labels:

- `human-in-loop` — taste calls. Brian reviews each PR before merge. No auto-merge.
  - Brand decisions (wordmark, voice, palette generation, type pairing)
  - UX wireframes (information architecture, hierarchy)
  - Visual design application (page-by-page aesthetic pass)
  - Motion timing/choreography decisions (the *feel* of a transition)
  - Design-system *value* choices (the actual numbers/hexes)

- `subagent-eligible` — mechanical implementation. Can run as parallel subagents.
  - Token export plumbing (CSS vars / JSON / Tailwind theme wiring once values are decided)
  - Component primitives (once API is decided, implementation can parallelize)
  - Backend integration tickets (wallet auth, signing, API wiring, error mapping)
  - a11y axe runs, perf budget enforcement, error boundary coverage
  - Observability instrumentation
  - Test scaffolding and e2e harness

When in doubt, default to `human-in-loop`.

## Workflow

Standard for every issue:

```
plan → worktree (under Chainless/worktrees/) → implement → self-test
     → independent reviewer subagent → open PR → human review (if human-in-loop)
     → squash-merge → pull design-V2 → clean worktree
```

- **Branch base:** always `design-V2`. Never `main`. Never another feature branch (no stacked PRs).
- **Worktrees:** `Chainless/worktrees/<name>/` only.
- **Commits:** Conventional. No `Co-Authored-By` trailers. No "Generated with Claude Code". No personal-infra references.
- **Diff size:** ≤400 LOC per PR or split.
- **Pre-commit:** `pnpm typecheck && pnpm test && pnpm build` runs automatically. Don't bypass with `--no-verify` unless explicitly authorised.
- **Auto-merge:** allowed for `subagent-eligible` issues only. `human-in-loop` waits for Brian's review.

## Dev commands

```bash
pnpm dev         # Next.js dev server (app/ on its default port)
pnpm build       # Build the app
pnpm typecheck   # tsc --noEmit on app/
pnpm test        # Vitest run on app/
```

## Backend & on-chain context (preserved from legacy notes — for M6)

When M6 begins, the integration surface is:

- Backend: `omega-markets` on `http://localhost:3000`. REST only. EIP-712 signing for all mutations. No WebSocket — polling.
- EIP-712 domain: `name: "Omega"`, `version: "1"`, `chainId: 31337` (Anvil dev) / `1` (mainnet), `verifyingContract: <OMEGA_BRIDGE_ADDRESS>`.
- Token math: `BigInt` for all u128 quantities. Prices are 18-decimal fixed-point. USDC/USDT use 6 decimals.
- Local dev contracts (Anvil 31337):
  - `OmegaBridge: 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853`
  - `MockUSDC:    0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE`
  - `MockUSDT:    0x68B1D87F95878fE05B998F19b66F4baba5De1aed`
- Backend gaps to expect (still mock-driven in M6 unless backend lands the endpoints first): account balance query, order history, deposit/withdrawal history, REST explorer, oracle price feed, transfer, websocket.

Full EIP-712 type definitions and price-encoding details are restored into `app/.claude/CLAUDE.md` as part of M6 kickoff, not here.
