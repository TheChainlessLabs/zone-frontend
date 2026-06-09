# Zone Integration Status (omega-interface ↔ omega-zone, zone 35)

Spine for the `/loop` integration task. Source of truth for progress — read first
every iteration; update the row after the checker verdict. Never mark `wired✓`
without separate-checker evidence.

## Environment
- Backend: synced **zone-35** container on the Mac Studio (public `:8546` / private `:8544`),
  reached from the laptop via SSH tunnel → frontend BFF proxy `/api/omega-zone/{public,private}-rpc`.
  RPC surface == latest-main (so this carries to the patched-main build).
- Frontend branch: `brian/zone-integration` (cut from `main` @ 8c4955d).
- `app/.env.local`: `OMEGA_ZONE_RPC_URL=http://localhost:8546`, `OMEGA_ZONE_PRIVATE_RPC_URL=http://localhost:8544`.
- Backend source of truth: `omega-zone` (local, main 556b15f) `crates/rpc/src/{handlers,types}.rs`, `crates/tempo-zone/src/rpc.rs`.

## ⚠ Architectural finding (iteration 1)
The frontend's live hooks (`lib/omega-zone/hooks.ts`) ALL gate on a wallet auth token:
`useOmegaZoneInfo` / `useOmegaZoneBalances` / `useOmegaZoneTopOfBook` → `enabled: Boolean(authToken && account)`.
So today **no live data flows without a connected Tempo wallet** — surfaces fall back to demo.
The backend serves the *public* reads (market config, top-of-book, reference price, midpoint,
batches) on `:8546` with an **anonymous** AuthContext (verified by no-auth curls returning real data).
→ Real frontend work: route public reads through the **public** proxy WITHOUT requiring a wallet,
so surfaces render live public data while disconnected; keep owner-scoped reads wallet-gated.

## Methods

| method | scope | status | backend handler | last verified evidence | notes |
|---|---|---|---|---|---|
| `zone_getMarketConfig` | public | pending (curl✓, UI-consume?) | handlers.rs:1518 `zone_get_market_config(auth)` | curl via proxy → OALPHA/PATH.USD market, darkpool, 6dp, minOrderAmount | FE: `rpc.ts:1069`. Needs wallet-free hook + surface wire. |
| `zone_getReferencePrice` | public | pending | handlers.rs:1563 `zone_get_reference_price(base,quote,auth)` | curl via proxy → `{enabled:false, pair, priceUnit, disclaimer}` | FE rpc.ts: NOT YET (no getReferencePrice fn found). Add it. |
| `zone_getTopOfBook` | public | pending | handlers.rs:1537 `zone_get_top_of_book(base,quote,auth)` | curl `[{base,quote}]` → real bid/ask @ price 1, qty 5e9, midpoint 1 | FE `rpc.ts:1084` + `useOmegaZoneTopOfBook` (auth-gated). Trade page is dark-pool: "no public order book" by design — confirm what's shown. |
| `zone_getMidpointHistory` | public | pending | handlers.rs:1613 | curl needs `[{base,quote}, interval, limit?, cursor?]` | FE `rpc.ts:1286`. Drives the trade chart. |
| `zone_getZoneInfo` | public? | pending | handlers.rs:1488 `zone_get_zone_info(auth)` | "Method not found" on WIP container (present in main) | WIP-container gap; works once main binary runs. FE `rpc.ts:163` (auth-gated). |
| `zone_listBatches` | public | **wired✓** | handlers.rs:1943 (container overrides default) | CHECKER (it2): proxy → `{batches:[]}`; /batches renders 0 rows + "No zone batches yet" + StatStrip "Batches today 0 · 0.00M", no synthetic rows over 13s | FE `rpc.ts:1219 listZoneBatches`. Map: `BatchListResponse{batches:BatchSummary[]}` → `BatchFixture[]` via `zoneBatchToFixture`; live-empty `{batches:[]}` → empty rows + 0 stats (NOT demo). |
| `zone_searchBatch` | public | pending | handlers.rs:213 `zone_search_batch(query)` | not tested | FE rpc.ts: NOT YET. Batches search. |
| `zone_getBatch` | public | pending | handlers.rs:1934 `zone_get_batch(n)` | not tested | FE `rpc.ts:1243`. Batch detail. |
| `zone_getDepositStatus` | public | pending | handlers.rs:1506 `zone_get_deposit_status(block,auth)` | not tested | FE `rpc.ts:178`. Deposit tracking. |
| `zone_getWithdrawalStatus` | public | pending | handlers.rs:1185 | not tested | FE `rpc.ts:1212`. |
| `zone_getMyOrders` | private | blocked:needs-wallet | handlers.rs:1031 `zone_get_my_orders(query,auth)` | — | owner-filtered by auth token; needs wallet-signed token. |
| `zone_getMyFills` | private | blocked:needs-wallet | handlers.rs:1049 | — | same. |
| `zone_getMyTransfers` | private | blocked:needs-wallet | handlers.rs:1067 | — | same. |
| `zone_getOrder` | private | blocked:needs-wallet | handlers.rs:1094 `zone_get_order(id,auth)` | — | owner-scoped. |
| `zone_getAuthorizationTokenInfo` | private | blocked:needs-wallet | handlers.rs:1469 | — | auth diagnostics; needs token. |

## Surfaces
| surface | status | notes |
|---|---|---|
| trade live market (pair/price/midpoint) | pending | needs wallet-free public reads (marketConfig + referencePrice + midpointHistory). |
| portfolio (balances/orders/fills) | blocked:needs-wallet | owner-scoped (private RPC + auth token). |
| batches explorer (list) | **wired✓ (live-empty)** | it2 CHECKER PASS: default /batches renders live-empty from `zone_listBatches` (demo only on unreachable-fallback via `usingFallback`). Follow-up: ExplorerHeader still shows a static "sealing #48,202 ~9s" countdown on live-empty — park it on real-live. `getBatch`/`searchBatch` param-sensitive, detail surface still pending. |
| batches detail (getBatch/searchBatch) | pending | `zone_getBatch` wants `[batchNumber]`; `zone_searchBatch` block-range-sensitive. Detail view + search wiring next. |

## Writes (later, needs funded wallet)
- order placement (`eth_sendRawTransaction` → darkpool), deposit/withdraw + status polling. Path exists in `requests.ts`; never fake.

## Decisions needed from Brian
- A **test Tempo wallet** (connect + sign zone auth token) is required to verify any owner-scoped / wallet-gated surface end-to-end. Without it, those stay `blocked:needs-wallet`.
