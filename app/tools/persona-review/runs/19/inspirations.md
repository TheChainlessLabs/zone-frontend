# Talia — inspirations

What we steal from, who we run from. Group by pattern.

## Mobile finance — copy this

- https://engineering.grab.com/driving-sea-forward-through-people-focused-design — Grab engineering on people-focused mobile design across SEA. Take: low-end Android first, header band carries action, never make a $120 Oppo render a desktop pretender.
- https://procreator.design/blog/super-app-ui-principles-from-top-global-app/ — Super-app UI principles. Take: 3–5 bottom tabs, primary actions in the bottom-third thumb zone, nothing else.
- https://medium.com/eggcademy/vietnamese-mobile-wallet-momo-redesign-b2e2be8cfded — MoMo redesign case study. Take: amount as the visual hero, inline numeric keypad, tap-targets that work for a 65-year-old auntie remitting to her son.
- https://blog.binance.us/advanced-trading-redesign/ — Binance advanced trade redesign. Take: percent-shortcuts as a real keypad row, not a strip; chart and order form on the same surface; one CTA, sticky, never floating mid-page.
- https://support.binance.us/en/articles/9843497-binance-us-app-2-0-new-mobile-app-changes — Binance.US App 2.0 mobile changes. Take: streamlined Market/Limit/Stop-Limit on a single page, optional percent tabs, mini chart in the order surface — every cut they made is one we should make.

## Mobile crypto wallets — pattern source

- https://trustwallet.com/ — Trust Wallet front door. Take: sticky bottom CTA pinned above home-indicator, single-purpose screens.
- https://help.phantom.com/hc/en-us/articles/4406393831187-How-to-receive-tokens-in-Phantom — Phantom mobile receive flow. Take: full-bleed amount entry, swap arrow as the direction-flip control instead of a Buy/Sell tab pair.
- https://apps.apple.com/us/app/phantom-crypto-wallet/id1598432977/ — Phantom App Store listing. Take: bottom-sheet for everything (connect, swap, sign), no centred modals.

## Telegram bots — the actual SEA finance pattern

- https://core.telegram.org/api/bots/buttons — Telegram inline keyboard spec. Take: one message + four inline buttons is enough for most decisions; stop building dashboards when a message will do.
- https://core.telegram.org/bots/2-0-intro — Telegram Bot API 2.0 intro. Take: callback-button flows, no pages, no scrolling — confirm in place.

## OS guidelines — the floor, not the ceiling

- https://developer.apple.com/design/human-interface-guidelines/layout — Apple HIG Layout (safe area, home indicator). Take: non-scrollable controls live inside the safe area, leave breathing room around the indicator. The current AppShell violates this on every page.
- https://developer.apple.com/design/human-interface-guidelines/ — Apple HIG root. Take: consistency cross-screen, gesture conventions, swipe-to-dismiss for sheets.
- https://www.lukew.com/ff/entry.asp?1085= — LukeW on touch target sizes. Take: 7–10 mm minimum; the percent shortcut buttons (h-9 ≈ 36 px on a 2x display) are right at the floor and should be h-12 (48 px) on mobile.
- https://dequeuniversity.com/rules/attest-ios/1.0/touch-target-size — Deque University iOS touch target rule. Take: 44×44 pt minimum, hard a11y line; we should aim 48 dp to match Material too.
- https://blog.appmysite.com/bottom-navigation-bar-in-mobile-apps-heres-all-you-need-to-know/ — Bottom nav 2025 guide. Take: never let the nav bar overlap content; reserve `pb-[bar-height + safe-area]` on the wrapper.

## Anti-references — what failure looks like

- https://www.stockbrokers.com/review/interactivebrokers — Interactive Brokers 2026 review. Anti-take: their mobile app is "for tracking market movements", not real trading. Desktop-first port is a behaviour cost, not just an aesthetic miss.
- https://investmentmoats.com/money/interactive-brokers-desktop/ — Investment Moats on TWS. Anti-take: "designed for finance managers, not retail" → their mobile audience never picks them. Omega cannot afford this.
- https://www.elitetrader.com/et/threads/is-it-just-me-or-is-trader-workstation-a-terrible-app-for-options-trading.328856/ — Elite Trader thread on TWS. Anti-take: even paying retail finds the experience punishing; "institutional-only" is a marketing line, not an excuse.
- https://www.bloomberg.com/professional/support/ — Bloomberg Terminal product surface. Anti-take: an entire generation of finance UX trapped under a 1980s keyboard. The Terminal is not aspirational, it is what we route around.
- https://grafana.com/ — Grafana home. Anti-take: observability tool, not a user-finance tool. Density without choices is dashboards-as-decoration.
