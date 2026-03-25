# Omega Interface — Project Instructions

## Project Overview
Omega Markets is a TEE-attested CLOB (Central Limit Order Book) for private stablecoin FX trading. Anonymous execution with zero information leakage. Built on TEE attestation for settlement verification on Ethereum L1. This repo is the frontend — a Next.js trading UI that communicates with the `omega-markets` backend via REST and interacts with smart contracts (`omega-core-contracts`) on-chain.

## Repo Structure
pnpm monorepo with 3 packages:
- `app/` — Next.js 14 (App Router), React 18, Tailwind CSS 4, TypeScript 5.7
- `landing/` — Astro 5, Tailwind CSS 4
- `design-system/` — CSS custom properties, Tailwind theme, tokens.json

## Design System
- **Accent**: `#0EA5E9` (electric cyan) — was `#3467A1`, updated in this session
- **Base**: `#0D0D0D`, Surface: `#1A1A1A`, Elevated: `#262626`
- **Text**: Primary `#F5F5F5`, Secondary `#A0A0A0`, Muted `#666666`
- **Semantic**: Success `#22C55E`, Error `#EF4444`, Warning `#EAB308`, Info `#0EA5E9`
- **Fonts**: Space Grotesk (display, --font-display), JetBrains Mono (mono, --font-mono)
- **Spacing**: 4px base grid. Component heights: sm 32px, md 40px, lg 48px
- **Transitions**: fast 100ms, normal 150ms, slow 300ms
- Tokens live in `design-system/variables.css` and `design-system/tokens.json`
- Tailwind theme mapping in `design-system/tailwind.theme.css`
- Use token classes (`bg-bg-surface`, `text-accent`, `border-border`) — never hardcode hex values

## App Pages
- `/trade` — Trading with BBO marquee, pair selector, order form, chart, positions/orders
- `/portfolio` — Portfolio value, balances with token colors, open positions with PnL
- `/explorer` — Protocol stats, batch explorer with pagination, batch/tx detail drill-down
- `/account` — Order management with filter tabs, order detail with pipeline visualization
- `/funding` — Deposit/withdraw/transfer form, transaction history
- `/settings` — Horizontal scrollable tabs on mobile, trading preferences consolidated
- `/trade/pair/[pair]` — Pair detail with stats grid, chart, venue comparison
- `/not-found` — 404 page with ghost text and navigation buttons

## Key Components
- `Navbar` — Desktop nav + wallet/deposit buttons, mobile hamburger menu, wired to DepositModal
- `MobileTabBar` — Fixed bottom tabs (Trade/Portfolio/Explorer), `lg:hidden`
- `BottomSheet` — Bottom sheet on mobile, centered modal on desktop (spring animation)
- `DepositModal` — Chain/token/amount selectors, percentage shortcuts, fee summary
- `WithdrawModal` — Standard/Privacy mode toggle, consent checkbox, fee breakdown
- `DisconnectedState` — Lock icon, value prop, Connect Wallet CTA, protocol stats
- `BBOMarquee` — Live venue prices (Wise/OFX/Revolut/Omega Midpoint)
- `OrderDetail` — Horizontal pipeline on mobile, vertical on desktop, mobile fill cards
- `BatchDetail` — Timeline with timestamps, Decrypt Mine button, mobile tx cards
- `TransactionDetail` — 3 execution stat cards (midpoint/savings/slippage), batch info
- `PairDetail` — 2x2 stat grid mobile, chart with timeframe tabs, venue comparison
- `WithdrawalDetail` — Privacy/Claimable badges, timeline, privacy proof card with actions

## Mobile Patterns
- Bottom padding `pb-[60px] lg:pb-0` on body for MobileTabBar clearance
- Responsive padding: `p-4 md:p-6` on all page wrappers
- Tables → card layouts on mobile with `hidden md:block` / `md:hidden`
- Bottom sheets use `sheet-enter` animation (translateY, spring cubic-bezier)
- `no-scrollbar` utility for horizontal tab scrolling

## Paper MCP Artboards (Design Source of Truth)
35 artboards total in "Omega Markets" Paper file. Key mobile artboards (390x844):
- Account Mobile (53V-0), Funding Mobile (56L-0), Settings Mobile (59U-0)
- Order Detail Mobile (5CP-0), Batch Detail Mobile (5FU-0), Transaction Detail Mobile (5IY-0)
- Pair Detail Mobile (5LR-0), Withdrawal Detail Mobile (5OA-0)
- Deposit Modal (5RB-0), Withdraw Modal (5SW-0)
Desktop: Disconnected State (5UD-0), 404 Error Page (5VH-0)
Design system reference: Phase 2 (EA-0), Animation Design System (2ZL-0)

