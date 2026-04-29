## Persona 07 — Kevin Park

### Top 3 observations

1. `/batches` is still laid out like a polished feature page when it should behave like a settlement console. GitHub keeps large diff reviews navigable with filtering and a file tree, while Grafana and CloudWatch push operators toward one dense, drillable view instead of a stack of decorative cards; Omega is leaving scan speed on the table. [ref-1] [ref-2] [ref-9]
2. The page shows proof state, but it does not let me operate on proof state. Stripe search, Stripe Workbench, and Postman all expose identifiers, errors, timings, and filters directly in the working surface; here I still need a second click to answer basic questions like “which batch is pending, how stale is it, and what exactly is missing.” [ref-3] [ref-4] [ref-5]
3. The ambient chrome is bleeding into the data plane. Vercel, Awwwards, and Dribbble all optimize for spectacle, browsing, and brand mood; importing that posture into an attestation explorer costs contrast, density, and trust because the UI starts feeling staged instead of instrumented. [ref-12] [ref-13] [ref-14]

### Page-by-page review

#### `/batches`

The current list is readable, but it burns too much width on rounded row cards and too little on sortable state. GitHub’s diff tooling, Grafana’s table model, and CloudWatch’s “single view” bias all point the other way: freeze the key identifiers, compress the chrome, and keep the operator in one surface until they actually need the deep record. [ref-2] [ref-7] [ref-9]

Search exists, but it behaves like a polite accessory instead of the main control path. Stripe’s dashboard search, Linear’s issue search, and iTerm2’s find model all treat direct lookup as the fastest path to a known object; `/batches` should let me jump by batch number, proof hash, or settlement tx without visually negotiating the page first. [ref-4] [ref-11] [ref-16]

The “Attestation log” label is directionally right, but the surface under it is not a log. Grafana’s observability guidance, Postman’s response viewer, and Stripe Workbench all reward side-by-side state inspection, where metadata, error context, and the active object live in one working set instead of behind card taps. [ref-5] [ref-6] [ref-10]

#### `/batches/[id]`

The detail page is honest about state, but the donut is over-promoted. Grafana’s dashboard guidance is to reduce cognitive load and preserve hierarchy, GitHub’s review UI privileges the active payload over ornamental framing, and Postman makes status, timing, and body details the primary object; here the ring is louder than the evidence. [ref-1] [ref-6] [ref-10]

The raw values that matter are present, but they are not grouped like an incident console. CloudWatch dashboards are explicit about a single operational view, Stripe Workbench groups endpoint, occurrences, and logs around an error object, and iTerm2’s split-pane model is basically a lesson in simultaneous context; batch state, pair aggregate, and chain proofs should coexist without forcing vertical travel. [ref-5] [ref-9] [ref-11]

#### Shell and adjacent surfaces

The shell is restrained enough, but the global dot-grid and softened containers should not spill onto infrastructure routes. Vercel’s current front door literally sells “beautiful interfaces,” Awwwards indexes animation and effects as first-class categories, and Dribbble’s shot culture is built around isolated polished frames; that behavior is fine for a brochure, but it is dead weight on a page that should feel closer to GitHub, Stripe Dashboard, or an internal runbook. [ref-3] [ref-12] [ref-13] [ref-14]

`/trade` and `/portfolio` can afford more mood because they are user-owned surfaces; `/batches` cannot. Grafana, CloudWatch, and GitHub all separate operational scanning from promotional storytelling, and Omega should keep that separation instead of letting the brand system flatten every route into the same visual temperament. [ref-1] [ref-8] [ref-9]

### Kill list

- Kill the global dot-grid on `/batches` routes. It adds brand atmosphere where Grafana, GitHub, and CloudWatch would spend those pixels on structure or whitespace discipline. [ref-1] [ref-8] [ref-9]
- Kill the card-per-row treatment on the list. A settlement explorer wants a table with fixed columns, not eight individually dramatized tiles. [ref-2] [ref-7] [ref-9]
- Kill the oversized progress donut as the hero of batch detail. Keep lifecycle state, but demote it into a compact timeline so hashes, timestamps, and failure evidence can lead. [ref-5] [ref-6] [ref-10]
- Kill passive chrome like the standalone `Last 100` label if it does not become an actual range/time control. Stripe search, Linear search, and GitHub filters all earn their space by changing the working set. [ref-2] [ref-4] [ref-16]

### Build list

- Add a sticky operator rail on `/batches` with queue counts, oldest pending age, last sealed time, and direct filters for `verified`, `pending`, `failed`, pair, and stale threshold. CloudWatch’s single operational view, Grafana’s RED/USE drilldown guidance, and Stripe Dashboard’s task-oriented navigation all back this move. [ref-3] [ref-6] [ref-9]
- Rebuild the batch list as a dense table with frozen left columns for batch ID and status, then sealed age, fills, orders, USD volume, pair count, proof hash, and settlement tx. GitHub’s file tree/filter model, Grafana’s table visualization with frozen columns, and Stripe’s filterable transaction surfaces are the right precedents. [ref-2] [ref-4] [ref-7]
- Add an inline detail pane on desktop so selecting a row reveals lifecycle, failure reason, root, proof hash, and L1 settlement without a route hop. iTerm2’s split panes, Postman’s response viewer, and Stripe Workbench’s error-group inspection all show the value of keeping context adjacent instead of serial. [ref-5] [ref-10] [ref-11]
- Add first-class failure instrumentation: stale pending badge, missing-proof badge, revert reason slot, and copyable identifiers with one-click outbound links. Stripe Workbench exposes occurrences, endpoint, and logs around failures; Postman keeps code, network details, and timings visible; CloudWatch treats dashboards as operational playbooks, not ornamental summaries. [ref-5] [ref-9] [ref-10]
- Add direct ID search semantics, including exact batch jump and hash prefix match, with keyboard bias on desktop. Stripe search, Linear quick search, and GitHub review navigation all optimize for operators who already know what they are looking for. [ref-2] [ref-4] [ref-16]

### References

- [ref-1] https://github.blog/changelog/2026-01-22-improved-pull-request-files-changed-page-on-by-default/
- [ref-2] https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/filtering-files-in-a-pull-request
- [ref-3] https://docs.stripe.com/dashboard/basics
- [ref-4] https://docs.stripe.com/dashboard/search
- [ref-5] https://docs.stripe.com/workbench/overview
- [ref-6] https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/
- [ref-7] https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/table/
- [ref-8] https://grafana.com/docs/grafana-cloud/introduction/dashboards/
- [ref-9] https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html
- [ref-10] https://learning.postman.com/docs/sending-requests/response-data/responses
- [ref-11] https://iterm2.com/features.html
- [ref-12] https://vercel.com/
- [ref-13] https://www.awwwards.com/websites/sites_of_the_day/
- [ref-14] https://dribbble.com/search/website-shots
- [ref-15] https://linear.app/docs/my-issues
- [ref-16] https://linear.app/docs/search
