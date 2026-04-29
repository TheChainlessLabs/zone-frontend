# Sophie Dubois — Critique

> The brand must have posture. Right now Omega has correct components and no posture.

## Top three observations

1. **The product opens on a panel, not a venue.** `/trade--connected-market` lands the eye on a 720-pixel order card floating in a sea of dot-grid; there is no editorial wall, no name set, no statement that this is a place. Chanel and Hermès teach the opposite — the surface stages the act before transacting it [ref-1][ref-7]. Omega currently behaves like a settings dialog in a black room.
2. **Source Serif 4 italic is a guest, never a host.** The serif appears once on `/portfolio` (*"Matched, settled, and proved."*) and on the `/brand` board, then vanishes. Without serif punctuation on `/trade`, `/batches`, and the connect modal, the italic reads as decoration borrowed for one screenshot, not as a brand register. Fondation Cartier and LVMH commission custom serif systems precisely so the institutional voice is felt on every surface, not as a cameo [ref-3][ref-8].
3. **Trading chrome and brand chrome have the same weight.** The "0xa513…C853" wallet pill, the "OMEGA" wordmark, the tab triplet (TRADE / PORTFOLIO / BATCHES), and the "Connect Wallet" button all live in one undifferentiated 56-pixel bar. A house with posture lets the name dominate and the utilities recede — COS does this with a navigation that gives the wordmark a full row and parks the cart in a hairline strip [ref-4]. Right now the wallet hex is louder than the name of the venue.

## Page by page

### /trade (Market and Limit) — desktop dark

The Market view is the most exposed surface and the one least dressed. A single soft-shadow card on a dot-grid background reads as a Vercel template, not a darkpool [ref-5]. The privacy notice — *"Orders match privately at midpoint."* — is the only sentence on the page that carries the brand, and it is set in 11px muted text below the CTA, where Kinfolk would never bury its thesis [ref-6].

In Limit mode (`trade--connected-limit.png`), the chart placeholder reads *"CHART WIRING LANDS IN M6"*. That string ships in the screenshot used to evaluate brand posture. Even as wireframe copy, this is the kind of leak A Magazine Curated By would never permit on a contact sheet [ref-2]. Remove now; replace with a quiet *Midpoint reference — last 24h* lede in italic.

The Buy / Sell segmented toggle uses success-green and red-destructive at equal saturation. Trading houses that broadcast posture (think the Bloomberg terminal or the MTS dark venues) hold colour back until the act is committed. Saturated tone on the *intent* control telegraphs DEX-energy. Pull both to monochrome at rest; let the success/destructive emerge only on confirmation modals.

### /portfolio — desktop dark

The single best surface in the build. The italic lede *"Matched, settled, and proved."* under PORTFOLIO eyebrow is the one moment the venue speaks [ref-3][ref-6]. But the chart hero is a saturated red gradient fill on a $47,213 number rendered at heavy weight — it screams *bad day* and competes with the lede. Quiet curves only — switch to a hairline, no fill, with the italic doing the emotional work.

Open positions and Recent fills sit in matching rounded cards with identical visual weight as the Summary donut. There is no figure-ground hierarchy. Kinfolk's grid trick: introduce vertical rhythm by letting one column breathe two-units more than the other [ref-6].

### /batches list and /batches/:id — desktop dark

The list page is the most institutionally credible surface — *"Sealed settlement batches with on-chain attestation. Public, verifiable."* is exactly the register a museum identity would adopt [ref-3]. The detail page's 4/4 progress ring is correct in concept but the green stroke is at full saturation; reduce to a one-pixel ring with a 14px italic *Verified* below. The point is institutional certification, not gamified completion.

### /account — desktop dark

The Gas preference segmented control is the single largest object on the page after the H1, and it is a developer setting. The Connected wallet card and Preferences card share the same surface treatment, the same radius, the same shadow envelope — there is no hierarchy between the *identity* of the session and the *adjustment* of its defaults. Hermès' product pages give identity (the bag, the name) two thirds of the canvas; controls live in a sidecar [ref-7].

### Connect wallet modal

The modal is correct as a function. As a *first contact* with Omega for a new institutional user, it is mute. There is no italic lede, no setting of register — just four vendor logos. A house with posture introduces itself in one sentence before asking for credentials; LVMH's Maisons gateway does this with two lines of serif before any link list [ref-8].

### /brand

The brand board itself is honest about the system: it shows the palette, the type, the curves. The problem is that the board's *own* layout is the most editorial surface in the build, while every shipping page is less considered than the document describing them. The shipping app must look as composed as the page that argues for the composition.

## Kill list

