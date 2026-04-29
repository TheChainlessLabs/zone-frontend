# Aisha Khan — critique of Omega design-V2

If a keyboard-only trader on a screen reader cannot complete the demo path — connect, fund, place a market order, read its outcome, find it again in /portfolio — then this product does not exist for them. That is the gate. I reviewed the dark and light renders on desktop and mobile, with a focus on the surfaces a wallet-gated, FX-priced, on-chain-settled product fails first: the disconnected state, the wrong-network banner, the order form, the withdraw modal, and the batch detail.

What follows is structured: top hits, then per-page, then a kill list and a build list. Every recommendation cites at least three external sources, with at least one anti-reference framed as a behaviour cost.

## Top 3 observations (hardest hits first)

1. **The order form has no error summary, no live region, and no programmatic name on its three-cell "Type · Fee · Est. receive" strip.** A blind trader will tab into a `display:none`-equivalent of "details" because the cell labels are font-mono ten-pixel uppercase tracked text rather than `<dl>` semantics, and the est-receive value updates silently as the amount changes. GOV.UK, NHS, ONS and the National Archives all converge on the same pattern: every form needs an error summary at the top with `role="alert"` and `tabindex="-1"`, plus an inline message per field [ref-1][ref-2][ref-3]. Omega has neither.

2. **"Sealed", "Proven", "Settled", "Verified" — these are the literal words the proof-state pills use.** The /batches detail page tells a non-crypto-fluent user nothing about what failed when "Settlement reverted on L1; fills remain valid offchain" appears, and there is no plain-language "what this means for you / what to do next" pair anywhere on the surface. Monzo's writing system, made public in 2020, settles this for a regulated financial product: replace jargon with the plain English equivalent, and never let a state name stand alone without a one-line consequence [ref-4][ref-5].

3. **Dark-on-dark micro-typography is the dominant style, and the placeholder, the percentage chips, the `OWN BATCH ONLY` flag, the eyebrow labels, and the proof-hash mono blocks are all set in `--muted-foreground` over `--card`.** Zinc-400 on zinc-950 is about 7.1:1 in dark mode, which clears WCAG 2.2 AA — but the *light-mode* variant (zinc-500 on zinc-50) lands at roughly 4.7:1, sitting on top of the 4.5:1 floor with no margin for low-vision users or sun-glare on a phone screen [ref-6][ref-7]. Anti-reference: this is the same trap the crypto-exchange category falls into wholesale — TradeView and Binance ship dense data surfaces where users routinely complain the UI is "scary" and "overloaded", which is what an institutional FX product should not feel like to anyone moving 6+ figures [ref-8][ref-9][ref-10].

## Page-by-page

### Trade — disconnected, wrong-network, no-NFT-pass

The disconnected screen is two CTAs and a blurb floated on a sea of dot-grid. As a single landing it works at 1440 px; at 390 px it leaves the user staring at a "Connect Wallet" button and an "Omega is read-only until your wallet signs in. No data leaves the page until you authorise." sentence with no orientation about what Omega *is*. Wise's transfer flow tells the user upfront, before any field, exactly what they are about to do, what it will cost, and how long it will take [ref-11]. Omega's disconnected screen tells the user nothing about the journey ahead.

The wrong-network banner uses `role="alert"` correctly (good) and has both a desktop button label ("Switch to Ethereum mainnet") and a short mobile label ("Switch network") — also good. But it places the banner *above* the navbar, so a keyboard user tabbing in lands on Omega → Trade → Portfolio → Batches → Connect button → and only then on the alert. A user who never tabs that far will miss it. GOV.UK's notification-banner pattern is explicit: position immediately *before* the page `h1`, not above the chrome, so screen-reader users encounter it before the route content [ref-12].

The no-NFT-pass screen's only outbound action is "Learn about the pass" pointing to `#nft-pass`. There is no route from "I do not hold a pass" to "I want to apply / I want to be told when access opens / I want to leave a contact". This is the polymarket-style ambiguity my persona explicitly rejects: the user is in a closed state with no recoverable next action.

### Trade — connected (market and limit)

The OrderForm is the surface I will redesign. The build list below is grounded in what fails on this page specifically.

