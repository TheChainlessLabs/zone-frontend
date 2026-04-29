# Brian Osei Review

## Top 3 observations

1. `/trade` still behaves like a crypto ticket, not a money-moving rail. On mobile the order form leads with side selection, while usable balance, settlement path, and operational constraints arrive late or not at all.[ref-1][ref-3][ref-4][ref-7]
2. `/batches` proves that Omega can show evidence, but it makes proof mechanics louder than payment outcome. The user sees rings, hashes, and stages before they see whether funds were usable, which corridor settled, and what to do when a batch is delayed.[ref-2][ref-5][ref-7][ref-8]
3. The shell spends too much attention on atmosphere. The dot grid, sticky chrome, and placeholder chart create the same screen-rich assumption that LSEG Workspace and Bloomberg Terminal can carry on premium desks, while M-PESA-style utility earns trust by putting action, balance, and confirmation first.[ref-1][ref-12][ref-13]

## Page-by-page

### `/trade`

This is the page that has to make the "infrastructure, not a bank" line visible, and right now it does not. The mobile market form asks me to buy or sell before it tells me what is available now, what remains locked, what settles on the next batch, and what the route is from signature to proof; M-PESA Business Till, Flutterwave payouts, Paystack transfers, and Yellow Card all front-load available funds, rails, and transfer conditions because operators need operating truth before they need styling.[ref-1][ref-3][ref-4][ref-7]

The limit page gets worse because the second screenful is a non-data chart placeholder and a fills table with dead rows. Chipper Checkout, Yellow Card, and Paystack all treat cross-border or treasury movement as a sequence with status, history, and corridor context, while Omega spends scarce mobile height on decorative market theatre that does not help me commit size.[ref-4][ref-7][ref-9][ref-10]

The wrong-network and disconnected states are readable, but they still speak like wallet software. Brian needs route language that works for a business operator in Lagos, Accra, or Nairobi: what network is required, what changes in read-only mode, what settles on Ethereum L1, and whether a withdrawal destination must be pre-approved; Paystack's transfer lifecycle, Yellow Card's transaction-status posture, and M-PESA's explicit channel descriptions are the right precedent here.[ref-1][ref-5][ref-8][ref-15]

### `/batches`

This page is closest to the brand promise because it exposes public settlement evidence, but the ordering is wrong. Safaricom Paybill, Paystack transfer flows, and Yellow Card treasury pages all make the practical questions obvious first, so Omega should lead with `sealed`, `settled on Ethereum`, `funds usable`, and corridor totals before it drops the user into proof hash language.[ref-2][ref-4][ref-7][ref-14]

The detail page uses "Attestation log", "Stage 4/4", and four proof steps, but it never translates those steps into business consequence. Yellow Card explicitly ties stablecoin rails to local-currency payout corridors, Paystack splits queued versus success versus reversed, and Flutterwave frames payouts as vendors, payroll, and country reach; Omega should translate `queued`, `sealed`, `proven`, and `settled` into `waiting to enter batch`, `matched`, `anchored`, and `usable for withdrawal` so the proof surface travels beyond crypto insiders.[ref-3][ref-5][ref-7][ref-8]

### `/portfolio`

The portfolio hero overweights mood and underweights liquidity state. Paystack balance views, OPay's control-of-funds framing, and Yellow Card's treasury language all treat available balance, payout balance, and currency position as first-class operators' questions, while Omega puts a red performance curve above the information that would actually help me decide whether to trade, withdraw, or wait for settlement.[ref-4][ref-6][ref-11][ref-14]

The summary and transfers sections are directionally right, but they still read like internal crypto labels rather than treasury controls. Chipper's business/payment language, Flutterwave's payout framing, and Paystack's transfer docs all point to the same rewrite: show `available now`, `locked until next batch`, `withdrawing to bank or wallet`, and `expected release window`, with status language that maps directly to an operational decision.[ref-3][ref-4][ref-9][ref-15]

### Withdrawal and proof-verification language

The withdraw modal is the sharpest language miss in the app. `Privacy fee`, `recipient`, and `Sign withdrawal` are understandable to a wallet-native user, but a globally distributed finance team needs wording closer to payment operations: destination, network cost, service cost, net sent, and status after signing; that is how Paystack, Yellow Card, and M-PESA teach transfer risk without assuming crypto fluency.[ref-1][ref-4][ref-8][ref-15]

