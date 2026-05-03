# Marcus Reed — Omega interface review

Former prime-brokerage product lead, now advising crypto market-structure startups. New York. I sit across from compliance officers, fund ops, and middle-office heads; I've watched a SOC2 auditor reject a vendor for not being able to produce a withdrawal receipt with a wallclock timestamp. I review your screens the way I'd review one of my client's vendor onboarding decks: can a fund operator walk a colleague through the system in one demo, and produce paper for it three quarters later.

I looked at the desktop dark screenshots, the live build, and the source for `/account`, `/batches/[id]`, and the deposit/withdrawal modals. I used 45 minutes.

---

## Top 3 observations

1. **Your /batches page is the only institutional surface in the build.** It uses the right nouns (Sealed, Proven, Settled, Externally verifiable, Submitter), exposes the proof hash and the L1 settlement, and prints "Anchored on Ethereum L1." That is the language a Fireblocks or Anchorage customer expects to read in a vendor demo [ref-1][ref-2]. Every other surface is consumer-shaped — and it's costing the rest of the product its credibility.
2. **/account has no audit log, no session history, no document tray, no admin role surface.** It is a settings page that knows the wallet's address and the user's gas-fee preference, and that's the institutional conversation over. Fireblocks, Anchorage, and Coinbase Prime all open onto activity-and-approvals, not preferences [ref-1][ref-2][ref-3]. A fund operator opening `/account` today cannot answer "when did this session start, what has it signed, and where's the receipt" — which is the only question the page exists to answer.
3. **The deposit and withdrawal modals are signing flows pretending to be forms.** They show "Network fee $0.42" and "Privacy fee $0.10" and a `Sign permit` / `Sign withdrawal` button — but no chain-confirmation step, no L1 tx hash on the success state, no Etherscan link on completion, no batch-of-record callback. Bloomberg's TOMS workflow surfaces every leg of the order lifecycle as a discrete, queryable record [ref-4]; today these modals close and the only proof the user has of a deposit lives buried at the bottom of `/portfolio` as a `0x2c1d…4a3b` span. The proof claim is the product. Make the receipt the artefact.

---

## Page-by-page

### /account — the page that decides whether your alpha is institutional

This is the surface I'd point to first in a vendor review and it's the weakest in the build. Today the page is: connected wallet card, gas-preference toggle, two preference toggles, theme toggle, sign-out. That is a consumer settings page. It is not what an institutional onboarding flow looks like.

What's right:
- The `Connected since Apr 27, 2026 · 09:00 UTC` line under the address is the right primitive. Wallclock-stamp every session start. UTC. Don't ever localise.
- `NFT pass: Held` rendered in success-green is honest — you are gating phase-4 alpha on a pass and the page admits it. Anchorage Digital's settlement onboarding uses a similar in-band gate-status surface [ref-2].

What's missing — every one of these is an institutional table-stake, not a feature request:

- **No activity log.** Fireblocks' audit log is the institutional reference — every transaction stage with a tamper-evident timestamp [ref-1]. There needs to be a "Recent activity" section on /account that lists the last 50 events the wallet performed: connections, signed orders, deposits, withdrawals, permit signs, with their batch ID and L1 hash where applicable. Each row downloadable. Each row linkable.
- **No CSV / PDF export.** Carta's cap-table export is the bar — Summary / Intermediate / Detailed, with audit metadata in the header [ref-5]. A fund's compliance officer cannot run quarterly reconciliation against a screen. Ship "Export activity (CSV)" and "Export receipts (PDF)" as account-level affordances. This is two endpoints and a dropdown; it is not heavy.
- **No "as-of" or session info beyond connected-since.** Last sign-in IP region, last successful settlement, last failed signature. Plaid's trust portal exposes this kind of meta-evidence [ref-7] and it is exactly the surface a vendor-review questionnaire scrapes.
- **`Connector: Browser wallet`** with no further detail. Compliance won't accept "browser wallet" as the audit answer. Capture the wallet vendor (MetaMask / Coinbase / Ledger via WalletConnect / hardware-via-Rabby) and surface it. Coinbase Prime's connector record is itemised at this level [ref-3].
- **No role surface.** "This wallet is connected as the trading principal" / "as a viewer" / "as a settlement-only delegate." Fireblocks' role-based access is the precedent; even if v0 only supports one role, name it on the page so the next role doesn't break the layout [ref-1][ref-6].
- **Sign-out copy: "Onchain balances are unaffected. Reconnect any time."** That's the right pattern. Keep it. But add: "This will not revoke any signed orders still in-flight; cancel open positions on /trade first." Otherwise an ops user will sign out mid-batch and panic.

