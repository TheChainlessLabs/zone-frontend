# Amira Haddad — Omega interface review

Portfolio director, Gulf family office. I sit on a treasury committee that approves stablecoin allocations against the dollar book and the euro book. The desks I review are Goldman Marquee, J.P. Morgan Markets, and a UBS private-banking portal. I do not read trading-app marketing copy. I read the order ticket, the audit log, and the timestamp.

I spent forty minutes on the desktop screenshots. Mobile is not relevant — a treasury rebalance does not happen in a taxi.

---

## Top 3 observations

1. **The product carries the right vocabulary — "sealed", "proof", "attestation" — but renders it in retail-DEX clothing.** The /batches detail page is the one surface that already looks like infrastructure; the rest of the app spends visual energy on chip pills and tinted CTAs that read as crypto campaign, not venue. The lexicon is correct; the surface is not yet caught up.[ref-1][ref-3][ref-7]
2. **The order ticket tells me what mode I am in (Market / Limit) before it tells me which pair, which side, which size, and at what price.** A capital allocator reads top to bottom: pair, direction, notional, price reference, fee, settlement venue. Mode is a parameter, not a headline. Marquee, J.P. Morgan Markets, and a UBS execution dialog all open with the trade contract — Omega opens with a tab control.[ref-2][ref-4][ref-6]
3. **There is no audit row on the order ticket.** No UTC timestamp, no batch window, no sequencer identifier, no policy reference. CAT-compliant institutional desks render millisecond-precision timestamps because the firm is on the hook for them; an unattested order ticket on a darkpool that markets itself as TEE-attested is a missed signal.[ref-9][ref-10]

---

## Page-by-page

### /trade — Market and Limit (`trade--connected-market.png`, `trade--connected-limit.png`)

The ticket is the room I live in. It is not yet a private-banking room.

- **Pair switcher pill at the top** is a dropdown styled as a chip. A capital-allocator surface does not put the most important contract — *what am I trading* — inside a pill. Marquee renders pair, side, and notional as a static contract header above the entry fields, not as a pickable widget.[ref-2] The pair should print as a fixed line; the dropdown affordance shrinks to a small "change pair" link.
- **Buy / Sell as two equal pills with a green tint on the active state** is the visual register of a retail crypto exchange. The active side should be communicated through the *price* — Marquee, Bloomberg, and J.P. Morgan all colour the price cell, not a dedicated button. A radio group with explicit "Direction: Buy USDC / Sell USDC" labelled in plain prose, top-aligned, is closer to how UBS execution dialogs read.[ref-2][ref-4][ref-6]
- **Amount input at `text-2xl`, "Available 10000.00 USDC" at `text-[10px]` mono uppercase.** This inverts the institutional convention. On a UBS or a J.P. Morgan execution dialog, the available balance is rendered at the same weight as the order size because *both numbers carry signing risk*. Make available balance a peer of the input, not a tracker.[ref-3][ref-4][ref-6]
- **The 25 / 50 / 75 / MAX row** is a retail-app idiom. A treasury allocation is not a percentage of wallet balance — it is a fixed notional decided in committee. Either retain it for partial exits with a clearer label ("Quick fractions of available balance") or remove it from the institutional surface entirely. Marquee does not have it.[ref-2]
- **"Buy USDC" CTA in success-green** is wrong on two counts: the verb is the smallest unit of information in the contract (the radio group already established side), and the colour load communicates celebration. UBS execution dialogs use a neutral primary button labelled with the *full order contract* — `Sign · Buy 10,000 USDC at midpoint · Settle Ethereum L1`.[ref-4][ref-6][ref-7] Aesop and Hermès do not paint their checkout buttons their brand colour; the button is simply the action.[ref-7][ref-8]
- **"Orders match privately at midpoint."** The line is correct. Keep it. It is the only sentence in the ticket that earns its place.[ref-1]
- **The duplicate `Type / Fee / Est. receive` strip inside the form, then a near-identical `Midpoint / Est. received / Fee / Settlement` strip below it.** Two strips, four cells each, restating the same contract. Pick one. Marquee shows the contract once, in a static row, above the action.[ref-2]

### /portfolio (`portfolio--default.png`)

