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

The trading app requires `NEXT_PUBLIC_API_URL` to point at a running `omega-api`
instance. For local development with the backend repo in
`/Users/brianseong/Developer/Omega/omega-markets`, run the backend on a separate
port and point the frontend at it:

```bash
# Backend API from omega-markets
cd /Users/brianseong/Developer/Omega/omega-markets
OMEGA_HTTP_BIND="127.0.0.1:3001" cargo run -p omega-api

# Trading app from omega-interface
cd /Users/brianseong/Developer/Omega/omega-interface-backend-api/app
NEXT_PUBLIC_API_URL="http://127.0.0.1:3001" pnpm dev
```

### Build

```bash
# Build all packages
pnpm build
```

## Testing

The `app` package uses [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for component tests in a jsdom environment.

```bash
cd app && pnpm test
```

### Stack

| Tool | Purpose |
|------|---------|
| Vitest | Test runner (jsdom environment) |
| `@vitejs/plugin-react` | JSX/React transform for Vite |
| `@testing-library/react` | Component rendering + queries |
| `@testing-library/jest-dom` | DOM assertion matchers (`.toBeInTheDocument()`, etc.) |

### Configuration

- **Config**: [`app/vitest.config.ts`](/app/vitest.config.ts) — jsdom env, React plugin, `@/` path alias
- **Setup**: [`app/vitest.setup.ts`](/app/vitest.setup.ts) — loads jest-dom matchers globally

### Path Aliases

The `@/` alias resolves to the `app/` package root, matching `tsconfig.json`. Use `import Foo from "@/components/Foo"` in tests.

### Adding a Test

1. Create `app/components/__tests__/YourComponent.test.tsx` (or co-locate as `YourComponent.test.tsx`)
2. Import `render`/`screen` from `@testing-library/react` and `describe`/`it`/`expect` from `vitest`
3. Call `afterEach(cleanup)` to prevent DOM leaks
4. Run with `cd app && pnpm test`

### What Needs Mocks

Components using Next.js internals (`next/image`, `next/link`, `next/navigation`, `next/font/google`) require manual mocks — pure presentational components work out of the box.

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