### /batches — keep this page; it is your demo

This is the surface that earns the institutional pitch. The 4-stage Queued / Sealed / Proven / Settled ring with `DONE / WAITING` per stage is the right model. The Pair Aggregate, the Batch Root, the Proof Hash, the L1 Settlement, the Submitter (`Sequencer #1 — TEE`), the `Externally verifiable` footer with "Anyone can verify this batch's proof on-chain" — that copy is the institutional vocabulary [ref-2][ref-4].

Two corrections:

- **The L1 settlement hash and the proof hash are spans, not links.** I called this out in Daniel's review and I'll repeat it: the proof claim is the product. `0xa1b2c3d4…2b3c4d5e` must be a clickable Etherscan link on mainnet, with a copy-to-clipboard affordance, and ideally a "Download attestation" download that hands the user a JSON or a signed PDF receipt. Bloomberg's BTCA post-trade surface treats every settlement record as a queryable artefact [ref-4]; you've got the data and you're rendering it as a span.
- **`Submitter: Sequencer #1 — TEE` is good but unsupported.** Link the string to a one-page explainer of the attestation chain — what TEE, what attestation report, what registry entry. Anchorage publishes its custody attestation chain at this level of itemisation [ref-2].

### /batches list — `Verified` pill + proof tail

The list rows are dense and correct. One issue: the `Pending` chip uses the same shape and typography as the `Verified` chip with only a colour delta. In a print-out or a colour-blind view that distinction is lost. Add a glyph (a half-filled ring or a `…`) so the pre-settlement state is unambiguous in monochrome. Bloomberg's terminal surfaces use this pattern explicitly so a printed P&L tape doesn't misread under a fluorescent compliance-floor light [ref-4].

### /portfolio — the receipt page that doesn't yet feel like one

The headline `$47,213.40 · -$1,659.75 · -3.40% today` is clean. The Open positions, Recent fills, Transfers tables are the right primitives. The serif italic `Matched, settled, and proved.` strapline under PORTFOLIO is the only piece of decorative copy I'd accept on this surface — it functions as a section subhead because the words are nouns the product actually does. Keep it.

What I'd change, for the institutional read:

- **Transfers table needs a wallclock and an explorer.** Today: `WITHDRAWAL · USDC · 1,500.00 · Pending · 0x2c1d…4a3b ↗`. Add a UTC timestamp column, a `Confirmations: 6/12` field on pending rows, and the destination address (truncated, copyable) for withdrawals. Anchorage's settlement view itemises every leg this way [ref-2].
- **`OWN BATCH ONLY` micro-label** above Recent fills is the right disclosure but too quiet. Compliance reads tables, not micro-labels. Promote it to a sentence under the section header: "Showing your fills only. Counterparty-side fills are private to their owners." That's verbatim the kind of copy an SEC vendor questionnaire wants.
- **Donut chart in Summary** — a two-slice donut at that scale is decoration. Replace it with a stacked horizontal bar (USDC / EURC) the same way Addepar renders allocation [ref-8].
- **`Cancel all` link** in Open positions is dangerously light. It needs a confirmation dialog with a one-line summary of what will be cancelled. Fireblocks' policy engine treats batch-cancel as an explicit policy event [ref-1].

### Deposit modal (`modal-deposit--idle.png`)

