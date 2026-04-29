# Persona 16 - Omar El-Sayed

## Top 3 observations

1. `/batches/[id]` has the right facts but the wrong adrenaline curve. I can verify a batch here, but I cannot read its danger level in one peripheral-glance sweep the way a Riot or FACEIT player reads phase, readiness, and failure state under pressure. [ref-1] [ref-5] [ref-7]
2. `/batches` treats `Verified`, `Pending`, and `Failed` like polite metadata instead of the main event. The rows need a stronger state spine, because this page is effectively a public match-room for settlement, not a calm archive. [ref-3] [ref-5] [ref-8]
3. `/trade` is disciplined, but its quiet order panel starves the user of execution-state theatre. Discord, Battle.net, and Steam all prove that dense systems can stay readable while still broadcasting live state, queue, and activity hierarchy. [ref-3] [ref-4] [ref-6]

## Page-by-page review

### `/batches`

The strongest move already exists: the left-edge state band on each row. The problem is that the row still reads left-to-right like a report card, so the eye lands on `Batch #4821` before it lands on whether the batch is safe, waiting, or broken; FACEIT and Steam both bias the screen toward "what is happening now" with stronger shelfing and activity-first grouping, and Mobalytics reinforces that same rule by ranking high-signal performance summaries before detail layers. [ref-3] [ref-5] [ref-8]

The search and pagination chrome are too emotionally flat for a surface that is supposed to answer "can I trust this batch flow?" The loading state is especially soft: six anonymous skeleton bars tell me data is absent, but not which attestation lane is being populated or whether the delay is normal, while Battle.net and Discord both teach users to expect explicit queue/activity framing when a system is in motion. [ref-2] [ref-4] [ref-6]

### `/batches/[id]`

This is the page Omar would rebuild first. The circular gauge is useful, but the stage list beside it is visually democratic when it should be hierarchical: `Queued`, `Sealed`, `Proven`, `Settled` should feel like a live elimination bracket where the current choke point glows louder than the completed steps, similar to how VALORANT exposes phase-specific HUD information, FACEIT exposes match-room readiness, and Mobalytics frames performance as scored lanes instead of equal paragraphs. [ref-1] [ref-7] [ref-8]

The failed state is the closest thing to a hit, but even there the danger lands late. The red banner explains the problem after the user has already read through a neat four-step ledger; on a live settlement surface, failure needs to seize the top of the viewport, quarantine the broken stage, and push recovery paths into the same visual lane the way launcher and competitive dashboards foreground interruptions and support access. [ref-2] [ref-5] [ref-7]

The mobile version proves the same point harder. Once the bottom tab bar cuts through the viewport, the stage machine fragments into stacked cards and the user loses the "where am I in the run?" frame; Discord's member-list activity cards and FACEIT's side-panel logic both show how to keep presence and progress compact without dissolving the primary state hierarchy. [ref-4] [ref-5] [ref-6]

### `/trade`

The order form is composed with discipline, and the Market/Limit split is sensible. But the surface reads more like a private terminal setup sheet than a live execution HUD, because the most important interim states are trapped in low-volume strips and microcopy instead of being promoted into active, readable status language; Steam's library home, Discord's status layers, and Battle.net's patch/install framing all show how ambient state can stay visible without hijacking the primary action. [ref-3] [ref-4] [ref-6]

Limit mode gets closer because the chart and fills create context, but the right column still feels like a placeholder bay rather than a tactical sidecar. FACEIT Track and Mobalytics both show the value of scannable lanes, filters, and ranked insight blocks when users need to compare recent performance against the current task, and this page wants more of that energy around order progression and fill verification. [ref-7] [ref-8] [ref-5]

## Kill list

