# Persona 05 — Luca Bianchi · /batches as a paper of record

A magazine man's reading of Omega. I do not trade. I evaluate the page the way I would evaluate the front of `Il Sole 24 Ore` on a Tuesday morning: does the hierarchy persuade, or does it merely list?

## Top three observations

1. **The /batches page reads as a database dump in a card costume — not a public ledger of record.** Every row carries the same visual weight, the same tonal stripe, the same chip rack; the eye has nowhere to rest and nowhere to be drawn, which is the opposite of what a financial paper of record does on its markets page [ref-1][ref-2][ref-7].
2. **Source Serif 4 italic is absent from the surface that most needs editorial register.** The page description sits in plain Geist Sans body — interchangeable with any dashboard — while the brand spec explicitly reserves the italic serif for "section descriptions" and "ledes" [ref-13]; this is the canonical place for it and it is not there.
3. **Empty, loading, and error states are written as system messages, not as editorial explanations of what the page actually is.** "No batches sealed yet. Check back after the first market open." is utility copy; it neither sells the privacy clause nor frames the absence as a deliberate editorial position the way `NZZ` or `The Economist` would [ref-3][ref-5][ref-12].

## Page-by-page

### /batches — list

The headline `Batches` and the dek "Sealed settlement batches with on-chain attestation. Public, verifiable." do the right thing in concept but the wrong thing in register. A Financial Times front prints a dek that is **slower and longer** than the headline, in a contrasting face, and it carries the editorial stance — not just a description [ref-1][ref-2]. Here, the dek is shorter than the headline and set in the same family. The paper-of-record voice is forfeit before the reader has scrolled.

The row design is `Aztec-proof-hero` — left-edge tonal band, status pill, batch number, chip rack, mono right rail. It is competent. It is also identical in cadence to fifteen rows on top of each other, which is exactly the visual problem the `TradingView` cluttered-dashboard critique names — uniform density everywhere, hierarchy nowhere [ref-9]. The screenshots confirm this: the eye finds the first `Pending` row only because of its colour, not because the page asked us to look at it.

The `LAST 100` label and the per-page selector are bolted to the right of the search input. In an `Il Sole 24 Ore` markets section the analogous chrome lives in a margin rail, never broken across the column of data [ref-7][ref-2]. Putting it beside the search box steals horizontal real estate and asks the eye to parse three different alignments before the first row.

The search-no-results state — `No batches match "0xdead". Try a different ID or hash.` — is polite, but it is the same shape as `Failed to load batches.` and the same shape as `No batches sealed yet.` Three different conditions, one void box. A paper of record distinguishes "we have no record of this" from "the press could not run today" [ref-3][ref-12].

### /batches/[id] — detail

The four-stage gauge (`STAGE 4/4`) and the four-row state machine (`QUEUED · SEALED · PROVEN · SETTLED`) are the strongest moment on the surface — this is the one piece that reads like a Bloomberg explanatory annotation rather than a database row [ref-4][ref-8]. The footnote `Externally verifiable. Anyone can verify this batch's proof on-chain` is also editorially correct.

What weakens it: the four KPI tiles `VOLUME · ORDERS · FILLS · PAIRS` repeat data that is already stated upstream in the gauge. An `Economist` chart would *not* duplicate the standfirst figure inside the chart itself [ref-5][ref-8]. They earn their pixels only if they carry something the gauge does not — share by pair as percentages, perhaps.

The `failed` variant adds a red banner — `Settlement reverted on L1. Bridge reorg encountered during submission. Fills remain valid offchain.` — which is the *correct* sentence to write but is set as a shadcn alert, not as an editor's note. A paper of record sets a correction in italic with rules above and below; the alert chrome makes it look like a toast you can dismiss [ref-1][ref-3].

## Kill list

- **Per-row chip rack** (`USDC/EURC USDC/USDT USDT/EURC`). It races the proof hash for attention and loses to it. Move pairs into the row's standfirst sentence. Precedent: Bloomberg prose annotation outperforms unlabelled marker grids [ref-4][ref-8].
- **Pill + tonal band on the same row.** Choose one. Newspapers use a single tonal mark, not two [ref-2][ref-11]. Keep the band, drop the pill — or invert.
- **`Per page: 100` button beside `LAST 100`.** Two pieces of pagination metadata at the same alignment is the `CoinMarketCap` ranking-page tic [ref-10]. Move both into a margin rail.
- **Plain-Sans dek under `Batches`.** This is the one place Source Serif 4 italic was specified for and it is missing [ref-13].
- **Three identical empty/error/no-results card boxes.** Same shell, three meanings — collapse into one editorial-note primitive with named eyebrows ("No record" / "Pressroom error" / "Pre-press") [ref-3][ref-12].
- **Per-row "0s · sealed" tail.** The `0s` is comparative-only and meaningless without an explicit reference; an Economist style guide would name the reference time inline [ref-5][ref-8].

## Build list

