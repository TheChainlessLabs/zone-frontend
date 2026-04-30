# Persona generation prompt

Paste this into ChatGPT (or any model with web search) when you need to refresh `personas.md`. Output goes straight into `tools/persona-review/personas.md`. The `run.sh briefs` phase consumes it.

---

You are designing a 20-persona panel that will review the omega-interface design-V2 app and produce a structured critique. Each persona is a real archetype of a user the product needs to win — not a marketing avatar. Their lens is informed by where they come from, how they earn, what financial interfaces they already live inside, and what makes them roll their eyes.

# What omega-interface is

Omega Markets — an institutional darkpool for stablecoin FX trading. TEE-attested matching engine, on-chain settlement on Ethereum L1. Positioning: infrastructure, not a bank. Target users: institutional traders, treasury operators, family offices, crypto-native arbitrageurs, and FX desks moving 6+ figures of stablecoin pairs (USDC/EURC, USDC/USDT, USDC/USDC.e at launch).

Current frontend on `design-V2`:
- Vercel/shadcn zinc palette, Geist Sans + Geist Mono + Source Serif 4 italic accents
- Liquid-glass surfaces on a few specific cards
- Soft drop shadows, dialed back recently
- Global dot-grid background
- AppShell — top Navbar on desktop, bottom MobileTabBar on mobile
- Pages: /trade (Market + Limit), /portfolio (chart hero + dual-column with sticky summary), /batches (Aztec-proof-hero list + detail), /account, /brand, /system, /not-found

# What I want from you

Generate exactly **20 personas**, numbered `01` through `20`. The set should cover:
- Geographic spread — at minimum 4 continents, multiple countries within Asia.
- Mix of institutional + crypto-native + retail-prosumer + product/design + research/operator viewpoints.
- Mix of ages 22–45, genders, languages of taste.
- Mix of redesign attitudes 1–5 (1 = fix copy only; 5 = full page rebuild).
- A mix of `claude-code` and `codex` runtimes assigned per persona — roughly half/half. Reasoning: Claude tends to be stronger on prose-heavy persona voice; codex tends to be stronger on dense source-code rewrites. Use that to bias the assignment.

Each persona must include reference inspirations the AGENT can actually reach via WebFetch / WebSearch — public marketing pages, product pages, trading-app landing pages, brand pages. No private dashboards. At least one anti-reference per persona must be a public site that lets the agent cite a behavioural cost (regulatory action, abandoned UX pattern, public criticism, churn data).

# Output format — Markdown, exactly this shape per persona

```
## Persona NN — Full Name, Age, City, Country

- **Runtime**: `claude-code` OR `codex`
- **Tagline**: <one-line motto in their voice>
- **Day job**: <concrete role + employer-type>
- **Cultural + taste lineage**: <one sentence naming the specific products / institutions / cities that formed their eye>
- **Finance interface usage**: institutional | crypto-native | retail-prosumer | product/design | research/operator
- **Reference inspirations (5–7)**:
  - [Site Name](https://url) — what they take from it.
  - [Site Name](https://url) — what they take from it.
  - ...
- **Anti-references (3–5)**:
  - [Site Name](https://url) — why they reject it (specific behavioural cost preferred).
  - [Site Name](https://url) — why they reject it.
  - ...
- **Primary value**: <one phrase — what they optimise for>
- **Redesign attitude**: 1 | 2 | 3 | 4 | 5
- **Voice traits**: <three adjectives>
- **Critique angles**:
  1. ...
  2. ...
  3. ...
- **Mobile vs desktop priority**: mobile | desktop — <one sentence why>
- **Success definition**: <one sentence — what they say "yes" to>

---
```

Separate personas with `---` on its own line.

# Quality bar

- Every persona must be specific enough that the next agent can read it cold and write in that voice. "Korean institutional trader" is not enough. Name the OMS tools, the Bloomberg-vs-Refinitiv split, the Seoul finance culture, the specific Korean retail apps they distrust.
- No two personas should be paraphrases of each other. Differentiate by lineage, not by superficial labels.
- Reference inspirations must point to public URLs that actually load. Verify before listing.
- Anti-references should encode a behavioural cost the persona can cite — Robinhood's confetti drew SEC action, Notion's load latency cost it execution-tool credibility, etc. The agent will use these as precedent in their critique.

# Hard rules

- No emoji.
- No "minimalist", "clean", "modern" as standalone descriptors anywhere in the output.
- No AI attribution language anywhere.
- No personal-infra references — keep everything framed for the next engineer.
- Use plain ASCII apostrophes. No smart quotes. No em-dashes inside URLs.

When done, output the 20 personas back-to-back in the format above. Nothing else — no preamble, no numbered list summary, no closing remarks.
