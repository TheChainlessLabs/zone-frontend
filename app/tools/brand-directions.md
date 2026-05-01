## Omega Brand Directions

### Direction 1 — Proofline Blue
Quiet authority with a colder, more distinctive attestation-blue register.

### Mode label
Production candidate

### Identity DNA
- Core sensory metaphor: annotated trading ledger etched into smoked glass.
- Reference DNA: Portex's poised blue, current Omega's restraint, Bloomberg-style evidence density, plus a touch of Uniswap's discipline around one signature color.
- Closest existing product the team can mentally anchor to: what Linear would look like if it were built for FX settlement rather than software issues.

### Palette
```txt
Background: #090B10 / oklch(0.17 0.01 255)
Surface 1:  #10141C / oklch(0.22 0.02 255)
Surface 2:  #151B25 / oklch(0.26 0.02 255)
Foreground: #F2F5FA / oklch(0.96 0.01 255)
Muted 1:    #A5B0C2 / oklch(0.76 0.02 255)
Muted 2:    #6B7587 / oklch(0.56 0.02 255)
Accent:     #6FA8FF / oklch(0.73 0.14 250)
Buy:        #67D6C3
Sell:       #C7A77A
Success:    #52C7A5
Error:      #E17E8A
Warning:    #D7A85B
Info:       #7CB9FF
```
Accent punches on proof moments, active nav state, selected order-side rails, and focus treatment. Never use it as generic decoration.

### Typography pairing
- Display: Cabinet Grotesk
- Body / UI sans: Satoshi
- Mono / numeric: Commit Mono
- Italic / serif accent: Source Serif 4 Italic
```txt
64/68
40/44
28/34
18/26
13/18
```
Non-obvious move: captions stay mono-uppercase, but the page-level strapline gets Source Serif 4 italic in a narrow, evidence-like sentence under the H1 so the serif feels like a signature annotation, not editorial fluff.

### Surface treatment
- Cards: opaque, low-radius `14px`, dark navy-black fill, 1px inner edge, diffuse shadow only on floating execution surfaces.
- Modals: heavier surface tier with a cool top-edge highlight, like a proof case sliding over the page.
- Navbar: the brand chrome lives in a slim, centered exchange-rail capsule; active item gets a blue underglow line rather than a filled pill.
- Atmosphere layer: replace the current dot-grid with a sparse Cartesian field of hairline cross-points, as if the whole app sits on settlement graph paper.

### Motion register
- Default ease + duration: `ease-standard`, 100ms and 150ms for UI, 500ms only for route atmosphere fades.
- Signature move: an active-state "scanline settle" where selected tabs and proof chips illuminate from left to right in one controlled pass.
- Reduced motion: scanline becomes an instant state swap; no shimmer, no drift.

### Voice
This direction sounds like a desk note written by someone who has already seen the fill. Calm, exact, and slightly cooler than current Omega. It should feel expensive because it never tries to impress you twice.

- Primary CTA: `Submit order`
- Error message: `Signature expired. Re-sign to confirm this ticket.`
- Empty state: `No fills yet. Matched orders will print here.`
- Footer line: `Anonymous spot FX. Onchain settlement.`
- Button label: `View proof`

### Where it lands on product
On `/trade`, Proofline Blue makes the order form feel more owned by Omega without changing its execution-first hierarchy; the accent sits on the active side, the submit path, and proof-confirmation states, while inputs remain sober. On `/portfolio`, the blue belongs on audit affordances, not PnL decoration. On `/batches`, it gives the already-strong institutional page a more memorable point of view through better proof highlighting and a cleaner active-search state. On `/account`, it supports receipts, export, and session metadata without making that page feel consumer-fintech.

### Direction 2 — Alloy Signal
Warmer metal, tighter contrast, and a subtle sovereign-desk seriousness.

### Mode label
Production candidate

### Identity DNA
- Core sensory metaphor: machined aluminum and smoked nickel under task lighting.
- Reference DNA: current Omega's institutional posture, Portex's dignified powder-blue restraint, outside-the-box influence from aviation instrumentation and Leica industrial detailing.
- Closest existing product the team can mentally anchor to: what Vercel might feel like if it were reinterpreted by an FX prime-brokerage brand team.

### Palette
```txt
Background: #0C0C0E / oklch(0.18 0.00 0)
Surface 1:  #151517 / oklch(0.24 0.00 0)
Surface 2:  #1D1E21 / oklch(0.29 0.01 255)
Foreground: #F5F3EE / oklch(0.95 0.01 85)
Muted 1:    #B1ACA1 / oklch(0.76 0.02 70)
Muted 2:    #777168 / oklch(0.54 0.02 70)
Accent:     #C8A66A / oklch(0.74 0.08 75)
Buy:        #8FC7B5
Sell:       #D8B48A
Success:    #73C2A2
Error:      #D98A86
Warning:    #D2A354
Info:       #9CB6D9
```
Accent punches only where Omega is making a claim of completion or privileged focus: confirmed CTA, selected nav marker, verified batch glyph, and keyline moments around the order form.

