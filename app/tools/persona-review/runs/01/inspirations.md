# Daniel Cho — references

The pages I went back to. What I take from each.

## Institutional terminals

- [Bloomberg EMSX — fact sheet (PDF)](https://data.bloomberglp.com/professional/sites/10/2-EMSX-Fact-Sheet.pdf) — the order ticket pad. Side, quantity, order type on one row at the head of the form. Take: top-line execution row at the top of the trade ticket.
- [Bloomberg Order Management — product page](https://professional.bloomberg.com/products/trading/order-management-system/) — audit trail, settlement linking, IOI surfacing. Take: the L1 settlement hash on /batches detail is a link, not inert text.
- [Bloomberg Buy-Side Trader product page](https://www.bloomberg.com/professional/solutions/asset-management/buy-side-trader/) — institutional execution-quality monitoring. Take: visible execution-quality cells (midpoint, fee) belong below the form, not duplicated inside it.
- [LSEG Workspace](https://www.lseg.com/en/data-analytics/products/workspace) — institutional market-data hierarchy without consumer gloss. Take: ticker + price at largest weight, all metadata grey.

## Crypto-pro execution

- [Kraken Pro — trading interface guide](https://support.kraken.com/articles/kraken-pro-trading-interface-guide) — order form: pair top-left, buy/sell, order type, price+quantity, balance, advanced. Click-from-orderbook quick-fill. Take: `Use midpoint` shortcut promoted to a chip, same affordance as Kraken's bid/ask click-fill.
- [Kraken Pro — set prices for limit orders](https://support.kraken.com/articles/how-to-set-prices-for-limit-orders-on-kraken-pro) — Post Only toggle. Not for v1, but a hint that institutional traders expect explicit order-flag controls.

## Order lifecycle + status copy

- [CME Direct — order search and cancel; status colour conventions](https://www.cmegroup.com/tools-information/webhelp/cmeone-firmsoft/Content/Orders-Search-Cancel.html) — Working (yellow), Filled (green), Cancelled (red), Held (grey). Take: the four-stage `Queued -> Sealed -> Proven -> Settled` ring on /batches detail is correctly modelled — propagate the same vocabulary into /portfolio fill rows.
- [TWS API — Placing Orders + StatusEnum table](https://interactivebrokers.github.io/tws-api/order_submission.html) — PendingSubmit, PreSubmitted, Submitted, Filled, Cancelled, Inactive. Take: stages are real states, not chips. Decorative pill-rounding on `Settled` and `Proven` is wrong — render as a stage indicator.
- [TWS — order status colours user guide](https://www.interactivebrokers.com/en/software/tws/usersguidebook/realtimeactivitymonitoring/order_status_colors.htm) — colour-by-state, flat text + dot, not chip. Take: replace pill `Settled` with dot + text in /portfolio fill rows.
- [CME Group — what happens when you submit an order](https://www.cmegroup.com/education/courses/things-to-know-before-trading-cme-futures/what-happens-when-you-submit-an-order.html) — explicit confirmation copy on the submit step. Take: `Buy USDC` CTA is too thin — needs the order summary in the button.

## Charts + technicals

- [TradingView — layouts quick guide](https://www.tradingview.com/support/solutions/43000746975-tradingview-layouts-a-quick-guide/) — chart workspace as the default institutional surface. Take: Market mode without a chart breaks parity with Limit; widen Market or commit to a phone-only Market mode in copy.

## Anti-references — what we are not

- [Robinhood ditches confetti — Bloomberg, March 2021](https://www.bloomberg.com/news/articles/2021-03-31/robinhood-ditches-its-confetti-animation-following-criticism) — gamification killed institutional trust. Take: zero celebratory motion on order submit. The success state is a number, not a reaction.
- [Robinhood confetti — CNBC coverage of regulatory action](https://www.cnbc.com/2021/03/31/robinhood-gets-rid-of-confetti-feature-amid-scrutiny-over-gamification.html) — Massachusetts regulators explicitly cited the confetti. Take: regulatory exposure is the cost of any "delight" pattern on an execution surface.
