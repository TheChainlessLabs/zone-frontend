## Priya Nair — review

### Top 3 observations

1. `/trade` still reads like a centered ticket demo, not a desk. In the current implementation, market mode is a narrow single column and limit mode just bolts a chart and fills table onto the side, so the workspace never settles into the fixed chart-ticket-history muscle memory that perp traders expect from dYdX, GMX, and Hyperliquid.[ref-1][ref-2][ref-3]

2. Market and limit are too similar where they should feel operationally different. Right now the same card survives both modes with one extra price field, but active traders expect market to be size-and-risk first while limit exposes resting-order controls, trigger logic, and follow-up management without making them hunt for another screen.[ref-2][ref-4][ref-5]

3. “Darkpool CLOB” is doing the hardest product work and you buried it in a tiny footer line. Private midpoint execution needs to be explained at the same hierarchy as price, fees, and fills or users will assume this is just a chart-first shell missing the order book.[ref-12][ref-13][ref-14]

### Page-by-page

#### `/trade`

The source makes the core problem explicit: `orderFormBlock` is shared across both modes and the page only changes width plus siblings, so the interface never teaches a durable active-trader layout.[trade/page.tsx](/Users/brianseong/Develop/Chainless/omega-interface/app/app/trade/page.tsx:138) A Hyperliquid or dYdX user expects the chart, ticket, and personal activity rails to stay pinned while the order mode changes inside the ticket, not the whole page geometry.[ref-1][ref-2][ref-3]

The pair switcher is too soft for a trading venue. It shows pair and midpoint, but not enough market context to justify a switch at speed, and the dropdown rows spend more visual weight on generic styling than on execution-critical clues like active mode, venue logic, or quick market stats.[pair-switcher.tsx](/Users/brianseong/Develop/Chainless/omega-interface/app/components/trade/pair-switcher.tsx:53) dYdX, GMX, and Backpack all frame pair selection as the first control in the trading stack, with immediate downstream consequences for order entry and open activity.[ref-1][ref-2][ref-6]

The ticket is under-instrumented. The current form has amount, percent buttons, a receive estimate, and a fee strip, but it omits the controls traders use to distinguish “cross now” from “rest intentionally”: slippage guardrails, reduce-only or close-only intent, post-only semantics for limit, and an obvious handoff into open orders after submission.[order-form.tsx](/Users/brianseong/Develop/Chainless/omega-interface/app/components/trade/order-form.tsx:127) That is why it feels more like a transfer widget than a perp ticket.[ref-2][ref-4][ref-6]

The detached execution strip is the wrong hierarchy. Midpoint, estimated receive, fee, and settlement are all useful, but pushing them below the card makes the ticket read like the whole story and turns the actual execution model into a footnote.[execution-context-strip.tsx](/Users/brianseong/Develop/Chainless/omega-interface/app/components/trade/execution-context-strip.tsx:21) GMX, Drift, and Hyperliquid all keep execution qualifiers tied directly to the order path so the user can price urgency versus control before clicking.[ref-2][ref-3][ref-4]

The limit-mode right rail is half right, half dead weight. “Your fills” is correct because darkpool products should show my activity, not public tape, but the placeholder chart literally announces it is unfinished and the stack lacks open orders, working orders, or position management, which is where limit-mode muscle memory actually lives.[your-fills.tsx](/Users/brianseong/Develop/Chainless/omega-interface/app/components/trade/your-fills.tsx:21) dYdX, Coinbase Advanced, and GMX all keep open orders and fills adjacent to the trade surface because resting liquidity without management is fake completeness.[ref-1][ref-2][ref-7]

The light theme is a miss for this persona. The mint CTA, soft shadows, and pale canvas make the trade page scan like Wise or a consumer balance flow, which costs speed because the eye no longer snaps to price, amount, and order state as the only things that matter.[ref-8][ref-9][ref-11]

#### `/portfolio`

This page is serviceable, but it is too hero-led for someone who came here to manage live risk. The giant PnL curve and serif line set the page up like a performance recap, while the open positions table gets pushed lower than it should for a perp-native user who expects position edit, close, and follow-up actions to dominate the first viewport.[ref-1][ref-2][ref-4]

The sticky summary card is useful, but it is optimized for holdings narration, not trading control. Vertex-style unified account context is the right instinct, yet Priya wants margin deployment, pending notional, and fill or batch linkage to snap into the same scan path as open positions.[ref-2][ref-4][ref-7]

