## Nathan Brooks — Portfolio Is The Product

### Top 3 observations

1. `/portfolio` leads with mark-to-market mood, not a reconcilable cash position. The oversized total and hero curve land before the user can see available funds, pending withdrawals, or what is still locked, which is the opposite of how Mercury, QuickBooks, and Modern Treasury teach users to audit money movement [ref-1] [ref-2] [ref-7] [ref-9].
2. The page splits the story of funds across `Open positions`, `Recent fills`, and `Transfers`, but it never stitches them into one timeline that answers which deposits funded which fills and what is still waiting to settle. That leaves Omega closer to a holdings dashboard than a ledger surface, despite the product claiming proof and settlement seriousness [ref-2] [ref-5] [ref-7] [ref-10].
3. The v0 account model is still too implicit. I can see a connected wallet and a batch proof page, but I cannot see the operational chain from wallet deposit to matched fill to batch attestation to withdrawal release without doing the reconciliation mentally myself [ref-8] [ref-10] [ref-11] [ref-12].

### Page-by-page review

#### `/portfolio`

The desktop screenshot is the main miss. The first screen spends its prime real estate on a red area chart and a tasteful italic line, while the only things that help me answer "where did my money go?" are small rows below the fold: a pending withdrawal, two settled deposits, and two fills with no roll-forward between them.

The summary card is too thin for the job. `Available` and `Locked` are present, but there is no explicit `Pending withdrawal`, `In proof`, `Ready to withdraw`, or `Net settled since last batch` split. Mercury explicitly distinguishes total, available, pending, and treasury balances; QuickBooks centers the register and reconciliation adjustments; Modern Treasury treats balance variance and settlements as first-class surfaces. Omega should stop acting like a portfolio app and start acting like an operator console [ref-1] [ref-3] [ref-7] [ref-9] [ref-10].

The mobile screenshot has the same structural issue, just compressed. The summary card lifts above the tables, which helps, but the bottom tab bar cuts directly through the donut card and still leaves the funding history as a separate afterthought rather than the backbone of the page.

#### `/trade`

The trade ticket is more disciplined than the portfolio page. I like that it keeps the order form narrow, exposes midpoint, fee, and settlement, and avoids the public-market spectacle that would undermine an institutional darkpool.

What is missing is a direct bridge from execution intent to funding impact. Nathan would want the order form to say, in plain accounting language, what balance bucket gets reduced now, what becomes locked, and when the resulting fill becomes withdrawable. Ramp and Brex are good here because approvals and reviews happen in the same place as the action, not as a separate archaeology exercise later [ref-4] [ref-5] [ref-6].

#### `/batches` detail

This is the strongest trust surface in the app. The verified batch page looks like infrastructure, and the stage list does a solid job of telling me whether the system sealed, proved, and settled the batch.

The issue is adjacency. `/batches` explains system truth, `/portfolio` explains user balances, and there is still no joined surface that says "this fill is in batch #4821, that batch settled at 14:02 UTC, so these funds moved from locked to withdrawable." Modern Treasury and Treasury Prime both make account state legible by relating balances and transactions, not by keeping them in separate conceptual drawers [ref-7] [ref-8] [ref-10].

#### `/account`

This page is too settings-shaped for a product with a pre-generated account model. Wallet, connector, and session are useful, but there is no explicit explanation of the exchange-side account abstraction, what it derives from, and which user-visible records are scoped to it.

If Omega is "infrastructure, not a bank," then say exactly what that means operationally: wallet is the signing identity, Omega account is the routing identity, batches are the settlement container, and balances are sub-ledger views over that chain. Treasury Prime's account docs and Modern Treasury's ledger framing both show the level of explicitness this product needs [ref-8] [ref-10] [ref-11].

### Kill list

- Remove the portfolio hero sentence `Matched, settled, and proved.` from the top-value zone. It burns attention on brand copy where a reconciler needs state buckets, unlike Mercury's balance framing, QuickBooks' register-first posture, or Modern Treasury's ledger language [ref-1] [ref-7] [ref-9].
- Remove the filled area treatment under the portfolio chart. It reads like performance theater, not cash controls, and it competes with the transaction-table behaviors Mercury, Ramp, and QuickBooks put at the center of review work [ref-2] [ref-5] [ref-9].
- Remove the donut from priority position on desktop. Allocation is secondary once a user is asking whether a withdrawal can be released; Mercury, Brex, and Modern Treasury all prioritize state and workflow over composition summaries when money movement is the task [ref-1] [ref-4] [ref-7].
- Remove `today` P&L as the only immediate context next to total value. For treasury users, day move without source attribution is weak signal compared with the explicit pending, cleared, and reconciled states used by Mercury, Ramp, and QuickBooks [ref-1] [ref-5] [ref-10].