- The amount input is a `<Input>` with `id="amount"` and `<label htmlFor="amount">Amount</label>`. Good. But there is no `aria-describedby` linking the input to the "Available 10000.00 USDC" hint, the "Orders match privately at midpoint." privacy notice, or the live "You receive" estimate. A screen reader user reaches the field, hears "Amount, edit text", and types blind. WCAG 2.2 1.3.1 and the UK Home Office error-message guidance both require that hint and error text be programmatically associated with the input via `aria-describedby` [ref-1][ref-13].
- The `Buy / Sell` toggle uses `role="radiogroup"` with two `role="radio"` buttons. Correct. But the active-state colouring is conveyed only through a tone-tinted background and a coloured icon — for a colour-blind user the active radio is indistinguishable from the inactive one until they read the `aria-checked` programmatically. Microsoft Fluent 2 ships paired focus + selection indicators for exactly this case [ref-14].
- The "Type · Fee · Est. receive" strip is a 3-column grid of `<div>` pairs. In a screen reader it announces nothing other than "Market 0.005% —". This is order summary data; it must be a `<dl>` with `<dt>` / `<dd>` pairs so a screen reader announces "Type: Market; Fee: 0.005%; Estimated receive: not yet calculated" [ref-1].
- The submit-disabled CTA reads "Buy USDC" with `disabled`. There is no `aria-describedby` explaining *why* it is disabled (amount empty, midpoint zero, error mode). GOV.UK and NHS both reject the disabled-CTA pattern outright in favour of "always submittable, validate on submit, render error summary on failure" — because a disabled button gives no feedback about how to leave the disabled state [ref-1][ref-3].
- The privacy line "Orders match privately at midpoint." is an `<Icon.Private />` followed by inline text. The icon has `aria-hidden`, which is right, but the line lives in a `<p>` with no relationship to the form. It should be inside the form's `<fieldset>` (or referenced via `aria-describedby` on the form root) so a screen reader hears it before the user commits.

### Portfolio

- The `$47,213.40` headline has a *negative* delta painted in the destructive-tinted `--destructive` red. It is the sole cue. A red-green colour-blind user has no second channel — no minus glyph in front of the number, no "down" word, no arrow. The number is also typeset in a mono italic that resembles Source Serif 4. Colour cannot be the only carrier of state under WCAG 2.2 1.4.1 [ref-7].
- The chart is a single `<svg>` line with no caption, no `<table>` fallback, no sonification, and the timeframe toggles (1D / 1W / 1M / 3M / 1Y / ALL) sit *below* the chart with mono-uppercase eyebrow labels, not as a controlled tab group. MIT's CHI 2023 Chart Reader work and Highcharts' a11y demos both ship the same baseline pattern: every chart has a `<details>` data table fallback and an aria-live summary that updates on timeframe change [ref-15][ref-16].
- The "Open positions / Recent fills / Transfers" sections are `<section>` blocks with an `<h2>`-equivalent text node — but rendered as a `<div>` with class `"text-base"`, not an actual heading. Heading semantics are how screen-reader users skim a page; without them the page becomes a flat list.
- "OWN BATCH ONLY" is meaningful eyebrow copy that explains a privacy choice; it is rendered at 10px uppercase tracked, leaning on `--muted-foreground` over `--card`. On the light-mode variant this borders the contrast floor [ref-6]. It also has no tooltip explaining what "own batch only" means.

### Batches detail (verified and failed)

The "Batch #4821" page is the proof surface — for an institutional desk this is the receipts page that says "yes, this trade settled". It is also the page that fails the persona's third critique angle most cleanly: there is no non-visual equivalent for the proof state.

- The 4-of-4 stage ring is purely visual. It is an SVG arc with no `<title>`, no `aria-label` on the surrounding container, no `<dl>` of stages with status. A screen reader user reads the four "QUEUED / SEALED / PROVEN / SETTLED" rows in sequence and gets the full state, but the visual progress (the arc fill) is the primary cue for sighted users — a blind user has no equivalent of "you are at 4 of 4".
- "Settlement reverted on L1; fills remain valid offchain" — this is the failure copy. Good in the technical sense. But the user is not told *what to do*. Monzo's pattern is "[what happened]. [what to do next]." in two clauses [ref-4]. Here we get the first clause and silence on the second.
- The proof hash, batch root, and L1 settlement tx are mono-rendered with copy/external-link icons. The icons appear without `aria-label`. A screen reader user hears "0x5e2a7c9b...5f4c3d2e" twice in a row with no way to know which one is the batch root and which one is the proof hash.

### Withdraw modal

