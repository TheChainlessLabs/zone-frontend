# Persona 09 — Arjun Mehta

## Top 3 observations

1. `/portfolio` spends the first scan on a large P&L curve, a serif line, and air; a trader account page should lead with balances, locked capital, open orders, fills, and cash movement in one glance. This is the wrong side of the Apple/Linear/Notion trade-off: attractive browsing chrome, slower state comprehension. [ref-13][ref-14][ref-15]
2. The app has decent dark-market tone, but it is still card-first instead of table-first. Arjun will tolerate visual restraint; he will not tolerate page-hopping or low-density account state. [ref-2][ref-5][ref-8]
3. `/batches` is closer to the target than `/portfolio`, because it already reads like an attestation log. `/trade` is serviceable, but `/portfolio` is the surface that currently undercuts the institutional claim. [ref-3][ref-6][ref-10]

## Page-by-page review

### /portfolio

The current page answers "how did the curve look" before it answers "what is my account doing." In the desktop screenshot, balances are hidden inside a side card, fills and transfers are split into separate cards, and the only dense object on the page is the number at top left; Kite, Yahoo Finance, and Excel all teach the opposite habit: keep account state in rows, keep cash movements visible, and keep headers anchored while the eye scans downward. [ref-1][ref-10][ref-12]

The donut summary is underpowered for this product. Koyfin's dashboards and watchlists push flexible columns, summary rows, and bespoke tables; thinkorswim's ladder and watchlists turn price, size, and working orders into aligned data planes; MetaTrader's Market Watch keeps bid, ask, spread, and last update in one strip of truth. Omega should treat balances the same way instead of hiding allocation inside a decorative radial. [ref-6][ref-8][ref-9]

The mobile version is worse because the bottom tab bar cuts through the summary card and the chart still eats the prime viewport. For a dense finance surface, mobile should degrade into stacked ledgers and pinned totals, not a miniature desktop hero. [ref-1][ref-11][ref-12]

### /trade

The limit screen has the right instinct: form left, context right, fills below. What is missing is trader-grade scan support around it: the form needs stronger keyboard and quick-action semantics, and the right rail should eventually act more like a watch/ladder companion than a placeholder chart slab. [ref-1][ref-4][ref-7]

The execution context strip is good product thinking, but the surrounding layout is still generous with spacing compared with the desks Arjun comes from. Zerodha's hotkeys, thinkorswim's Active Trader, and MetaTrader's DOM all assume the user is scanning and acting fast, so whitespace has to justify itself with information, not mood. [ref-1][ref-4][ref-7]

### /batches

This is the most convincing institutional surface in the app today. The list already behaves like a proof log, and that direction matches Koyfin's multi-view dashboards, Yahoo's customizable portfolio lists, and MetaTrader's market-watch habit of making state legible in rows before anything else. [ref-6][ref-10][ref-11]

I would still tighten it further: add sortable columns, keep the filter and page-size controls visually subordinate to the data, and let the row body carry more aggregate status without opening the detail page. That's the pattern from thinkorswim watchlists, Koyfin watchlists, and Excel freeze/fixed-grid behavior. [ref-3][ref-9][ref-12]

### /account

The account page is acceptable as a settings screen, but it is too verbose relative to the rest of the product. For this persona, `/account` should be low-frequency administration; the trading account state belongs on `/portfolio`, the way Yahoo keeps transactions and cash inside portfolio context and the way trading tools keep operational data near the active workspace. [ref-5][ref-10][ref-11]

## Kill list

- Remove the serif line from `/portfolio` and reclaim that slot for operational labels like account equity, available, locked, pending outflow, and proof-ready fills. [ref-2][ref-8][ref-10]
- Remove the oversized portfolio chart hero as the default top module; move performance history below the account-state grid or collapse it behind a range toggle. [ref-6][ref-10][ref-12]
- Remove the donut-only allocation summary card; token exposure needs a row model with available, locked, total, and share side by side. [ref-8][ref-9][ref-10]
- Remove the separation between fills and transfers as primary cards on first load; merge them into one compact activity ledger with type, status, amount, timestamp, and hash/proof reference columns. [ref-5][ref-10][ref-11]
- Remove any mobile composition where the bottom nav visually bisects high-priority account state. Dense finance mobile flows should protect the summary block first. [ref-1][ref-11][ref-12]

## Build list

- Add a top account-state strip with `equity`, `available`, `locked`, `open orders`, `pending withdrawals`, and `latest proof state` in one horizontal scan. This is the account analogue of Kite's shortcut-driven dashboard navigation, Koyfin's all-on-one-screen dashboard discipline, and Yahoo Finance's transaction-plus-cash portfolio model. [ref-1][ref-8][ref-10]
- Add a balances matrix with sticky header and compact rows: `token`, `available`, `locked`, `total`, `share`, `last movement`, `action`. Koyfin explicitly leans on configurable watchlist columns and summary rows, MetaTrader's Market Watch keeps quote fields aligned in a table, and Excel's freeze-panes model exists for exactly this sort of continuous row scanning. [ref-6][ref-9][ref-12]
- Add an open-orders blotter with sortable columns and stronger order metadata: `pair`, `side`, `type`, `limit/mid`, `amount`, `% filled`, `submitted`, `status`, `cancel`. thinkorswim's watchlists and Active Trader Ladder both normalize the idea that working orders live in the same scan plane as price data, and Zerodha's shortcuts show how often serious users bounce directly into orders and positions. [ref-1][ref-3][ref-5]
- Add a merged activity ledger for fills, deposits, and withdrawals with sticky header, compact rows, and direct hash/proof references. Yahoo Finance keeps transactions and cash management inside portfolio context, MetaTrader keeps time-and-sales and DOM close to execution, and Koyfin keeps reusable data tables at the center of the workflow. [ref-7][ref-8][ref-10]
- Add keyboard-scanning affordances on desktop: row focus states, quick filters, and shortcut hints for balances/orders/fills/search. Zerodha publishes explicit dashboard and order shortcuts, thinkorswim centers keyboardable watchlists and search, and Excel's locked panes are the spreadsheet expression of the same behavior: preserve orientation while the user moves fast. [ref-1][ref-3][ref-12]

## References

- [ref-1] https://support.zerodha.com/category/trading-and-markets/general-kite/others-kite/articles/keyboard-shortcuts
- [ref-2] https://zerodha.com/products/kite
- [ref-3] https://toslc.thinkorswim.com/center/howToTos/thinkManual/Left-Sidebar/Watch-Lists
- [ref-4] https://toslc.thinkorswim.com/center/howToTos/thinkManual/Trade/Active-Trader/AT-Overview-Layout?color=dark
- [ref-5] https://toslc.thinkorswim.com/center/howToTos/thinkManual/Trade/Active-Trader/AT-Ladder
- [ref-6] https://www.metatrader5.com/en/terminal/help/trading/market_watch
- [ref-7] https://www.metatrader5.com/en/terminal/help/trading/depth_of_market
- [ref-8] https://www.koyfin.com/features/custom-dashboards/
- [ref-9] https://www.koyfin.com/help/mywatchlists/
- [ref-10] https://help.yahoo.com/kb/SLN36784.html
- [ref-11] https://help.yahoo.com/kb/SLN28273.html
- [ref-12] https://support.microsoft.com/en-gb/office/freeze-panes-to-lock-rows-and-columns-dab2ffc9-020d-4026-8121-67dd25f2508f
- [ref-13] https://www.apple.com/
- [ref-14] https://linear.app/
- [ref-15] https://www.notion.com/product/wikis
- [ref-16] https://www.coinbase.com/
