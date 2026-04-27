# Density & Layering Rules

This document captures the "when to use a card wrapper" rules applied in
FE-057. Follow them for all new UI work so the app stays visually
consistent.

## The two-level background rule

Omega's dark theme has three background tokens:

| Token | Hex | Role |
|---|---|---|
| `--color-bg-base` | `#0D0D0D` | Page background — the default. Everything sits on this unless there is a reason not to. |
| `--color-bg-surface` | `#1A1A1A` | Cards, modals, form containers, hover highlights — a single step up from base. |
| `--color-bg-elevated` | `#262626` | Interactive-state fills inside a surface (active tab pill, button hover inside a card). |

**Never stack three levels.** A `bg-bg-elevated` element sitting inside a
`bg-bg-surface` sitting inside something that already reads as a card is
visual noise. Two levels max — if you find yourself nesting three, remove
the middle one.

## When to flatten (remove the `bg-bg-surface` wrapper)

- **Hero content** — the primary visual element on each page. The price
  chart on `/trade`, the portfolio value hero on `/portfolio`, the batch
  table on `/explorer`, the orders table on `/account`, any detail-page
  hero (`OrderDetail`, `BatchDetail`, `TransactionDetail`,
  `WithdrawalDetail`, `PairDetail`). Let it sit directly on the flat
  page background.
- **Data tables** — header row uses `border-b border-border-subtle`,
  data rows use `hover:bg-bg-surface` with a rounded highlight
  (`rounded-md -mx-2 px-2`). No container card. Applies to
  PortfolioBalances, OpenPositions, BatchExplorer, account orders,
  TransactionHistory, Fills list in OrderDetail, RecentTrades in the
  right sidebar.
- **Info sections** — grouped key/value rows with a heading. Use the
  heading and the column `gap-6`/`gap-8` to separate sections instead
  of a surface. Applies to detail-page Timeline, Batch Info,
  Withdrawal Details, etc.

## When to keep the card

- **Interactive tiles** — small click targets that benefit from a
  distinct surface. Stat cards on `PairDetail` (24H Volume etc),
  `StatCard` in `TransactionDetail` (Midpoint / Savings / Slippage),
  balance tiles per token, deposit/withdraw/transfer action buttons.
  Consistent with Uniswap's Send / Receive / Buy / More pattern.
- **Modals, popovers, dropdowns** — must float above content.
  Unchanged by this pass.
- **Forms** — `FundingForm`, `OrderForm` section fills, inputs inside
  modals. Form fields need an explicit field boundary that a card
  provides.
- **Settings groups** — each settings group on `/settings` keeps its
  card so the groups read as visually distinct.
- **Venue Comparison** (`PriceComparisonPanel`) — keeps its weak
  `bg-bg-surface` so the compact pill row reads as a group next to
  the flat chart. Unchanged by FE-057; further refined in FE-056.
- **Privacy Proof card** on `WithdrawalDetail` — a call-to-action
  tile with Verify Proof / Download & Claim buttons.
- **Warning / alert callouts** — the `bg-warning/10 border
  border-warning/30` pattern on the `/account` stale-nonce warning,
  etc. Keep — they need to read as distinct alerts.

## Row hover pattern (for flattened tables)

```tsx
// Header row
<div className="flex items-center h-[33px] border-b border-border-subtle text-label-uppercase text-text-muted">
  {/* column labels */}
</div>

// Data row — same width and insets as the header so column
// percentages stay aligned. Hover pops to bg-bg-surface with a
// rounded-md corner at the row's natural bounds.
<div className="flex items-center h-[40px] hover:bg-bg-surface transition-fast rounded-md">
  {/* row content */}
</div>
```

Keep the header and row on the same horizontal inset — if you add
`px-*` to the row, add it to the header too so the flex column
percentages compute against the same content box width. Right-aligned
numeric columns drift quickly if you don't.

## Spacing — the density model (FE-058)

FE-057 handled colour layering. FE-058 handles the vertical / horizontal
rhythm: how much space sits between sections, and how much padding
sits inside cards.

### Reference values

| Surface | Mobile | Desktop | CSS variable |
|---|---|---|---|
| Inter-section gap | 16 px | 24 px | `--section-gap-mobile` / `--section-gap-desktop` |
| Card internal padding | 16 px | 24 px | `--card-padding-mobile` / `--card-padding-desktop` |
| Page max-width | — | 1200 px | `--page-max-width` |

In Tailwind class form: `gap-4 md:gap-6` between sections, `p-4 md:p-6`
inside cards, `max-w-[1200px] mx-auto w-full` on every page wrapper.
The `/trade` simple-mode column is the one intentional exception
because the action-first execution model anchors the swap card at
`max-w-[480px]`.

### When to deviate

- **Tight inline groups** (filter tabs, pill rows, breadcrumbs) — use
  `gap-2` or `gap-3`. The 24 px rule is for *major* sections.
- **Detail pages with dense step pipelines** — `OrderDetail` /
  `BatchDetail` timelines pack closer; use `gap-4` desktop, `gap-3`
  mobile.
- **`/trade` simple mode** — explicit max-w-[480px], generous vertical
  padding (`pt-10 pb-16`). Don't bring the 1200 px wrapper there.

### What this gives the user

A consistent "deep breath" between sections. Uniswap and CoW Swap both
use ~24 px between major surfaces; the prior 12-16 px rhythm read as
crowded once colour layering was simplified in FE-057. Don't tighten
further per page without writing a why.

### Where the tokens live

CSS custom properties are declared in `design-system/variables.css`
under the "Density tokens" block. JSON parallels in `tokens.json`
under `spacing.density`. Where Tailwind utilities exist for the value
(e.g. `gap-6` for 24 px), prefer the utility — the CSS variables are
the documented reference, not the runtime knob to wire into every
class.
