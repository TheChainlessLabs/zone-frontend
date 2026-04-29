## Persona 15 — Elena Petrova

### Top observations

1. The app has visual restraint, but not yet product grammar. `/trade`, `/portfolio`, `/batches`, `/account`, and the wallet/modals all solve state, metadata, and actions with slightly different structures, so the system still reads as page assembly rather than one coherent instrument panel. [ref-1] [ref-3] [ref-8]
2. The strongest surfaces are the repeated ones: batch rows, position rows, fill rows, transfer rows. The weakest surfaces are the bespoke thesis moments: the portfolio hero, the detached execution strip, the batches verification ring, because each introduces a new local language instead of reusing one object model. [ref-2] [ref-5] [ref-8]
3. Mobile breaks the spell. The bottom tab bar sits on top of content in the screenshots, and the wrong-network state adds another layer of chrome above it; that is the opposite of Linear’s “navigation recedes, work surface wins” discipline. [ref-1] [ref-6] [ref-11]

### Page-by-page review

#### `/trade`

This is the correct place to be severe. The current order form is composed cleanly, but the pair switcher, order card, confirmation modal, disconnected state, allowlist failure, and execution strip still behave like adjacent components rather than one execution object with stable slots for instrument, action, constraints, and status. Stripe’s dashboard search and object navigation, Attio’s object/list model, and Raycast’s keyboard-first action framing all point in the same direction: compress the surface into one canonical trade entity, then derive states from it instead of adding parallel sub-cards. [ref-3] [ref-4] [ref-8] [ref-11]

Market and Limit should be view modes over the same data model, not two subtly different page layouts. Linear is explicit about feature parity across list and board views, and Notion does the same with database views showing the same underlying data differently; Omega should keep the same section order, labels, and state handling in both modes, then only add the chart/fills rail as an auxiliary view. [ref-2] [ref-5] [ref-10]

The detached execution strip under the form is a symptom of unfinished object modeling. Midpoint, estimated receive, fee, and settlement are not footer trivia; they are order facts and should live in the same card, in the same slot order, and in the same language as the confirmation modal. [ref-1] [ref-3] [ref-8]

#### `/portfolio`

The portfolio page is carrying too many concurrent theses: editorial lede, oversized P&L hero, chart, summary donut, positions, fills, transfers. That drifts toward the Bloomberg / MetaTrader / CoinMarketCap failure mode where everything is important at once, so exception scanning gets slower exactly when the user wants one answer quickly. [ref-12] [ref-13] [ref-14]

The useful grammar is already lower on the page: rows with stable labels, quantities, status chips, and timestamps. Keep the chart, but demote it into a view control over the account object; let positions, locked capital, and transfer status set the page hierarchy, the way Attio uses lists over stable records and Notion uses multiple views over the same database. [ref-5] [ref-8] [ref-9]

#### `/batches`

This is the most system-coherent page in the set. The list view repeats well, status is legible, and the absence of counterparty noise is correct for the product.

The detail page loses that discipline. The giant verification ring, isolated KPI cards, and explanatory footer switch to a second language, where the list row already had the right ingredients: status, batch id, time, proof reference, and pair scope. Linear’s recent refresh argues for consistency in headers and controls across workflows; Attio’s workflows and Retool’s automation surfaces both keep state progression explicit without turning it into an ornamental hero. Omega should do the same. [ref-1] [ref-7] [ref-10]

#### `/account`

The page is serviceable, but it is four settings dialects on one route: a data card, a segmented gas control, two binary preference rows, a theme pill, and a session card. Stripe, Linear, and Attio all converge on a simpler rule: settings pages should feel schema-driven, with one row model for label, explanation, current value, and action. [ref-1] [ref-3] [ref-9]

#### Guards and modals

The disconnected state, pass-required state, wrong-network banner, and wallet modal do not yet belong to one family. They need one shared state kit with the same icon area, title slot, explanation slot, action slot, and escalation rules, otherwise each exceptional condition teaches the user a new syntax. [ref-1] [ref-7] [ref-10]

### Kill list

- Remove the global dot-grid from authenticated product routes. It is atmospheric, but systems surfaces should get their hierarchy from information grouping, not a persistent decorative field behind every task surface. [ref-1] [ref-3] [ref-11]
- Remove the detached execution strip below the trade card and absorb those facts into the order object. Repeating critical order metadata across separate boxes weakens trust. [ref-1] [ref-3] [ref-8]
- Remove the oversized verification ring on batch detail. A stage list with stable status treatment is enough; the current ring is a hero treatment in a page that should behave like audit infrastructure. [ref-1] [ref-7] [ref-10]
- Remove the portfolio serif lede from the main operating page. It introduces a marketing register into the one surface that should read like account state. [ref-1] [ref-3] [ref-12]
- Remove mobile tab-bar overlap with scroll content before adding any more page furniture. A shell that covers controls is a system error, not a visual detail. [ref-1] [ref-6] [ref-11]

### Build list

- Add a global command surface for pair jump, batch jump, deposit, withdraw, wallet actions, and route navigation. Raycast is the obvious precedent for the interaction posture, Stripe for search-as-navigation across objects, and Attio for context-sensitive quick actions. [ref-4] [ref-9] [ref-11]
- Add a canonical `StatePanel` family for `default`, `empty`, `loading`, `error`, `skeleton`, `disconnected`, and `allowlist-failure`. Linear’s refresh is explicitly about removing exceptions, Retool keeps workflow exceptions legible inside one frame, and Attio models process states without changing the entire page syntax. [ref-1] [ref-7] [ref-10]
- Add a reusable object header primitive shared by trade pair, batch, wallet, and portfolio summary: `title`, `status`, `meta`, `actions`. Attio’s object/list model, Notion’s multiple views over one database, and Stripe’s resource-oriented dashboard all support this direction. [ref-3] [ref-5] [ref-8]
- Add saved views and quick filters to `/batches` and `/portfolio`, not just search and one static sort. Linear’s view parity, Notion’s database views, and Attio’s favorited list views show the pattern clearly. [ref-2] [ref-5] [ref-9]
- Add an inline execution policy block inside the order form for midpoint source, fee, settlement rail, and eligibility. This should be the same component in the form, the confirmation modal, and disabled states. Stripe’s documentation-grade clarity, Linear’s compact header discipline, and Raycast’s “do not waste time” ergonomics are the correct standards. [ref-1] [ref-3] [ref-11]

### References

- [ref-1] https://linear.app/now/behind-the-latest-design-refresh
- [ref-2] https://linear.app/docs/board-layout
- [ref-3] https://docs.stripe.com/dashboard/basics
- [ref-4] https://docs.stripe.com/dashboard/search
- [ref-5] https://www.notion.com/help/guides/using-database-views
- [ref-6] https://www.notion.com/help/guides/navigating-with-the-sidebar
- [ref-7] https://retool.com/build-enterprise-apps/workflows
- [ref-8] https://docs.attio.com/docs/objects-and-lists
- [ref-9] https://attio.com/help/reference/productivity-collaborating/navigating-your-workspace
- [ref-10] https://attio.com/help/reference/automations/workflows/getting-started-with-workflows
- [ref-11] https://www.raycast.com/
- [ref-12] https://professional.bloomberg.com/products/bloomberg-terminal/
- [ref-13] https://www.metatrader5.com/
- [ref-14] https://coinmarketcap.com/rankings/exchanges/
