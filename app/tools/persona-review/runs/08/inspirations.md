# Aisha Khan — inspirations

External pages searched and read. Each entry is one line in this persona's voice on what we take from it.

## Government and public-service design systems

- https://design-system.service.gov.uk/components/error-summary/ — the canonical error-summary pattern: `role="alert"`, top of form, anchor links to fields. This is the floor.
- https://design-system.service.gov.uk/components/error-message/ — inline error message tied to its field via id-association; same sentence as the summary.
- https://design-system.service.gov.uk/components/notification-banner/ — `role="region"` + `aria-labelledby`, positioned immediately before the `h1`, never above the chrome.
- https://design-system.service.gov.uk/accessibility/ — accessibility commitments at the system level, the model Omega should publish.
- https://design.homeoffice.gov.uk/accessibility/interactivity/error-messages — UK Home Office on tying hint text and validation messages to inputs via `aria-describedby`.
- https://service-manual.nhs.uk/design-system/components/error-summary — NHS error-summary takes the GOV.UK pattern and tightens the copy rules; same template applies to /trade and /portfolio modals.
- https://service-manual.ons.gov.uk/design-system/components/error-panels — ONS variant; useful for the multi-field withdraw form.
- https://designnotes.blog.gov.uk/2013/11/14/exploring-validation-messages/ — origin paper on why "always submittable, validate on submit" beats disabled CTAs.

## WCAG and contrast primary sources

- https://www.w3.org/TR/WCAG22/ — WCAG 2.2 normative; 1.4.3 contrast, 1.4.1 use of colour, 2.5.8 target size.
- https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html — the 4.5:1 floor and what counts as "text" — placeholders included.
- https://webaim.org/articles/contrast/ — the operational guide; light-mode `--muted-foreground` is the surface that fails.
- https://www.w3.org/WAI/ARIA/apg/patterns/ — ARIA Authoring Practices: dialog, breadcrumb-with-current, listbox patterns.

## ARIA live, charts, screen-reader fallbacks

- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions — `aria-live="polite"` on the "You receive" estimate and on every withdrawal state change.
- https://www.highcharts.com/blog/accessibility/ — chart fallback table + sonification; the model for the /portfolio chart.
- https://vis.csail.mit.edu/pubs/rich-screen-reader-vis-experiences/ — MIT CHI 2023 work on multimodal data viz; the long-form citation behind the `<details>` data table requirement.
- https://alper.datav.is/publications/chartreader/ — Chart Reader prototype; a more ambitious target for the proof-stage timeline.

## Inclusive-product writing and FX progress disclosure

- https://monzo.com/blog/weve-made-our-writing-system-available-to-all — every state name needs a [what happened] [what to do next] pair. This is the model for /batches.
- https://wise.com/us/pricing/ — every fee is visible before the field; no surprise. The model for the OrderForm strip.
- https://wise.com/help/articles/2978013/what-are-the-fees-and-limits-for-receiving-money — the recipient confirmation step before signing; the model for the Withdraw modal.

## Design-system technique references (mechanical patterns)

- https://bbc.github.io/gel/ — BBC GEL technical guide; touch targets at 7mm minimum, design touch-first.
- https://fluent2.microsoft.design/ — Fluent 2 Web; paired focus + selection states so colour is never the only carrier.
- https://polaris-react.shopify.com/components/deprecated/modal — Shopify Polaris Modal; focus trap, accessible names on dismissal.

## Anti-references — behaviour cost framing

- https://www.tradingview.com/accessibility/ — TradingView's *own* statement: chart accessibility is a known gap and an active programme. Do not ship the same gap on /portfolio without naming it.
- https://tradingview.github.io/lightweight-charts/tutorials/a11y/intro — TradingView's own a11y tutorials show the keyboard-navigation primitive as opt-in via featureset; chart-default-inaccessible is the trap.
- https://www.trustpilot.com/review/binance.com — Binance is the cautionary tale: users describe the interface as "scary" and "overloaded". An institutional product cannot afford the same first impression at the disconnected and trade pages.

## Notes on what I could not source

- I did not find a publicly hosted institutional FX execution UI (Bloomberg Terminal, FXall) with a screen-reader walkthrough I could cite directly. The Bloomberg sonification capstone is the closest available analogue and is referenced in the chart-fallback build item.
- Polymarket and Dexscreener do not publish accessibility statements; their omission from cited URLs is intentional — I do not cite anti-references without a published source. The TradingView and Binance citations carry the anti-reference load.
