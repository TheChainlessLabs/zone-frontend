# Omega Zone Alpha Manual Test Guide

This guide covers the parts that need a real Tempo Wallet session. Automated
checks already cover type safety, mocked RPC calls, build, and read-only API
smoke tests. The remaining validation is interactive wallet signing and live
state mutation.

## Prerequisites

- Use the frontend build that targets the configured alpha Omega Zone RPC.
- Use Tempo Wallet, not a generic injected EVM wallet.
- Use the funded alpha account. Expected starting zone balances are roughly:
  - `25,000 PATH.USD`
  - `5,000 OALPHA`
- Keep browser devtools open on Console and Network.
- Do not use review query params such as `?walletState=connected` for real
  wallet testing.

Known caveats:

- `zone_getReferencePrice` may return `enabled: false`; that is acceptable for
  alpha.
- `/batches` may show an empty state if no batches have been sealed yet.
- The first zone trade/withdraw may ask Tempo Wallet to authorize an access key.
  That is expected once. Repeated prompts on every page navigation are not.
- Tempo Wallet may print SES-related console noise. Treat it as blocking only if
  the user action fails.

## 1. Connect And Session Persistence

1. Open the frontend URL.
2. Click the Tempo Wallet connect/sign-up action.
3. Complete the Tempo Wallet flow.
4. If the app asks for an Omega Zone RPC auth signature, sign it once.
5. Confirm the app shows the connected account in the shell.
6. Navigate between `Trade`, `Portfolio`, `Batches`, and `Account`.
7. Refresh the page and navigate again.

Expected:

- No email login or magic-link modal appears.
- The connected account remains visible.
- The app should not ask for the RPC auth signature on every page switch.
- Page transitions should not flash a full blank screen.
- No `UnsupportedChainIdError`, `Maximum call stack size exceeded`, or repeated
  blinking signature popup appears.

## 2. Batches Page

1. Open `/batches`.
2. Confirm the page loads without requiring wallet interaction.
3. Search for a batch ID or transaction hash if one is available.
4. Open a batch detail page if the list has rows.

Expected:

- The page renders a real list or an honest empty state.
- It does not show `Failed to load batch`.
- It does not invent order counts, fill counts, pair volume, or proof metadata.

## 3. Portfolio Read Path

1. Open `/portfolio`.
2. Wait for balances to settle.
3. Refresh the page.
4. Navigate away and back to `/portfolio`.

Expected:

- Portfolio value reflects live zone balances.
- The funded account should show approximately `25,000 PATH.USD` and `5,000 OALPHA`
  before trades.
- Fills, transfers, deposits, and withdrawals should come back after refresh if
  the backend has indexed them.
- No extra login signature is required after the initial app auth.

## 4. Trade Read Path

1. Open `/trade`.
2. Confirm the pair is `OALPHA/PATH.USD`.
3. Confirm midpoint/top-of-book data loads.
4. Toggle Buy/Sell.
5. Toggle Market/Limit.
6. Use the `25%`, `50%`, `75%`, and `MAX` amount buttons.

Expected:

- The app never shows `PATH.USD/PATH.USD`.
- Midpoint should be `1.000000` when the seeded book is active.
- Buy side availability uses `PATH.USD`.
- Sell side availability uses `OALPHA`.
- Percent controls display `%`.
- Limit mode shows the market reference/chart area on the right.
- No fake historical candles appear if history is disabled.

## 5. Market Buy

Use a small amount first, such as `10 OALPHA`.

1. Open `/trade`.
2. Select `Market`.
3. Select `Buy`.
4. Enter `10`.
5. Open the order preview.
6. Confirm the order.
7. Approve any Tempo Wallet access-key prompt if this is the first zone action.
8. Sign/approve the transaction.
9. Wait for success.

Expected:

- The frontend does not call darkpool `approve`.
- The frontend does not ask the wallet to use `eth_sendTransaction` or
  `eth_signTransaction` for the zone action.
