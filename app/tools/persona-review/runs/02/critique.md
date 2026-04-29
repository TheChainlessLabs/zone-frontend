# Mei Lin — Omega design-V2 review

Senior product designer, cross-border payments, Shanghai. I trade stablecoins from a phone in line at the airport. I have used Alipay, WeChat Pay, OKX, Futu, and Tiger every day for years. I judge a financial UI by whether I can read it on a 6.1" screen with one thumb while a flight is boarding.

I went through the mobile dark screenshots first, the desktop ones second, then the OrderForm source. I gave myself 45 minutes.

---

## Top 3 observations

1. **The mobile /trade page makes me scroll past the entire order ticket before I see the midpoint reference, and the bottom tab bar actively crops the CTA in Limit mode.** The pair switcher, mode tabs, side toggle, limit price, amount, percentage chips, "you receive", a 3-cell detail strip, the Buy button, the privacy line, *then* the 4-cell ExecutionContextStrip — that is eight stacked sections before the user sees a price chart. On the screenshot of `trade--connected-limit.png` the green CTA and the privacy line are clipped behind the bottom tab bar. OKX, Futu and Tiger all collapse the order ticket into a fixed bottom sheet so the price/chart context stays visible above it; nobody who trades from Asia would ship a layout where the ticket eats the whole viewport. [ref-1][ref-2][ref-3]
2. **Pair switching is a desktop dropdown bolted onto a phone, not a market switcher.** Five launch pairs, and the only way to move between them is a 320px-wide dropdown that opens *downward* over the form. Tiger, Futu, and OKX all expose markets as a horizontal scroll of segmented chips at the top of the trade tab — one tap, no menu, your thumb stays in the easy zone. The Omega dropdown puts the target list right under the chevron, in the stretch zone, behind a tap that hides the form behind the menu. This is the most frequent action on the page and it costs two thumb-stretches per switch. [ref-2][ref-3][ref-4]
3. **The pre-trade gates ("Pass required", "Connect wallet", "Wrong network") are full-page empty illustrations where they should be inline action sheets.** Three different screenshots — `trade--no-nft-pass`, `trade--disconnected`, `trade--wrong-network` — all use the same centred-icon-plus-paragraph layout that occupies 80% of the viewport. Alipay and WeChat treat blocking states as a bottom-sheet with the action button pinned to the thumb zone, so the user resolves the gate without losing where they were on the page. Coinbase used to do exactly this empty-state pattern and active traders abandoned it for Advanced Trade once they realised every gate was a full-page detour. [ref-5][ref-6][ref-7]

---

## Page-by-page

### /trade — Market on mobile (`trade--connected-market.png`)

This is the screen the launch ships against. It does not earn the screen.

- **OMEGA wordmark + truncated wallet pill** eat the top 60px. Fine. But the wallet pill on the right is the only persistent affordance for "switch chain / disconnect / view balances" — and it is in the impossible-zone top-right corner of a 390px viewport. On a Pixel 8 my left thumb cannot reach it without a hand reset. WeChat puts the equivalent under a long-press on the bottom tab. [ref-1][ref-8]
- **Pair switcher** is a 360px-wide pill showing `USDC/EURC  0.9213` and a chevron. Tapping it opens a list with 24h change. That list is the only place I see 24h change at all. That data should live on the page, not in the menu. Tiger and OKX show the price + change inline as a strip of segment chips at the top of the trade view. [ref-2][ref-3]
- **Market / Limit tabs** are inside the order card. Combined with the mode-as-card-internal tab, you cannot tell at a glance which mode you are in until you look inside the card. WeChat keeps mode tabs as a sticky strip *outside* the card so the chrome of the page communicates state. [ref-1]
- **Buy / Sell toggle** is two equal-weight pills; the active one tints. On the small screen the tint is thin enough that I have already mistapped Sell once. OKX makes the active side a high-contrast filled pill that flips the colour of the price cell with it. [ref-2]
- **Amount input is `0.00` in `text-2xl`, available balance is `font-mono text-[10px]` on the label row.** Available balance is the most important number for risk. On Futu and Tiger, available balance sits as a tappable chip directly above the amount field at full size — tap to fill MAX, long-press to enter a custom amount. The current 10px label costs me a squint. [ref-3][ref-4]
- **Percentage shortcuts** (25 / 50 / 75 / MAX) are correct as primitives but render as four equal outlined buttons. Tiger renders these as four tinted chips with the active one filled, so you can see *which percentage you committed to*. The current version forgets state the moment you tap. [ref-3]
- **Buy USDC CTA** is correct as a dominant green pill, sits in the easy zone. But the label `Buy USDC` is the same whether amount = 0 or amount = 5000. The CTA label should carry the order summary at submission moment — `Buy 5,000 USDC at 0.9213 EURC` — that is the iOS Wallet pattern and the WeChat Pay confirmation pattern. [ref-1][ref-9]
- **Below the form**, the ExecutionContextStrip (Midpoint / Est. received / Fee / Settlement) on mobile collapses to 2x2. That is fine in isolation but it duplicates the in-form 3-cell `Type / Fee / Est. receive` strip already inside the order card. Two strips, repeating two values. Pick one. [ref-3]

