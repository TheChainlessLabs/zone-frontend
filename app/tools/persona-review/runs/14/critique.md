# Hana Mori — Persona 14 critique

> Silence is a feature. I do not trade. I read rooms.
> A trading desk should feel like a private library at dusk, not a server rack with a logo.

## Top three observations (hardest hits first)

1. **The dot-grid is the loudest thing on the page.** Across `/trade`, `/portfolio`, `/batches`, the radial dot field is doing more visual work than any of the actual interface — exactly the failure mode Aceternity-style "blueprint" backdrops tip into when you can read them at a glance, and the trend critique flags as the SaaS-template tell [ref-1][ref-9]. Restraint here is binary: it should either fall below 12% opacity or disappear.
2. **There are too many enclosed rectangles per page, and none of them earn their edges.** `/portfolio` runs five framed cards in a 9-row column; `/trade` (Market) stacks pair switcher, form, context strip — three frames where one breath of negative space would do. The Row's site rule applies: white space is the layout, not the gap between cards [ref-3][ref-13].
3. **Source Serif italic is being used as a single-line ornament, not as a register change.** "Matched, settled, and proved." reads as decoration rather than editorial. Either give the italic the size, line-length, and air a Wallpaper lede commands [ref-4], or retire it from the page chrome and let mono carry the room.

## Page-by-page

### /trade — market mode

A six-foot-wide order form sits alone in a 1440px window with no compositional relationship to anything else on the page. This is the most expensive surface in the product and it is currently arranged as a centred SaaS form. Three things are wrong:

- The card has hairline + soft drop *and* a dot field behind it. Aesop's stores work because the loudest thing in the room is the product, not the wall behind it — same logic [ref-2][ref-8]. Pick one envelope.
- "0xa513…C853" with a green pulse-dot in the navbar is the visual loudness of a notification badge. The Row's nav doesn't do this; neither does Acne Studios. The wallet chip should read like a watermark, not a status light [ref-3][ref-5].
- "Buy USDC" in saturated emerald, then a privacy padlock line directly below in muted grey, then an Execution Context Strip with four mono cells — the whole stack carries three different weights of attention with no chosen hierarchy. Norm Architects' Kinfolk gallery sequences a visitor through three zones of *increasing* privacy [ref-6][ref-12]; this page sequences nothing.

### /trade — limit mode

The chart card is the right idea — wide negative space, a chart that lives in its own frame. But the candles render at full saturation against a charcoal panel, and the "YOUR FILLS / LAST 24H" caption lives in tracked-uppercase mono next to a `Settled`/`Matched` chip that uses the same emerald as the Buy CTA. Three uses of one accent on one viewport. Muuto's catalogue restricts colour to atmosphere, not emphasis [ref-7] — Omega should adopt the same rule for the success hue.

### /portfolio

The hero number is good — `$47,213.40` set large in display sans, the italic lede `Matched, settled, and proved.` directly above. That part lands. What does not:

- The −3.40% red is the loudest character on the page. Robinhood-genre red. Coinbase's chart palette uses near-black for the trace and reserves chromatic red for *negative deltas only*, never the line itself [ref-13]. The chart trace and the delta are duplicating the same alarm.
- The donut chart, the summary card, and the open-positions card are all 1px-bordered panels with the same corner radius and the same fill. There is no rest between them. Wallpaper's editorial layouts use a 7-column grid where most columns are deliberately empty [ref-4]; this layout uses every column it owns.
- Empty state (`portfolio--empty`) shows a faint outline donut and "$0.00" still in the loud delta red. An empty portfolio should be the most composed view in the product, not a templated zero-state.

### /batches list

This is the closest the product gets to atmosphere. The left-edge accent stripe, the mono batch numbers, the spacing between rows — all reading correctly. Two corrections: the `Verified` chip is repeated on every row, which means the chip carries no information when it's universal. Suppress it on default and surface only the exceptions (Pending, Failed). And the search input + "LAST 100" + "Per page: 100" tri-cluster at the top introduces three weights of UI in a 60px band; pick one.