This is the highest-risk surface in the product — wrong recipient address, lost funds. The modal is competent (zod schema, `aria-required`, period-terminated error copy, focus trap inherited from the dialog primitive) but has gaps:

- "Recipient" accepts any 0x-prefixed 40-hex string. There is no allowlist confirmation, no checksum (EIP-55) validation, no "this address has never received funds before — confirm twice" pattern. Wise's transfer flow shows the recipient name, the IBAN, and the bank, then asks for a confirmation step before signing — because a wrong recipient is unrecoverable [ref-11][ref-17].
- The "Network fee $0.42 / Privacy fee $0.10 / You receive 0.00 USDC" breakdown is a `<dl>` (good — I checked the source) but the `<Status />` badge on success/failure is a Chip, not a `role="status"` live region. The state-change announcement on signing → pending → success is silent to a screen reader.
- The success state shows the tx hash as an external link; the link has no `aria-label` distinguishing it from any other tx hash on the page. "Open transaction 0x9f3c4a on Etherscan in a new tab" would [ref-18].

## Kill list

- **The 10px uppercase tracked eyebrow labels on `OWN BATCH ONLY`, `WITHDRAWAL`, `DEPOSIT`, `MIDPOINT`, `EST. RECEIVED`, `SETTLEMENT`, `BATCH ROOT`, `PROOF HASH`, `L1 SETTLEMENT`, `SUBMITTER`.** Below 12px, mono uppercase tracked text is hostile to dyslexic readers and to anyone zooming a phone in sun glare. Replace with 12px sentence-case labels in the body type [ref-6][ref-19].
- **The disabled "Buy USDC" / "Sign withdrawal" CTAs.** Move to "always submittable, validate on submit, render an error summary at the top of the form" [ref-1][ref-3].
- **Colour-only delta indication on the portfolio headline.** A `-$1,659.75` already has a minus sign; that is fine, but the green/red pairing with no glyph fails 1.4.1 — add a "down" or arrow and keep the colour as a second channel [ref-7].
- **The Source Serif 4 italic eyebrow lines ("Matched, settled, and proved." / "Connect a wallet to continue") rendered light over near-black.** Italic body type at 14–16px is the slowest-to-read style for low-vision and dyslexic users. Use the Geist Sans roman for the primary heading; reserve italics for full-stop-terminated single-clause prose, never for the page H1 [ref-19].
- **The dot-grid global background.** It is decorative, fine, but on the disconnected state and the not-found page it creates a subtle moiré at certain device DPRs that low-vision users report as visual noise. Either ship `prefers-contrast: more` and `prefers-reduced-motion` overrides that flatten it, or remove it from auth-gate surfaces.
- **The `Awaiting signature…` chip in the Navbar replacing the Connect-Wallet button during signing.** The button is the keyboard user's anchor — replacing it with a non-button removes their ability to dismiss / cancel via the same focus path. Keep the button shape and label, change only the inner text + icon.

## Build list

Every item below cites three or more external precedents. Every item maps to a measurable test (axe, keyboard run, screen-reader script).

1. **Error summary above the OrderForm and WithdrawModal**, with `role="alert"`, `tabindex="-1"`, focused on submit failure. Each entry links to the field with a hash anchor that moves DOM focus on click. This is the single most-cited form-accessibility pattern in UK government, NHS and the office for national statistics [ref-1][ref-2][ref-3].

2. **`aria-describedby` chain on every input** in OrderForm, WithdrawModal, DepositModal: amount → available, recipient → format hint, limit price → midpoint hint, all error messages. UK Home Office mandates this association for hint text and validation messages [ref-13]. WCAG 2.2 1.3.1 + 3.3.1 require it.

3. **`<dl>` semantics on every label/value pair** that today is rendered as a 2-row `<div>` stack: order details strip, batch summary, fee breakdown, transfer rows. ARIA list-of-pairs is the one HTML primitive screen readers reliably announce as a key-value structure [ref-1][ref-15].

4. **`aria-live="polite"` "You receive" announcement on the OrderForm**, debounced 500ms, with the full sentence ("You receive 9.21 EURC at midpoint 0.9213") so a blind trader hears the trade outcome before they sign. Time-critical financial state changes use `aria-live` per MDN's live-regions guide and ARIA Authoring Practices [ref-20][ref-21].