- No error mentions invalid darkpool address checksum.
- No error mentions unsupported chain `421700035`.
- After success, `PATH.USD` decreases and `OALPHA` increases.
- Trade/fill history refreshes if the backend indexed the fill.

## 6. Market Sell

Use a small amount first, such as `5 OALPHA`.

1. Open `/trade`.
2. Select `Market`.
3. Select `Sell`.
4. Enter `5`.
5. Open the order preview.
6. Confirm the order.
7. Sign/approve the transaction.
8. Wait for success.

Expected:

- `OALPHA` decreases and `PATH.USD` increases.
- No darkpool `approve` transaction appears.
- No wallet-hosted zone transaction method error appears.

## 7. Limit Order And Cancel

Use a non-crossing order if possible so it rests in the book.

1. Open `/trade`.
2. Select `Limit`.
3. Select `Sell`.
4. Enter a small amount, such as `1 OALPHA`.
5. Enter a limit price above the current midpoint, such as `2`.
6. Submit and sign the order.
7. Confirm the order appears in your open order/history surface.
8. Cancel the order if the UI exposes cancel.
9. Refresh the page.

Expected:

- The order is created through raw signed transaction submission.
- Open order state survives refresh through backend history.
- Cancelling changes the order status to cancelled.
- If the order crosses and fills immediately, record that as expected matching
  behavior rather than a frontend failure.

## 8. Deposit From Tempo L1 To Zone

Use a small deposit first, such as `10 PATH.USD`.

1. Open `/portfolio`.
2. Click `Deposit`.
3. Enter `10`.
4. Submit.
5. Approve `PATH.USD` to the ZonePortal on Tempo L1 if prompted.
6. Confirm the ZonePortal deposit transaction.
7. Wait for the app to poll deposit status.

Expected:

- L1 `PATH.USD` decreases.
- Zone `PATH.USD` increases after the deposit is processed.
- The transfer/deposit activity appears after backend indexing.
- The app does not require a zone-chain switch for the L1 deposit path.

## 9. Withdraw From Zone

Use a tiny amount first, such as `1 PATH.USD`, and withdraw to your own Tempo
address.

1. Open `/portfolio`.
2. Click `Withdraw`.
3. Enter `1`.
4. Use your own address as the recipient.
5. Submit.
6. Approve any Tempo Wallet access-key prompt if needed.
7. Sign/approve the zone withdrawal request.
8. Wait for the UI status update.

Expected:

- Zone `PATH.USD` decreases or becomes locked/pending.
- The withdrawal is not shown as fully settled immediately after only the zone
  transaction receipt.
- Status should progress through backend states such as `pending`, `batched`,
  `submitted`, `processed`, `failed`, or `bounced`.
- If status polling reports a backend block-range/query error, capture it as a
  backend issue with the withdrawal transaction hash.

## 10. Navigation Regression Pass

1. After at least one successful action, switch between all main tabs:
   `Trade`, `Portfolio`, `Batches`, `Account`.
2. Refresh each page once.
3. Repeat one read action on each page.

Expected:

- One app login/auth session covers all pages.
- No repeated auth-sign popups on navigation.
- No full-screen flashing between tabs.
- Live balances and activity remain consistent after refresh.

## 11. What To Capture If Something Fails

For any failure, capture:

- Page and action, for example `Trade > Market Buy > Confirm`.
- Connected account address.
- Amount, side, order type, and price.
- Transaction hash if one exists.
- Exact modal error text.
- Console error text.
- Network response body for the failing JSON-RPC request.
- Whether it happened before wallet prompt, during wallet prompt, or after
  transaction submission.

Critical failures to report immediately:

- Repeated blinking sign-message modal.
- `eth_sendTransaction` or `eth_signTransaction` appears in a zone action error.
- Darkpool `approve` appears before market/limit trading.
- `UnsupportedChainIdError` for `421700035`.
- `Maximum call stack size exceeded`.
- Balances do not refresh after a successful trade transaction.