The hero number is read correctly. The chart is honest. The three things I would change are voice and weight, not layout.

- **"Matched, settled, and proved." in serif italic** under PORTFOLIO is a campaign line. It belongs on a landing page, not on a treasury surface. A private-banking portal opens with `Account · As of 27 Apr 2026 09:00 UTC` because the date stamp is the trust signal.[ref-3][ref-6][ref-9] Replace the italic line with a UTC timestamp and the wallet address.
- **`Pending` / `Settled` / `Proven` rendered as adjacent pill chips of identical visual weight.** These are stages in a single lifecycle, not category labels. Marquee, J.P. Morgan post-trade, and CAT-compliant audit logs render lifecycle as a small ordinal indicator next to a UTC timestamp, not as a tinted pill.[ref-2][ref-9][ref-10] Demote the chips to plain text in mono, with the ordinal stage rendered as `3/4 Proven` next to the timestamp.
- **The donut on the summary card** with a 97 / 3 split between two stablecoins is decorative geometry. UBS, HSBC, and J.P. Morgan family-office portals render allocation breakdowns as ranked horizontal rows with notional and percent — the chart is a memory aid, not a hero. A single horizontal bar at 24px would carry the same information at a fraction of the visual cost.[ref-3][ref-5][ref-6]
- **Transfer hashes `0x2c1d…4a3b` rendered with an out-link icon** is correct in shape. They are not yet hyperlinks in the screenshot — verify the live build wires the Etherscan jump and a click-to-copy. Without those two affordances the proof claim is decorative.[ref-9]

### /batches — list and detail (`batches--default.png`, `batches-detail--verified.png`)

This is the only surface in the app that already feels like infrastructure. Do not touch it. Two adjustments.

- The list rows lead with a pill `Verified` / `Pending`. Demote to a stage marker (`4/4` / `2/4`) plus the word in plain mono. The detail page already does this correctly; carry it back to the list.[ref-2][ref-9]
- The proof hash `PROOF 0xb7c8…f5a6` should be the same affordance as a transfer hash on /portfolio — a link to the on-chain attestation, with copy. The detail page exposes `BATCH ROOT` and `L1 SETTLEMENT` as static text; institutional reviewers expect those to be live. Marquee and Etherscan both treat hashes as primary actions, not labels.[ref-2][ref-9]

### /account (`account--connected.png`)

The page is well structured. Two voice-level edits.

- **"Wallet, preferences, session." as a serif italic subhead** is a marketing flourish. Strip it.
- **"Connected since Apr 27, 2026 · 09:00 UTC"** — correct. This is the audit anchor I want to see on every primary surface, not just the account page.[ref-9][ref-10]

### Modals — connect, deposit, withdraw, order confirmation (`modal-connect--idle.png`, `modal-deposit--idle.png`)

The modals are the surfaces that decide trust. They are currently styled as DEX modals.

- **The connect modal opens with "Sign in with your wallet to access the Omega trading desk."** "Trading desk" is correct. Drop "Sign in" — institutional users do not sign in to wallets. They connect them, then sign per action. Use `Connect a wallet to begin a session.`
- **Wallet rows with M / W / C / B coloured initials** is the Coinbase Wallet idiom. A private-banking portal renders provider logos as monochrome marks; the colour load goes on the active session indicator, not on the picker.[ref-3][ref-6]
- **Deposit modal** does the right thing operationally — chain, token, amount, network fee, You deposit, Sign permit, Sign deposit. The voice is correct. The visual register is still soft chip and rounded box. Replace the rounded chip toggles for `USDC / USDT / EURC` with a tabular row labelled `Token` and the value in mono — this is a settlement instruction, not a token picker on a swap aggregator.[ref-2][ref-4]

### /not-found and /trade — pass-required (`trade--no-nft-pass.png`)

- **"PHASE 4 — CLOSED ACCESS / Pass required / Trading is gated to Phase-4 NFT pass holders."** The phase reference and the tone are correct. The padlock icon in a circle is decoration. A private-banking portal renders gated access with a one-line policy reference and a contact route — not a glyph. The "Learn about the pass" button should be `Request access` and route to a contact path, not a marketing page.

---

## Kill list — remove