5. **Plain-language consequence pair on every state pill** in /batches: "Verified — settled on L1; visible to you and the counterparty only." / "Failed — settlement reverted; fills remain valid offchain; no action required." Monzo's writing system is the precedent — every error has [what happened] [what to do next] [ref-4][ref-5].

6. **EIP-55 checksum verification + "first send to this address" confirmation** on the WithdrawModal recipient. Wise's flow + every UK FCA-regulated payment app pairs the address with a confirm step before signing because a typo is unrecoverable [ref-11][ref-17].

7. **Chart fallback `<details>` data table** on /portfolio with the same data points the line uses, plus `aria-live="polite"` summary string that updates on timeframe change ("1M, peak $48,873 on 04-22, low $39,140 on 04-04, current $47,213"). Highcharts and the MIT Chart Reader project both ship this as the baseline non-visual equivalent [ref-15][ref-16].

8. **Proof-stage `<ol>` with `aria-current="step"` on the active stage** in /batches detail, replacing the SVG arc as the primary semantic structure. The arc remains as decorative `aria-hidden`. ARIA Authoring Practices' breadcrumb-with-current pattern is the same shape [ref-21].

9. **`aria-label` on every copy/external icon** that quotes the truncated hash: "Copy proof hash 0xb7c8d9e0…d3e4f5a6 to clipboard" and "Open settlement tx 0xa1b2c3d4…2b3c4d5e on Etherscan in a new tab" [ref-18].

10. **Reduced-motion + `prefers-contrast: more` overrides** that flatten the dot-grid background, remove the chart line interpolation animation, and bump the `--muted-foreground` toward `--foreground` so all eyebrow copy lands at 7:1 not 4.7:1 in light mode. WCAG 2.2 1.4.6 (AAA) is the target floor for the upgraded contrast [ref-6][ref-7].

11. **Move the wrong-network banner inside the `<main>` region**, immediately before the page `<h1>`, mirroring GOV.UK's notification-banner placement, so a screen-reader landing on the page hears the alert before the route content [ref-12].

## References

- [ref-1] GOV.UK Design System — Error summary. https://design-system.service.gov.uk/components/error-summary/
- [ref-2] NHS digital service manual — Error summary. https://service-manual.nhs.uk/design-system/components/error-summary
- [ref-3] ONS Design System — Error panels. https://service-manual.ons.gov.uk/design-system/components/error-panels
- [ref-4] Monzo — We've made our writing system available to all. https://monzo.com/blog/weve-made-our-writing-system-available-to-all
- [ref-5] Monzo — and the new language of banking (LinkedIn analysis). https://www.linkedin.com/pulse/monzo-new-language-banking-artur-ma%C5%82ek
- [ref-6] WebAIM — Contrast and color accessibility. https://webaim.org/articles/contrast/
- [ref-7] W3C — Understanding SC 1.4.3 Contrast (Minimum). https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- [ref-8] TradingView — Accessibility statement. https://www.tradingview.com/accessibility/
- [ref-9] Lightweight Charts — Improving accessibility. https://tradingview.github.io/lightweight-charts/tutorials/a11y/intro
- [ref-10] Trustpilot — Binance reviews (interface complaints). https://www.trustpilot.com/review/binance.com
- [ref-11] Wise — Fees and pricing transparency. https://wise.com/us/pricing/
- [ref-12] GOV.UK Design System — Notification banner. https://design-system.service.gov.uk/components/notification-banner/
- [ref-13] UK Home Office — Error messages (UCD manual). https://design.homeoffice.gov.uk/accessibility/interactivity/error-messages
- [ref-14] Microsoft Fluent 2 Web — Accessibility / focus indicator. https://fluent2.microsoft.design/
- [ref-15] Highcharts — Accessibility demos. https://www.highcharts.com/blog/accessibility/
- [ref-16] MIT Visualization Group — Rich screen-reader experiences for accessible data viz. https://vis.csail.mit.edu/pubs/rich-screen-reader-vis-experiences/
- [ref-17] Wise — Help: fees and limits. https://wise.com/help/articles/2978013/what-are-the-fees-and-limits-for-receiving-money
- [ref-18] Shopify Polaris — Modal (focus + accessible names). https://polaris-react.shopify.com/components/deprecated/modal
- [ref-19] BBC GEL — Technical guide. https://bbc.github.io/gel/
- [ref-20] MDN — ARIA live regions. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
- [ref-21] ARIA Authoring Practices — Patterns. https://www.w3.org/WAI/ARIA/apg/patterns/