### /trade — Limit on mobile (`trade--connected-limit.png`)

The chart placeholder is the right idea, the placement is wrong.

- **Chart appears below the order form, below the ExecutionContextStrip, below the You-Fills table.** On a mobile viewport that means I scroll past the entire ticket to see the chart. Every Asian trading app I use puts the chart *above* the ticket — chart at 40% of viewport height, ticket as a half-sheet docked to the bottom that rises on focus. Futu's portrait mode, OKX's Pro mode, Tiger's mobile trade screen, all the same shape. [ref-2][ref-3][ref-4]
- **`Use midpoint` shortcut** is `font-mono text-[10px]`. It is the most useful shortcut on the limit form and it is invisible. Make it a tinted chip flush with the price input, same height as the input. [ref-2]
- **`Your fills` table** with columns Side / Pair / Amount / Price / Status is correct in shape but renders as a 320px-wide horizontal scroll in the screenshot — the Status column is clipped on the right edge. Xiaohongshu's dual-column card pattern shows the right move here: stack each fill as a 2-line card (line 1: side + pair + status chip; line 2: amount @ price + timestamp), no horizontal scroll. [ref-10]

### /portfolio — mobile (`portfolio--default.png`)

The headline `$47,213.40` and the `-$1,659.75 / -3.40% today` row are well-formed. Below that, the page falls apart.

- **`Matched, settled, and proved.`** italic Source Serif 4 line under PORTFOLIO eyebrow is decorative and I tolerate it on the portfolio surface. On /trade I would not.
- **The chart card with 1D / 1W / 1M / 3M / 1Y / ALL pill toggle and Deposit/Withdraw buttons** is fine in shape. But the timeframe pills are below the chart and Deposit/Withdraw is below those — that is *three* horizontal strips of small affordances stacked vertically. On Futu the timeframe pills overlay the chart's bottom edge; the deposit primary action is a floating action button anchored bottom-right above the tab bar. [ref-3]
- **Summary card with the donut + Capital deployed 2.6%**. The donut is 96px of pie with two slices in a 390px viewport. That is decoration. Alipay's wealth dashboard uses a horizontal stacked bar with inline labels for asset allocation, which is denser and reads in one glance on a phone. [ref-5]
- **Open positions, Recent fills, Transfers** each get their own card with their own heading. Three nearly identical cards stacked. WeChat and Xiaohongshu both use a section navigator chip strip + a single pane that swaps content — same information density, half the vertical real estate. [ref-1][ref-10]

### /account — mobile (`account--connected.png`)

This one is closer. Connected wallet card with Address / Chain / Connector / NFT Pass is dense and readable. The Gas preference segmented control is correct.

- **`Reduce motion` toggle row is clipped behind the tab bar on the screenshot.** The Preferences card extends below the bar and renders the toggle half-hidden. This is the same fixed-bar-eats-content bug I flagged on /trade. The page wrapper needs `pb-[calc(60px+env(safe-area-inset-bottom)+16px)]` not `pb-[60px]`. [ref-8]
- **Theme card with `DARK` toggle** is pleasant. Keep.

### Modals — `modal-connect`, `modal-deposit`, `modal-withdraw`

Bottom-sheet on mobile is the right call. The execution is half-finished.

