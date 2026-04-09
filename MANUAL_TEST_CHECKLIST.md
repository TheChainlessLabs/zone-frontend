# Omega Interface — Manual Test Checklist

**Date:** 2026-04-09
**Frontend:** http://localhost:3001
**Backend:** http://localhost:3000
**Dev Wallet PK:** `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`
**Address:** `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`

---

## What's New Since 2026-04-08

Features shipped in PRs #34–#50 that require coverage below:

- **Notification Center** (§16) — navbar bell icon, unread badge, dropdown list
- **Order Confirmation Dialog** (§17) — review screen before signing
- **Stale Data Warning Overlay** (§18) — surfaces when backend polling goes cold
- **Wallet Disconnect Dropdown** (§19) — click address → Copy / Explorer / Disconnect
- **Keyboard Shortcuts** (§20) — `B`/`S` flip, `1-4` order type, `Enter` submit, `?` help
- **Fill Notifications** (§21) — toast + notification center entry when an order fills
- **Price Impact Warning** (§22) — severity badge when order vs book depth is large
- **Fee Transparency** (§23) — fee line item in confirmation dialog
- **Friendly Error Messages** (§24) — backend errors mapped to human copy
- **Pair Dropdown** (§25) — replaces old static market selector
- **1inch Venue Prices** (§26, ENG-499) — added to BBO marquee alongside Wise/OFX/Revolut
- **Dev Console Logging** (§27) — colored `[tag]` logs for nonce/order/api/wallet/notification/impact

---

## 0. Boot Sequence

```bash
# Backend (in omega-markets)
cd ../omega-markets && ./scripts/start-backend.sh

# Frontend (in omega-interface)
cd app && pnpm dev

# Seed data (optional)
cd ../omega-e2e && node seed-backend.mjs
```

Wait for: backend `listening on 127.0.0.1:3000`, Next.js `Ready in Xms` on `http://localhost:3001`.

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

## 16. Notification Center (Navbar bell icon)

- [ ] Bell icon visible in navbar next to wallet area
- [ ] Click bell → dropdown opens anchored to the icon
- [ ] Empty state reads "No notifications yet" when fresh
- [ ] Place an order that fills → new entry appears with fill price + qty
- [ ] Unread red badge increments on new entry, clears after dropdown is opened
- [ ] Mark-read / Clear-all actions work and persist across page reload
- [ ] Click outside dropdown → closes without errors

## 17. Order Confirmation Dialog

- [ ] Click Buy / Sell with a valid amount → confirmation dialog opens (does NOT sign yet)
- [ ] Dialog shows: side, pair, price (or "Midpoint"), quantity, estimated fee, price impact
- [ ] Confirm button triggers signing prompt → toast "Order Placed"
- [ ] Cancel button closes dialog, no signing prompt, no network request
- [ ] `ESC` key closes dialog (no submit)
- [ ] Click backdrop outside dialog closes it
- [ ] Dialog is keyboard-focusable and traps focus inside

## 18. Stale Data Warning Overlay

- [ ] All data loading normally → no overlay
- [ ] Kill backend (Ctrl+C in backend terminal)
- [ ] Wait ~10s → yellow "Data may be stale" overlay appears on affected panels
- [ ] Restart backend → overlay disappears within one poll cycle (~5s)
- [ ] Overlay is non-blocking — UI still responds to clicks underneath

## 19. Wallet Disconnect Dropdown

- [ ] Click the truncated address pill in navbar → dropdown opens
- [ ] Dropdown shows: full address (or truncated), Copy Address, View on Explorer, Disconnect
- [ ] Copy Address → toast "Address copied"
- [ ] View on Explorer → opens new tab to configured explorer URL with the address
- [ ] Disconnect → clears wallet state, returns to "Connect Wallet" CTA
- [ ] Clicking outside closes dropdown

## 20. Keyboard Shortcuts (Trade page only)

- [ ] Press `?` → shortcut help overlay appears
- [ ] Press `B` → side flips to Buy (highlighted)
- [ ] Press `S` → side flips to Sell (highlighted)
- [ ] Press `1` / `2` / `3` / `4` → switches between order type tabs (midpoint/limit/…)
- [ ] Press `Enter` inside amount input → opens confirmation dialog
- [ ] Shortcuts are IGNORED while focus is in any `<input>` / `<textarea>` (no flip while typing)
- [ ] `?` overlay dismisses with `Escape`

## 21. Fill Notifications

- [ ] Place an order that will fill immediately (crosses the book)
- [ ] Within ~5s: green "Order filled" toast appears with fill price + quantity
- [ ] Notification center bell badge increments
- [ ] Open notification center → entry visible with timestamp
- [ ] Entry contains the order ID (or a shortened reference)
- [ ] Multiple fills of the same order show as distinct entries or a single aggregated one (consistent with design)

## 22. Price Impact Warning

- [ ] Place a small order (well within book depth) → no warning
- [ ] Place a large order that would consume most of the book → warning badge visible
- [ ] Confirmation dialog shows price-impact percentage
- [ ] Severity colors correct: green (none <10%), yellow (warning 10–50%), red (critical >50%)
- [ ] Critical severity requires extra confirmation click (two-step)

## 23. Fee Transparency

- [ ] Fee line item visible in confirmation dialog for every order type
- [ ] Fee % matches `FEE_SCHEDULE` constant (check dev console or `app/lib/fees.ts`)
- [ ] Fee amount displays in the same token as the quantity
- [ ] Zero-fee orders (if any) explicitly show "Fee: 0.00"

## 24. Friendly Error Messages

- [ ] Submit an order with a stale nonce → toast "Nonce mismatch — resynced, please try again" (NOT raw JSON)
- [ ] Submit an order with insufficient balance → toast "Insufficient balance" (NOT `ERR_INSUFFICIENT_FUNDS`)
- [ ] Kill backend then submit → toast "Network error — check your connection"
- [ ] Rate limit hit (if testable) → "Too many requests, slow down"
- [ ] No raw backend JSON or stack traces visible in any user-facing toast

## 25. Pair Dropdown (replaces old Market Selector)

- [ ] Click current pair name in page header → dropdown opens
- [ ] Dropdown has a search/filter input
- [ ] EUR/USD is selectable; GBP/USD etc. are shown disabled with "Coming soon" tooltip
- [ ] Type "EUR" → list filters correctly
- [ ] Select a pair → dropdown closes, page updates (symbol in header, chart, book)
- [ ] URL does not change for /trade (global context) but DOES change for /trade/pair/[pair]
- [ ] Keyboard navigation: arrow keys move highlight, Enter selects, Escape closes

## 26. 1inch Venue Prices (BBO Marquee)

- [ ] BBO marquee shows 1inch alongside Wise / OFX / Revolut
- [ ] 1inch row has the green "Live" dot when fresh
- [ ] Price updates on a ~30s cadence
- [ ] If 1inch fetch fails → row shows "—" and dot goes gray (no crash)
- [ ] Omega midpoint "Best Price" badge still appears when Omega beats all venues

## 27. Dev Console Logging (expanded)

- [ ] All existing §15 tags visible: `[nonce]` green, `[order]` cyan, `[api]` purple, `[wallet]` yellow, `[balance]` orange, `[signing]` pink, `[registration]` teal
- [ ] NEW: `[notification]` log when a fill notification is created
- [ ] NEW: `[impact]` log when price-impact estimator runs (includes severity)
- [ ] NEW: `[order] confirmation opened` / `confirmation confirmed` / `confirmation cancelled`
- [ ] Production build (`pnpm build && pnpm start`) → all dev logs tree-shaken (empty console)