1. **The decorative donut on /portfolio summary.** A two-slice ratio chart at hero scale is theatre. Replace with a horizontal allocation bar and a ranked notional list.[ref-3][ref-5][ref-6]
2. **`Pending` / `Settled` / `Proven` as adjacent pill chips.** Lifecycle is ordinal, not categorical. Demote chips to mono text with stage indicators.[ref-2][ref-9][ref-10]
3. **The duplicate `Type / Fee / Est. receive` strip inside the order form.** Restated below by the ExecutionContextStrip. Pick one home.[ref-2]
4. **The 25 / 50 / 75 / MAX row** on the institutional ticket. Treasury allocations are not a fraction of a wallet. Either label honestly as "Quick fractions of available balance" or remove for the institutional surface.[ref-2]
5. **The serif italic subheads** on /portfolio (`Matched, settled, and proved.`) and /account (`Wallet, preferences, session.`). Replace with a UTC timestamp and wallet identifier — that is the institutional subhead.[ref-3][ref-6][ref-9]
6. **The success-green tint on the Buy CTA and the destructive-red tint on the Sell CTA.** Colour belongs on the price cell, not on a celebration button. Aesop, Hermès, and Apple checkout buttons all use neutral primary actions.[ref-7][ref-8][ref-12] The Pump.fun school of green-buttons-as-celebration is precisely what a treasury allocator cannot tolerate — the platform is currently regulator-watched for gamified UX precisely because tinted action surfaces cue retail behaviour.[ref-11]
7. **The coloured M / W / C / B initials** on the wallet picker. Monochrome logo marks only.[ref-3][ref-6]

## Build list — add

1. **A contract header row at the top of every order ticket.** Format: `USDC/EURC · Buy USDC · Notional 10,000 USDC · Mid 0.9213 EURC · Settles Ethereum L1`. Static text in mono, no chrome. Marquee, J.P. Morgan Markets, and UBS execution dialogs all open with this kind of contract restatement before the action.[ref-2][ref-4][ref-6]
2. **A UTC timestamp band on every primary surface.** `As of 2026-04-27 09:00:14 UTC` rendered in mono, top-right, on /portfolio, /batches, /account, /trade. CAT-compliant institutional desks publish synchronised millisecond-precision timestamps because the firm is on the hook for them; Omega should adopt the same convention.[ref-9][ref-10]
3. **A full-contract CTA label.** `Sign · Buy 10,000 USDC at midpoint · Settle Ethereum L1` instead of `Buy USDC`. The button is the last legible chance to catch a wrong order before the wallet handoff. Marquee, J.P. Morgan Markets, and UBS dialogs print the contract on the action.[ref-2][ref-4][ref-6]
4. **Stage indicators in place of chip pills.** `1/4 Queued`, `2/4 Sealed`, `3/4 Proven`, `4/4 Settled` as a single mono span next to the UTC timestamp on every fill row — the same vocabulary the /batches detail page already establishes. Carry the pattern back from the strongest surface to the weakest.[ref-2][ref-9]
5. **Live links and click-to-copy on every hash.** The proof claim is the product. Marquee and Etherscan both treat hashes as primary actions; an inert `0xb7c8…f5a6` span is a wasted trust cue.[ref-2][ref-9]
6. **A neutral primary action on every CTA.** Replace tinted Buy/Sell CTAs with a Hermès / Aesop / Apple style neutral action — black on light, white on dark, no chromatic load. The colour cue lives on the price cell.[ref-7][ref-8][ref-12]
7. **A policy line on the gated-access surface.** Replace `Learn about the pass` with `Request access` and route to a contact path. Private-banking portals render gated states as policy references, not as marketing CTAs.[ref-3][ref-6]
8. **A Sabon / GS-Serif-equivalent line under the wordmark, used once per surface.** The current Source Serif 4 italic accent is in the right family but spent in the wrong places (subheads on portfolio, account). Spend it once — under the wordmark, as the venue's own line. Goldman uses the serif sparingly for headlines and short text blocks, never as a section subhead.[ref-1][ref-2]

---

## Verdict

