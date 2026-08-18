# The hand-rolled Figma integration

**Status:** live on `kyles-frontend-edits`
**Figma file:** https://www.figma.com/design/YI4akSQx9T8iL8hvOk6f3H — *Omega Markets — Landing*
**Surfaces covered:** `/` (desktop + mobile), `/research`, `/research/private-price-discovery`, `/research/design-partners` (desktop)
**Enforced by:** `app/__tests__/figma-contract.test.ts`

Design and code round-trip through a Figma file without paying for the parts of
Figma that would normally make that possible. This document explains what we
built instead, why, and how to actually use it.

---

## Why hand-rolled

Figma sells two features that solve exactly this problem, and both are gated
above the plan this account is on (Professional):

| What we wanted | Figma's answer | Why we can't use it |
| --- | --- | --- |
| "Which source file implements this node?" | **Code Connect** | Organization / Enterprise only |
| "Fetch the design variables from CI" | **Variables REST API** | Enterprise only |

So the integration is three moving parts we own, plus one we don't:

1. **The Figma MCP server** (we don't own it) — the live connection. It lets
   Claude read frame geometry, variables, styles and annotations out of the
   file, and write nodes back into it.
2. **`design/component-map.json`** — our stand-in for Code Connect.
3. **`design/tokens.json`** — our stand-in for the Variables API.
4. **`app/__tests__/figma-contract.test.ts`** — the thing that makes 2 and 3
   more than good intentions.

The trick is that **the two contract files live in git**. Code Connect mappings
live in Figma's cloud where nobody reviews them; ours show up in a diff, get
argued about in a PR, and fail CI when they rot.

---

## The two contract files

### `design/tokens.json` — what Figma says the tokens are

A mirror of the Figma variable collections (`Omega Color`, `Omega Radius`) in
git. The test compares it against the CSS that actually renders and names the
exact token and both values when they disagree.

The subtlety worth knowing: **the effective value of a token is a cascade.**
`app/app/_generated/tokens.css` is generated from `omega-docs`, and
`app/app/styles/tokens.css` layers overrides on top. `--glass-fill` is the live
example — the generated file says `rgba(255,255,255,0.04)`, the override layer
says `color-mix(in oklab, var(--background) 66%, transparent)`, and the override
is what you see on screen. So the test reads both files, applies the override
layer, and compares Figma against the *result*. Anything else would enforce a
value nobody renders.

Figma variables can't hold `color-mix()` or `var()`, so computed tokens are
stored twice: the CSS expression under `colors`, and the resolved value Figma
actually holds under `figmaResolved`. That second one is a hand-maintained
number — the test cannot catch it drifting, and the file says so.

> **Refreshing this file is a Claude/MCP job, not a script.** The Variables REST
> API is Enterprise-only, so nothing running locally can fetch it. Ask Claude to
> pull the variables over MCP and rewrite the file.

### `design/component-map.json` — which node is which file

The Code Connect stand-in. Every entry resolves a Figma node id to the source
file that implements it, plus a note about anything the geometry doesn't carry:

```json
{
  "figmaName": "Button",
  "nodeId": "3:10",
  "source": "app/components/ui/button.tsx",
  "note": "Component set, 8 variants. Variant=Primary → cva variant \"default\" …"
}
```

It also records what is deliberately **out** of scope, which turns out to matter
more than the mappings. `landing-sections.tsx`, `order-scroll-story.tsx` and
`landing-request-access.tsx` are not in the Figma file, because no route renders
them today — pushing dead components to Figma invites design work on surfaces
that will never ship.

The test asserts every `source` still exists. Rename a component without
updating the map and CI tells you, instead of a designer discovering it three
weeks later.

---

## Working the loop

### Code → Figma (how the file got made)

The Figma file was generated *from* this repo, not drawn by hand:

- Colour and radius tokens were read out of the CSS cascade and created as
  Figma variables, each carrying its real `var(--name)` as its web code syntax,
  and each scoped (fills to fills, radii to corner radius) so the variable
  pickers stay usable.
- `Button`, `Proof Step`, `Stat Card`, `Market Instrument`, `Input` and
  `Research Row` were built as components with variant axes that mirror the
  code. Notably the Button `Size` axis maps to the **responsive classes at each
  call site** (`Default`, `Large`, `Mobile Nav`, `Mobile Hero`), not to the cva
  `size` prop — because that's what the landing actually varies. `Market
  Instrument` is a closed set of five: adding a sixth means adding it to
  `marketInstrumentNames` in code first.
- The screens were assembled from those components at both breakpoints, with
  the real hero poster still uploaded as the backdrop fill and the real Omega
  mark inserted as a vector from the paths inlined in `OmegaMark.tsx`.

Every component carries a **description** naming its source file, and every
screen region carries a **Dev Mode annotation** doing the same. That is what
makes the file legible when you come back to it in three months.

### Figma → code (how an edit comes home)

Ranked by how cleanly the edit survives the trip:

1. **Change a variable.** Exact values, zero interpretation. Colour and radius
   changes should always be made this way.
2. **Edit the main component**, not a detached instance. The component's
   description tells you which file it lands in.
3. **Dev Mode annotations** (right-click → Annotate) for intent that geometry
   can't carry — "this is disabled until both fields validate", "this state only
   exists while the order is resting".
   **Figma comments are NOT readable over MCP. Annotations are.** This is the
   single most common way a design instruction gets silently dropped.
4. **Auto-layout gap and padding on the 4px grid.** A raw `13px` leaves Claude
   guessing which Tailwind step you meant.

Hand off with **Copy link to selection** — the URL must contain `node-id` — plus
one line on what changed. Then Claude reads the node over MCP, resolves it
through `component-map.json`, and edits the file the map names.

Design work follows the repo's branching rule: one branch per frame or feature,
so the design→code output is reviewable as a diff before it lands.

### What comes back is only as good as the file

Auto-layout frames give real flex/gap/padding. Absolutely-positioned layers give
coordinates that won't reflow. Bound variables map onto the CSS custom
properties; detached values don't. When a frame is loose, Claude should say so
rather than silently emitting magic numbers.

---

## What is deliberately not modelled

The hero backdrop is a looping `.webm`
(`public/landing/blackhole/omega-blackhole-hero-desktop.webm`); Figma holds its
poster still. The 60-star seeded starfield, the CSS order-meteors, the
scroll-driven dot-grid fade and the nav's scroll-to-solid transition are all
code-only.

Don't try to redesign motion in Figma. Describe the change in an annotation on
the frame that owns it.

Copy is the same story: every landing string lives in
`app/components/landing/content.ts`. Text edited in Figma is a *request*, not a
source.

---

## What porting a surface tends to surface

Rebuilding a page from its own code is an audit whether you meant it to be one.
The research port turned up a live layout bug: on `/research`, the identity
column is a `32fr` track (≈274px of content box at a 1440 viewport) and the
headline is `text-[clamp(48px,6vw,72px)]`, which resolves to **72px** at any
viewport ≥1200px. "Research" set in Geist SemiBold at 72px measures ≈295px, so
it overflows its column by ~21px and runs under the card's divider. Below
~1200px the clamp scales the type down and it fits.

That is recorded as a Dev Mode annotation on the Identity column, and in
`component-map.json`. It is deliberately **not** "fixed" in Figma by shrinking
the type — the Figma file's job is to show what the code does.

---

## Known fidelity gaps

Small, deliberate, and worth knowing before you trust a pixel:

- **Wordmark weight.** `landing-nav.tsx` asks for `font-semibold` (600). Figma's
  Space Grotesk ships Light / Regular / Medium / Bold — no 600 — so the Figma
  wordmark is **Bold (700)**. It reads very slightly heavier than production.
- **Hero backdrop crop.** The poster still is an image fill at `FILL` scale, so
  the mobile frame crops the blackhole differently than the `.webm` does at the
  same viewport. Treat the backdrop as indicative, not as a layout constraint.
- **Per-child spacing.** The copy column's real rhythm is `mt-5 / mt-6 / mt-9`.
  Figma auto-layout has one gap per frame, so it uses a uniform 24 with the CTA
  row carrying the extra 12 as padding. The headline gap is 4px tighter in code
  than in Figma.

None of these are worth "fixing" in Figma. They're recorded here so nobody
measures one of them and files it as a bug.

---

## Commands

```bash
pnpm test          # runs the contract test with everything else
pnpm sync-tokens   # regenerates app/app/_generated/tokens.css from omega-docs
```

There is no `figma:pull`. Refreshing `design/tokens.json` needs MCP, so it is a
Claude job — the absence of a script here is the design, not an omission.

---

## Origin

The pattern (two committed contract files plus one test, standing in for Code
Connect and the Variables API on a Professional plan) was first built in the
`avata-hacking` repo — see its `AGENTS.md` § Design and `design/`. This is the
same contract applied to the Omega landing surface, with the token half adapted
to handle this repo's generated-plus-override CSS cascade.