### Typography pairing
- Display: Neue Montreal
- Body / UI sans: Geist Sans
- Mono / numeric: Azeret Mono
- Italic / serif accent: Source Serif 4 Italic
```txt
60/64
38/42
26/32
17/24
12/18
```
Non-obvious move: numerics run slightly tighter than surrounding mono text, with uppercase labels letterspaced wider than current Omega so the data plane feels calibrated like an instrument panel, not a devtool.

### Surface treatment
- Cards: opaque charcoal-metal plates with `12px` radius, minimal shadow, visible edge contrast, and a slightly warmer border than the fill.
- Modals: denser, almost vault-like, with a brighter top seam and a restrained brass focus ring on form affordances.
- Navbar: a straight-edged top rail with a small branded datum line and a right-aligned "desk action" zone; less playful than pills, more like console hardware.
- Atmosphere layer: keep the ambient field but shift from dots to faint halftone pin-pricks that get denser near the order form and disappear near tables.

### Motion register
- Default ease + duration: `ease-standard`, 75ms for hover/focus, 150ms for modal and tab shifts.
- Signature move: subtle datum-line slides; when state changes, a 1px line glides into place like a calibration mark.
- Reduced motion: lines snap in place with opacity only.

### Voice
This direction is Omega at its most boardroom-ready. Still concise, still technical, but with a warmer confidence that makes the platform feel established rather than merely minimal.

- Primary CTA: `Submit ticket`
- Error message: `Network fee moved. Review and sign again.`
- Empty state: `No open positions. Place an order to enter the book.`
- Footer line: `Private matching. Public settlement record.`
- Button label: `Export receipt`

### Where it lands on product
On `/trade`, Alloy Signal makes the form feel more like a dealing console than a web card: the warm accent appears only where the operator needs assurance that a state is settled or selected. On `/portfolio`, it helps receipts and transfer history feel archival, almost statement-like. On `/batches`, this is the most naturally credible direction for counterparties, auditors, and treasury operators. On `/account`, it turns governance and activity sections into something closer to an operator workstation than a settings screen.

### Direction 3 — Acid Witness
Pitch black, acid-lime, and a single aggressive neon move held inside an institutional frame.

### Mode label
Exploration

### Identity DNA
- Core sensory metaphor: a forensic evidence lab crossed with a black-site trading terminal.
- Reference DNA: the Crypto Investment App's loud lime energy, current Omega's dark-pool seriousness, and outside-the-box influence from tactical equipment labeling.
- Closest existing product the team can mentally anchor to: if a high-end custody startup borrowed one dangerous move from a club poster, then forced it through institutional risk controls.

### Palette
```txt
Background: #050505 / oklch(0.14 0.00 0)
Surface 1:  #0E0E0F / oklch(0.20 0.00 0)
Surface 2:  #17181A / oklch(0.27 0.01 255)
Foreground: #F4F5EE / oklch(0.96 0.01 100)
Muted 1:    #A8ACA0 / oklch(0.75 0.02 100)
Muted 2:    #676A63 / oklch(0.52 0.01 100)
Accent:     #B8F36B / oklch(0.90 0.19 125)
Buy:        #9CF0C0
Sell:       #F1C77A
Success:    #91E2A9
Error:      #F18B97
Warning:    #E4C45A
Info:       #A7D8FF
```
Accent punches as a controlled radiation event: the active order form, live-proof states, and one atmospheric bloom behind the hero surface. Nowhere else.

### Typography pairing
- Display: Anton
- Body / UI sans: Switzer
- Mono / numeric: Fragment Mono
- Italic / serif accent: none
```txt
72/72
42/44
28/32
18/24
12/18
```
Non-obvious move: section heads go all-lowercase in dense grotesk while batch IDs and price numerics become the dignified voice. The hierarchy flips: the machine data looks formal, the headings look raw.

### Surface treatment
- Cards: almost-black blocks with harder corners, `10px` radius, and one inside neon hairline only on the dominant action module.
- Modals: full blackout sheets with edge-bloom, like sealed evidence envelopes.
- Navbar: this is where the wildness lives most safely; the wordmark sits left in neutral white while the active route is keyed by a thin acid capsule and a micro status diode.
- Atmosphere layer: the dot-grid mutates into a sparse constellation map with one lime fog plume anchored behind the order form only; tables remain clean.

