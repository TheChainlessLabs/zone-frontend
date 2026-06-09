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
| `zone_getMarketConfig` | public | works (not live-consumed) | handlers.rs `zone_get_market_config(auth)` | curl via proxy → OALPHA/PATH.USD market | Public variant available; trade uses the **pinned** ZONE_PAIR (matches), so no live fetch is required. N/A for live wiring. |
| `zone_getReferencePrice` | public | works (disabled on zone) | handlers.rs `zone_get_reference_price(...)` | curl → `{enabled:false, ...}` (no provider configured) | Trade shows the **midpoint** (from topOfBook), not a reference price. Disabled is the correct live state. N/A. |
| `zone_getTopOfBook` | public | **wired✓** | handlers.rs `zone_get_top_of_book(base,quote,auth)` | it4 CHECKER: `/trade` (no wallet) POSTs it to the public proxy; bid/ask `0x1` → midpoint renders `1.000000` | Map: `TopOfBookResponse{bid/ask:OrderLevel{price:hexstr}}` → `bestBid/bestAsk = BigInt(price)` → `formatMidpoint`. FE: `getZonePublicTopOfBook` (rpc.ts, publicRpcFetch). Value coincides with demo; verified by network path. |
| `zone_getMidpointHistory` | public | **wired✓** | handlers.rs `zone_get_midpoint_history(...)` | it4 CHECKER: `/trade` (no wallet) POSTs it; 50 samples, **advancing cursor** (live), `history.enabled:true` (sampler online) | Map: `ZoneMidpointHistoryResponse.history.enabled` → `midpointHistoryEnabled` (limit-chart gate). FE: `getZonePublicMidpointHistory` (rpc.ts, publicRpcFetch). |
| `zone_getZoneInfo` | public? | pending | handlers.rs:1488 `zone_get_zone_info(auth)` | "Method not found" on WIP container (present in main) | WIP-container gap; works once main binary runs. FE `rpc.ts:163` (auth-gated). |
| `zone_listBatches` | public | **wired✓** | handlers.rs:1943 (container overrides default) | CHECKER (it2): proxy → `{batches:[]}`; /batches renders 0 rows + "No zone batches yet" + StatStrip "Batches today 0 · 0.00M", no synthetic rows over 13s | FE `rpc.ts:1219 listZoneBatches`. Map: `BatchListResponse{batches:BatchSummary[]}` → `BatchFixture[]` via `zoneBatchToFixture`; live-empty `{batches:[]}` → empty rows + 0 stats (NOT demo). |
| `zone_searchBatch` | public | **blocked:backend** | handlers.rs `zone_search_batch(query)` | it3 curl: `-32602 "query exceeds max block range 100000"` | Backend scans L1 from the 3.2M-block-old anchor → exceeds range cap. FE `searchZoneBatch` (rpc.ts:1250) wired; needs omega-zone fix (range-bounded scan / indexer). |
| `zone_getBatch` | public | **blocked:backend** | handlers.rs `zone_get_batch(n)` | it3 curl `["4821"]`: `-32602 "query exceeds max block range 100000"` | Same block-range cause. FE `getZoneBatch` (rpc.ts:1237) wired (passes `toBatchNumberHex` string). Detail view falls back to demo on this error (acceptable until backend fixed). |
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
| trade live market (midpoint/chart) | **wired✓ (wallet-free)** | it4 CHECKER PASS: a wallet-free public effect polls `zone_getTopOfBook` + `zone_getMidpointHistory` (publicRpcFetch) every 10s; `hasLiveData` includes `publicMarketState==="ready"`, so /trade shows the LIVE midpoint without a wallet (demo only on unreachable). Follow-up: `/trade` intermittently redirects to `/` while disconnected — investigate (possible wallet-state route guard). Order placement / owner fills remain wallet-gated. |
| portfolio (balances/orders/fills) | blocked:needs-wallet | owner-scoped (private RPC + auth token). |
| batches explorer (list) | **wired✓ (live-empty)** | it2 CHECKER PASS: default /batches renders live-empty from `zone_listBatches` (demo only on unreachable-fallback via `usingFallback`). Follow-up: ExplorerHeader still shows a static "sealing #48,202 ~9s" countdown on live-empty — park it on real-live. `getBatch`/`searchBatch` param-sensitive, detail surface still pending. |
| batches detail (getBatch/searchBatch) | **blocked:backend** | it3: both error `-32602 query exceeds max block range 100000` on this container (L1 scan from the 3.2M-block anchor). FE is already wired (`getZoneBatch`/`searchZoneBatch`); detail view demo-falls-back on the error. Verify live once the backend bounds the scan / adds an indexer. Needs an **omega-zone PR** (range-bounded batch lookup). |

## Writes (later, needs funded wallet)
- order placement (`eth_sendRawTransaction` → darkpool), deposit/withdraw + status polling. Path exists in `requests.ts`; never fake.

## Backend issues to PR (omega-zone) — do NOT hack inline
- **Block-range cap on batch lookups (it3):** `zone_getBatch` / `zone_searchBatch` return `-32602 "query exceeds max block range 100000"` because they scan L1 from the zone's anchor (~3.2M blocks back). Needs a range-bounded scan or an indexer so batch detail/search can serve live. Frontend is already wired; blocked on this.
- **WIP container vs main:** the synced container is the WIP build — `zone_getZoneInfo` is "Method not found" (present in main). Resolves when the patched-main binary runs on synced data.

## Decisions needed from Brian
- A **test Tempo wallet** (connect + sign zone auth token) is required to verify any owner-scoped / wallet-gated surface end-to-end. Without it, those stay `blocked:needs-wallet`.