- The dot-grid background on `/trade` Market mode. It is wallpaper. A darkpool does not have wallpaper.
- The full-saturation red fill under the portfolio chart line. Replace with a hairline, no fill.
- *"CHART WIRING LANDS IN M6"* placeholder string. Even in wireframe shots, internal milestone language never appears in a brand-evaluation surface [ref-2].
- The Buy and Sell coloured tints at rest. Hold colour for the confirmation step.
- Equal-weight wallet pill in the navbar — drop the leading green dot, set the hex in 11px mono, and let the wordmark breathe.
- Identical card treatment across every surface. Tables get hairlines; brand-moments get the soft envelope; nothing else gets the soft envelope.

## Build list

1. **An italic editorial lede on every page header — not just /portfolio.** Source Serif 4 italic at 20–24px, single sentence, period-terminated, sitting below the page eyebrow. /trade gets *"Match at midpoint. Settle on chain."* /batches gets *"Sealed, attested, public."* /account gets *"This wallet, this session."* This is how Fondation Cartier turns every exhibition page into the same institution speaking [ref-3].
2. **A single-column "venue plate" above the order card on /trade Market.** 96px of vertical air, eyebrow MARKET set in 10px mono uppercase, italic lede underneath, then the card. This is COS's product-page logic — the photograph and the title sit alone before the buy-row appears [ref-4].
3. **Demote the wallet pill and the navbar tabs to a single 40px hairline strip.** Keep the wordmark on its own line above. The institutional gesture is the name first, then the utilities — Hermès, Cartier, and LVMH all separate identity from controls vertically rather than horizontally [ref-7][ref-8].
4. **Replace the saturated chart fill on /portfolio with a 1.5px line, no area fill, anchored to a baseline grid.** Let the italic lede *"Matched, settled, and proved."* carry the sentiment. Kinfolk's rule: emotion lives in the type, not the chart [ref-6].
5. **A connect-modal lede.** One italic sentence above the four vendor rows: *"Sign in with the wallet that holds the desk."* — the registry is the act, not the modal.

## Anti-reference cost — Binance

Binance's interface is what happens when every promotional surface fights every other promotional surface for the same square inch. Trustpilot reviews and Coin Bureau both note new users describe the platform as "overloaded with too many tabs and buttons" and "scary for beginners who can get lost trying to find a certain section" [ref-9]. The cost is concrete: institutional desks reviewing Omega for a counterparty trial cannot present a screen that reads in the same visual register as the venue they are trying to *avoid*. Every saturated coloured chip, every promotional banner, every equal-weight tab triplet is a step toward the bazaar. Hold the line.

---

## References

- [ref-1] Chanel — restraint and monochrome discipline in luxury identity. https://www.chanel.com · context via https://dirtylinestudio.com/luxury-brand-typography/ and https://www.chroitor.com/brand-design-lessons-from-chanel-crafting-a-legacy-of-luxury/
- [ref-2] A Magazine Curated By — fashion-editorial visual intelligence. https://a-magazine.be
- [ref-3] Fondation Cartier — custom institutional typeface (FCartier by Base Design) and exhibition-coloured visual system. https://www.fondationcartier.com · context https://area17.com/clients/fondation-cartier and https://fontsinuse.com/typefaces/147516/fcartier
- [ref-4] COS — minimal product-page logic, five-item navigation, editorial photography. https://www.cos.com · analysis https://fazbuy.com/blogs/news/cos-s-elevation-strategy-how-the-minimalist-giant-is-redefining-affordable-luxury
- [ref-5] Vercel / shadcn zinc — the foundation Omega adopts; reads as default unless dressed. Omega brand source `omega-docs/03-brand/visual-identity.md`.
- [ref-6] Kinfolk — whitespace as compositional rhythm; type carries emotion, not ornament. https://www.kinfolk.com · redesign by Alex Hunting Studio https://alexhunting.studio/blogs/projects/kinfolk · type-system context https://klim.co.nz/in-use/kinfolk-magazine/
- [ref-7] Hermès — quiet luxury digital experience; identity and utility separated. https://www.hermes.com · analysis https://premiumcoding.com/the-new-language-of-luxury-website-design-how-digital-experiences-shape-desire-in-2025/
- [ref-8] LVMH — institutional serif system commissioned from Production Type for portfolio voice. https://www.lvmh.com · https://productiontype.com/portfolio/lvmh
- [ref-9] Binance (anti-reference) — interface criticism: overloaded, cluttered, "scary for beginners". https://www.binance.com · https://coinbureau.com/review/binance-us-review · https://www.trustpilot.com/review/binance.com