- **Two CTAs, `Sign permit` and `Sign deposit`, with no progression indicator.** A user cannot tell if these are sequential or parallel. They are sequential. Render them as `Step 1 of 2` / `Step 2 of 2` with the second one disabled until the first lands. Coinbase Prime steps every approval flow this way [ref-3].
- **No success-state preview.** What happens when this modal closes? On Fireblocks the success state shows the wallclock, the L1 tx hash, and the policy that approved it [ref-1]. Today I close the modal and it disappears. Replace the close-on-submit pattern with a success step that lives in the modal until I dismiss it, and link the L1 tx.
- **`Network fee $0.42`** is honest but unsupported. Show the gas preference (`Normal · ~3 blocks`) inline with the fee, and let me change it inline. Today gas preference lives on /account behind a tab.

### Withdrawal modal (`modal-withdraw--idle.png`)

- **`Privacy fee $0.10`** is a footgun. I don't know what it pays for. The brief lexicon says "Privacy" is a property, not a service charge [internal: omega-docs/03-brand/messaging.md]. Either rename to `Service fee` and document, or strike it.
- **`Recipient · 0x…` field with no resolution.** Show ENS reverse-resolution if available, show "this is a new address you haven't sent to before" warning if it is, show "this matches your connected wallet" if it does. Fireblocks treats first-time-to-address as a policy-flag event [ref-1].
- **`Sign withdrawal` is the only CTA.** Rename to `Submit withdrawal · 1,500 USDC to 0x4e1a…0e9f`. The button is the last legible chance to catch a typo. Bloomberg's order-confirmation buttons carry the full order summary verbatim [ref-4].

### Connect wallet modal (`modal-connect--idle.png`)

- **`Sign in with your wallet to access the Omega trading desk.`** Good — "trading desk" is the institutional noun [internal: messaging.md]. Keep.
- **No SOC / certifications strip in the modal footer.** Plaid's trust portal puts SOC2 / ISO27001 visibly available, and modal-level connect flows for Coinbase Prime echo this with a "By connecting you agree to..." that links to Terms + Privacy + Trust center [ref-3][ref-7]. Today the footer says only "By connecting, you agree to the Terms." Add `Terms · Privacy · Trust center` as three links. Trust center is the page where you publish your SOC2 status, your proof methodology, your subprocessor list. Don't ship to a private alpha without one.

### `/trade — Pass required` (`trade--no-nft-pass.png`)

The `PHASE 4 — CLOSED ACCESS` micro-label is the right tone. The body copy `Trading is gated to Phase-4 NFT pass holders. The connected wallet does not hold a pass.` is honest. But:

- **`Pass required` chip in the navbar** uses lock-icon + label, which reads as a generic CTA. A fund operator looking at this reads "I need to acquire the pass." There needs to be a second line under it: "Contact desk@omegamarkets.com to request access." Anchorage's gated-product surfaces always include a sales/desk contact path [ref-2]. The current flow dead-ends.

### Disconnected states (`trade--disconnected.png`, `portfolio--disconnected.png`)

- **`Omega is read-only until your wallet signs in. No data leaves the page until you authorise.`** That is excellent privacy copy. Keep verbatim. This is the line a compliance reviewer will quote in the report, and the line that distinguishes you from Uniswap [anti-ref-1] — Uniswap's wallet-disconnected swap UI is unambiguously consumer-direct, no data-handling disclosure, no read-only framing.

### Error states (`portfolio--error.png`, `batches--error.png`)

- **`Portfolio unavailable. Retry in a moment.` / `Failed to load batches. Refresh to retry.`** Both are terse and honest. But for a SOC2-conscious operator the missing detail is "what's the incident-status link?" Fireblocks' fall-through error states surface the status-page URL inline [ref-1]. Add `Status: status.omegamarkets.com` to every error state. Even if the status page is a static "All systems operational" today, having the link in the error reassures the operator they aren't blind.

---

## Kill list