- **Connect wallet sheet** lists MetaMask / WalletConnect / Coinbase / Browser — 4 rows, full width, chevron right. That works. The sheet handle (grey pill at the top) is correct. But the sheet does not lock the body behind it on iOS, you can still scroll the page underneath and the page renders dimmed. WeChat's mini-program bottom sheet locks the page; without that lock my thumb scrolling the page accidentally dismisses the sheet. [ref-1]
- **Deposit modal** has Chain / Token chips (USDC selected) / Amount with `Wallet · 12,500.00 USDC` available / 25/50/75/Max chips / Network fee + You deposit row / Sign permit + Sign deposit buttons. The `Wallet · 12,500.00 USDC` available is at the right size *here*, which proves you know how to render available balance correctly. Apply that same pattern to /trade. [ref-3][ref-4]
- **`Sign permit` then `Sign deposit`** is a two-step signature flow shown as two separate buttons stacked. WeChat Pay and Alipay collapse this into a single primary button that updates its label as it progresses (`Sign permit -> Confirming -> Sign deposit -> Submitting`). One target, sequential states. The current design wastes a CTA slot on a step the user has not reached yet. [ref-1][ref-5]

### /batches — mobile (`batches--default.png`)

This is the strongest surface in the build, even on mobile. Each batch row is dense, status chip + batch ID + fills/orders/notional + pair tags + proof hash. I read four batches per screen without scrolling. Don't touch.

One nit — the search field at top with `Last 100 / Per page: 100` controls is a desktop primitive. On mobile that whole row should be a sticky filter chip strip that I can scroll horizontally. [ref-2]

### Pre-trade gates — `trade--no-nft-pass`, `trade--disconnected`, `trade--wrong-network`

These three screens are the worst surfaces in the build for a mobile-first user.

- All three are full-page centred-icon-paragraph-button. Vertical real estate is wasted. The user is gated *from* the trade page but the page does not show them what they are missing. [ref-7]
- The `Pass required` page links out to `Learn about the pass` — opens a new tab. On mobile that is a context loss. WeChat mini-programs handle gated access as an inline bottom sheet that previews the gated content blurred behind, with the unlock CTA pinned bottom. The user sees what they are unlocking. [ref-1][ref-6]
- `Connect a wallet to continue` repeats the message twice — once in the wallet pill in the header, once as the empty-state hero. One source of truth. Coinbase's old onboarding had this exact redundancy and removed it after the 2022 funnel review. [ref-7]

---

## Kill list — remove

1. **The duplicate 3-cell `Type / Fee / Est. receive` strip inside the order card.** Same data is in the ExecutionContextStrip below. Pick the one outside the form. [ref-3]
2. **The big donut on /portfolio summary with two slices.** Replace with a horizontal stacked bar with inline `USDC $32,450 · EURC $14,763` labels. Alipay does this and it is denser. [ref-5]
3. **Full-page empty-illustration treatment on `trade--no-nft-pass`, `trade--disconnected`, `trade--wrong-network`.** Convert to inline bottom-sheet over a dimmed but still-rendered /trade page so the user sees what they are unlocking. [ref-1][ref-6]
4. **The 10px `Available 10000.00 USDC` label.** Promote to a tappable chip directly above the amount input at full readable size. [ref-3][ref-4]
5. **`Buy USDC` static CTA label.** Replace with the order summary at submit time. [ref-1][ref-9]
6. **`Sign permit` / `Sign deposit` as two separate stacked buttons.** Collapse to one primary CTA whose label progresses through the steps. [ref-1][ref-5]

## Build list — add

1. **A horizontal pair-chip strip at the top of the trade tab.** Five chips, each showing `USDC/EURC  0.9213  +0.04%`, sticky under the header, horizontal scroll if it overflows. Tap to switch, no menu. Tiger and Futu both ship this exact strip. [ref-2][ref-3]
2. **A bottom-docked order ticket on mobile that rises into a sheet on focus.** Default state: 2-line strip pinned above the tab bar (Side toggle on left, Amount field on right, `Submit` chip). Tap the strip and it expands into a half-sheet covering the bottom 60% of viewport with the full ticket. The chart stays visible above. OKX Pro mode and Futu mobile both do this. [ref-2][ref-3]
3. **Available balance as a primary tappable chip above the amount input.** Tap = MAX, long-press = custom. Same size as the amount field label, not 10px. Futu, Tiger, OKX all do this. [ref-2][ref-3][ref-4]
4. **Order summary inside the CTA at submit moment.** `Buy 5,000 USDC at 0.9213 EURC · fee 0.005%` — last legible chance to catch a wrong order. iOS Wallet's Apple Pay confirmation does this. WeChat Pay does this. [ref-1][ref-9]
5. **Inline gated-state bottom sheets** for `Pass required`, `Connect wallet`, `Wrong network`. The /trade chart and pair strip stay rendered behind, dimmed; the sheet handles the gate. WeChat mini-program pattern. [ref-1][ref-6]
6. **Page padding fix.** Every page wrapper needs `pb-[calc(60px+env(safe-area-inset-bottom)+16px)]` so the bottom tab bar does not crop content. The `pb-[60px]` currently in AppShell is exact-fit and the safe-area inset on iPhone 14+ pushes it under. Visible on `trade--connected-limit`, `account--connected`, `portfolio--default`. [ref-8]
7. **Single progressive CTA in deposit/withdraw flows** with state-driven label. Apple Pay and WeChat Pay both use this. [ref-1][ref-9]