- **Editorial masthead.** Replace `Batches` + plain dek with: title, ISO date of latest seal in mono uppercase, italic Source Serif 4 dek that names the privacy clause in one sentence. Precedent: FT uses a contrasting display face for the headline and a separate face for the dek, both ranged to the same baseline [ref-1][ref-2][ref-13].
- **Standfirst sentence in place of a stat band.** "Across the last 12 sealed batches — 10 verified, 1 pending, 1 reverted — the engine cleared 154 fills against 196 orders for a notional of $2.4M." One sentence. Mono inserts only on the numerals. Precedent: `The Economist` standfirst paragraphs that interleave figures into prose [ref-5][ref-8].
- **Run-of-paper entries with ordinal numbering (`№ 001`).** Each entry is a numbered paragraph, not a card. Status reads down the *left margin* in mono uppercase tracking, the way an editor's queries read down a galley proof. Precedent: NZZ long-form column layout; Müller-Brockmann grid, where ordinal labels sit in their own column rather than inside the body of the entry [ref-3][ref-6].
- **Marginalia rail for chrome.** Search box, edition window note, per-page control, privacy clause — all live in a 220-column right rail that does not interrupt the run of paper. Precedent: Monocle's strict-grid + marginalia patterns; FT 6-column layouts [ref-2][ref-11].
- **Three named editorial states** — `Pre-press` (no batches yet), `No record` (search miss), `Pressroom error` (fetch failure) — each with its own eyebrow, italic dek, and (if the state warrants) a single neutral action. Precedent: NZZ's restrained, naming-not-blaming error voice [ref-3][ref-12].
- **Detail-page correction primitive.** When `failed`, replace the destructive alert with an editorial correction set: rule above, italic Source Serif 4 sentence, rule below, mono attribution to the L1 reorg event [ref-1][ref-3].

## Anti-reference, with cost

`TradingView`'s default chart is the cautionary tale here. Rondesignlab's case study on its own redesign documents the cost: traders "face obstacles … with cluttered interfaces that slow down analysis and decision-making … overloaded dashboards" and the fix was to "[simplify] chart control" [ref-9]. The /batches page is not yet TradingView-cluttered, but the row template is on the same trajectory: every signal at uniform weight, every chip competing with the next, the eye never told where to land. For a surface whose entire job is to make a sealed proof feel like a publication of record, that's a category error. Strip the row to one ordinal, one status word, one sentence, one proof reference — and let the absence of chrome do the persuading.

## Success test

I say yes only when a journalist could screenshot a single /batches entry, paste it into an article about how stablecoin FX clears, and have the screenshot read as a credible primary source — not as a UI screenshot. That is the bar.

---

## References

- [ref-1] García Media — *Financial Times: a classic redesign for the digital age* — https://garciamedia.com/blog/financial_times_a_classic_redesign_for_the_digital_age/
- [ref-2] Klim Type Foundry — *Financial Times in use (Financier Display, Financier Text, Metric)* — https://klim.co.nz/in-use/financial-times/
- [ref-3] TypeMates — *NZZ.ch relaunch* — https://www.typemates.com/news/nzz-ch-relaunch
- [ref-4] Anychart — *New examples of visual storytelling in action* (Bloomberg scrollytelling, network annotation) — https://www.anychart.com/blog/2026/01/23/visual-storytelling-examples/
- [ref-5] Fountn — *The Economist visual style guide* — https://fountn.design/resource/the-economist-visual-style-guide/
- [ref-6] Müller-Brockmann — *Grid Systems in Graphic Design* (PDF on Monoskop) — https://monoskop.org/images/a/a4/Mueller-Brockmann_Josef_Grid_Systems_in_Graphic_Design_Raster_Systeme_fuer_die_Visuele_Gestaltung_English_German_no_OCR.pdf
- [ref-7] 24 Ore System — *Il Sole 24 Ore newspaper / digital platform overview* — https://24oresystem.ilsole24ore.com/en/brands/il-sole-24-ore-newspaper/
- [ref-8] Storytelling with Charts — *Context is key: using annotations and labels effectively* — https://www.storytellingwithcharts.com/blog/context-is-key-using-data-visualization-annotation-and-labels-effectively/
- [ref-9] Rondesignlab — *TradingView platform UX case study* — https://rondesignlab.com/cases/tradingview-platform-for-traders
- [ref-10] CoinMarketCap — homepage / ranking page (anti-reference observation) — https://coinmarketcap.com
- [ref-11] magCulture — *Monocle, redesigned* — https://magculture.com/blogs/journal/monocle-redesigned
- [ref-12] Nieman Journalism Lab — *How NZZ is building products to cultivate paying audiences* — https://www.niemanlab.org/2016/07/how-the-swiss-newspaper-nzz-is-building-products-to-try-and-cultivate-new-paying-audiences/
- [ref-13] omega-docs — *03-brand/visual-identity.md* — Source Serif 4 italic role specification (display ledes, section descriptions; never on data)