1. **The donut on /portfolio summary.** Two slices of allocation at decoration scale. Replace with a stacked bar. [ref-8]
2. **Identical chip shape for `Pending` vs `Verified`** on /batches list. Add a glyph differentiator for monochrome readability. [ref-4]
3. **`Privacy fee` line in the Withdraw modal.** Rename or remove; the lexicon doesn't support it. [internal: messaging.md]
4. **`Cancel all` as a quiet text link.** Promote to a button + confirm dialog. Batch cancel is a compliance event. [ref-1]
5. **L1 settlement hash and proof hash as inert spans on /batches detail.** They are the product. Make them links. [ref-2][ref-4]
6. **`Browser wallet` as the connector value.** Capture and surface the actual wallet vendor. [ref-3]

## Build list

1. **`/account` Activity log section.** Last 50 events: connection / sign / order / deposit / withdrawal / permit, each with UTC timestamp, batch ID where applicable, L1 hash where applicable. Filterable by event type. Per Fireblocks' audit-log model [ref-1], per Coinbase Prime's Activities tab [ref-3].
2. **`/account` Export buttons.** Export activity CSV. Export receipts PDF. Per Carta's report-export model — Summary / Intermediate / Detailed with audit metadata in the header [ref-5].
3. **`/account` Trust center link.** Static page listing SOC2 status (target date if not yet certified), subprocessors, security contact. Per Plaid's trust-portal pattern [ref-7].
4. **Two-step confirmation in deposit and withdrawal modals.** `Step 1 of 2: Sign permit` → `Step 2 of 2: Sign deposit` with progression indicator and a success state that holds the L1 tx hash. Per Coinbase Prime's stepped-approval flow [ref-3], per Fireblocks' transaction-stage UI [ref-1].
5. **CTA copy that carries the order.** `Submit · Buy 1,000 USDC at 0.9213 EURC · Fee 0.005%` in /trade; `Submit withdrawal · 1,500 USDC to 0x4e1a…0e9f` in the modal. Per Bloomberg TOMS confirmation pattern [ref-4].
6. **Etherscan + copy on every hash, every screen.** L1 settlement hash, proof hash, batch root, submitter, deposit/withdrawal hashes on /portfolio Transfers. Per Anchorage's settlement-record itemisation [ref-2].
7. **Status-page URL on every error state.** Per Fireblocks' incident-aware error surfaces [ref-1].

---

## Verdict

I'd describe this build to a fund operator as "the batches page is institutional; the rest is a high-end consumer wallet." That's not a bad place to be — `/batches` proves you can write the institutional language; you just haven't applied it everywhere yet.

The cheapest place to fix this is `/account`. Add the activity log, the export, the trust center link, and the operational role surface, and a fund operator can do an internal demo Monday morning — "this is where the receipts live, this is the pass status, this is what the wallet has signed in the last 30 days." That's the page that decides whether the rest of the build gets a vendor-review review or a "consumer wallet, can't onboard" rejection.

I've spec'd this rewrite in `redesign/account-marcus.tsx`. It's a sectioned rewrite, not a rebuild — same primitives (Card, Field, PageSection), new sections (Audit log, Export, Trust + compliance, Operator role).

Don't add features. Surface the receipts.

---

## Anti-reference behaviour-cost note

