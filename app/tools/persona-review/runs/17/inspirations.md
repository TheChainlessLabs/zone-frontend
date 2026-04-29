# Inspirations — Grace Miller, Persona 17

Every recommendation in `critique.md` is sourced against one of these. Grouped by what the page is being asked to learn from.

## Order verification — the missing gate

- [Fidelity — Brokerage Handbook: Confirming, Reviewing, and Canceling Orders](https://www.fidelity.com/accounts/services/content/cancelorder.shtml) — what we take: a preview screen is the default, skipping it requires an explicit acknowledgement, and confirmation comes back with an order number. That's the contract.
- [Fidelity — Standard Trade Ticket help](https://www.fidelity.com/products/atbt/help/ActiveTraderTools_Trade_Help.html) — what we take: the ticket reads back side, symbol, quantity, type, price, and time-in-force in one block before any "Place order" button is live.
- [Schwab — StreetSmart Pro Order Verification](https://help.streetsmart.schwab.com/pro/4.36/content/Order_Verification_SSP.htm) — what we take: a separate verification window between submit and send, with explicit copy that turning it off "immediately submits without a verification screen". Omega's missing this rail.
- [Schwab — Order Warning Messages](https://help.streetsmart.schwab.com/pro/4.32/Content/Order_Warning_Messages.htm) — what we take: stateful warnings that fire on suspicious sides (selling without holdings, oversized notional, price far from last). Treat these as their own surface, not a toast.
- [E*TRADE — Power E*TRADE Pro Placing Trades](https://us.etrade.com/platforms/power-etrade/pro/how-to/placing-trades) — what we take: order preview reflects commissions, fees, credit/debit, and resulting buying power before submit. Omega shows fee but not "what your balance looks like after this fills".
- [Schwab — Trading Tools: Avoiding Mistakes](https://www.schwab.com/learn/story/trading-tools-avoiding-mistakes) — what we take: tooling itself is a risk control. Educates the reader that confirm flows are not friction; they are insurance.

## Plain-language education the trader actually wants

- [Investor.gov — Types of Orders (SEC, Office of Investor Education)](https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders) — what we take: regulator's own one-paragraph definitions of market vs limit. Omega should match that ceiling on jargon.
- [Schwab — 3 Order Types: Market, Limit, and Stop](https://www.schwab.com/learn/story/3-order-types-market-limit-and-stop-orders) — what we take: educational content that lives one click from the order ticket, not three menus deep.
- [Schwab — Mastering Order Types: Limit Orders](https://www.schwab.com/learn/story/mastering-order-types-limit-orders) — what we take: the page is allowed to say "you are choosing price control over guaranteed execution". A retail trader can read that. Omega's "Limit price" label can do better than zero context.
- [Investopedia — translated entry on Order](https://www-investopedia-com.translate.goog/terms/o/order.asp?_x_tr_sl=en&_x_tr_tl=hi&_x_tr_hl=hi&_x_tr_pto=tc) — what we take: glossary-grade plain definitions, surfaced as tooltips on the trade page.
- [Cboe Europe — Dark & Hidden Liquidity (BATS Europe Dark Pool PDF)](https://cdn.cboe.com/resources/participant_resources/BATSEuro_DarkPool.pdf) — what we take: the exchange itself defines a "midpoint non-displayed order book" and explains why it exists. Omega's batches page can borrow that line.
- [Cboe / market microstructure — Bartlett & McCrary, Dark Trading at the Midpoint (NYU Stern)](https://www.stern.nyu.edu/sites/default/files/assets/documents/2%20Bartlett%20and%20McCrary%20Shall%20We%20Haggle.pdf) — what we take: there is published research on midpoint pricing rules. We can cite it instead of asserting "anonymous, verifiable" with no anchor.
- [Chainlink — What Is a Trusted Execution Environment (TEE)?](https://chain.link/article/trusted-execution-environment-tee) — what we take: a 60-word reader-friendly definition of TEE attestation. Use that exact register on the batches page, not "TEE attestation generated".

## Portfolio clarity

- [Morningstar — Holdings Tab help](https://www.morningstar.com/help-center/portfolio/holdings-tab) — what we take: a portfolio surface organises by purpose first (Summary, Gain/Loss) and lets the user drill into holdings second. Omega's portfolio leads with a chart and a dollar number; it should lead with what's deployed vs available, then chart.
- [Morningstar — X-Ray Holdings Breakdown (2025)](https://www.morningstar.com/whats-new/x-ray-holdings-breakdown) — what we take: the breakdown by category sits on the same page, not a separate tab. Capital deployed vs locked vs available belongs co-located with positions, which Omega's "Summary" card already does — but the labels need definitions.
- [Marotta on Money — How to Read a Schwab Trade Confirmation](https://marottaonmoney.com/how-to-read-your-schwab-trade-confirmation-summary/) — what we take: a third-party advisor walking through what's on a trade confirmation. The fact that this exists means even Schwab's confirmations aren't fully self-explanatory; mine will not be either, so I need on-page glossary affordances.

## Anti-references — behaviour-cost framing

- [GMX gov forum — Interface issues thread](https://gov.gmx.io/t/interface-issues/4530) — behaviour cost: when even GMX's own community files a thread about confusion, it's a sign the platform is filtering by patience, not by competence. Omega is heading the same way with "no NFT pass" walls and unexplained "batches".
- [Coin Bureau — Hyperliquid Review 2026](https://coinbureau.com/review/hyperliquid-review) — behaviour cost: Hyperliquid is described as "intimidating for beginners" because the team came from a quant trading background and wrote the UI for themselves. Omega is risking the same: a TradFi-fluent retail trader looks at "Phase 4 — Closed access · Pass required" and bounces. Words exclude before they invite.
- [Wikipedia — Knight Capital Group, August 2012 trading disruption](https://en.wikipedia.org/wiki/Knight_Capital_Group) — behaviour cost: $440M lost in 45 minutes because pre-trade controls were inadequate. The retail-trader version of this is one wrong-side click. Omega has zero pre-submit verification surface today; that's the lesson the Knight case exists to teach.
- [Henrico Dolfing — Case Study: $440M Software Error at Knight Capital](https://www.henricodolfing.ch/en/case-study-4-the-440-million-software-error-at-knight-capital/) — behaviour cost: same incident, walked through as engineering process failure. The product equivalent is shipping an order ticket without a confirmation modal as the default.
- [SEC — SEC Charges Knight Capital With Violations of Market Access Rule](https://www.sec.gov/newsroom/press-releases/2013-222) — behaviour cost: the regulator's enforcement action is the why behind every preview screen on every retail brokerage in the country. We don't redo that work; we copy it.
- [Wikipedia — Fat-finger error](https://en.wikipedia.org/wiki/Fat-finger_error) — behaviour cost: the term itself is industry. A trade page without a verification step is a fat-finger machine.
- [FINRA — Regulatory Notice 21-23 (Best Execution and Order Handling)](https://www.finra.org/rules-guidance/notices/21-23) — behaviour cost: the regulatory baseline retail traders have been trained on for two decades. Omega's "infrastructure not a bank" framing is fine; the behaviour the trader expects from a trading surface is not.

## Voice / language register

- [Fidelity — Trading FAQs: Placing Orders](https://www.fidelity.com/trading/faqs-placing-orders) — what we take: declarative, second-person, no exclamations. "Once your order is placed, an order confirmation screen with your order number is displayed." That's the register.
- [Fidelity — Trading FAQs: Order Types](https://www.fidelity.com/trading/faqs-order-types) — what we take: defines every order type at the top, then walks through edge cases. The trade page does not need to repeat all of this, but a tooltip per term is non-negotiable.