The same applies to proof verification. Yellow Card exposes transaction status and corridor coverage, Paystack exposes conclusive and non-conclusive transfer states, and Flutterwave exposes payout verification and country reach; Omega should keep proof visible, but subordinate it to the sentence an operator cares about: `This withdrawal is settled and externally verifiable`, or `This batch is sealed but not yet spendable`.[ref-3][ref-5][ref-7][ref-8]

## Kill list

- Kill the global dot grid on `/trade`, `/portfolio`, and `/batches`. M-PESA, Paystack, and Yellow Card win by keeping high-frequency finance surfaces visually quiet, and the current background spends contrast budget without improving action clarity.[ref-1][ref-4][ref-7]
- Kill the chart placeholder and the `Chart wiring lands in M6` copy from the live trade path. Chipper, Flutterwave, and Paystack all use scarce mobile height for route, amount, and status rather than internal roadmap leakage.[ref-3][ref-4][ref-9]
- Kill `privacy fee` as a naked label. Yellow Card, M-PESA, and Paystack name fees by outcome and source, so Omega should do the same if it wants non-crypto operators to trust the deduction.[ref-1][ref-4][ref-7]
- Kill proof-first headings like `Attestation log` on the public explorer. Lead with settlement outcome, then let the proof sit underneath as evidence, the same way transfer systems expose status before audit detail.[ref-2][ref-5][ref-8]

## Build list

- Build a mobile-first execution brief at the top of `/trade`: available now, locked until next batch, settlement rail, and next proof window. M-PESA Business Till, Paystack transfer balance management, and Yellow Card treasury rails all show that operators commit faster when the rail conditions are visible before the action button.[ref-1][ref-4][ref-7]
- Build an explicit execution path inside the ticket: `Sign`, `Queued`, `Matched`, `Sealed`, `Usable`. Paystack's queued versus success model, Flutterwave's payout-verification posture, and Yellow Card's transaction-status language all support making intermediate states visible instead of hiding them behind modal transitions.[ref-3][ref-5][ref-8]
- Build corridor language into `/batches` and `/portfolio`: pair total, destination rail, settlement network, and whether the funds are usable for withdrawal yet. Yellow Card, Chipper, and M-PESA all ground cross-border movement in corridor and payout reality, not only in transaction identifiers.[ref-1][ref-7][ref-9][ref-10]
- Build a plainer withdrawal model: destination address or account, network cost, service cost, net sent, and a post-signing status line that says whether the instruction is queued, sealed, or spendable. Paystack, M-PESA, and OPay all reduce withdrawal anxiety by naming the move in operational terms instead of insider shorthand.[ref-1][ref-4][ref-11][ref-15]
- Build a stricter mobile chrome budget. Bloomberg Terminal and LSEG Workspace prove what happens when a product assumes permanent desk space and deep attention; Omega should take the opposite lesson and compress header, footer, and decorative scaffolding so the action and state land in the first screenful on ordinary phones.[ref-1][ref-12][ref-13]

## References

- [ref-1] M-PESA Business Till — https://www.safaricom.co.ke/personal/m-pesa/lipa-na-m-pesa/m-pesa-business-till
- [ref-2] M-PESA Paybill — https://www.safaricom.co.ke/main-mpesa/for-your-business/business-paybill
- [ref-3] Flutterwave Send Money — https://flutterwave.com/us/send-money
- [ref-4] Paystack Managing Transfers — https://paystack.com/docs/transfers/managing-transfers/
- [ref-5] Paystack How Transfers Work — https://paystack.com/docs/transfers/how-transfers-work/
- [ref-6] Paystack Top-ups and Balance — https://support.paystack.com/en/articles/2130114
- [ref-7] Yellow Card API Suite — https://yellowcard.io/api-suite
- [ref-8] Yellow Card API Documentation — https://help.yellowcard.io/article/1016-api-documentation
- [ref-9] Chipper Checkout — https://www.chippercash.com/chipper-checkout
- [ref-10] Chipper Send & Receive — https://www.chippercash.com/send-and-receive
- [ref-11] OPay — https://www.opayweb.com/
- [ref-12] LSEG Workspace — https://www.lseg.com/en/data-analytics/products/workspace
- [ref-13] Bloomberg Terminal — https://www.bloomberg.com/professional/solution/bloomberg-terminal/
- [ref-14] Yellow Card — https://yellowcard.io/
- [ref-15] Paystack Transfers Dashboard Guide — https://support.paystack.com/hc/en-us/articles/360009881720-How-do-I-make-bulk-transfers-from-my-Paystack-Dashboard