[anti-ref-1] **Robinhood — gamification settlement, $7.5M to Massachusetts (Jan 2024).** Robinhood Financial paid $7.5M and overhauled its UI after the Massachusetts Securities Division enforced specifically against celebratory imagery and game-of-chance affordances [https://www.bloomberg.com/news/articles/2021-03-31/robinhood-ditches-its-confetti-animation-following-criticism, https://www.thinkadvisor.com/2024/01/18/robinhood-to-pay-7-5m-over-gamification-practices/]. The institutional read on this is unambiguous: every consumer-broker UI affordance from this lineage is now a regulatory liability for any platform that touches retail-adjacent flow. Omega's Phase-4 NFT-pass-gated alpha is institutional-only on paper, but the moment a Phase-5 retail expansion appears in your roadmap, every consumer-wallet pattern still in the build (donut decoration on /portfolio, ungated `Cancel all` link, "Privacy fee" copy without disclosure) becomes a compliance review finding. Strip the consumer-wallet residue now, while you only have a small set of design-partner wallets to migrate. The cost of fixing it after the first 50 funds onboard is a rebuild, not a polish.

---

## References

- [ref-1] [Fireblocks — Governance and Policy Engine](https://www.fireblocks.com/platforms/governance-and-policies) — programmable policy engine with role-based access, approval workflows, audit-trail at every transaction stage; the institutional reference for "every action is a queryable, policied event."
- [ref-1b] [Fireblocks — Get audit logs API](https://developers.fireblocks.com/reference/getauditlogs) — tamper-evident audit log endpoint; the data-shape institutional vendors expect.
- [ref-2] [Anchorage Digital — Settlement Network](https://www.anchorage.com/platform/settlement) — on-demand settlement directly between participants with full reporting and audit-trail surfaces; the language ("settlement," "approve," "audit," "qualified custodian") Omega's /batches page already echoes.
- [ref-2b] [Anchorage Digital Prime](https://www.anchorage.com/platform/prime) — institutional onboarding posture; gated-product copy and SOC1/SOC2 surfacing.
- [ref-3] [Coinbase Prime — Trading & Allocation](https://www.coinbase.com/prime/trading) and [Allocate trades — Help](https://help.coinbase.com/en/prime/trading-and-funding/allocate-trades) — post-trade reporting, allocation history on the Activities tab, account statements; the "Activities tab" pattern is exactly what /account needs.
- [ref-4] [Bloomberg TOMS — Trade Order Management Solutions](https://www.bloomberg.com/professional/product/trade-order-management-solutions/) and [BTCA — post-trade analytics](https://www.bloomberg.com/professional/products/trading/post-trade-services/btca/) — message-level logging of order creation/amend/cancel/fills, lifecycle audit, allocation records; the canonical institutional trade-ticket and post-trade reference.
- [ref-5] [Carta — How to download a cap table report](https://support.carta.com/kb/guide/en/how-to-download-a-cap-table-report-m8JbBrvZ4y/Steps/3802667) and [How to export company reports](https://support.carta.com/kb/guide/en/how-to-export-company-reports-KOo86f6SJB/Steps/3758005) — Summary / Intermediate / Detailed export tiers with audit metadata; the institutional report-export bar.
- [ref-6] [Fireblocks — Define AML Policies and Set Transaction Authorization Policy](https://developers.fireblocks.com/docs/set-transaction-authorization-policy) — role-based access and maker/checker steps; reference for surfacing the operator role on /account.
- [ref-7] [Plaid Trust Center](https://security.plaid.com/) and [Plaid — Trust and Safety](https://plaid.com/safety/) — public trust portal exposing SOC2 Type 2, ISO27001, pen-test results; the model for an Omega "Trust center" link footer.
- [ref-8] [Addepar — Why Addepar (institutional reporting)](https://addepar.com/why-addepar) and [Addepar Analytics & Reporting SOC 3](https://addepar.com/assets/addepar-analytics-reporting-and-navigator-platforms-soc-3-2024-2025.pdf) — institutional allocation reporting; reference for replacing the /portfolio donut with a stacked bar.
- [anti-ref-1] [Robinhood ditches confetti animation following criticism — Bloomberg, Mar 2021](https://www.bloomberg.com/news/articles/2021-03-31/robinhood-ditches-its-confetti-animation-following-criticism) and [Robinhood to Pay $7.5M Over 'Gamification' Practices — ThinkAdvisor, Jan 2024](https://www.thinkadvisor.com/2024/01/18/robinhood-to-pay-7-5m-over-gamification-practices/) — Massachusetts Securities Division settlement, $7.5M penalty, mandated removal of celebratory imagery and game-of-chance affordances; the precedent for stripping every consumer-wallet residue from an institutional surface before retail expansion.
- [anti-ref-2] [Uniswap app — anonymous-consumer swap UI](https://app.uniswap.org) — read against Omega's `Connect a wallet to continue · No data leaves the page until you authorise` copy: Uniswap is the consumer baseline; Omega's institutional positioning needs the disclosure copy in front of every gated state.
