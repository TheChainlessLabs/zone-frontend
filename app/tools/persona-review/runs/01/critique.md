# Daniel Cho — Omega interface review

Senior FX execution trader. Korean pension fund. Bloomberg + CME Direct + IBKR TWS user. I run six-figure stablecoin hedges on a four-monitor desk in Seoul.

I looked at the screenshots, the order-form source, and the live build. I was given 45 minutes; I used 30.

---

## Top 3 observations

1. **The trade ticket has no top-line execution row.** Side, pair, size, limit price, midpoint, est. receive — these belong in one horizontal strip at the head of the ticket. Today they are scattered across six vertical sections. Bloomberg's EMSX puts buy/sell, quantity, and order type on a single row of the ticket pad; I don't get that here. [ref-1][ref-3]
2. **Market mode wastes the screen and leaves no execution context.** A 480px column floating in a black void on a 1440px desktop is a phone layout. No chart, no recent fills, no spread reference, no current midpoint sparkline. Limit mode is correct in shape; Market mode should match. [ref-4][ref-5]
3. **`Pending` / `Settled` / `Proven` are decorative chips, not a lifecycle.** Per /portfolio I see `Settled` and `Proven` sitting next to each other on the same row with identical visual weight. They are not equivalent; `Proven` is a proper superset. The /batches detail page handles this correctly with the 4-stage ring (Queued -> Sealed -> Proven -> Settled). The portfolio surface should adopt the same lifecycle vocabulary, not chip-grade colour swatches. [ref-2][ref-6]

---

## Page-by-page

### /trade — Market (`trade--connected-market.png`)

This is my battleground. It fails the one-glance test.

- **Pair switcher** sits alone in a 720px-wide pill at the top. Fine, but the midpoint inside it (`0.9213`) is rendered at the same weight as the ticker label. On Bloomberg the price is the largest cell on the ticket because that's what your eye lands on first. [ref-1]
- **Buy / Sell toggle** is two equal pills side by side. Buy is currently green-tinted, Sell ghosted. That implies state, not selection. CME Direct uses a single explicit toggle with the side colour-locked into the price cell — when you flip Sell, the colour of the price area flips with it. That's the kind of visual lock-in I want. [ref-2]
- **Amount input** is `0.00` with `USDC` in the right gutter. No "Sell USDC -> receive EURC" directionality on the field. The unit on the right needs to read with the side. [ref-2]
- **`Available 10000.00 USDC`** is on the right of the Amount header, in `font-mono text-[10px]`. That is the most important number in the form for risk and it's the smallest. Robinhood does this same thing — small available balance, big "buy" button. I don't trust this. [ref-7]
- **`You receive` row** with em-dash until you enter a number is fine, but the value formatting drops to `font-mono text-sm` while the input field is `text-2xl`. Receive has to be at least the same weight as the amount. That's the only number that matters at execution time. [ref-1][ref-3]
- **`Type / Fee / Est. receive` strip** under the CTA repeats info from the ExecutionContextStrip below. Two strips, four cells each, redundant. Pick one. [ref-9]
- **`Buy USDC` CTA** at full width, full success-green. The colour load is correct, the label is wrong. CME Direct labels the confirmation button `Submit` or `Send Buy 1 ESH4 @ 4500.00 LMT` — verb + asset + side + size + price. `Buy USDC` tells me nothing the toggle didn't. [ref-2]
- **`Orders match privately at midpoint.`** — fine line, kept it. Don't lose this.

### /trade — Limit (`trade--connected-limit.png`)

Better. Two-column layout works. The chart placeholder is honest. Comments:

