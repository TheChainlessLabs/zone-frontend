# Perp DEX speed

- https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-types
  What we take: market means now, limit means price control, no fuzzy copy around it.
- https://hyperliquid.gitbook.io/hyperliquid-docs/trading/portfolio-graphs
  What we take: portfolio state is tied to account value and P&L horizons, but sampled graphs still need sharper event feedback around deposits and withdrawals.
- https://www.bybit.com/en/help-center/article/FAQ-Order-Execution--Liquidation
  What we take: execution choices are framed as speed versus control, with concrete failure modes like delay, partial fill, or no fill.

# LATAM fintech

- https://blog.nubank.com.br/pix-em-processamento-o-que-isso-significa/
  What we take: when instant breaks, say why and say what happens next.
- https://support.bitso.com/hc/en-us/articles/33725399989396-Deposits-and-crediting
  What we take: crediting windows, same-day cutoffs, and rejection recovery should sit in plain view.
- https://support.bitso.com/hc/en-us/articles/9649039148692-Send-funds-with-Bitso-Transfer-through-the-app
  What we take: instant send flows earn trust when the product says the transfer was sent immediately and leaves a receipt trail.
- https://wise.com/help/articles/2977947/how-do-i-track-my-transfer
  What we take: activity list plus current step plus delay notice. No mystery gap.

# Order lifecycle

- https://www.bybit.com/en/help-center/article/The-differences-between-trade-history-and-order-history/
  What we take: split order state from executed-trade state so the user never confuses “open” with “filled”.
- https://www.mercadopago.com.br/developers/pt/docs/checkout-api-payments/response-handling/query-results
  What we take: approved, in process, pending capture, retry later. State names are operational, not decorative.
- https://www.mercadopago.com.br/ajuda/identificacao-pagamento-meu-comprador_548
  What we take: “ship only when approved” is hard gating. Omega should be equally explicit about when funds are actually settled.
- https://global-selling.mercadopago.com/help/36476
  What we take: money available later is still a first-class state, with an exact release date.

# Charts and activity

- https://www.bybit.com/en/announcement-info/order-summarize/
  What we take: order tools stay attached to execution logic, not separated into passive reporting.
- https://www.mercadopago.com.br/developers/pt/docs/woocommerce/payment-status
  What we take: map backend payment state to user-facing state cleanly and predictably.

# Anti-references

- https://cowswap.mintlify.app/cow-swap/tutorials/limit
  What we take: good mechanism, bad feeling for Rafael. If users can hit the price and still wait because fees or solver conditions are unresolved, the UI must work twice as hard to show motion.
- https://www.notion.com/help/optimize-database-load-times-and-performance
  What we take: when the vendor itself explains that more pages, properties, filters, and rollups slow things down, that is the exact document-software drag this trading UI must avoid.
