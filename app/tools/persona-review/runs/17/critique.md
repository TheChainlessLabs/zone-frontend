# Critique — Grace Miller, Persona 17

Forty-five years old, eighteen of them on the CME floor, twelve more teaching retail traders not to lose their savings. I read this like an order ticket on a brokerage platform — because that's what your customers will read it as, whether you intended it or not. Plain talk follows.

## Top three observations

1. **There is no order verification step before you spend a stranger's money.** The trade page submits straight from a green "Buy USDC" button to a confirmation modal that exists in the codebase but is not wired as a hard gate the user has to read; every retail brokerage that survived the last twenty years builds this rail because of incidents like Knight Capital's $440M error in 45 minutes [ref-1][ref-2][ref-3].
2. **The product talks to me in DeFi vocabulary it has not earned the right to use.** "Batch", "TEE attestation generated", "Pass required · Phase 4 — Closed access", "Sign permit" — none of these are defined where they appear, and a sophisticated retail trader will read them as either marketing or a wall [ref-4][ref-5][ref-6].
3. **The error and access states are decorative, not educational.** "Trading is gated to Phase-4 NFT pass holders. The connected wallet does not hold a pass." is a sentence; it is not an answer to "what is this product, what is the risk, and what do I do next" [ref-7][ref-8][ref-9].

## Page-by-page

### /trade — Market and Limit

The order ticket is laid out cleanly enough. The problem is what's missing, not what's there.