The brand work is closer than it looks. The lexicon is correct. The /batches surface is correct. What's wrong is that the *trade* and *portfolio* surfaces are still wearing retail-DEX clothing — chip pills, percentage shortcuts, tinted action buttons, decorative donuts, italic mood lines. None of that survives a private-banking review. Strip those, carry the /batches register across the app, and the product reads as a venue.

The redesign in `redesign/order-form.tsx` is a surgical pass on the order ticket. Same component, same fields. Restated as a Marquee-style contract.

---

## References

- [ref-1] [Goldman Sachs Design System — Typography (GS Sans / GS Serif / Sabon)](https://design.gs.com/foundation/typography) — institutional design system that pairs a wide sans for tabular numerics with Sabon serif used sparingly for headlines and short text blocks. The vocabulary the institutional eye reads as serious.
- [ref-2] [Goldman Sachs Marquee — platform overview and order ticket pattern](https://marquee.gs.com/welcome/our-platform/overview) — institutional digital-finance posture: contract-header order tickets, customizable workspaces, blotters, real-time STP. The reference for what an institutional ticket reads like.
- [ref-3] [UBS Family Office and UHNW digital experience](https://www.ubs.com/global/en/wealthmanagement/family-office-uhnw/family-office-solutions.html) — wealth-management portals render allocation as ranked rows, audit anchors as UTC date stamps, and trust through restraint not chrome.
- [ref-4] [J.P. Morgan Markets — institutional platform](https://www.jpmorgan.com/markets) — five-pillar institutional platform with research, data, portfolio, pricing, post-trade. Recently overhauled for institutional users; sets the bar for layout that opens with the trade contract.
- [ref-5] [J.P. Morgan Markets — next-generation platform launch (FinTech Magazine)](https://fintechmagazine.com/news/jpmorgan-markets-launches-institutional-platform-overhaul) — explicit institutional design philosophy: reduce navigation time, surface the trade contract, prioritise efficient access over decoration.
- [ref-6] [Goldman Sachs Marquee — desktop product page (Marquee Trader)](https://marquee.gs.com/welcome/products/access-points/desktop) — the precedent for "ticket + blotter + audit row" composition; the institutional reference for how a desk surface should compose.
- [ref-7] [Hermès — quiet luxury and design restraint (Kantar analysis)](https://www.kantar.com/inspiration/agile-market-research/why-hermes-quiet-luxury-speaks-loudest) — material-confidence and saying-less-accomplishes-more as a marketing philosophy. The institutional finance equivalent is: let the order book speak, don't tint the button.
- [ref-8] [Aesop — typographic seriousness and apothecary register](https://fontsinuse.com/uses/20234/aesop-logo-website-and-packaging) — Suisse Int'l + Optima paired with calm utilitarian labels. Labels read like instructions, not slogans. The closest commercial-product analogue for what a darkpool ticket should read like.
- [ref-9] [FINRA Consolidated Audit Trail (CAT)](https://www.finra.org/rules-guidance/guidance/reports/2023-finras-examination-and-risk-monitoring-program/cat) — institutional audit-trail standard: every event timestamped to millisecond precision, synchronised to NIST UTC. The regulatory frame an institutional reviewer brings to any execution surface.
- [ref-10] [Trading Technologies — Audit Trail timestamp reference](https://library.tradingtechnologies.com/trade/at-reference.html) — sample of an institutional audit-trail file: ISO-8601 UTC, millisecond precision, sequencer identifier per row. The format a treasury reviewer expects to find inline on the ticket.
- [ref-11] [Pump.fun — economic and legal analysis (Storm Partners)](https://storm.partners/blog-post/meme-coin-mania-on-pump-fun-an-economic-and-legal-analysis) — *anti-reference with behaviour cost*. Pump.fun's gamified UX is now the explicit precedent regulators (MiCAR, U.S. AML/gambling) cite when treating tinted celebration UI as a compliance risk. A green-tinted Buy CTA is no longer cosmetically wrong — it is regulator-adjacent. A treasury allocator's compliance officer will not approve a venue whose action surface visually rhymes with Pump.fun.
- [ref-12] [Apple Human Interface Guidelines — clarity, hierarchy, deference](https://developer.apple.com/design/human-interface-guidelines/) — the third reference for neutral primary actions, sufficient text contrast, and adornments kept to a minimum. Used here as the high-trust product-clarity baseline.
