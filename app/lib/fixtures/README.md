# Fixture data registry

Mock data for every state of every M3 page and modal. Powers the `?state=`
review-time toggle that lets reviewers click through default / empty /
loading / error / skeleton / disconnected / wrong-network without
mocking the backend.

## Layout

```
app/lib/fixtures/
├── types.ts                     shared type aliases (PageState, MarketPair, OrderFixture, …)
├── pairs.ts                     the 5 launch pairs as a typed array
├── trade/                       /trade page states
├── portfolio/                   /portfolio page states
├── batches/                     /batches list + detail + search
├── account/                     /account page states
├── modals/                      ConnectWallet, Deposit, Withdraw, Order Confirmation
└── use-page-state.ts            URL `?state=` reader hook
```

One file per `(surface, state)` cell. Each file default-exports a single
fixture conforming to the page's shape.

## Conventions

- **Type-safe.** Every fixture imports its shape from `types.ts`. Adding
  a field to a fixture without updating the type breaks the build.
- **No fake market activity that contradicts the dark-pool positioning.**
  Omega does not expose a global trade feed; counterparty IDs never appear.
  Recent-fills lists in `/trade` show only the user's own fills + own-batch
  fills.
- **No fiat tickers.** Pairs use stablecoin tokens only — `USDC/EURC`,
  never `EUR/USD`. Source: `omega-docs/03-brand/naming.md`.
- **Voice from `omega-docs/03-brand/messaging.md`.** Status labels are
  terse single words or short phrases. Empty states are short factual
  sentences with no marketing copy. Errors say what failed and what to
  do next.
- **No emoji glyphs.** Including decorative Unicode like `[OK]` glyphs.
  Lucide icons are the visual layer; fixtures only carry the data.

## How pages consume

```tsx
"use client";

import { portfolioFixtures, usePageState } from "@/lib/fixtures";

export default function PortfolioPage() {
  const state = usePageState();
  const fixture = portfolioFixtures[state] ?? portfolioFixtures.default;

  if (fixture.error) return <ErrorState message={fixture.error.message} />;
  if (fixture.isLoading) return <Skeleton />;
  if (state === "disconnected") return <DisconnectedState />;
  // …
}
```

`?state=` accepts the seven `PageState` values. Unknown values fall
back to `default`. Surfaces that don't have all seven (e.g. /account)
expose a narrower `Record` and the page handles the missing cells.

## How to add a fixture

1. File under `app/lib/fixtures/<surface>/<state>.ts`.
2. Export one constant named `<surface><State>` (camelCase).
3. Conform to the shape in `types.ts`. Add fields to the type if a new
   surface needs them.
4. Register it in the surface's `index.ts` Record.
5. Update `app/.claude/M3-state-coverage.md`.
6. Run `pnpm typecheck && pnpm test && pnpm build`.

## Lifespan

When M6 wires real backend data, fixtures move from "the source of truth
at review time" to "the fallback when the user is offline / loading /
error". The `?state=` toggle stays as a fault-injection affordance for
manual QA. Fixture files do not get deleted at M6 — they migrate.