#### `/batches`

The privacy stance is good and the list is readable, but this page currently feels more polished than the trade page, which is backwards. A trader can understand “verified, sealed, proof hash” quickly here, so the same clarity should migrate back into `/trade` as an execution-state module instead of living only in the public explorer.[ref-12][ref-13][ref-14]

#### Mobile

Mobile is acceptable as secondary coverage, but limit mode collapses into a long scroll where the ticket, execution strip, chart, and fills become separate chapters. That breaks the whole point of perp muscle memory; on mobile, the fix is not more cards, it is a compact sticky ticket and a tabbed lower panel for chart, open orders, and fills.[ref-1][ref-3][ref-7]

### Kill list

- Kill the centered “one pristine card in a lot of empty space” trade composition. That spacing language belongs to Vercel dashboards and transfer products, not to an execution surface that should keep adjacent context within one eye movement.[ref-9][ref-10][ref-11]
- Kill the detached four-cell strip under the ticket and fold execution context into the same rail as order entry. Traders should not have to read the page vertically to understand midpoint, fee, and settlement behavior.[ref-2][ref-3][ref-4]
- Kill the tiny privacy footer as the main explanation of darkpool behavior. “Orders match privately at midpoint” is core mechanism copy, not legalese-sized garnish.[ref-12][ref-13][ref-14]
- Kill the fake comfort of the light-mode trade canvas for this persona. It reads closer to Coinbase or Wise account flows than a venue where speed and certainty matter.[ref-8][ref-9][ref-11]
- Kill the “Chart wiring lands in M6” placeholder language on a live-looking page. If the chart is present, it needs to earn its slot; if it is not ready, replace it with a private-market module that explains match logic and working orders.[ref-1][ref-2][ref-12]

### Build list

- Build a fixed three-zone desktop trade layout: market strip and pair context on the left, midpoint chart plus private execution context in the center, and a sticky action rail on the right with the ticket on top and personal activity below. That is the closest fit to active-trader muscle memory without copying a public order-book venue one-for-one.[ref-1][ref-2][ref-7]
- Build materially different market and limit behaviors inside one ticket. Market should default to size, slippage guard, and estimated average execution; limit should add price, post-only or rest behavior, reduce-only intent, and immediate routing into working orders after submit.[ref-2][ref-3][ref-4][ref-6]
- Build a “Private midpoint execution” module directly under the chart header. It should explain three things in one scan: price references come from the midpoint, there is no public book on this surface, and only my fills and matched activity are visible here.[ref-12][ref-13][ref-14]
- Build a personal activity stack that prioritizes `Open orders`, `Positions`, and `Own fills` ahead of decorative context. dYdX, GMX, and Coinbase Advanced all teach the same lesson: once a trader submits, the next job is management, not admiring the page chrome.[ref-1][ref-2][ref-7]
- Build hot-path controls into the ticket instead of adding more explanatory copy elsewhere: quick notional presets, one-click midpoint for limit, slippage tolerance for market, and clear state labels for `working`, `matched`, `settling`, and `settled`.[ref-2][ref-4][ref-6]
- Build wrong-network and disconnected states that preserve the workstation frame instead of collapsing into a generic centered blocker. Hyperliquid, GMX, and Drift-trained users expect the venue to remain legible even when trading is gated; removing the frame makes the product feel brittle.[ref-2][ref-3][ref-4]

### References

- [ref-1] https://help.dydx.trade/en/articles/166979-interface-of-the-trade-tab
- [ref-2] https://docs.gmx.io/docs/trading/order-types/
- [ref-3] https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-types
- [ref-4] https://docs.drift.trade/protocol/trading/order-types
- [ref-5] https://docs.drift.trade/protocol/trading/order-types/advanced-order-types
- [ref-6] https://support.backpack.exchange/exchange-1/account-functions/order-types-and-executions
- [ref-7] https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/dashboard-overview
- [ref-8] https://help.coinbase.com/en-gb/coinbase/trading-and-funding/advanced-trade/what-is-advanced-trade
- [ref-9] https://wise.com/us/send-money/
- [ref-10] https://www.aave.org/help/supplying/supply-tokens
- [ref-11] https://vercel.com/docs/dashboard-features/overview
- [ref-12] https://renegade.fi/
- [ref-13] https://www.coinperps.com/learn/dark-pools-in-crypto-explained
- [ref-14] https://legalclarity.org/how-do-dark-pools-work/