### Motion register
- Default ease + duration: `ease-standard`, 100ms default, 500ms reserved for atmospheric glow on page entry.
- Signature move: "charge then lock" where the primary action fills with lime, pauses for a beat, and then resolves to a stable dark state after confirmation.
- Reduced motion: remove the charge phase; retain only instant fill and focus ring.

### Voice
This direction keeps Omega terse, but the terseness becomes confrontational in a productive way. It feels like the system already knows what matters and has no interest in ornamental politeness.

- Primary CTA: `Route order`
- Error message: `Ticket rejected. Check price, size, or wallet state.`
- Empty state: `Nothing matched. Resting orders stay private until crossed.`
- Footer line: `Midpoint execution. No broadcast intent.`
- Button label: `Lock limit`

### Where it lands on product
On `/trade`, Acid Witness is all about containing the loudness to one place: the order form becomes the active chamber and everything around it recedes. That is strategically useful because Omega's product really is the order form. On `/portfolio`, the lime must shrink dramatically and live only in current-value or proof states; otherwise it will feel like a wallet app. On `/batches`, the exploration teaches restraint by contrast: if rendered, the page should stay almost neutral except for live/pending system cues. On `/account`, this direction likely wants less atmosphere and more black-document severity.

### Direction 4 — Offset Ledger
Institutional modernism with poster-scale typography and a powder-blue printmaking accent.

### Mode label
Exploration

### Identity DNA
- Core sensory metaphor: a Bauhaus settlement notice pinned to a dealing-room wall.
- Reference DNA: Portex's cornflower temperament, editorial poster systems, and outside-the-box influence from Swiss exchange bulletins and offset print registration marks.
- Closest existing product the team can mentally anchor to: if a museum-grade financial annual report became an execution UI without losing operational seriousness.

### Palette
```txt
Background: #0A0A0D / oklch(0.17 0.01 260)
Surface 1:  #121317 / oklch(0.22 0.01 260)
Surface 2:  #1C1E25 / oklch(0.29 0.02 260)
Foreground: #F2F0EA / oklch(0.95 0.01 85)
Muted 1:    #B8B3A7 / oklch(0.78 0.02 80)
Muted 2:    #7C766C / oklch(0.57 0.02 80)
Accent:     #A9BFF7 / oklch(0.82 0.07 255)
Buy:        #83C6D8
Sell:       #D8B28C
Success:    #7FC2B0
Error:      #DD8C92
Warning:    #D5AA66
Info:       #A9BFF7
```
Accent punches on oversized page numerals, selected navigation plate, and the frame around the order form. It should feel like printed registration color, not SaaS highlight ink.

### Typography pairing
- Display: League Gothic
- Body / UI sans: Albert Sans
- Mono / numeric: Iosevka
- Italic / serif accent: Cormorant Infant Italic is banned by brief; use Source Serif 4 Italic instead
```txt
78/74
44/44
30/34
18/25
12/18
```
Non-obvious move: one giant condensed headline or batch number per page lives partially off-grid, while operational copy stays disciplined. The brand move is scale contrast, not color saturation.

### Surface treatment
- Cards: opaque and flatter than the other directions, `8px` radius, crisp border, almost no shadow; the poster feeling comes from layout and type, not glossy material.
- Modals: broad-margin floating documents with a stronger title bar and numbered steps laid out like print captions.
- Navbar: a typographic masthead rather than a generic app bar; more left-right asymmetry, less center-pill symmetry.
- Atmosphere layer: dot-grid becomes offset registration marks, faint vertical baselines, and occasional powder-blue crosshair marks in the corners of major sections.

### Motion register
- Default ease + duration: `ease-standard`, 100ms for interactions, 150ms for modal and tab movement.
- Signature move: oversized numerals and captions slide on orthogonal axes, like print layers aligning.
- Reduced motion: layer-alignment motion becomes opacity-only with no positional travel.

### Voice
This is the most editorial exploration, but it should still read like an operations document, not a magazine. The tension is useful: it shows how far typography alone can carry personality without reaching for consumer-fintech tropes.

- Primary CTA: `Submit batch`
- Error message: `Price moved outside tolerance. Amend and resubmit.`
- Empty state: `No settlement record for this filter.`
- Footer line: `Proof onchain. Counterparties absent by design.`
- Button label: `Read batch log`

### Where it lands on product
On `/trade`, Offset Ledger would be strongest if the oversized type lives in the framing, not the controls themselves. The form stays operational; the personality comes from section plates, pair labels, and page numbers. On `/portfolio`, this direction could make balance and holdings feel more report-like than dashboard-like. On `/batches`, it opens an interesting path where batch IDs become big navigational landmarks, almost like catalog references. On `/account`, it could differentiate audit sections beautifully, though it risks feeling too authored if not kept rigid.

## Reference Comparison Matrix

