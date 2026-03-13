# Omega Interface

Open-source frontend for the [Omega Markets](https://omega.markets) protocol — a darkpool for stablecoin FX with anonymous execution at midpoint pricing and zero information leakage.

## Architecture

This is a pnpm monorepo with three packages:

| Package | Stack | Description |
|---------|-------|-------------|
| [`app`](/app) | Next.js 14, React 18, Tailwind CSS 4 | Trading application (trade, portfolio, explorer, account, funding, settings) |
| [`landing`](/landing) | Astro 5, Tailwind CSS 4 | Marketing landing page |
| [`design-system`](/design-system) | CSS custom properties | Shared tokens, variables, and theme configuration |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

### Install

```bash
pnpm install
```

### Development

```bash
# Trading app (Next.js) — http://localhost:3000
pnpm dev:app

# Landing page (Astro) — http://localhost:4321
pnpm dev:landing
```

### Build

```bash
# Build all packages
pnpm build
```

## Design System

The design system is built on CSS custom properties and consumed by both `app` and `landing` via Tailwind CSS 4.

**Colors** — Dark-first with `#0EA5E9` electric cyan accent, semantic success/error/warning/info.

**Typography** — [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) for display, [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for tabular/financial data.

**Spacing** — 4px base grid. Component heights: sm (32px), md (40px), lg (48px).

See [`design-system/variables.css`](/design-system/variables.css) for the full token reference.

## Project Structure

```
omega-interface/
├── app/                    # Next.js trading application
│   ├── app/                # App router pages
│   │   ├── trade/          # Trading page with BBO feed + order form
│   │   ├── portfolio/      # Balances, positions, P&L
│   │   ├── explorer/       # Batch + transaction explorer
│   │   ├── account/        # Order management
│   │   ├── funding/        # Deposit, withdraw, transfer
│   │   └── settings/       # User preferences
│   ├── components/         # React components
│   ├── lib/                # Types, hooks, mock data
│   └── public/             # Static assets
├── landing/                # Astro marketing site
├── design-system/          # Shared design tokens
│   ├── variables.css       # CSS custom properties
│   ├── tailwind.theme.css  # Tailwind theme mapping
│   └── tokens.json         # Raw design tokens
├── pnpm-workspace.yaml
└── package.json
```

## Key Features

- **Darkpool trading** — Orders execute privately at the midpoint price with no order book visibility
- **BBO price feed** — Real-time best bid/offer from Wise, OFX, Revolut, and Omega Midpoint
- **Pipeline transparency** — Track orders through: Submit → Match → Aggregation → Batch → Settle → Prove
- **Privacy mode** — ZK-proof-based withdrawals with zero on-chain history leakage
- **Batch explorer** — Browse settlement batches, transactions, and cryptographic proofs
- **Mobile-first** — Responsive design with bottom sheet modals and tab navigation

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with CSS custom properties
- **Icons**: [Lucide](https://lucide.dev/)
- **Language**: TypeScript 5.7
- **Package Manager**: pnpm workspaces
- **Landing**: [Astro 5](https://astro.build/)

## License

[BSL 1.1](LICENSE) — Business Source License
