# Omega Markets Design System

Design tokens, Tailwind theme, and component specifications for the Omega Markets decentralized darkpool FX trading platform.

**Version 2.0**

---

## Architecture

```
tokens.json ─────→ variables.css ─────→ tailwind.theme.css
                          │
                    ┌─────┼─────┬──────────┐
                    ▼     ▼     ▼          ▼
              palette.md  typography.md  components.md  README.md
```

- **`tokens.json`** is the canonical source of truth for all design decisions.
- **`variables.css`** is the runtime CSS custom properties layer, consumed by browsers directly.
- **`tailwind.theme.css`** maps everything into Tailwind v4 utilities via `@theme inline`.

---

## Quick Start

```css
/* In your app's main CSS file */
@import "../design-system/tailwind.theme.css";
```

That's it. This single import brings in Tailwind CSS v4, the CSS custom properties, and all theme mappings.

---

## File Manifest

| File | Purpose |
|------|---------|
| `tokens.json` | Machine-readable design tokens — colors, typography, spacing, radii, shadows, component sizing |
| `variables.css` | CSS custom properties on `:root` (dark default) with optional `[data-theme="light"]` override |
| `tailwind.theme.css` | Tailwind v4 entry point — `@theme inline` block, custom utilities, base layer |
| `palette.md` | Color documentation with WCAG contrast ratios and usage constraints |
| `typography.md` | Type specimen, font pairing rationale, scale reference |
| `components.md` | 10 component specifications with full state matrices |
| `README.md` | This file |

---

## Design Principles

1. **Dark-first** — `#0D0D0D` base, not pure black. Surface layers at ~5% lightness steps.
2. **Financial precision** — JetBrains Mono with `tabular-nums` for all numeric data.
3. **Contrast-safe** — Every text/background pair meets WCAG AA. Steel Blue (`#3467A1`) used as fill, not text on dark.
4. **Minimal chrome** — Content over decoration. One accent color, restrained palette.
5. **4px rhythm** — All spacing derived from a 4px base unit.

---

## Font Loading

Load **Space Grotesk** (UI text) and **JetBrains Mono** (numeric/code) from Google Fonts.

### HTML

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### CSS

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
```

---

## Tailwind v4 Notes

- Tailwind v4 uses **CSS-first configuration** — there is no `tailwind.config.js`.
- The `@theme inline` block in `tailwind.theme.css` maps CSS custom properties to utility classes.
- `--spacing: 0.25rem` sets the 4px base unit: `p-1` = 4px, `p-6` = 24px, `p-16` = 64px.
- Font size utilities include line-height companions automatically.

---

## Color Tokens Quick Reference

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent` | `#3467A1` | Primary accent (Steel Blue) |
| `--color-text-primary` | `#F5F5F5` | Headlines, important text |
| `--color-text-secondary` | `#A0A0A0` | Body text, descriptions |
| `--color-bg-base` | `#0D0D0D` | Page background |
| `--color-bg-surface` | `#1A1A1A` | Card/panel backgrounds |
| `--color-success` | `#22C55E` | Bid, positive values |
| `--color-error` | `#EF4444` | Ask, negative values |

> **No pure white (`#FFFFFF` or `#FFF`) anywhere.** Use `#F5F5F5` as the lightest color.
