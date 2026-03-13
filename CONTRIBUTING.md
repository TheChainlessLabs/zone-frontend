# Contributing to Omega Interface

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Start development: `pnpm dev:app`

## Branch Naming

```
brian/<feature-or-fix-description>
```

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add deposit bottom sheet modal
fix: responsive padding on mobile detail pages
refactor: consolidate settings into single view
docs: update README with architecture diagram
```

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Write a descriptive title (under 70 characters)
- Include a summary of what and why in the description
- Link related issues

### PR Description Template

```markdown
## Summary
- What changed and why

## Test Plan
- [ ] Verified on desktop (1440px)
- [ ] Verified on mobile (390px)
- [ ] Build passes (`pnpm build`)
```

## Code Style

- **TypeScript** — Strict mode, explicit types where they aid readability
- **Tailwind CSS** — Use design system tokens (`text-accent`, `bg-bg-surface`), not raw colors
- **Components** — One component per file, colocate helpers at bottom of file
- **Imports** — Use `@/` path alias, destructure where possible

## Design System

All UI should use tokens from `design-system/variables.css`. Never hardcode colors, spacing, or typography values that exist as tokens.

```tsx
// Do
<div className="bg-bg-surface border border-border rounded-lg p-4">

// Don't
<div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-4">
```

## Mobile-First

All components must work on 390px viewport width. Use responsive prefixes:

```tsx
<div className="p-4 md:p-6">        // Tighter on mobile
<div className="grid-cols-2 md:grid-cols-4">  // Fewer columns on mobile
<div className="hidden md:block">    // Desktop only
<div className="md:hidden">          // Mobile only
```