### /batches/[id] (verified)

The 4/4 dial is the strongest piece of typography on the entire site. It has the silence I'm looking for — one number, one ring, one chip, against air. The detail rows below ("BATCH ROOT / PROOF HASH / L1 SETTLEMENT / SUBMITTER") are correct as a four-up table; the surrounding card framing is unnecessary and competes with the dial.

### /account

A sequence of identical 1px-bordered panels (Wallet / Gas / Preferences / Theme / Session). This is the page where Tanizaki's argument lands hardest — *In Praise of Shadows* describes Western aesthetics as the addiction to surface and edge, Japanese aesthetics as the addiction to recess [ref-8]. Account is currently four edges and zero recess. Strip the panels; let labels and dividers carry it.

### Modals (Connect, Deposit, Withdraw)

Connect modal is fine — it has the most restraint of any surface, and is the closest in feeling to a Norm Architects entry zone [ref-6]. Deposit and Withdraw, however, lay token chips, percentage chips, "Network fee" row, "You deposit" row, and a two-button CTA into one 480px panel. That's six elements competing in <500px of vertical air. The Row's checkout is a counter-example: one decision per screen, white between [ref-3].

## Kill list

- The global dot-grid background — at minimum, drop opacity from 0.7 to 0.10 and remove the radial mask entirely; ambient grids that announce themselves are SaaS-template signature [ref-1][ref-9].
- The pulsing green dot next to the wallet address chip — this is exchange-app vocabulary, not institutional [ref-10][ref-11].
- The `Verified` chip in the batches list (suppress when universal; show only exceptions) [ref-3].
- The `surface-soft` shadow envelope on the OrderForm wrapper. The card already has a fill, an inner ring, and sits on a busy background. Pick one.
- The repeated 1px hairline-bordered card on `/account`. Replace with hairline horizontal dividers between sections and let the outer page provide containment [ref-8].
- "ORDERS MATCH PRIVATELY AT MIDPOINT." rendered as a centred caption with a padlock glyph below the CTA. Move it to the navbar or footer once, set in mono uppercase at 10px, and stop repeating. A Bloomberg Tradebook desk doesn't whisper its features twice [ref-10].
- The duplicate of "Est. receive" — once in the OrderForm three-column DetailCell row, again in the ExecutionContextStrip below. Pick one and delete the other.
- The tri-state Buy/Sell tinted segmented control AND a tinted submit CTA for the same side. The form is shouting twice. The CTA carries the colour; the segmented can be neutral [ref-3].

## Build list

- **Re-tier the surface envelope to three explicit levels** — page (no fill, no edge), section (12% inner ring only, no shadow), interactive (hairline + tonal fill, never both). The Row's product page collapses surfaces this way; nothing rests on more than one envelope at a time [ref-3][ref-13].
- **Introduce a true editorial column on `/portfolio`** — 7-column underlying grid, hero number occupies columns 1–4, italic lede sits on its own line above as a Wallpaper-style standfirst (set in Source Serif at 22–24px, 1.4 leading, max 50ch) [ref-4]. Columns 5–7 stay empty above the fold.
- **Introduce shadow as a register on dark mode** — Tanizaki argues a dark room is read by the *gradients* between blacks, not by the highlights [ref-8]. Adopt three explicit dark fills: `bg-deep` (page), `bg-quiet` (panels), `bg-surface` (interactive). The current dark-mode card and dark-mode background are nearly the same value.
- **Demote the Buy/Sell accent.** Use emerald only on the CTA fill at submit; use neutral foreground for the segmented control's active state. Muuto handles this rule for product photography — colour is for atmosphere, not emphasis [ref-7].
- **Replace the global dot-grid with a single, off-axis vertical hairline** as the only ambient mark on the page, sitting where the editorial sidebar would. Dezeen's 2016 redesign worked because it stripped to one austere structural mark [ref-12].
- **Set the "ORDERS MATCH PRIVATELY AT MIDPOINT." line once in the page chrome** as a tracked uppercase whisper at the very bottom of the viewport, not under the CTA. Aesop's storefronts list nothing on the door; the room itself states the brand [ref-2].

