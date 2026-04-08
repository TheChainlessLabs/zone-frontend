# Omega Interface — Manual Test Checklist

**Date:** 2026-04-08
**Frontend:** http://localhost:3001
**Backend:** http://localhost:3000
**Dev Wallet PK:** `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`
**Address:** `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`

---

## 1. Wallet Connection

- [ ] Open http://localhost:3001 → see "Connect Wallet to Get Started"
- [ ] Click Connect Wallet → select Browser Wallet → see connecting spinner → connected checkmark → auto-close
- [ ] Address shows in navbar (truncated)
- [ ] Refresh page → wallet stays connected (session persisted)
- [ ] Disconnect → reconnect → no duplicate POST /accounts (check Network tab)

## 2. Balances (Portfolio page)

- [ ] Navigate to /portfolio → shows real USDC (10,000) and USDT (8,000)
- [ ] No mock values visible (45,520 / 48,250 / 25,000)
- [ ] Deposit / Withdraw / Transfer buttons visible in header
- [ ] Deposit button opens DepositModal
- [ ] Withdraw button opens WithdrawModal

## 3. Order Placement — Midpoint (Trade page)

- [ ] Midpoint tab selected by default
- [ ] Midpoint price shows (~1.0878 with current book)
- [ ] Enter amount (e.g. 100) → click Buy → signing prompt → "Order Placed" toast
- [ ] Order appears in bottom panel Orders tab within 5s
- [ ] Balance changes after order (collateral increases, available decreases)

## 4. Order Placement — Limit (Trade page)

- [ ] Switch to Limit tab → price input appears with "Mid: X.XXXX" hint
- [ ] Enter price 1.0850, amount 200 → submit → order placed at your price
- [ ] Order appears in book at 1.0850 (not midpoint)
- [ ] Submit button text shows "Buy EUR / USD at 1.0850"

## 5. Percentage Shortcuts (Trade page)

- [ ] 25% button sets amount to 25% of available USDC balance
- [ ] 50% button sets amount to 50%
- [ ] MAX button sets amount to full available balance

## 6. Order Cancellation (Account page)

- [ ] Navigate to /account → see real orders with prices (1.0856, 1.0900, etc.)
- [ ] Open + Cancelled + Filled statuses shown with correct colored badges
- [ ] Click X on an open order → cancel signing → order disappears within 5s
- [ ] Cancel All button → progress "Cancelling 1 of N..." → success toast
- [ ] Filter tabs (All / Open / Filled / Cancelled) filter correctly

## 7. Order Book (Trade page)

- [ ] Bids (green) and asks (red) visible with real prices
- [ ] After placing an order, book updates within 5s
- [ ] After cancelling, order removed from book within 5s
- [ ] Midpoint recalculates when book changes

## 8. BBO Marquee (Trade page top bar)

- [ ] Shows Wise / OFX / Revolut prices with green "Live" dot
- [ ] Omega midpoint shown with "Best Price" badge
- [ ] Prices update every ~30s

## 9. TEE Status Bar (Trade page bottom)

- [ ] Shows "TEE Connected" with green dot
- [ ] "Last update Xs ago" counts up and resets on each API poll
- [ ] Kill backend → status changes to yellow "Reconnecting" then red "Disconnected"
- [ ] Restart backend → status recovers to green "Connected"

## 10. Empty States

- [ ] New wallet with no balances → Portfolio shows "No tokens yet" with "Deposit Funds" CTA
- [ ] No orders → Account shows "No orders yet" with icon
- [ ] No positions → Bottom panel Positions tab shows "No open positions"

## 11. Error Handling

- [ ] Kill backend → data sections show "Something went wrong" + Retry button
- [ ] Restart backend → click Retry → data loads correctly
- [ ] Place order with stale nonce → error toast "Nonce mismatch" → auto-resync
- [ ] Try submitting with 0 amount → blocked (button stays enabled but nothing happens)

## 12. Market Selector (Trade page sidebar)

- [ ] EUR/USD highlighted with accent color in pair list
- [ ] Click another pair (e.g. GBP/USD) → pair dimmed/disabled (no backend market)
- [ ] Click back to EUR/USD → data returns

## 13. Page Loading

- [ ] Navigate between pages → loading skeleton appears immediately (no blank screen)
- [ ] Navigate back to previously visited page → data appears faster (cached)

## 14. Mobile Layout (resize browser to 390px or use DevTools)

- [ ] No horizontal scroll on any page
- [ ] Bottom tab bar visible (Trade / Portfolio / Explorer)
- [ ] All buttons have adequate touch targets (not tiny)
- [ ] Modals render correctly on small viewport
- [ ] Filter tabs scroll horizontally on account page

## 15. Dev Console

- [ ] Colored dev logs visible: [nonce] green, [order] cyan, [api] purple, [wallet] yellow
- [ ] No uncaught errors in console (TradingView warnings are OK)
- [ ] No CORS errors
