# Rafael Mendes Review

## Top 3 observations

1. `/trade` is too quiet. The core ticket sits in the middle like a banking form, then asks me to trust that matching is fast without showing any live execution rhythm.[ref-1][ref-2][ref-12]
2. `/portfolio` tracks value, but it does not track state change. I can see a red curve, but I cannot feel the moment an order moved from pending to matched to settled to proven.[ref-3][ref-13][ref-14]
3. The connect and deposit paths go dark and spin. That is the fastest way to make an institutional trader suspect the app froze.[ref-3][ref-6][ref-9]

## Page-by-page

### `/trade`

This is the battleground and right now it feels slower than it probably is. The limit layout is better than market because at least I can see fills beside the ticket, but the fills area is still a static table and the chart is a placeholder with no post-match reaction.[ref-1][ref-2][ref-12]

The market ticket is too dead between click and wallet handoff. Hyperliquid frames market as immediate execution, Bybit frames market as speed over price control, and Wise keeps a transfer alive by showing the current step plus delay context. Omega should do the same with a visible path inside the ticket: `Sign -> Queued -> Matched -> Settling`, where the active stage flips instantly and never waits for the next screen to explain itself.[ref-1][ref-3][ref-12]

Your fills should stop reading like a receipt table. Bybit explicitly separates trade history from order history, Bitso says instant send flows were sent immediately, and Mercado Pago maps backend states into explicit user states. Omega needs a live tape feel here: newest fill pinned first, a one-beat highlight on arrival, and status chips that change shape or tone when a fill moves from matched to settled.[ref-2][ref-5][ref-15]

### `/portfolio`

The hero number is fine. The problem is the page spends its biggest space on a passive curve while the real risk is operational state. Rafael cares less about the line and more about whether that `Pending` withdrawal is blocked, whether a `Matched` fill is now `Settled`, and when locked capital frees up.[ref-3][ref-4][ref-14]

Wise exposes received, sent, delay, and estimated arrival. Mercado Pago distinguishes approved money from money that will be released later. Bitso publishes same-day versus next-day crediting windows. Omega should pull that discipline into the right rail and recent activity: exact next release times, tighter `locked` explanations, and a last-state-change strip above the chart so portfolio feels operational, not editorial.[ref-3][ref-4][ref-14]

Also: the serif lede on portfolio says mood, not urgency. Rafael does not need mood here. He needs what moved and whether it is usable.[ref-2][ref-9][ref-10]

### Modals

The connect modal is the hardest miss. Dark scrim, spinner, one badge, no progress. Nubank explains when Pix is still processing, Wise tells you whether money was received or sent, and Mercado Pago maps `in_process` into concrete resolution paths. Omega should replace the lonely spinner with a compact stage list and a timeout branch: `Wallet request sent`, `Signature pending`, `Relay queued`, then `Still waiting? reopen wallet`.[ref-3][ref-6][ref-9]

The deposit modal is closer, but it still front-loads inputs and back-loads trust. Bitso tells you same-day versus next-day credit timing, Mercado Pago shows whether money is approved or still processing, and Mercado Pago also distinguishes money available now from money released later. Put the timing and state upfront: `Permit`, `L1 received`, `Credited to Omega`, with the expected window beside each step.[ref-4][ref-7][ref-14]

## Kill list

- Kill the global dot-grid on trading-critical pages. It spends visual energy and gives back nothing on execution surfaces that should feel like terminals, not posters.[ref-1][ref-10][ref-12]
- Kill the chart placeholder line `CHART WIRING LANDS IN M6`. That is internal process leaking into the product, and it makes the right side of `/trade` feel unfinished right where Hyperliquid and Bybit usually reassure you with active market context.[ref-1][ref-2][ref-12]
- Kill spinner-only waiting states in connect flow. If the user is stuck reading a spinner, you already lost the latency war.[ref-3][ref-6][ref-9]
- Kill decorative serif mood on portfolio above the number. The fastest screens cut interpretation and show operational truth.[ref-2][ref-10][ref-14]