## Animation Design System (artboard 2ZL-0)
- Bottom sheet: spring snap (cubic-bezier 0.32, 0.72, 0, 1)
- Drill-down: slide 250ms easeInOut
- Modal: scale+fade 250ms ease-out
- List stagger: 40ms per item, max 7 items

## Workflow
User's required workflow: **Design in Paper MCP first → user reviews → implement into code**
- Each mobile screen = individual 390x844 artboard (not grouped)
- Follow brand guide (EA-0) and animation design system (2ZL-0)
- All 12 missing mobile artboards have been designed and approved
- All 12 designs have been implemented into code

## What's Been Done (This Session)
1. Created 12 Paper MCP artboards (all mobile screens + desktop states) — APPROVED
2. Implemented all 12 designs into code:
   - 404 page + DisconnectedState component
   - BottomSheet + DepositModal + WithdrawModal (bottom sheet pattern)
   - Account/Funding/Settings mobile layouts
   - All 5 detail pages (Order/Batch/TX/Pair/Withdrawal) mobile layouts
   - Wired DepositModal to Navbar
3. Updated design system: accent color #3467A1 → #0EA5E9
4. Added MobileTabBar, BBOMarquee, ProtocolStats, StatusBar components
5. Responsive padding fixes on all page wrappers
6. Favicon color updates
7. Repo renamed from omega-frontends → omega-interface
8. Added README.md, LICENSE (BSL 1.1), .github PR/issue templates
9. Updated all package.json with @omega namespace

## What's Next (Pending)
- Commit the README/LICENSE/.github files (Bash was broken due to rename)
- Delete CONTRIBUTING.md (was created then user asked to remove)
- Set up GitHub remote for omega-interface repo
- Update GitHub repo description via `gh repo edit`
- Consider: CI/CD workflows, Vercel deployment config, environment variables
- Consider: Testing setup (Playwright for e2e, Vitest for unit)

## Commands
```bash
pnpm dev:app          # Next.js dev server (port 3001)
pnpm dev:landing      # Astro dev server
pnpm build            # Build all packages
pnpm typecheck        # TypeScript check (app)
pnpm test             # Run tests (Vitest)
```

---

## Backend Integration (omega-markets)

### API Surface
Backend runs at `http://localhost:3000`. **No HMAC auth** — pure EIP-712 signing. **No WebSocket** — polling only.

| Method | Path | Auth | Response |
|--------|------|------|----------|
| `GET` | `/markets/{market_id}/book` | None | `{ market_id, bids: OrderEntry[], asks: OrderEntry[] }` |
| `GET` | `/markets/{market_id}/trades` | None | `{ market_id, trades: Trade[] }` |
| `POST` | `/orders` | EIP-712 (account owner) | `{ order_id }` (201) |
| `POST` | `/orders/cancel` | EIP-712 (account owner) | 204 |
| `POST` | `/admin/accounts` | EIP-712 (admin) | `{ account_id }` |
| `POST` | `/admin/tokens/create` | EIP-712 (admin) | `{ token_id }` |
| `POST` | `/admin/tokens/issue` | EIP-712 (admin) | 204 |
| `POST` | `/admin/tokens/burn` | EIP-712 (token owner) | 204 |
| `POST` | `/admin/markets/create` | EIP-712 (admin) | `{ market_id }` |

### EIP-712 Domain
```
name: "Omega"
version: "1"
chainId: 31337 (Anvil) / 1 (mainnet)
verifyingContract: <OMEGA_BRIDGE_ADDRESS>
```

### EIP-712 Signed Types (must match `omega-markets/crates/core/src/crypto/signature.rs`)
```solidity
struct AddLimitOrderRequest { uint64 nonce; uint16 market_id; uint128 price; uint128 quantity; uint8 side; }
struct AddMarketOrderRequest { uint64 nonce; uint16 market_id; uint128 price; uint128 quantity; uint8 side; uint32 max_slippage_bps; }
struct AddFlipOrderRequest { uint64 nonce; uint16 market_id; uint128 price; uint128 quantity; uint8 side; uint128 flip_price; }
struct CancelOrderRequest { uint64 nonce; uint16 market_id; uint64 order_id; }
struct BurnTokenRequest { address owner; uint128 quantity; uint32 token_id; uint64 nonce; }
```
- `side`: 0 = Buy, 1 = Sell
- All `uint128` values use BigInt in TypeScript, serialize as string for JSON

### Price Encoding
Prices use 18-decimal fixed-point: `1.0856` → `1_085_600_000_000_000_000`. Quantities use token-specific decimals: USDC/USDT = 6 decimals (`100 USDC` → `100_000_000`).