## Voice corrections

- "Connect a wallet to trade" / "Omega is read-only until your wallet signs in. No data leaves the page until you authorise." — already in the right register. Keep this voice everywhere.
- "Sealed settlement batches with on-chain attestation. Public, verifiable." — too declarative for a dark-pool product positioned as private. Rewrite to: "Settlement batches, sealed and attested." Same content, less throat-clearing.
- "Bridge stablecoins from Ethereum L1 into Omega." in the Deposit modal — strong. Don't change.

## References

- [ref-1] Setproduct — *Vercel aesthetic: a complete guide to Blueprint Grid design*. https://www.setproduct.com/blog/complete-guide-to-blueprint-grid-design
- [ref-2] Wallpaper* — *Aesop stores: a visual history of interior architecture*. https://www.wallpaper.com/gallery/lifestyle/a-visual-history-of-aesops-best-designer-stores
- [ref-3] Composure Magazine — *The Silent Luxury Revolution: How The Row Redefined Modern Elegance*. https://composuremagazine.com/the-silent-luxury-revolution-how-the-row-redefined-modern-elegance/
- [ref-4] Wallpaper* (Wikipedia, masthead) — https://en.wikipedia.org/wiki/Wallpaper_(magazine)
- [ref-5] Letters from Sweden — *Acne Studios* type-system case study. https://lettersfromsweden.se/acnestudios/
- [ref-6] Dezeen — *Norm Architects creates minimalist workspace for Kinfolk magazine*. https://www.dezeen.com/2016/11/21/norm-architects-minimalist-workspace-office-gallery-interior-design-kinfolk-magazine-copenhagen-denmark/
- [ref-7] Finnish Design Shop — *Muuto: Minimalist Nordic design for modern living*. https://www.finnishdesignshop.com/en-us/manufacturer/muuto
- [ref-8] Wikipedia — *In Praise of Shadows* (Tanizaki, 1933). https://en.wikipedia.org/wiki/In_Praise_of_Shadows
- [ref-9] Aceternity UI — *Grid and Dot Backgrounds* component (the canonical SaaS-template pattern). https://ui.aceternity.com/components/grid-and-dot-backgrounds
- [ref-10] Bloomberg Tradebook — institutional dark-pool front-end. https://www.bloomberg.com/professional/products/trading/trading-venues/btbu/
- [ref-11] CoinDesk — *Crypto.com, the Staples Center and the 'Stadium Curse'* (anti-reference: loud crypto signaling, behaviour cost = the brand becomes synonymous with promotion not product, and a Series-A investor screening Omega will read the same vocabulary as the same risk). https://www.coindesk.com/business/2021/11/17/ftx-cryptocom-and-the-stadium-curse
- [ref-12] Dezeen — *Welcome to the new-look Dezeen* (2016 redesign rationale). https://www.dezeen.com/2016/10/11/welcome-to-new-look-dezeen-update-refresh/
- [ref-13] TYPZA — *10 Minimalist luxury websites that redefine modern elegance*. https://www.typza.com/blog/10-minimalist-luxury-websites
- [ref-14] Aesop — *A respectful response to function and setting*. https://www.aesop.com/us/r/philosophy-to-design/
- [ref-15] CFTC press release — *CFTC Charges Binance ... Willful Evasion ... Operating an Illegal Digital Asset Derivatives Exchange* (anti-reference: aggressive promotional UX as a leading indicator of regulatory failure; behaviour cost is that the same atmosphere makes the product un-buyable for institutional desks who screen for compliance posture). https://www.cftc.gov/PressRoom/PressReleases/8680-23
