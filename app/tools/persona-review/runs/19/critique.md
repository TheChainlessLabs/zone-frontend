# Talia Nguyen — critique

22, Ho Chi Minh City. Phone first, always. I am reviewing this on a 6.1" Android in one hand on a Grab. If I cannot finish a buy of USDC/EURC with my right thumb, you do not exist for me or for anyone in my Telegram group of 4,000 stablecoin remittance users.

I went through the mobile screenshots — `mobile/dark/trade--connected-market.png`, `trade--connected-limit.png`, `portfolio--default.png`, `portfolio--empty.png`, `batches--default.png`, `batches-detail--verified.png`, `modal-connect--idle.png`, `modal-deposit--idle.png`, `account--connected.png`, `trade--no-nft-pass.png`, `trade--disconnected.png`. The desktop set I skipped — desktop is a courtesy, not the product.

## Top 3 — hardest hits first

1. **The bottom tab bar eats the primary CTA.** On `trade--connected-limit.png` the green "Buy USDC" submit sits maybe 8 px above the `TRADE / PORTFOLIO / BATCHES` bar — every confirmation tap is a 50/50 between "buy" and "switch route". That violates the entire point of the thumb zone [ref-1][ref-7] and the iOS safe-area / home-indicator rule [ref-3]. On `portfolio--default.png` the bar literally overlaps the Summary card. This is a cliff, not a bar.

2. **The order form is desktop-shrunk, not mobile-built.** Pair switcher, mode tabs, side toggle, limit price, amount, percent shortcuts, "you receive", three-cell detail strip, then CTA — eight stacked surfaces in the order form alone before I even see the chart. Binance's mobile spot form keeps it to four [ref-4]; Phantom's swap is essentially three [ref-9]. I scroll three times to buy.

3. **Amount entry is a tiny right-aligned text box, not a keypad surface.** I tap `0.00`, the OS keyboard slides up, covers the percent shortcuts and the CTA, and now I am typing blind. Every Vietnamese mobile wallet I use — MoMo, ZaloPay, the Binance app — pins amount as the visual hero with the keypad inline [ref-2][ref-4]. This is the single biggest reason a remittance user bounces.

## Page-by-page

### `/trade` — Market and Limit

`trade--connected-market.png`: the form is alright but the chrome is wrong. `OMEGA` wordmark + wallet pill + pair switcher + Market/Limit tab + Buy/Sell + Amount label + input + percent row + "you receive" accordion + 3-cell detail strip + CTA + privacy line + bottom tab bar. That is twelve horizontal bands inside a 390×844 viewport. Telegram bots, which is how my friends transact, ship a single message + four inline buttons [ref-5]. Cut. Cut. Cut.

`trade--connected-limit.png`: scrolling reveals a candlestick chart and "Your fills" table below the form. On limit mode the form pushes the CTA almost into the tab bar (~16 px gap). Apple's HIG says non-scrollable content lives inside the safe area and you leave negative space around the home indicator [ref-3]. We have neither.

`trade--disconnected.png` and `trade--no-nft-pass.png`: empty-state hero with "Connect Wallet" / "Learn about the pass" — the empty-state itself is the cleanest surface in the whole app. Keep.

### `/portfolio`

`portfolio--default.png` and `portfolio--empty.png`: the chart hero is fine, the 1D/1W/1M/3M/1Y/ALL row is fine, Deposit/Withdraw is fine. But "Open positions", "Recent fills", "Transfers" are three separate cards that scroll one after another and the bottom tab bar covers the dial chart on default. The Summary card has a horizontal "USDC $32450.00 / EURC $14763.40" row that is partially under the tab bar. This is a layering bug, not a visual taste issue. Add `pb-[80px]` and a content sentinel — that is one line.

`portfolio--disconnected.png` is identical to the connected screen — the empty state never fires. Bug.

### `/batches`