- Remove the long-form descriptive paragraph above the `/batches` list; this surface already says "public, verifiable," and the extra sentence delays first-state contact. [ref-3] [ref-5] [ref-10]
- Remove the equal visual weight between completed and active stages in `/batches/[id]`; done steps should collapse into dimmed confirmations, not compete with the current bottleneck. [ref-1] [ref-7] [ref-8]
- Remove the low-urgency centered empty/error composition on `/batches`; failure should pin to the top state lane, not float in a blank recital box. [ref-2] [ref-4] [ref-5]
- Remove the polite privacy footer styling on batch detail; the verification contract matters, but it should read like a locked system note, not an afterthought card. [ref-2] [ref-6] [ref-7]
- Remove the hidden emotional ceiling on `/trade`; the surface needs explicit interim execution state modules, not only a CTA plus a quiet footer line. [ref-3] [ref-4] [ref-8]

## Build list

- Add a vertical "attestation rail" to `/batches` that clusters rows by live state and shows counts per lane: `Verified`, `Pending proof`, `Settlement risk`, with sticky totals at the top. FACEIT's side-panel navigation, Steam's custom shelves, and Discord's member/activity grouping all prove that users scan faster when the system pre-sorts live entities into state-led buckets instead of a flat feed. [ref-3] [ref-5] [ref-6]
- Add a dominant "current choke point" block at the top of `/batches/[id]` that names the active stage, elapsed time in stage, and next expected transition before the rest of the audit detail. VALORANT's phase-aware HUD options, FACEIT's match-room readiness model, and Battle.net's patch/install state framing all support surfacing the active phase before secondary metadata. [ref-1] [ref-2] [ref-7]
- Add disciplined transition motion when a batch advances from `Sealed` to `Proven` to `Settled`: one lane brightens, the previous lane locks, the ring ticks forward, and the audit hash shelf receives a single confirmation pulse. Riot's HUD conventions, Discord's activity/status layering, and Steam's update/event hierarchy all support motion that teaches state rather than decorating it. [ref-1] [ref-4] [ref-3]
- Add a failure quarantine mode for `/batches/[id]` where the failed stage turns into a red incident module with rollback context, last good checkpoint, and operator-visible remediation references. FACEIT's live-support framing, Battle.net's repair/update controls, and Discord's visibility controls all show that interruption states need both diagnosis and next action in the same pane. [ref-7] [ref-2] [ref-4]
- Add a compact "execution telemetry" strip to `/trade` that persists pending order, matched state, settlement path, and proof receipt in one always-visible band. Steam's library home, Battle.net's launcher status model, and Mobalytics' scored summary panels each demonstrate how persistent secondary telemetry keeps users oriented without stealing the main call to action. [ref-3] [ref-2] [ref-8]

## Anti-reference

Do not let `/batches` drift toward Aesop, GOV.UK, or Hermes behavior. Aesop spends its homepage budget on mood and literary pacing, GOV.UK's homepage is explicitly organized around broad content discovery, and Hermes leads with editorial object storytelling; all three models are excellent for browsing, but on a live settlement surface that temperament imposes a real cost: users must read and interpret instead of instantly classifying operational state. [ref-9] [ref-10] [ref-11]

## References

- [ref-1] https://support-valorant.riotgames.com/hc/en-us/articles/4413936440467-VALORANT-UI-Settings-FAQ
- [ref-2] https://us.support.blizzard.com/en/help/article/25949
- [ref-3] https://store.steampowered.com/libraryupdate
- [ref-4] https://support.discord.com/hc/en-us/articles/7931156448919-Activity-Sharing-on-Discord-FAQ
- [ref-5] https://support.faceit.com/hc/en-us/articles/14996885023516-Navigating-FACEIT
- [ref-6] https://support.discord.com/hc/en-us/articles/360035407531-Custom-Status
- [ref-7] https://support.faceit.com/hc/en-us/articles/17012729714972-FACEIT-Track-Overview
- [ref-8] https://mobalytics.gg/gpi/
- [ref-9] https://www.aesop.com/us/
- [ref-10] https://design-guide.publishing.service.gov.uk/frontend-templates/homepage/
- [ref-11] https://www.hermes.com/
