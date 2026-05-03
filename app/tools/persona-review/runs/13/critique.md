# Caleb Williams — review of Omega interface

24, Austin, retail, lives in Discord. Trades USDC/EURC out of a small DeFi fund, mods two trader chats, and forwards links into group DMs the second something looks like alpha. I was pulled in to answer one question: would I screenshot the Omega trade page into my trading group, or would I scroll past?

Right now: scroll past. The product is correct. It is not yet alpha-coded.

## Top 3, hardest hits first

1. **The order ticket is sitting in the middle of a black void.** No tape, no order book, no last fills, no batch heartbeat — just a 480px column floating on a dot grid. Uniswap's swap card works because it is the entire app and surplus context is welded onto it; here the same card is floating without any of that confidence. Make the ticket *dominant*, not *isolated*. [ref-1][ref-2][ref-7]
2. **"Orders match privately at midpoint" is the alpha and you've buried it as 11px footer microcopy.** This is the actual differentiator versus every other DEX I have open in another tab. CoW Swap turned "you got surplus, here's the number" into the loudest thing on their post-trade screen. Omega should make midpoint match status the loudest thing on the *pre*-trade screen. [ref-2][ref-3][ref-8]
3. **The Phase-4 Pass-required gate is friction wearing alpha cosplay.** A locked padlock icon and "Learn about the pass" link is the most generic NFT-gate template on the internet — it reads like Galxe, not like an early product I want to chase. If you are gating, the gate has to *feel* like the prize, not like a 404. Farcaster's invite era worked because the wait felt social, not bureaucratic. [ref-4][ref-5][ref-15]

## Page-by-page

### /trade — the surface I actually care about

Market mode is too quiet. The 480px column with no chart, no fills, no recent batch, no sense that anything is *happening* on the other side of the wall — that's what a Stripe checkout looks like. Stripe is correct. Trading isn't checkout. Uniswap kept the swap card narrow but always paired it with a price chart and a route preview so you feel the engine behind the price [ref-1][ref-7]. Omega's matching engine is the most interesting part of the product and the UI shows none of it.

The Buy/Sell segmented toggle is fine — green/red tinting, mono labels, that's the right register. The "You receive" row shows an em-dash until you type, which is correct. But the **Type / Fee / Est. receive** strip below it is fundamentally the wrong content. Fee 0.005% is a footnote, not a hero. The three cells should be: **Match window** (next batch in 0:42 ticking down), **Counterparty hint** (`internal · CLOB` or `solver · external`), **Settlement proof** (`mid · 0.9213 · L1 attest in T+3 batches`). That's the CoW Swap surplus pattern applied to a midpoint dark pool [ref-2][ref-3][ref-8]. Same pixels, infinitely more alpha.

The privacy lock at the bottom needs to move *inline* into the CTA — Rabby's pre-sign simulation taught the whole space that the moment of confirmation is when users want clarity, not after [ref-9][ref-10]. The button currently says "Buy USDC". It should say "Buy 5,000 USDC at midpoint · matches privately" with the privacy claim baked in. One affordance, not button + footer.

Limit mode adds a chart placeholder that explicitly admits it's wiring-pending. In a review build that's fine. In a public alpha that's a tell. Either ship a real candlestick chart against the historical midpoint feed (TradingView lightweight-charts, DefiLlama-tier) or kill the slot and use the space for **last 10 batches with their proof hashes** — which is content you uniquely have and nobody else does. The fills table on the right is already good (mono numerals, Settled/Matched chips), just promote it from "bottom right" to "first thing the eye hits after the form."

Mobile Market: the bottom tab bar steals 88px and the ticket already needs every pixel — the "Settlement Ethereum L1" detail from the execution context strip gets clipped behind the tab bar in `trade--connected-market.png`. Fix the safe-area-inset-bottom padding on the page, not just the tab bar. Rainbow handles this by floating the primary action above the tab bar, not below it [ref-6].

### /portfolio — the strongest page; one fix

Hero treatment is right: serif italic eyebrow, oversized $47,213.40 in display weight, signed delta in destructive color, donut + summary on the right. That's Zora-tier compositionally [ref-11]. One thing missing — no **batch lineage** anywhere. As a retail trader my P&L means more if each fill is one click from "show me the proof." Add an inline `→ batch #4821` link on each row in Recent fills that deeplinks to /batches/4821. That's the move that makes me trust this is real and not a CEX in zk cosplay [ref-2][ref-3][ref-12].

### /batches — almost there

The detail page is genuinely good — 4/4 stage donut, color-coded stage list, batch root + proof hash + L1 settlement hash all shown as truncated mono. That's the institutional-calm move I want preserved. What it's missing is **"verify it yourself"** as a primary affordance, not a tertiary microcopy line. CoW Swap's whole brand is "you can prove we executed correctly" [ref-2][ref-3]. Omega has the same property *and a stronger one* (TEE attestation) and treats it as a footnote: "Externally verifiable. Anyone can verify this batch's proof on-chain." That sentence should be a button: `Verify on Etherscan ↗` next to `Replay attestation ↗`. The batch list (#4821, #4820, #4819) — keep, that's clean. The pair-aggregate breakdown — keep, useful.

### /account — fine, mostly invisible

NFT pass: Held — green pill is correct. Gas preference Fast/Normal/Slow as a segmented toggle — correct, that's the Rainbow pattern [ref-6]. Nothing to add. This is supposed to be invisible and it is.

### Modals — the connect flow is the problem