`batches--default.png`: list works for me. The Aztec-green left-edge stripe + "Verified" pill is readable. But the list page also has its tab bar covering the "Batch #4818" row. Same bug, same one-line fix.

`batches-detail--verified.png`: the 4/4 stage circle is good — tells me the proof is sealed without making me read. But the page is 1500+ pixels tall on mobile, and the tab bar floats over "Volume / Orders" mid-card. Section folding (collapse "Pair aggregate", "Batch root", "Externally verifiable" by default) would cut that to one screen.

### `/account`

`account--connected.png`: the tab bar covers "Show advanced order types" — I never even saw the option until I scrolled twice. The Gas preference Fast/Normal/Slow segmented control is crystal-clear, that is the right pattern.

### Modals

`modal-connect--idle.png`: bottom-sheet pattern is correct [ref-3][ref-9]. Four wallet rows are 56 px tall, that is comfortable. Keep.

`modal-deposit--idle.png`: the sheet is half-screen with a giant black gap below "Sign deposit". Wasted real estate. The CTA should be sticky at the bottom inside the sheet, not floating mid-page. Permit + Sign deposit are two separate buttons stacked with no spacing distinction — looks like a double-confirm trap. Trust Wallet swap-confirm puts one CTA, full width, above the home-indicator inset [ref-6].

## Kill list

- The free-floating bottom tab bar without a `pb-[var(--tab-h)+safe-area]` content sentinel. Causing overlap on every page.
- The "You receive" accordion row above the 3-cell detail strip — it shows the same number twice. Pick one.
- The `Available 10000.00 USDC` micro-label in mono-uppercase tracking-wide. Unreadable at 10 px. Use plain numerals.
- The tabs "Market / Limit" stacked above the Buy/Sell toggle. Two segmented controls within 80 px is one too many — collapse Buy/Sell into the CTA itself (one button "Buy USDC", swipe-to-flip to Sell).
- The PairSwitcher card above the form. Move it to the header.
- Two stacked CTAs in deposit ("Sign permit" outline + "Sign deposit" filled). Combine into one progressive button: "Sign permit → Sign deposit" stepped state.

## Build list

1. **Sticky bottom CTA above the tab bar, with safe-area inset.** Floating action region (`position: sticky; bottom: 60px + env(safe-area-inset-bottom);`). Apple HIG says non-scrollable controls live in the safe area; the home indicator gets breathing room [ref-3]. Trust Wallet and Phantom both pin their primary swap CTA this way [ref-6][ref-9]. **Precedent: [ref-3][ref-6][ref-9]**.

2. **Inline numeric keypad as the primary amount-entry mode, not the OS keyboard.** Big tap-targets (≥48 dp [ref-7][ref-8]), digits + decimal + backspace. MoMo and ZaloPay drive 23M+ Vietnamese users with this pattern [ref-2]; Binance percent-buttons live next to a fixed digit row [ref-4]. The OS keyboard is the fallback, not the path. **Precedent: [ref-2][ref-4][ref-7]**.

3. **Pair switcher into the header pill, not as a card.** `USDC/EURC 0.9213 ▾` lives where the wallet pill is on a phone — header is hot real estate, do not waste it on a logo only. Grab puts location/destination right in the header band; that is the reason their super-app navigation works on a $120 Oppo [ref-1][ref-10]. **Precedent: [ref-1][ref-10]**.

4. **Collapse the 3-cell detail strip + "You receive" row into one expandable summary line.** "You pay 5,000 USDC → receive 4,606.50 EURC · fee 0.005% · est. 2 ms" — one row, tap to expand. Telegram bots, which is the actual mobile finance pattern in SEA, run on this single-line + tap-to-expand idiom [ref-5]. **Precedent: [ref-4][ref-5]**.

