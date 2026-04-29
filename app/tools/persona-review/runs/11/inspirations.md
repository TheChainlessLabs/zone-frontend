# Marcus Reed — Inspirations

External pages I pulled into this review. Grouped by category. Each line: what I take from it, in operator language.

## Institutional crypto custody and settlement (the reference set Omega is positioning into)

- [Fireblocks — Governance and Policy Engine](https://www.fireblocks.com/platforms/governance-and-policies) — every action is a queryable, policied event with a tamper-evident audit trail. This is what `/account` needs to add: an Activity log with the same data shape.
- [Fireblocks — Get audit logs API reference](https://developers.fireblocks.com/reference/getauditlogs) — the data shape compliance teams scrape against. If Omega's account export is missing fields a Fireblocks audit-log row carries, the reconciliation breaks.
- [Fireblocks — Set Transaction Authorization Policy](https://developers.fireblocks.com/docs/set-transaction-authorization-policy) — maker/checker, role-based access, policy drafts. Reference for surfacing the operator's role on `/account` and treating `Cancel all` as an explicit policy event.
- [Anchorage Digital — Settlement Network](https://www.anchorage.com/platform/settlement) — on-demand settlement between participants, full reporting, audit-trail surfaces. The verbatim institutional vocabulary `/batches` already echoes — apply it everywhere else.
- [Anchorage Digital Prime](https://www.anchorage.com/platform/prime) — gated-product onboarding posture; how a regulated institution presents a closed alpha. The pattern Omega's "Pass required" page should adopt instead of dead-ending.
- [Coinbase Prime — Trading](https://www.coinbase.com/prime/trading) — agency-only execution with transparent post-trade reporting and historical analytics. The "post-trade is a primary surface, not a secondary tab" stance.
- [Coinbase Prime — Allocate trades (Help)](https://help.coinbase.com/en/prime/trading-and-funding/allocate-trades) — Activities tab pattern, allocation history on the portfolio. This is the model for `/account` Activity log placement.
- [Coinbase Prime homepage](https://www.coinbase.com/prime) — institutional crypto prime brokerage framing; "agency only," "transparent post-trade." The frame Omega should aim its landing copy at, not the consumer DEX frame.

## Institutional reporting and records (the report-export and audit bar)

- [Bloomberg TOMS — Trade Order Management](https://www.bloomberg.com/professional/product/trade-order-management-solutions/) — message-level logging of order creation, amendment, cancel, fills; full lifecycle audit; allocation records. The institutional trade-ticket reference, and the precedent for CTA copy that carries the order summary.
- [Bloomberg BTCA — Transaction Cost Analysis](https://www.bloomberg.com/professional/products/trading/post-trade-services/btca/) — every settlement record as a queryable artefact. The standard the `/batches` proof-hash and L1-settlement-hash spans need to graduate to (clickable, copyable, downloadable).
- [Bloomberg Compliance products](https://www.bloomberg.com/professional/products/compliance/) — integrated trade-compliance engine with rule-building, real-time violation management, comprehensive reporting and a detailed audit trail. The vendor-review questionnaire bar.
- [Carta — How to download a cap table report](https://support.carta.com/kb/guide/en/how-to-download-a-cap-table-report-m8JbBrvZ4y/Steps/3802667) — Summary / Intermediate / Detailed export tiers with audit metadata in the report header. The model for `/account` Export activity (CSV) and Export receipts (PDF).
- [Carta — How to export company reports](https://support.carta.com/kb/guide/en/how-to-export-company-reports-KOo86f6SJB/Steps/3758005) — near-real-time data export for audits and due diligence. The pattern for offering activity export at the account level.
- [Addepar — Why Addepar](https://addepar.com/why-addepar) — institutional portfolio aggregation with normalized, verified data and customizable reporting. The replacement model for the `/portfolio` decorative donut: stacked allocation bar with drill-down.
- [Addepar Analytics & Reporting platforms SOC 3 (PDF)](https://addepar.com/assets/addepar-analytics-reporting-and-navigator-platforms-soc-3-2024-2025.pdf) — what a published audit attestation looks like. Reference for the Trust center page Omega needs to ship before a private alpha.

## Financial infrastructure trust posture

- [Plaid Trust Center](https://security.plaid.com/) — public-facing security artefact distribution: SOC2 Type 2, ISO27001, ISO27701, pen-test results, vendor questionnaires, cyber insurance. The bar for Omega's Trust center link in the connect-wallet modal footer.
- [Plaid — Trust and Safety](https://plaid.com/safety/) — consumer-and-developer trust positioning. Reference for the disconnected-state copy on `/trade` ("No data leaves the page until you authorise") — keep this; it's the line a vendor-review report quotes.

## Anti-references — behaviour-cost framing, not aesthetic

- [Uniswap app](https://app.uniswap.org) — the anonymous-consumer DEX baseline. Behaviour cost: every UI affordance Omega shares with Uniswap (no operator role, no activity log, no document tray, no audit-export) is a vendor-review failure mode for the institutional pitch. Uniswap is fine for what it is; Omega is positioning elsewhere, so the surface needs to look elsewhere.
- [Robinhood — ditches confetti animation following criticism (Bloomberg, Mar 2021)](https://www.bloomberg.com/news/articles/2021-03-31/robinhood-ditches-its-confetti-animation-following-criticism) — precedent.
- [Robinhood to Pay $7.5M Over 'Gamification' Practices (ThinkAdvisor, Jan 2024)](https://www.thinkadvisor.com/2024/01/18/robinhood-to-pay-7-5m-over-gamification-practices/) — Massachusetts Securities Division enforcement; mandated removal of celebratory imagery and game-of-chance UI affordances. Behaviour cost: every consumer-wallet residue still in Omega's build (decorative donut, light-touch `Cancel all`, undocumented `Privacy fee`) becomes a compliance finding the moment Phase-5 expands beyond NFT-gated alpha. Strip them now while the design-partner cohort is small.
- [GMX](https://gmx.io) — DeFi-native. Behaviour cost: same posture, no operational reassurance, no document tray. Read as the wrong direction for an institutional dark-pool surface.
- [Blur](https://blur.io) — trader-aggression aesthetic. Behaviour cost: the visual language of urgency and FOMO is precisely what institutional desks have screened out of their workflows since the 2008 prime-brokerage standardisation; reproducing it on Omega is the fastest way to lose a Tuesday risk-meeting demo.