- **Limit price** with `Use midpoint` shortcut on the right is correct. Kraken Pro has the equivalent bid/ask quick-fill, this is the institutional version of it. [ref-4]
- **`Use midpoint`** is in a 10px uppercase mono, almost invisible. It's the most useful shortcut on the form. Make it a chip. [ref-4]
- **Cyan `Limit price` label** vs every other label being grey-700 — the cyan is doing nothing. If cyan means "precision-strong accent" per the source comment, then it should appear on the actual price cell, not the label.
- **Your fills** table on the right is the correct primitive — Side / Pair / Amount / Price / Status / Matched columns. The hierarchy is right. The `Settled` and `Matched` chips are too round and too pill-shaped. TWS uses flat status text with a colour dot, not a button. [ref-3]

### /portfolio (`portfolio--default.png`)

Good bones. The headline `$47,213.40` and the `-$1,659.75 / -3.40% today` row read cleanly. The chart is honest — single-line P&L curve, not a candle wall.

- **`Matched, settled, and proved.`** italic Source Serif 4 line under PORTFOLIO is the only piece of decorative typography I tolerate on this page. It works because it functions as a section subhead, not a marketing slogan. Keep it.
- **Open positions** row shows `5000.00 @ 0.9215  12%  Pending`. The `12%` is a fill percentage. It's not labelled anywhere. I have to guess. Bloomberg's open-orders pane has explicit column headers above the row. [ref-1]
- **Recent fills** row shows `Settled` and `Proven` as separate chips on adjacent rows. These are not parallel states. `Proven` implies the batch was both sealed and the TEE attestation generated; `Settled` implies on-chain. Either show the full 4-stage progression on every fill, or collapse to one canonical state per row. The current rendering is misleading. [ref-6][ref-9]
- **Summary card** with the donut and `Capital deployed 2.6%` is fine. The donut is too large for the data — two slices at this scale is theatre. A 24px progress bar would carry the same information. [ref-1]

### /batches (`batches--default.png`, `batches-detail--verified.png`)

This is the strongest surface in the build. The 4-stage `Queued -> Sealed -> Proven -> Settled` ring on the detail page is the right model. The list rows are dense, the proof hashes are exposed, the `Externally verifiable` line at the bottom is the right institutional reassurance.

- **List row** — `Verified` chip, `Batch #4821`, fills/orders/notional, pair tags, `0s sealed`, `proof 0xb7c8...f5a6`. This row is good. I read it in one glance. Don't touch.
- **Detail page** — the stage ring `2/4` for pending, `4/4` for verified is the right execution-lifecycle visual. The `DONE / WAITING` pattern at each stage is direct, no copy padding.
- **`Anchored on Ethereum L1`** under SETTLED is the right level of detail. The `Externally verifiable` footer reads as institutional trust copy, not marketing fluff. [ref-2][ref-6]
- One nit — `0xa1b2c3d4...2b3c4d5e` is the L1 settlement hash. It needs to be a link, not a span. Etherscan link, click-to-copy, both. That's the proof and it's currently inert. [ref-6]

---

## Kill list — remove

1. **The duplicate `Type / Fee / Est. receive` strip inside the order form.** Everything in it is restated in the ExecutionContextStrip below. Pick one home — I'd put it below the form. [ref-9]
2. **Cyan `Limit price` label.** Either the accent moves onto the price value or the cyan goes. As a label-only colour it's noise. [ref-3]
3. **`Buy USDC` button label.** Replace with the explicit order summary the user is signing. [ref-2]
4. **The decorative donut on /portfolio summary.** Two-slice donut at that scale is theatre. Replace with a horizontal ratio bar or drop it. [ref-1]
5. **`Pending` / `Settled` / `Proven` as side-by-side chip variants of equal weight.** These are stages, not categories. Render them as a stage indicator. [ref-6]
6. **The 480px-on-1440px Market layout.** Either widen Market to match Limit, or accept Market mode is mobile-first and own that decision in copy.

## Build list — add

