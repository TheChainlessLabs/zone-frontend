# Mei Lin — inspirations

External pages I sourced for the Omega review. Grouped by category. One line each on what we take from it, in my voice.

## Reference inspirations (Asian fintech / crypto / dense mobile)

### Alipay
- [Alipay Mini Program UX Design Guidelines — Service Center](https://miniprogram.alipay.com/docs/miniprogram/design/service-center) — Take the service-grid density and the bottom-sheet pattern for blocking states. Replace the donut on /portfolio with a stacked horizontal bar with inline labels, the way Alipay's wealth dashboard handles allocation.
- [Alipay Mini Program Development Platform — overview](https://miniprogram.alipay.com/docs/miniprogram/design/overview) — Take the discipline of compressing service entries into nine-rectangle grids when there is too much vertically. Trading does not need this, but the gas-preference and theme cards on /account would.

### WeChat
- [WeChat Mini Program Design Guidelines](https://developers.weixin.qq.com/miniprogram/en/design/) — Take the page-locking bottom-sheet pattern, the sticky strip-outside-the-card mode tabs, and the single-progressive-CTA idiom for sign permit then sign deposit.
- [Apps Within Apps: UX Lessons from WeChat Mini Programs — NN/g](https://www.nngroup.com/articles/wechat-mini-programs/) — Take the inline gated-access sheet that previews the gated content. Replace the three full-page Pass/Connect/Wrong-network screens with this pattern.

### Xiaohongshu
- [Xiaohongshu deep-dive — Lillian Li, Chinese Characteristics](https://lillianli.substack.com/p/xiaohongshu-deep-dive) — Take the dual-column card pattern for the /portfolio Open positions / Recent fills / Transfers stack, and the two-line composition that handles the YourFills row without horizontal scroll.

### OKX
- [OKX trading mechanism docs](https://www.okx.com/en-us/help/trading-mechanism) — Take the horizontal segmented pair strip at the top of the trade view, the side-coloured price cell, and the bottom-docked Pro-mode ticket that rises into a sheet on focus.
- [OKX trading settings FAQ](https://www.okx.com/en-eu/help/trading-settings-faq) — Take the configurable order-form layout. Mei wants the institutional-density default, the lite-mode is a different surface and Omega does not need it.

### Futu / moomoo
- [Futu moomoo manual — watchlist customisation](https://www.moomoo.com/us/manual/topic-14-13) — Take the multi-column sliding watchlist for cross-pair comparison and the regional grouping mental model. Apply to a future five-pair watch surface.
- [Hong Kong Stock Trading Mobile Experience Analysis — BiyaPay](https://www.biyapay.com/blogDetail/2434-hong-kong-stock-trading-mobile-experience-analysis) — Take the chart-above-ticket portrait layout. Confirms what every Asian retail trader expects on a phone.

### Tiger Brokers
- [Tiger Brokers feature update notes](https://www.itiger.com/about/app/update) — Take the watchlist UX optimisations — multi-column sliding mode, market icons, personalised settings — as a model for how a trade page should let dense data sit one tap away.
- [Tiger Brokers product page (Singapore)](https://www.itiger.com/sg/) — Take the one-account-many-markets framing as a positioning lesson. Omega has five pairs, not 50 markets, but the same ergonomic ambition applies.

## Anti-references (for behaviour-cost framing)

### Coinbase
- [Crypto's User Activation Crisis: Coinbase Activation Funnel Case Study — Nima Torabi](https://medium.com/the-plg-insider/cryptos-user-activation-crisis-a-product-case-study-on-coinbase-s-activation-funnel-e2a21b6eef48) — Behaviour cost. Coinbase's full-page empty-state gates pushed active traders out to Advanced Trade. Direct precedent for "no full-page detours between wallet connect and a price". Cited in critique.
- [Coinbase vs Coinbase Pro / Advanced Trade — WunderTrading](https://wundertrading.com/journal/en/learn/article/coinbase-vs-coinbase-pro) — Confirms that the simplified consumer flow and the trader flow had to bifurcate because the consumer flow was patronising for users who already knew what they were doing. Omega cannot afford to ship the consumer flow first.

### Robinhood
- [Robinhood and the Gamification of Investing — FinMasters](https://finmasters.com/gamification-of-investing/) — Anti-reference. Confetti, scratch-off cards, push-notification-driven trade prompts. Active traders are not children and stablecoin FX is not a Vegas trip.
- [SEC inquiry into trading gamification — U.S. Congressman Sean Casten](https://casten.house.gov/media/in-the-news/sec-accelerates-inquiry-gamification-trading-sites-robinhood) — Regulatory cost of patronising affordances. Omega's institutional positioning means zero patronising affordances anywhere.

## Mobile UX foundations

### Thumb-zone / one-hand discipline
- [The Thumb Zone: Designing For Mobile Users — Smashing Magazine](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/) — Take the three-zone model. Primary CTAs in the easy zone. Wallet pill on the right of the navbar moves to the bottom tab on mobile.
- [How To Design Mobile Apps For One-Hand Usage — Smashing Magazine](https://www.smashingmagazine.com/2020/02/design-mobile-apps-one-hand-usage/) — Take the curve-anchored quick-action pattern, the order-summary-in-CTA pattern, and the 44x44 minimum tap-target rule for percentage chips and pair strips.
- [Mastering the Thumb Zone — Parachute Design](https://parachutedesign.ca/blog/thumb-zone-ux/) — Confirms 49% of users are one-handed. Five-pair trade switcher must support that user without exception.

## Vendor / platform reads (skimmed, not cited inline)

- [OKX review 2026 — Datawallet](https://www.datawallet.com/crypto/okx-review) — Confirms OKX has both Lite and Pro modes; institutional default is Pro. Maps to Omega's institutional-only stance.
- [Moomoo review 2026 — Wall Street Survivor](https://www.wallstreetsurvivor.com/moomoo-review/) — Confirms moomoo's mobile-first dense dashboard and multi-market watchlist as the daily-use shape for an Asian retail-pro user.