### Build list

- Add a ledger header that breaks funds into `Available now`, `Locked in open orders`, `Pending withdrawal`, `In batch / awaiting proof`, and `Last settled batch`. Mercury's balance taxonomy, QuickBooks' register/reconcile model, and Modern Treasury's account-settlement framing all point to the same pattern: state buckets first, visualization second [ref-1] [ref-7] [ref-9] [ref-10].
- Replace the current `Transfers` card with a single money-movement register ordered by time and source. Each row should declare `event type`, `asset`, `amount`, `counter-bucket`, `status`, `batch or tx reference`, and `running available balance`, because Mercury's transactions page, Ramp's transaction review surfaces, and QuickBooks' account registers all optimize for traceability over decoration [ref-2] [ref-5] [ref-6] [ref-9].
- Add a reconciliation panel that explicitly ties fills to settlement readiness: `matched`, `proved`, `settled on L1`, `withdrawable`. Modern Treasury's audit logs and account settlements, the batch-attestation surface already present in Omega, and Treasury Prime's account model all support showing the user exactly where an entry sits in the lifecycle [ref-7] [ref-8] [ref-10] [ref-11].
- Add saved operational views above the register: `All`, `Money in`, `Money out`, `Pending review`, `Released to withdraw`, `Needs action`. Mercury already saves filtered transaction views, Ramp splits reviewable states from pending states, and Brex keeps finance work inside a single source of truth instead of asking the user to rebuild the queue manually [ref-2] [ref-4] [ref-5] [ref-6].
- Add an account-model explainer block on `/portfolio` or `/account` that says what is derived off-chain, what settles on-chain, and where each reference comes from. Treasury Prime documents accounts as balances plus transactions plus owners; Modern Treasury documents internal accounts against ledger accounts; Omega should be equally plainspoken about custodial boundaries and provenance [ref-8] [ref-10] [ref-11].

### Anti-reference warning

Do not push `/portfolio` further toward consumer-crypto excitement. Rainbow sells "Experience Crypto in Color," Zora turns the profile into a tradable social object, Pump.fun says "Turn Memes into Money," and Polymarket centers market participation mechanics; all four teach users to watch action and identity before they verify cash provenance. That behavior is expensive here because Omega's target user is not trying to feel momentum, they are trying to close the loop between deposits, fills, proof, and withdrawals without opening a spreadsheet [ref-12] [ref-13] [ref-14] [ref-15].

### References

- [ref-1] https://support.mercury.com/hc/en-us/articles/28767842120852-Understanding-your-Mercury-balances
- [ref-2] https://mercury.com/blog/updated-transactions-page
- [ref-3] https://support.mercury.com/hc/en-us/articles/38790547830036-Viewing-cashflow-and-transactions-data-on-your-Transactions-page
- [ref-4] https://www.brex.com/product/spend-management/
- [ref-5] https://support.ramp.com/hc/en-us/articles/4417421399699-Reviewing-transactions-from-Ramp-cards
- [ref-6] https://support.ramp.com/hc/en-us/articles/44976060889619-Expenses-transactions-and-reimbursements-filters
- [ref-7] https://www.moderntreasury.com/products/ledgers
- [ref-8] https://docs.moderntreasury.com/reconciliation/docs/account-reconciliation-overview
- [ref-9] https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/account-registers-quickbooks-online/L8V2Hal1f_US_en_US
- [ref-10] https://quickbooks.intuit.com/learn-support/en-us/help-article/statement-reconciliation/reconcile-account-quickbooks-online/L3XzsllsK_US_en_US
- [ref-11] https://docs.treasuryprime.com/reference/account
- [ref-12] https://rainbow.me/en
- [ref-13] https://support.zora.co/en/articles/6316801
- [ref-14] https://app.pump.fun/
- [ref-15] https://docs.polymarket.com/market-makers/trading