## Build list

- Build an in-ticket execution rail: `Sign`, `Queued`, `Matched`, `Settling`. It should flip inside the ticket before any modal closes. Hyperliquid sets the expectation that market action is immediate, Bybit makes execution outcome explicit, and Wise proves progress with named steps and delay messaging.[ref-1][ref-3][ref-12]
- Build a live fills tape, not a table. Newest row on top. One-frame accent flash on new fill. Status chip morph when state upgrades. Bybit's trade-history split, Bitso's immediate send confirmation, and Mercado Pago's state mapping all point the same way: state transitions should be impossible to miss.[ref-2][ref-5][ref-15]
- Build exact settlement timing into portfolio and deposit flows. Show what is usable now, what is locked, and the next expected release or credit event. Wise, Bitso, and Mercado Pago all do this because money state without timing is not trust.[ref-3][ref-4][ref-14]
- Build timeout-aware wallet states. If signature has not landed, show the user what is waiting and what to do next. Nubank's processing explanation, Mercado Pago's `in_process` branch, and Wise's delay notices all handle uncertainty better than this modal does.[ref-3][ref-6][ref-9]
- Build hard separation between order state and fill state across `/trade` and `/portfolio`. Open order, matched fill, settled batch, proven batch. Different surfaces, different verbs. Bybit already separates order history from trade history, Mercado Pago separates approved from released money, and CoW is the warning case: when execution logic is abstract, you must over-communicate state or the product feels late.[ref-2][ref-11][ref-14]

## References

- [ref-1] Hyperliquid Docs, Order types — https://hyperliquid.gitbook.io/hyperliquid-docs/trading/order-types
- [ref-2] Bybit Help Center, Differences between Trade History and Order History — https://www.bybit.com/en/help-center/article/The-differences-between-trade-history-and-order-history/
- [ref-3] Wise Help Centre, How do I track my transfer? — https://wise.com/help/articles/2977947/how-do-i-track-my-transfer
- [ref-4] Bitso Help Center, Deposits and crediting — https://support.bitso.com/hc/en-us/articles/33725399989396-Deposits-and-crediting
- [ref-5] Bitso Help Center, Send funds with Bitso Transfer through the app — https://support.bitso.com/hc/en-us/articles/9649039148692-Send-funds-with-Bitso-Transfer-through-the-app
- [ref-6] Mercado Pago Developers, Consulta sobre o status de um pagamento — https://www.mercadopago.com.br/developers/pt/docs/checkout-api-payments/response-handling/query-results
- [ref-7] Mercado Pago Ajuda, Ainda não foi aprovado o pagamento do meu comprador — https://www.mercadopago.com.br/ajuda/identificacao-pagamento-meu-comprador_548
- [ref-8] Mercado Pago Ajuda, Por que minha compra aparece como “Pagamento em processamento”? — https://www.mercadopago.com.br/ajuda/17243
- [ref-9] Nubank Blog, Pix em processamento: o que isso significa? — https://blog.nubank.com.br/pix-em-processamento-o-que-isso-significa/
- [ref-10] Notion Help Center, Optimize database load times & performance — https://www.notion.com/help/optimize-database-load-times-and-performance
- [ref-11] CoW DAO Documentation, Limit orders — https://cowswap.mintlify.app/cow-swap/tutorials/limit
- [ref-12] Bybit Help Center, FAQ — Order Execution & Liquidation — https://www.bybit.com/en/help-center/article/FAQ-Order-Execution--Liquidation
- [ref-13] Hyperliquid Docs, Portfolio graphs — https://hyperliquid.gitbook.io/hyperliquid-docs/trading/portfolio-graphs
- [ref-14] Mercado Pago Global Selling, How long do I have to wait to use the money? — https://global-selling.mercadopago.com/help/36476
- [ref-15] Mercado Pago Developers, Status de pagamentos — https://www.mercadopago.com.br/developers/pt/docs/woocommerce/payment-status