`modal-connect--idle.png`: MetaMask / WalletConnect / Coinbase / Browser wallet stacked in a card. That works. `modal-connect--no-nft-pass.png`: same exact wallet list, no callout that this wallet won't pass the gate, then the user lands on `trade--no-nft-pass.png` and gets told too late. **Front-load the gate detection**: simulate the pass check during connect (Rabby does this for arbitrary contract calls in milliseconds [ref-9][ref-10]) and show the gate state inside the connect modal: `0xa513…C853 · No pass detected · Phase 4 closed`. Don't make me sign and then disappoint me.

The deposit modal is correct shape (chain → token → amount → permit + deposit). The "Sign permit" / "Sign deposit" two-button row is the Uniswap pattern done right [ref-1][ref-7]. Keep.

## Kill list

- The "CHART WIRING LANDS IN M6" placeholder text on /trade Limit. Either real chart or kill the slot — never ship a demo TODO to a public alpha.
- The footer privacy line on the order form ("Orders match privately at midpoint."). It's the wrong size in the wrong place. Move into the CTA.
- The dot-grid background on /trade Market behind a centred 480px card. The grid + the void = Bloomberg-empty-screen energy. Either fill the surface with real content or drop the grid on this one route. [ref-13]
- "Pass required" → "Learn about the pass" pattern. Generic Galxe-tier energy. Replace with the Farcaster-invite move. [ref-4][ref-5]
- The 11px / 10px monospace eyebrows on `EST. RECEIVED · mid · EURC`. Caps + tracking 0.14em + 10px is illegible at desktop viewing distance. Bump to 11px and reduce tracking, or drop the all-caps. [ref-14]

## Build list

- **Match window countdown.** A live `0:42 → next match` micro-counter glued to the order form. CoW Swap shows batch auction phase visibly, that's where "you can feel the engine running" comes from. [ref-2][ref-3][ref-8]
- **Pre-sign simulation row in the order confirmation modal.** Show: `You sign · You spend 5,000 USDC · You receive ≥ 4,606.50 EURC · Settles in batch #4822 · Proof at L1 in ~6 min`. Rabby's exact pattern, applied to a midpoint match instead of a generic ERC-20 swap. [ref-9][ref-10]
- **"Prove it" affordances on /batches detail.** Two outline buttons: `Verify on Etherscan ↗` and `Copy proof hash`. Promote externally-verifiable from microcopy to action. [ref-2][ref-3]
- **Batch lineage links on every fill in /portfolio.** `→ batch #4821` rendered as the same mono pill as on /batches. One click from "I traded" to "here's the on-chain proof I traded honestly." [ref-2][ref-12]
- **Front-loaded pass check inside the connect modal.** Sim the NFT-pass `balanceOf` during the wallet selection step, show inline `No Phase-4 pass on 0xa513…C853` before signing. Rabby precedent: simulate, don't make the user discover. [ref-9][ref-10]
- **Replace "Pass required" gate copy with social-invite framing.** Add: who's already in (`182 traders onboarded`), recent batch volume (`$8.4M settled in last 24h`), and a "request access" path — not just "learn about the pass". Farcaster's invite gating worked because the inside felt populated, not because the door was locked. [ref-4][ref-5][ref-15]

## Anti-reference behaviour cost

Bloomberg Terminal users *take pride* in the pain — yellow-on-black, function codes, the whole Stockholm syndrome [ref-13]. That's a moat for Bloomberg because their users are paid to suffer the UI. Crypto-native retail is the opposite: we have ten DEXes open, one of them feels alive, that's where the volume goes. Omega's current /trade Market screen has Bloomberg's *quietness* without Bloomberg's *density* — which is the worst of both. Either be loud and crypto-native (Uniswap, Zora) or be dense and informational (Bloomberg, Kraken Pro [ref-16]). Floating-card-on-a-grid is neither. The behaviour cost is real: I close the tab and trade somewhere I can feel the book moving.

## References

- [ref-1] Uniswap interface — https://app.uniswap.org/
- [ref-2] CoW Swap product — https://swap.cow.fi/
- [ref-3] Solver Engine, CoW Protocol docs — https://docs.cow.fi/cow-protocol/tutorials/arbitrate/solver/solver-engine
- [ref-4] Farcaster Frames — https://www.farcaster.xyz/
- [ref-5] "Farcaster's Frames Are New Alpha" — https://medium.com/@combfin/farcasters-frames-are-new-alpha-579ffd6738fd
- [ref-6] Rainbow wallet — https://rainbow.me/
- [ref-7] Uniswap interface repo — https://github.com/Uniswap/interface
- [ref-8] CoW Swap explained, surplus + solver competition — https://eco.com/support/en/articles/13064300-cow-swap-explained-intent-based-dex-trading-with-mev-protection
- [ref-9] Rabby transaction simulation — https://docs.tenderly.co/simulations/transaction-preview
- [ref-10] Rabby Wallet review, pre-sign balance-change preview — https://cryptoadventure.com/rabby-wallet-review-2026-safer-evm-defi-with-transaction-simulation-risk-scanning-and-auto-chain-switching/
- [ref-11] Zora — https://zora.co/
- [ref-12] CoW Protocol vs CoW Swap, surplus framing — https://docs.cow.fi/cow-protocol/concepts/how-it-works/protocol-vs-swap
- [ref-13] "The Impossible Bloomberg Makeover", UX Magazine — https://uxmag.com/articles/the-impossible-bloomberg-makeover
- [ref-14] Uniswap v4 modular swap surface — https://www.dextools.io/tutorials/uniswap-v4-the-modular-revolution
- [ref-15] Farcaster DAU surge after Frames launch — https://www.theblock.co/post/275971/farcaster-daily-active-users-surge-frames-launch
- [ref-16] Kraken Pro user reviews — https://www.trustpilot.com/review/kraken.com