5. **Buy/Sell as a swipe-flip on the CTA, not a separate radio.** Default Buy. Swipe right on the CTA to flip to Sell. One row recovered, one ambiguity gone. Phantom swap collapses direction into a single arrow flip [ref-9]; Binance has a separate Buy/Sell tab pair but the mobile redesign 2025 trend is consolidation [ref-4][ref-11]. **Precedent: [ref-4][ref-9][ref-11]**.

6. **Bottom-sheet for confirmation, not a centred modal.** The `OrderConfirmationModal` should slide up from the bottom, sticky-CTA inside the sheet, swipe-down-to-dismiss. The connect-wallet sheet (`modal-connect--idle.png`) already does this — apply the same pattern everywhere. iOS HIG plus the dominant SEA mobile pattern [ref-3][ref-9]. **Precedent: [ref-3][ref-6][ref-9]**.

7. **Add a `pb-[calc(60px+env(safe-area-inset-bottom)+16px)]` sentinel on every page wrapper inside `AppShell`.** This is the single biggest fix in the whole audit and it is one line of CSS. **Precedent: [ref-3]**.

## Anti-reference: behaviour cost

Bloomberg Terminal's mobile companion exists, but reviewers are blunt — "the mobile app and online platform will not offer all of the functionality you need for anything more than tracking market movements" [ref-12]. That is the cost of building desktop-first then porting: your phone surface is a quote viewer, not a trading tool. Interactive Brokers' TWS has the same disease — the mobile app is for "tracking market movements" and is missing drawing tools and order entry depth [ref-12][ref-13]. Omega is positioned as institutional, but the institutional audience is increasingly mobile-first too — and even if they are not, the long-tail retail FX user (me, my Telegram group, 600M Southeast Asians on stablecoin payment rails) absolutely is. If I cannot complete the alpha demo path on my phone, I am not the user. And I am the user.

## References

- [ref-1] Grab Engineering — *Driving Southeast Asia Forward Through People-Focused Design.* https://engineering.grab.com/driving-sea-forward-through-people-focused-design
- [ref-2] Eggcellent Design — *Vietnamese Mobile Wallet MoMo Redesign* (UX case study). https://medium.com/eggcademy/vietnamese-mobile-wallet-momo-redesign-b2e2be8cfded
- [ref-3] Apple — *Layout · Human Interface Guidelines* (safe area + home indicator). https://developer.apple.com/design/human-interface-guidelines/layout
- [ref-4] Binance.US — *App 2.0: New Mobile App Changes* (percent tabs + streamlined order entry). https://support.binance.us/en/articles/9843497-binance-us-app-2-0-new-mobile-app-changes
- [ref-5] Telegram Core — *Bot Buttons / Inline Keyboard.* https://core.telegram.org/api/bots/buttons
- [ref-6] Trust Wallet — *Mobile crypto wallet feature set.* https://trustwallet.com/
- [ref-7] LukeW — *Touch Target Sizes* (44pt iOS, 48dp Material). https://www.lukew.com/ff/entry.asp?1085=
- [ref-8] Deque University — *Touch Target Size Rule (iOS).* https://dequeuniversity.com/rules/attest-ios/1.0/touch-target-size
- [ref-9] Phantom — *Help Center · Mobile patterns.* https://help.phantom.com/hc/en-us/articles/4406393831187-How-to-receive-tokens-in-Phantom
- [ref-10] ProCreator — *Top 5 UX Principles for Super App UI Design.* https://procreator.design/blog/super-app-ui-principles-from-top-global-app/
- [ref-11] Binance.US Blog — *Introducing the All-New Advanced Trade Interface.* https://blog.binance.us/advanced-trading-redesign/
- [ref-12] StockBrokers.com — *Interactive Brokers Review 2026* (mobile platform limits). https://www.stockbrokers.com/review/interactivebrokers
- [ref-13] Investment Moats — *What is There to Like and Dislike about Interactive Brokers Desktop.* https://investmentmoats.com/money/interactive-brokers-desktop/
- [ref-14] AppMySite — *Bottom navigation bar in mobile apps · 2025 guide.* https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/
