Yuki Tanaka reviews Omega Markets.

## Top observations

1. The batch lifecycle is legible, but it does not yet feel inevitable. The current proof ring, status pill, and stage list all repeat the same fact instead of handing state from one calm signal to the next, so "pending" and "verified" read as snapshots rather than a continuous transition.[ref-1][ref-2][ref-3]
2. The trade surface is disciplined on desktop dark mode, then loosens on mobile when the execution strip falls away from the form and limit-mode context drops below the tab bar fold. That break in continuity matters more than the palette; Sony, Apple, and PlayStation all keep state-bearing controls anchored while supporting context changes around them.[ref-2][ref-4][ref-5]
3. The modal language is close, but the connecting state still splits attention between overlay, spinner, badge, and duplicated wallet-wait copy. Trading-critical waits should narrow focus, not decorate it; Robinhood learned the hard way that celebratory or gamified feedback can attract scrutiny because it changes the emotional temperature of a financial action.[ref-6][ref-7][ref-8]

## Page-by-page review

### `/trade`

The narrow market-mode form is the strongest surface in the app. It holds still, uses one dominant action, and avoids the twitchy market-board energy that Binance, OKX, and Dexscreener normalize.[ref-8][ref-9][ref-10]

The problem starts when limit mode expands. On desktop, the chart and fills panel appear as separate slabs without a clear motion hierarchy; on mobile, the same content drops below the tab bar and breaks the feeling that the market switch is one state change. Apple's continuity guidance, Framer's layout-transition discipline, and PlayStation's card-based context shifts all suggest one anchored primary column with secondary context revealed by measured crossfade and short travel, not a structural jump.[ref-2][ref-3][ref-5]

Keep the order form frame fixed between Market and Limit. Reveal the limit price field first, then crossfade in the chart/fills region as supporting context; on mobile, collapse the execution context strip into the form footer so the trade consequence stays attached to the submit action.[ref-2][ref-3][ref-5]

### `/batches/[id]`

This is the page I would rebuild first. The current hero uses a large circular gauge plus a second textual stage list, but the ring does not teach anything about time, certainty, or what becomes available next; it mainly amplifies the success color.[ref-1][ref-2][ref-11]

The better model is a quiet lifecycle rail: one active stage, one next action, one evidence panel that reveals only when the underlying artefact exists. Apple's progress and sheet guidance, Sony's restrained transition language, and Framer's bias toward continuity all point toward movement that clarifies causality rather than celebrates completion.[ref-1][ref-2][ref-3]

Pending and verified also need different emotional temperatures. Pending should feel steady, not stalled; verified should feel resolved, not victorious. Robinhood's confetti retreat and the Massachusetts complaint around gamification are useful precedents here: financial interfaces pay a cost when state change is dramatized as reward.[ref-6][ref-7][ref-12]

### Connect / deposit / withdraw modals

The modal shells already avoid broad theatrical motion, which is correct. What remains is to reduce duplicated emphasis: the desktop close icon, the spinner, the badge, and the repeated "awaiting signature" sentence all speak at once.[ref-1][ref-2][ref-13]

Use one focal stack. I would keep the title, replace the spinner-plus-badge pair with a single stage line, and make desktop dialog and mobile drawer share the same internal sequence timing so the breakpoint changes shell geometry but not behavioural rhythm.[ref-1][ref-2][ref-13]

### `/portfolio`

The portfolio page is visually controlled, but it inherits the same continuity issue as limit-mode trade. The sticky summary and hero chart are composed as independent sections rather than one reading path, so motion should be used only to maintain context between them, never to create novelty.[ref-2][ref-4][ref-5]

If anything on this page moves, let it be the change of focus between balances, open orders, and fills. Sony and MUJI are both good reminders that utility gains credibility when transitions are almost invisible until they help orientation.[ref-4][ref-11][ref-14]

## Kill list

- Remove the duplicate waiting signals in the connect modal: spinner, badge, and repeated body sentence do the same job.
- Remove the proof gauge as the dominant batch-detail metaphor. It consumes too much area for information that is already present in the stage list.
- Remove the detached execution context strip from mobile trade; its information belongs with the submit consequence.
- Remove any future temptation to add bounce or overshoot to Buy/Sell, Market/Limit, or settlement-critical controls. That is anti-pattern territory for this product class.[ref-2][ref-8][ref-12]

## Build list

- Build a single lifecycle rail for batch detail: four rows, one active marker, one calm progress measure, one evidence drawer that reveals proof hash and settlement hash only when present. Precedent: Apple's progress hierarchy, Sony's restrained transition language, Framer's continuity-first layout motion.[ref-1][ref-2][ref-3]
- Build explicit motion tokens for modal open/close, market switching, skeleton exit, and proof reveal: `200ms ease-out` for entry, `150ms ease-in` for dismissal, no spring except direct sheet drag, and no movement on trade-critical numeric updates. Precedent: Apple HIG motion, Material motion timing, Framer reduced-motion guidance.[ref-1][ref-13][ref-15]
- Build a breakpoint-consistent trade transition where Market and Limit share the same anchored form frame, and supporting context appears as a secondary reveal rather than a reflow surprise. Precedent: PlayStation's control-center layering, Sony's continuity bias, Apple's sheet and context-preservation guidance.[ref-2][ref-4][ref-5]
- Build a proof-state distinction that changes language before color: `Queued`, `Sealed`, `Proof ready`, `Anchored on L1`, then `Externally verifiable`. Precedent: Apple progress copy, MUJI's utility-first communication, Sony's product-state restraint.[ref-1][ref-4][ref-11]

## Reference list

- [ref-1] https://developer.apple.com/design/human-interface-guidelines/motion
- [ref-2] https://developer.apple.com/design/human-interface-guidelines/sheets
- [ref-3] https://www.framer.com/help/articles/how-animations-and-effects-work-in-framer/
- [ref-4] https://www.sony.com/en/SonyInfo/design/stories/motionlogo/
- [ref-5] https://www.playstation.com/en-us/ps5/features/
- [ref-6] https://www.cnbc.com/2020/12/17/robinhood-puts-away-digital-confetti-as-regulators-cite-gamification-concerns.html
- [ref-7] https://www.sec.state.ma.us/divisions/securities/robinhood/robinhood-index.htm
- [ref-8] https://www.binance.com/en
- [ref-9] https://www.okx.com/
- [ref-10] https://dexscreener.com/
- [ref-11] https://www.muji.com/us/about-muji/
- [ref-12] https://www.cnbc.com/2020/12/16/massachusetts-sec-o-commonwealth-galvin-says-robinhood-is-a-reckless-company-gamifying-investing.html
- [ref-13] https://m3.material.io/styles/motion/overview
- [ref-14] https://www.sony.com/en/SonyDesign/
- [ref-15] https://www.framer.com/help/articles/reduced-motion-settings/