1. **One-line execution summary row at the top of the trade ticket.** Format: `BUY  USDC/EURC  Mid 0.9213  Available 10,000 USDC`. Mono, tabular, large enough to read at desk distance. Bloomberg EMSX puts buy/sell, ticker, and quantity on one row at the top of the order pad. [ref-1][ref-3]
2. **Side-coloured price cell.** When Buy is active, the limit-price cell border tints success-green; when Sell, destructive-red. Visual lock-in between side and price. CME Direct does this. [ref-2]
3. **Order summary in the CTA.** `Submit · Buy 1,000 USDC at 0.9213 EURC · Fee 0.005%`. The button is the last legible chance to catch a wrong order before it ships. [ref-2]
4. **Keyboard hotkeys.** `B` = Buy, `S` = Sell, `M` = midpoint, `Enter` = submit, `Esc` = cancel. TWS exposes these and traders use them. The form already has the radiogroup semantics; wire the keys. [ref-3]
5. **Stage indicator on every fill row.** A 4-dot mini-ring (Queued · Sealed · Proven · Settled) per fill, not a single chip. Same vocabulary as /batches detail — the user learns the lifecycle once and reads it everywhere. [ref-6]
6. **Make the L1 settlement hash a link.** Etherscan + copy. The proof claim is the product; the hash needs to be live. [ref-6][ref-8]
7. **Available balance promoted.** Same weight as the amount input value, positioned directly above the input, not as a 10px tracker on the label row. Risk lives there. [ref-1][ref-3]

---

## Verdict

The current build is close and the /batches surface earned its keep. The trade ticket needs a surgical pass — I've spec'd it in `redesign/order-form-daniel.tsx`. It's not a rebuild. It's the same component with the cells reordered, the summary row added, the colour lock-in wired, and the CTA copy made honest.

Don't add features. Anchor what's there.

---

## References

- [ref-1] [Bloomberg EMSX — Execution Management System fact sheet](https://data.bloomberglp.com/professional/sites/10/2-EMSX-Fact-Sheet.pdf) — institutional ticket pad, side+quantity+order-type on one row, IOI integration, execution-quality monitoring.
- [ref-2] [CME Direct — Order status colour conventions and lifecycle](https://www.cmegroup.com/tools-information/webhelp/cmeone-firmsoft/Content/Orders-Search-Cancel.html) — Working (yellow), Filled (green), Cancelled (red), Held (grey); explicit cancellable states.
- [ref-3] [Interactive Brokers TWS — Order status colours and lifecycle](https://www.interactivebrokers.com/en/software/tws/usersguidebook/realtimeactivitymonitoring/order_status_colors.htm) — PendingSubmit, PreSubmitted, Submitted, Filled, Cancelled, Inactive — explicit states with semantic meaning.
- [ref-4] [Kraken Pro — Trading interface guide](https://support.kraken.com/articles/kraken-pro-trading-interface-guide) — order-form module: pair top-left, buy/sell, type dropdown, price+quantity, balance row; order-book click-to-fill.
- [ref-5] [TradingView chart layouts](https://www.tradingview.com/support/solutions/43000746975-tradingview-layouts-a-quick-guide/) — chart workspace as the institutional default surface; Limit-mode parity expectation.
- [ref-6] [TWS API — order status state table (StatusEnum)](https://interactivebrokers.github.io/tws-api/order_submission.html) — canonical lifecycle reference for `Submitted -> Filled`, with PreSubmitted as a held-pending state. Maps to Omega's `Sealed -> Proven -> Settled`.
- [ref-7] [Robinhood drops confetti — Bloomberg, March 2021](https://www.bloomberg.com/news/articles/2021-03-31/robinhood-ditches-its-confetti-animation-following-criticism) — anti-reference. Massachusetts regulators specifically called out gamification. Institutional FX surface cannot afford a single celebratory cue.
- [ref-8] [Bloomberg Order Management — institutional product page](https://professional.bloomberg.com/products/trading/order-management-system/) — settlement-hash links and audit trail expectations.
- [ref-9] [EMSX API Programmer Guide — order-status fields](https://emsx-api-doc.readthedocs.io/en/latest/programmable/requestResponse.html) — canonical field set, no duplication of order metadata.
