# Findings — 20-persona design review tally

Coverage: all 20 critiques parsed (01–20).

## Summary

- Total kill clusters: 22
- Total build clusters: 38
- Highest-voted: BUILD — Order-summary CTA label (8 votes)
- Strongest convergence by surface: `OrderForm` — 7 clusters with ≥5 votes (3 kill, 4 build)

## Top-3 highest-voted

1. BUILD — Order-summary CTA label (8 votes)
2. KILL — Decorative donut on /portfolio summary (8 votes)
3. KILL — Global dot-grid on data/operational surfaces (7 votes)
   BUILD — In-ticket execution rail (Sign → Queued → Matched → Settling → Settled) (7 votes)

## Convergent — votes ≥ 5

### KILL — Decorative donut on /portfolio summary (8: 01, 02, 04, 09, 11, 14, 17, 18)
Two-slice donut at hero scale is theatre. Replace with horizontal stacked bar. Behaviour-cost: Addepar/Mercury prioritise state-and-flow over composition summary.

### KILL — Global dot-grid on data/operational surfaces (7: 03, 07, 10, 13, 14, 15, 20)
"A darkpool does not have wallpaper" (10). Aceternity-school SaaS-template tell. Strip from authenticated product routes; keep on /brand.

### KILL — Duplicate Type/Fee/Est-receive strip vs ExecutionContextStrip (5: 01, 02, 04, 12, 14)
Pick one home. Marquee/JPM render once.

### KILL — "Buy USDC" / generic CTA label (6: 01, 02, 04, 11, 13, 17)
The verb is the smallest unit of information in the contract. Pump.fun precedent — regulators cite tinted celebration UI.

### KILL — "CHART WIRING LANDS IN M6" placeholder (5: 03, 10, 12, 13, 20)
Internal milestone language never appears in a brand-evaluation surface. Kill or ship a chart.

### KILL — Sub-12px micro-typography (6: 01, 02, 04, 08, 13, 14)
10px uppercase tracked text is hostile to dyslexic readers, fails contrast floor in light mode at ~4.7:1.

### BUILD — Order-summary CTA label (8: 01, 02, 04, 11, 12, 13, 17, 19)
`Submit · Buy 1,000 USDC at 0.9213 EURC · Fee 0.005%`. Knight Capital $440M precedent. Last legible chance to catch a wrong order.

### BUILD — In-ticket execution rail (7: 03, 06, 12, 13, 16, 18, 20)
Sign → Queued → Matched → Settling → Settled, flips inside the ticket before any modal closes. Hyperliquid/Bybit/Wise lineage.

### BUILD — Live hash links + click-to-copy on every hash (5: 01, 04, 11, 13, 17)
Proof claim is the product. Etherscan + copy on every hash, every screen.

### BUILD — Available balance promoted (5: 01, 02, 04, 09, 18)
Peer of amount input, not a 10px tracker. UBS/JPM convention — both numbers carry signing risk.

### BUILD — Mobile safe-area / tab-bar overlap fix (6: 02, 08, 14, 15, 18, 19)
`pb-[calc(60px+env(safe-area-inset-bottom)+16px)]`. Single biggest single-line fix in the build.

### BUILD — Lifecycle stage indicator on every fill row (5: 01, 04, 06, 11, 16)
Replace `Settled`/`Proven`/`Pending` chips-as-categories with the 4-stage ring or `1/4`-style ordinal.

### BUILD — Plain-language consequence pair on every state pill (5: 03, 06, 08, 17, 20)
Monzo writing system: every error has [what happened] [what to do next]. Translate `queued / sealed / proven / settled` to non-crypto operators.

## Strong — votes 3–4