---

## Verdict

`design-V2` reads like a desktop layout that was responsive-shrunk to mobile. The bones are good — the order primitives, the batches surface, the colour discipline. The mobile ergonomics are not yet shipped. I have rewritten the /trade mobile shell at `redesign/trade-mobile-mei.tsx` — chart-first, pair-strip-second, bottom-docked ticket, available-balance promoted, CTA carrying the summary. It is not a rebuild of the order primitives. It is a re-layering of where they sit on a phone.

A trader holding the device with one hand should be able to switch pair, set amount, and submit without their thumb leaving the bottom third of the screen. That is the test. Ship that, and the desktop layout falls out for free as a wider grid of the same units.

---

## References

- [ref-1] [WeChat Mini Program Design Guidelines — Tencent](https://developers.weixin.qq.com/miniprogram/en/design/) — bottom-tab navigation rules, sticky mode strips, page-locking bottom sheets, single-progressive CTAs.
- [ref-2] [OKX product documentation — trading mechanism and basic rules](https://www.okx.com/en-us/help/trading-mechanism) — segmented market chip strip at the top of trade view, side-coloured price cells, bottom-docked Pro-mode ticket. Asian crypto-native account/trade/earn hierarchy.
- [ref-3] [Futu / moomoo manual — watchlist customisation](https://www.moomoo.com/us/manual/topic-14-13) — multi-column sliding watchlist, regional market chip strip, available-balance-as-chip pattern, percentage shortcuts as filled chips.
- [ref-4] [Tiger Brokers feature notes](https://www.itiger.com/about/app/update) — multi-column sliding watchlist for horizontal browsing of key data, watchlist optimised for retail efficiency, market icon personalisation.
- [ref-5] [Alipay Mini Program UX Design Guidelines — Service Center](https://miniprogram.alipay.com/docs/miniprogram/design/service-center) — service-grid density, bottom-sheet for blocking states, horizontal stacked-bar over donut for portfolio breakdown.
- [ref-6] [Apps Within Apps: UX Lessons from WeChat Mini Programs — NN/g](https://www.nngroup.com/articles/wechat-mini-programs/) — gated-access bottom sheets that preview the gated content, single page-locked sheet pattern that prevents accidental dismiss.
- [ref-7] [Crypto's User Activation Crisis — Coinbase activation funnel case study](https://medium.com/the-plg-insider/cryptos-user-activation-crisis-a-product-case-study-on-coinbase-s-activation-funnel-e2a21b6eef48) — anti-reference. Active traders abandoned full-page empty-state gates for Advanced Trade once Coinbase's onboarding cost surfaced. The behaviour cost: every full-page detour during a hot pair is a missed entry, and the user attributes the friction to the venue. Direct lesson: institutional traders won't tolerate three full-page gates between wallet connect and a price.
- [ref-8] [The Thumb Zone: Designing For Mobile Users — Smashing Magazine](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/) — three reachability zones, 75% of mobile interactions are thumb-driven, primary actions belong in the bottom third of viewport, safe-area inset compliance.
- [ref-9] [How To Design Mobile Apps For One-Hand Usage — Smashing Magazine](https://www.smashingmagazine.com/2020/02/design-mobile-apps-one-hand-usage/) — order-summary-as-CTA-label pattern, progressive button states, fintech-app curve-anchored quick actions reduced mis-taps and shaved 8s off transfer flow.
- [ref-10] [Xiaohongshu deep-dive — Lillian Li, Chinese Characteristics](https://lillianli.substack.com/p/xiaohongshu-deep-dive) — dual-column card pattern, two-line card composition for high information density, vertical-feed pacing optimised for mobile thumb scroll.