- No preview/verification screen between the form and the network. Fidelity, Schwab, and E\*TRADE all default to a preview that re-states side, symbol, quantity, price, type, fees, and resulting buying power before the order is sent — and they require an explicit acknowledgement to disable it [ref-1][ref-2][ref-3]. `OrderConfirmationModal` exists in the repo but the spec calls it a "review", not a verification. Promote it. Wire it in by default. Make the disable path require a typed acknowledgement, not a settings toggle. (Schwab's own copy is explicit that turning it off "immediately submits without a verification screen" [ref-1] — that sentence is the safety contract.)
- "Limit price" has no tooltip. A retail trader knows what a limit order is in equities; she does not necessarily know what your limit means against an off-exchange midpoint book. Investor.gov, Schwab Learn, and Investopedia all define this in two sentences [ref-10][ref-11][ref-12]. Borrow the language.
- "Orders match privately at midpoint." is a footer line. Midpoint is a defined term — Cboe Europe's own dark-pool brief calls it "a separate midpoint non-displayed order book" [ref-13] and there is published research on the pricing rule [ref-14]. Link the word. Don't make me earn it.
- The big green "Buy USDC" button is the same green as the "Buy" side toggle. On a Sell, the button turns red and the toggle stays subtle. That asymmetry is fine — but the button should also reprint side and pair in the label and disable until the verification gate has been satisfied. Schwab's order warnings explicitly fire when something looks off (selling without holdings, oversized notional, price far from last) [ref-15] — Omega should treat the same conditions as warning-tier copy on the verification screen, not silent submits.
- "Available 10000.00 USDC" is right-aligned in mono, which I respect. But the percentage shortcuts (25 / 50 / 75 / MAX) are sized identically to permanent affordances. On a touch-error or a fat-finger they spend my whole balance with one tap. Put MAX behind a confirm step or visually demote it [ref-16][ref-3].
- "You receive — " with an em-dash is a placeholder, not a state. When it's empty, say "Enter an amount". When it's calculated, also state the implied price ("at 0.9213 EURC per USDC") so the trader can sanity-check direction before submit [ref-2][ref-17].

### /trade — Pass-required + wrong-network

- "Pass required · Phase 4 — Closed access" is the entire screen. There is no link out to what Phase 4 means, no waitlist, no "this is a permissioned launch and here is the safety reason". A TradFi retail trader reads this and assumes either a marketing gate or a regulatory one — both interpretations cost trust. Schwab's education content treats every restriction as an opportunity to teach why it exists [ref-16][ref-9]. Do that.
- "Wrong network. You're on Base. Switch to Ethereum mainnet to continue." is the cleanest copy on the site. Keep it. Add one sentence explaining what happens on the wrong network — "no orders will route" — so the user knows whether she lost money in the seconds before noticing [ref-2][ref-3].

### /portfolio

- The hero number `$47,213.40` over a red line chart with `-$1,659.75 · -3.40%` reads like a Schwab balance — that's the right register. Keep it.
- "Matched, settled, and proved." italic deck is poetic. It is not a definition. Morningstar's portfolio surface always pairs a label with a definable behaviour [ref-18][ref-19]; "proved" needs a one-line tooltip ("each batch ships with a proof published on Ethereum L1, viewable in /batches"), not a brand voice flourish.
- "Capital deployed 2.6%" with a thin progress bar is good. "Locked $1242.40" without explaining what locked means against an off-chain match-engine is not. A retail trader will assume "locked" = "stuck". Define it where it lives [ref-18][ref-20].
- The donut chart of USDC vs EURC has no legend on hover and no per-position P&L. Morningstar's holdings tab is the floor here [ref-18].
- "Recent fills · OWN BATCH ONLY" is a privacy claim disguised as a UI label. State it as a sentence: "Only your fills are visible. Your counterparties can't see them either." That's the explainer that closes the trust gap.

### /batches and /batches/:id

- "Sealed settlement batches with on-chain attestation. Public, verifiable." — three nouns, one adjective each. Cboe and Investor.gov manage the same intent in full sentences [ref-13][ref-10]. So can we.
- "Each row is a sealed batch with its on-chain proof state. Counterparty information is by design absent from this surface." — "by design" is engineer voice. Replace with "Counterparty identities are never written to this page or to the chain." That is the property a retail trader can repeat to her advisor.
- The detail page leads with "STAGE 4/4" inside a green ring, then the four stage labels (QUEUED → SEALED → PROVEN → SETTLED) each with a one-line description. Good — this is the best UI on the site. The two improvements: (a) link "TEE attestation" to a definition page on first hit, every session [ref-4]; (b) put a "What is a batch?" link beside the page title [ref-13].
- "Externally verifiable" footer says "Anyone can verify this batch's proof on-chain. Individual fills are visible only to their counterparties — see /portfolio." That's the right register. Apply it everywhere else.

### /account, modals (Connect / Deposit / Withdraw)

- The Connect modal's three-step "no NFT pass" state shows a generic message — same problem as the page-level wall. Add the why.
- The Deposit modal's "Network fee $0.42" + "You deposit 0.00 USDC" pattern is fine; "Sign permit" / "Sign deposit" buttons need plain-language helpers ("Sign permit lets Omega move USDC from your wallet to the bridge contract — one-time per token") [ref-21]. The brand voice says use "Sign", which is fine; the content next to it must explain what is being signed.

## Kill list

- Kill the practice of submitting an order without a verification step that the user must read [ref-1][ref-2][ref-3].
- Kill the orphan term "TEE attestation generated" without an inline definition or link [ref-4][ref-5].
- Kill the "Phase 4 — Closed access · Pass required" wall in its current form. Replace with a paragraph that explains why access is gated, what the safety reason is, and what changes when access opens [ref-9][ref-16].
- Kill the equal visual weight of `MAX` against `25/50/75`. MAX is a different action class [ref-3][ref-16].
- Kill "Matched, settled, and proved." as an undefined italic deck on /portfolio. Promote to plain copy with a definition tooltip on `proved` [ref-18][ref-19].
- Kill the bare em-dash placeholders ("You receive —", "EST. RECEIVE —"). Replace each empty state with a one-line instruction or a calculated reference price [ref-2][ref-17].

## Build list

Each item names what to add, where, and the precedent it leans on.

1. **Order verification gate, default-on, hard to disable.** Wire `OrderConfirmationModal` into `/trade` as a required step on every submit. Default copy: "Verify your order. Side, pair, amount, price." Disable path requires typing the word "skip" once per session, not a quiet toggle [ref-1][ref-2][ref-3].
2. **Pre-submit warnings panel.** When the order is reviewed, surface any of the following as their own row, in plain English: notional > 25% of available; price more than 50 bps from the live midpoint; selling more than the BASE wallet balance; using midpoint type after the limit-price field was edited. Schwab fires order warnings on the same triggers [ref-15].
3. **Glossary tooltips on first occurrence per session.** Every term in this lexicon: `Limit price`, `Midpoint`, `Batch`, `Sealed`, `Proved`, `Settled`, `TEE attestation`, `Sign permit`, `Capital deployed`, `Locked`. Each tooltip ≤ 30 words, sourced from a single defined glossary page. Investor.gov, Schwab Learn, Cboe, and Chainlink's TEE explainer all do this in production [ref-10][ref-11][ref-13][ref-4].
4. **A `/learn` (or `/glossary`) sub-route, one page, no marketing.** Anchored definitions for every term above, plus "what is Omega doing differently from a regular DEX". Schwab Learn is the model — it lives one click from the order ticket [ref-11][ref-22].
5. **Order receipt with an order ID after submit.** Fidelity calls this out explicitly: "an order confirmation screen which contains your order number and details will be displayed" [ref-2]. Omega has the data; it does not have the receipt artefact.
6. **Pre-execution buying-power read-back.** Show the trader what her available + locked balance will look like after this order matches, not just the fee. E\*TRADE's preview shows "the resulting cash and margin buying power values should the order fill" [ref-3]. Same idea, simpler payload here.
7. **Phase-gate explainer page.** Replace the wall with a page that says: who can trade today, why, what's coming, what to do in the meantime, and a link to the audit / risk model. The retail trader cares about safety justification, not exclusivity [ref-9][ref-16].
8. **Reduce-motion + reduce-pattern audit.** The dot-grid is fine on a desktop calm hour; check that no part of the trade ticket flashes during a state change. Schwab's own trading-mistake guide makes the point that the tooling itself is a risk control [ref-16] — that includes visual stability.

## References

- [ref-1] [Schwab — StreetSmart Pro Order Verification](https://help.streetsmart.schwab.com/pro/4.36/content/Order_Verification_SSP.htm)
- [ref-2] [Fidelity — Brokerage Handbook: Confirming, Reviewing, and Canceling Orders](https://www.fidelity.com/accounts/services/content/cancelorder.shtml)
- [ref-3] [E\*TRADE — Power E\*TRADE Pro Placing Trades](https://us.etrade.com/platforms/power-etrade/pro/how-to/placing-trades)
- [ref-4] [Chainlink — What Is a Trusted Execution Environment (TEE)?](https://chain.link/article/trusted-execution-environment-tee)
- [ref-5] [Coin Bureau — Hyperliquid Review 2026 (intimidating for beginners)](https://coinbureau.com/review/hyperliquid-review)
- [ref-6] [GMX gov forum — Interface issues thread](https://gov.gmx.io/t/interface-issues/4530)
- [ref-7] [Wikipedia — Knight Capital Group, August 2012 disruption](https://en.wikipedia.org/wiki/Knight_Capital_Group)
- [ref-8] [Henrico Dolfing — $440M Knight Capital Software Error case study](https://www.henricodolfing.ch/en/case-study-4-the-440-million-software-error-at-knight-capital/)
- [ref-9] [SEC — Press Release: SEC Charges Knight Capital With Violations of Market Access Rule](https://www.sec.gov/newsroom/press-releases/2013-222)
- [ref-10] [Investor.gov (SEC OIEA) — Types of Orders](https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders)
- [ref-11] [Schwab — 3 Order Types: Market, Limit, and Stop](https://www.schwab.com/learn/story/3-order-types-market-limit-and-stop-orders)
- [ref-12] [Schwab — Mastering Order Types: Limit Orders](https://www.schwab.com/learn/story/mastering-order-types-limit-orders)
- [ref-13] [Cboe Europe — Dark & Hidden Liquidity (BATS Europe Dark Pool, PDF)](https://cdn.cboe.com/resources/participant_resources/BATSEuro_DarkPool.pdf)
- [ref-14] [Bartlett & McCrary — Dark Trading at the Midpoint (NYU Stern)](https://www.stern.nyu.edu/sites/default/files/assets/documents/2%20Bartlett%20and%20McCrary%20Shall%20We%20Haggle.pdf)
- [ref-15] [Schwab — Order Warning Messages (StreetSmart Pro)](https://help.streetsmart.schwab.com/pro/4.32/Content/Order_Warning_Messages.htm)
- [ref-16] [Schwab — Trading Tools: Avoiding Mistakes](https://www.schwab.com/learn/story/trading-tools-avoiding-mistakes)
- [ref-17] [Fidelity — Standard Trade Ticket help](https://www.fidelity.com/products/atbt/help/ActiveTraderTools_Trade_Help.html)
- [ref-18] [Morningstar — Holdings Tab help](https://www.morningstar.com/help-center/portfolio/holdings-tab)
- [ref-19] [Morningstar — X-Ray Holdings Breakdown (2025)](https://www.morningstar.com/whats-new/x-ray-holdings-breakdown)
- [ref-20] [Marotta on Money — How to Read a Schwab Trade Confirmation](https://marottaonmoney.com/how-to-read-your-schwab-trade-confirmation-summary/)
- [ref-21] [Fidelity — Trading FAQs: Placing Orders](https://www.fidelity.com/trading/faqs-placing-orders)
- [ref-22] [Fidelity — Trading FAQs: Order Types](https://www.fidelity.com/trading/faqs-order-types)
- [ref-23] [FINRA — Regulatory Notice 21-23 (Best Execution and Order Handling)](https://www.finra.org/rules-guidance/notices/21-23)
- [ref-24] [Wikipedia — Fat-finger error](https://en.wikipedia.org/wiki/Fat-finger_error)