### Local Dev Contract Addresses (Anvil chainId 31337)
```
OmegaBridge:  0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
MockUSDC:     0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE
MockUSDT:     0x68B1D87F95878fE05B998F19b66F4baba5De1aed
```

### Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_BRIDGE_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
NEXT_PUBLIC_USDC_ADDRESS=0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE
NEXT_PUBLIC_USDT_ADDRESS=0x68B1D87F95878fE05B998F19b66F4baba5De1aed
```

### What the Backend Does NOT Have (stay on mock data)
- Account balance query endpoint
- Order history endpoint (filled/cancelled orders)
- Deposit/withdrawal history
- Explorer/batch data via REST (only gRPC)
- Oracle price feed
- Transfer endpoint
- WebSocket / real-time push

---

## Architecture IDs (from `.claude/architecture-brief.md`)
- **PROC-005**: Frontend (this repo)
- **COMP-033**: BFF Engine Proxy → `app/api/engine/[...path]/route.ts`
- **COMP-034**: SwapOrderCard → `components/OrderForm.tsx`
- **COMP-035**: WalletAuth → `components/WalletModal.tsx` + `components/Navbar.tsx`
- **COMP-036**: ApiClient → `lib/apiClient.ts` (to be created)
- **COMP-037**: ConfigLoader → `lib/config.ts` (to be created)
- **COMP-038**: OrderSigning Hook → `lib/hooks/useOrderSigning.ts` (to be created)
- **COMP-039**: DepositFlow Hook → `lib/hooks/useDeposit.ts` (to be created)
- **COMP-040**: WithdrawalClaim Hook → `lib/hooks/useClaimWithdrawal.ts` (to be created)
- **IF-001**: Frontend → Gateway (HTTP REST)

---

## Integration Ticket Dependency Graph

```
FE-001 (Wallet) ─┬─→ FE-003 (Signing) ─┬─→ FE-005 (Order Placement)
                  │                      └─→ FE-006 (Order Cancel)
                  ├─→ FE-007 (Deposit) ──┬─→ FE-008 (Withdrawal)
                  │                      └─→ FE-009 (Portfolio)
FE-002 (API)  ───┼─→ FE-003, FE-004, FE-005, FE-006, FE-007, FE-008, FE-009
                  └─→ FE-004 (Live Data) ──→ FE-009 (Portfolio)
```

Foundation (no deps): FE-001, FE-002
After foundation: FE-003, FE-004, FE-007 can run in parallel
After signing: FE-005, FE-006 can run in parallel
After deposit: FE-008, FE-009 can run in parallel

Ticket bodies: `tasks/linear-tickets/FE-00X-*.md`

---

## Coding Conventions
- Use native `fetch` (not axios) for API calls
- Use `BigInt` for all u128 price/quantity math — never `Number` for token amounts
- Hooks in `lib/hooks/`, types in `lib/apiTypes.ts`, config in `lib/config.ts`
- ABIs in `lib/abis/` — minimal fragments, not full contract ABIs
- Use token design system classes — never hardcode hex colors
- Toast via `useToast()` hook for all user-facing feedback
- Loading states: use existing `Skeleton.tsx` component
- Error states: graceful degradation, never crash the component

## Symphony Pipeline

This repo is managed by **Symphony** — our Elixir orchestrator that turns Linear tickets into PRs autonomously.

- **Repo:** `github.com/TheChainlessLabs/symphony` (custom fork — NOT `odysseus0/symphony`)
- **Workflow:** `symphony/workflows/omega-interface.md`
- **Run:** `cd symphony/elixir && ./bin/symphony ../workflows/omega-interface.md --i-understand-that-this-will-be-running-without-the-usual-guardrails`

### Pipeline
Planner(Claude) → Builder(Claude) → Reviewer(Codex) → Simplifier(Claude) → Debugger(Claude) → Validator(Claude) → Final Reviewer(Codex) → Human Review

### Verdict Contract
Every phase must end with a single-line JSON verdict:
```json
{"phase":"<name>","verdict":"PASS|FAIL|ESCALATE","summary":"<brief>","details":{}}
```

### Critical: What NOT to Do
- Do NOT use `npx skills add` or create `.agents/skills/` directories
- Do NOT copy WORKFLOW.md into this repo — it stays in the Symphony repo
- Do NOT reference `odysseus0/symphony` — we use a custom fork
- Do NOT use `mix setup` or `mix build` — use `mix deps.get` and `mix escript.build`

For full architecture details, see `symphony/docs/architecture.md` and `symphony/docs/agent-instructions.md`.
