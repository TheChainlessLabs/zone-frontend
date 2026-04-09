# Omega Interface — Remaining Issues

## HIGH PRIORITY — On Linear (Backlog)
- ENG-505 FE-040: Stale data warning overlay
- ENG-506 FE-041: Order confirmation dialog
- ENG-507 FE-042: Price impact warning
- ENG-508 FE-043: Wallet disconnect dropdown
- ENG-509 FE-044: Notification center
- ENG-510 FE-045: Friendly error messages

## MEDIUM PRIORITY — On Linear (Backlog)
- ENG-511 FE-046: Fee transparency
- ENG-512 FE-047: Custom chart with trade data
- ENG-513 FE-048: Keyboard shortcuts
- ENG-514 FE-049: Fill notifications
- ENG-515 FE-050: Error reporting (Sentry)

## NEW — Tracked on GitHub Issues (Linear limit reached)

### FE-054: Replace TradingView embed with neon lightweight-charts area chart — [#51](https://github.com/TheChainlessLabs/omega-interface/issues/51) (in progress)
Swap the heavy `s3.tradingview.com` iframe widget for a native canvas area chart matching the Uniswap app aesthetic — smooth neon-cyan gradient + subtle drop-shadow glow. Uses `lightweight-charts@^5.1` (the same lib Uniswap ships).

### FE-055: Seed neon chart with historical price data from a backend source — [#52](https://github.com/TheChainlessLabs/omega-interface/issues/52) (blocked on backend)
Follow-up to FE-054. The new chart only caches points the client has observed since the session began, so fresh tabs start empty. Needs a proper `/markets/{id}/midpoint-history` endpoint on `omega-markets` (or equivalent) to backfill the series on first load. Blocked on backend work — ping Pablo.

## NEW — Not on Linear (limit reached)

### FE-052: Full button/interaction audit
Click every button on every page. Verify every number shown has real meaning.

**Pages to audit:**
- /trade: Buy/Sell, order type tabs, % shortcuts, submit, pair dropdown
- /portfolio: Deposit/Withdraw/Transfer, Trade links, balance values
- /account: filter tabs, cancel per order, Cancel All, order links
- /funding: tabs, chain/asset selectors, amount, MAX, submit
- /explorer: tabs, pagination, batch links, stats cards
- /settings: all controls
- Navbar: Connect Wallet, Deposit, wallet address dropdown
- Modals: Deposit, Withdraw, Cancel All, Wallet, Order Confirmation

**Mock numbers to audit:**
- Explorer stats (mockExchangeStats) — show "—" or fetch from backend
- Batch table (mockBatches) — label as "Sample data" or hide
- Transaction history (mockFundTransactions) — label as "Sample" or hide
- Open positions (openPositions) — use empty state, no mock positions
- Savings "0.8 pips" — compute from real venue comparison

### FE-053: Multi-wallet concurrency stress test
Playwright test with multiple browser contexts simultaneously:
- 3 wallets placing orders at the same time
- Verify no nonce collisions
- Verify orders don't leak between accounts
- Cancel while placing from another context
- Rapid fire: 10 orders in 5 seconds
- Verify frontend doesn't crash or show stale data

## BLOCKED ON BACKEND
- ENG-480-485: Privacy, auth, WebSocket, trade history (backend deps)

## SKIPPED
- ENG-392 FE-007: Deposit Flow
- ENG-395 FE-008: Withdrawal Flow