Proofline Blue is to Omega what Linear is to enterprise software: quiet enough to trust immediately, but with a signature cool tone that makes the brand legible at a glance. It borrows Portex's poise and Uniswap's discipline around one identity color, then directs both toward attestation and execution rather than community or exploration.

Alloy Signal is to Omega what Vercel is to infrastructure brands: a highly controlled neutral system with one warmer note that makes the product feel mature rather than anonymous. If Proofline is the sharper, more technical option, Alloy is the one that would reassure the broadest institutional audience on first contact.

Acid Witness is to Omega what the louder crypto-native apps are to retail, except disciplined by compliance gravity. It deliberately tests whether Omega can own a memorable color event without slipping into degen-Dex behavior. The value of rendering it is not that it ships; it is that it teaches the safe directions where boldness can live safely.

Offset Ledger is to Omega what a Swiss cultural institution's annual report is to a bank portal: typographic conviction as identity. It is the least color-dependent exploration and the best test of whether page-scale composition, condensed display type, and print-era registration graphics can give Omega a point of view without depending on glow or gradient.

## Buy/Sell Color Logic

The rule across all four directions should be consistent: buy/sell is not a retail-casino green/red pair, and it is not a permanent decoration applied to every number on screen. Buy and sell colors should appear first on the order-side selector, the submitted CTA, confirmation copy, and small directional markers in fills or positions. They should not flood tables, balances, or charts by default.

Proofline Blue uses a cool aqua buy and a sand-bronze sell, which feels like bid and offer in a refined institutional environment rather than win and loss in a consumer brokerage. Alloy Signal keeps the same logic but warms the sell side slightly, making both directions feel like materials rather than alerts. Acid Witness makes the strongest semantic break: buy is a pale mint inside the lime universe, sell is a sodium-amber warning tone. Offset Ledger turns buy/sell into editorial inks, almost like cyan and tan registration marks. The strategic point is that side semantics become part of brand personality while status semantics remain separately readable.

## Sandbox Exploration Plan

Render these as parallel, comparable skins instead of a linear redesign debate.

- Each direction renders at `/brand?dir=1`, `/brand?dir=2`, `/brand?dir=3`, and `/brand?dir=4`.
- The server component reads `searchParams.dir`, applies `data-brand-direction`, and threads the token set through all brand specimens.
- `/system` showcases primitives, order-form states, tables, chips, and motion samples under the same direction token scope.
- `/brand/compare` renders all four side-by-side at equal zoom with the same surfaces: navbar, order form, batches row, modal, empty state.
- Token scoping lives under `[data-brand-direction="N"]` so no variables bleed across routes or screenshots.
- Acceptance is simple: a non-designer flips through all four query params and feels an immediate difference in under 30 seconds, without losing the sense that all four still belong to Omega.
- The first brand board should show the same canonical demo pair in every direction: `USDC/EURC`, one default order ticket, one disconnected state, one verified batch row, one pending batch row, one receipt/export panel, and one modal stepper. That keeps taste debates anchored to the same information architecture.
- The compare page should lock zoom, spacing, and content fixtures. If one direction only "wins" because it got more whitespace or a simpler specimen, the exercise is invalid.
- Screenshot the compare board for Brian at desktop and mobile in the same PR so the team evaluates temperament, not implementation imagination.

```tsx
// app/brand/page.tsx
export default function BrandPage({ searchParams }) {
  const dir = Number(searchParams.dir ?? 1)
  return <BrandBoard data-brand-direction={dir} direction={dir} />
}

// app/brand/compare/page.tsx
export default function ComparePage() {
  return [1, 2, 3, 4].map((dir) => <BrandBoard key={dir} data-brand-direction={dir} direction={dir} />)
}
```

```css
[data-brand-direction="1"] { --brand-accent: #6FA8FF; }
[data-brand-direction="2"] { --brand-accent: #C8A66A; }
[data-brand-direction="3"] { --brand-accent: #B8F36B; }
[data-brand-direction="4"] { --brand-accent: #A9BFF7; }
```

## Recommendation

Among the production candidates, pick Proofline Blue first. It solves Brian's core complaint cleanly: more personality, but still tight and credible for institutional FX. The blue is distinct enough to stop the product from reading anonymous-institutional, yet it remains compatible with the current Omega cues already working on `/batches`: mono evidence, dark atmosphere, and proof-forward states. It also gives M2 a clearer token story than the current mostly-zinc system without dragging the interface toward consumer-fintech softness.

Among the explorations, render Acid Witness first. It is the most strategically informative because it tests the exact failure boundary the team needs to understand: how much identity can Omega carry before it stops feeling safe to a serious desk. Even if the answer is "less than this," the exercise will show where accent energy, navbar chrome, and atmospheric lighting can be borrowed back into the shipping directions without compromising trust.