### KILL
- Tinted Buy/Sell at rest on CTA (4: 04, 10, 14, 17)
- Source Serif italic eyebrow on operational pages (4: 04, 09, 15, 18)
- Filled red gradient under portfolio chart (3: 10, 14, 18)
- Two-button stacked Sign permit / Sign deposit (3: 02, 11, 19)
- Disabled CTA pattern (3: 02, 08, 17)
- Universal `Verified` chip per row (3: 11, 14, 16)
- 25/50/75/MAX shortcuts (3: 04, 17, 19) — fat-finger risk
- Long descriptive paragraph at top of /batches (3: 05, 14, 16)
- "Privacy fee" label in withdraw (3: 11, 17, 20)
- Spinner-only waiting in connect (3: 03, 06, 08)
- Full-page empty-illustration treatment for gated states (3: 02, 12, 13)
- Oversized verification ring on /batches/[id] (4: 06, 07, 10, 15)
- 11px privacy footer (3: 12, 13, 14)
- Identical card framing across surfaces (3: 09, 14, 15)

### BUILD
- Replace donut with horizontal stacked bar (4: 02, 04, 09, 11)
- Glossary tooltips on first occurrence (4: 11, 13, 17, 20)
- Top account-state strip / ledger header (4: 09, 12, 18, 20)
- Activity log / merged register (3: 09, 11, 18)
- Pair-strip / pair-switcher in header (3: 02, 12, 19)
- Dense table with sortable / frozen columns for /batches (3: 07, 09, 16)
- Side-coloured price cell (3: 01, 04, 14)
- Italic editorial lede on page headers (3: 05, 10, 14) — DISAGREES with KILL above
- Inline gated bottom sheet (3: 02, 12, 13)
- Two-step deposit/withdraw with success state holding L1 tx (3: 02, 11, 19)
- UTC timestamp band on every primary surface (3: 04, 11, 17)
- Failure quarantine + status-page URL (3: 07, 11, 16)
- Front-loaded pass/network/signature pre-check in connect (3: 03, 13, 17)
- Reconciliation panel mapping fill → batch → settled → withdrawable (3: 13, 18, 20)
- Canonical StatePanel family (3: 05, 08, 15)

## Disagreements

### Editorial italic vs operational restraint
Two factions split along persona lineage. Editorial (05, 10, 14) want MORE Source Serif italic. Trader/ops (04, 09, 15, 18) want it GONE from operational pages. Reconciliation: split — keep italic on /batches + /brand, strip from /trade /portfolio /account.

### Density vs restraint
Density camp (07, 09, 12, 16) vs restraint camp (10, 14). Convergence on /batches/[id] (oversized ring) but divergence on replacement.

### Lifecycle vocabulary canonical naming
Eight personas agree the lifecycle should propagate. Disagree on naming: 06 prefers "Anchored on L1 / Externally verifiable"; 20 prefers "waiting to enter batch / matched / anchored / usable".

## Single-voter items worth flagging

1. Persona 08 — Error summary above forms with `role="alert"` (GOV.UK + NHS floor)
2. Persona 11 — /account Activity log + CSV/PDF export + Trust center link (SOC2)
3. Persona 17 — Pre-submit warnings panel (Knight Capital precedent)
4. Persona 19 — Inline numeric keypad as primary amount-entry on mobile (MoMo/ZaloPay)
5. Persona 13 — Match window countdown glued to order form (CoW Swap batch auction)
6. Persona 14 — Re-tier surface envelope to three explicit levels
7. Persona 16 — Disciplined transition motion when batch advances
8. Persona 11 — Capture and surface actual wallet vendor (compliance audit answer)
9. Persona 15 — Cmd-K global command surface
10. Persona 18 — Account-model / settlement-rail explainer block

## Surface heatmap

| Surface | Kill ≥5 | Build ≥5 | Kill 3–4 | Build 3–4 |
|---|---|---|---|---|
| OrderForm | 3 | 4 | 4 | 2 |
| /trade | 1 | 2 | 3 | 2 |
| /portfolio | 1 | 0 | 3 | 2 |
| /batches | 0 | 0 | 3 | 1 |
| /batches/[id] | 0 | 1 | 1 | 2 |
| /account | 0 | 0 | 1 | 1 |
| modals | 0 | 0 | 3 | 2 |
| MobileTabBar | 0 | 1 | 0 | 0 |
| cross-surface | 1 | 2 | 1 | 3 |

OrderForm absorbs the most converged pressure. /account has zero high-converge clusters but 4 single/double-voter builds.
