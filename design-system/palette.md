# Omega Markets Color Palette

Color reference for the Omega Markets design system. All values are sourced from `tokens.json` and resolved through `variables.css`. Every component in the system consumes these colors via CSS custom properties -- never hardcoded hex values. The palette is built for a dark-first trading interface where legibility under sustained screen time is the primary constraint.

No pure white (#FFFFFF) appears anywhere in this system. The lightest color is #F5F5F5, chosen to reduce eye strain during extended trading sessions.

---

## Accent

Steel Blue serves as the primary brand and interactive color. It communicates "actionable" across the UI -- buttons, links, selected states, and focus indicators.

| Swatch | Hex | CSS Variable | Role |
|--------|-----|-------------|------|
| ![#3467A1](https://via.placeholder.com/16/3467A1/3467A1) | `#3467A1` | `--color-accent` | Default. Button fills, active nav items, primary actions. |
| ![#3D78B8](https://via.placeholder.com/16/3D78B8/3D78B8) | `#3D78B8` | `--color-accent-hover` | Hover state. ~8% lighter than default. |
| ![#2D5A8E](https://via.placeholder.com/16/2D5A8E/2D5A8E) | `#2D5A8E` | `--color-accent-active` | Active/pressed state. ~8% darker than default. |
| ![#4A8BC7](https://via.placeholder.com/16/4A8BC7/4A8BC7) | `#4A8BC7` | `--color-accent-muted` | Muted accent. Secondary indicators, icon tints. |
| ![#4A8BC71F](https://via.placeholder.com/16/4A8BC71F/4A8BC71F) | `#4A8BC71F` | `--color-accent-subtle` | Subtle background wash (12% opacity). Selected row highlights, hover tints. |

---

## Text

Four levels of text hierarchy, designed for dark backgrounds. The system never uses pure white for text.

| Swatch | Hex | CSS Variable | Role |
|--------|-----|-------------|------|
| ![#F5F5F5](https://via.placeholder.com/16/F5F5F5/F5F5F5) | `#F5F5F5` | `--color-text-primary` | Primary text. Headings, body copy, prices, labels. |
| ![#A0A0A0](https://via.placeholder.com/16/A0A0A0/A0A0A0) | `#A0A0A0` | `--color-text-secondary` | Secondary text. Descriptions, timestamps, metadata. |
| ![#666666](https://via.placeholder.com/16/666666/666666) | `#666666` | `--color-text-muted` | Muted text. Placeholders, disabled labels, watermarks. **Large text only (18px+).** |
| ![#0D0D0D](https://via.placeholder.com/16/0D0D0D/0D0D0D) | `#0D0D0D` | `--color-text-inverse` | Inverse text. Used on light fills (e.g., text inside accent-colored buttons). |

---

## Backgrounds

A four-tier surface system that creates depth through subtle lightness steps. Every tier is a neutral gray with no hue bias. See the [Surface Layer Progression](#surface-layer-lightness-progression) section for the rationale behind the exact values.

| Swatch | Hex | Lightness | CSS Variable | Role |
|--------|-----|-----------|-------------|------|
| ![#0D0D0D](https://via.placeholder.com/16/0D0D0D/0D0D0D) | `#0D0D0D` | 5.1% | `--color-bg-base` | App background. The lowest layer. |
| ![#1A1A1A](https://via.placeholder.com/16/1A1A1A/1A1A1A) | `#1A1A1A` | 10.2% | `--color-bg-surface` | Card and panel backgrounds. Primary content containers. |
| ![#262626](https://via.placeholder.com/16/262626/262626) | `#262626` | 14.9% | `--color-bg-elevated` | Elevated surfaces. Dropdowns, popovers, tooltips. |
| ![#333333](https://via.placeholder.com/16/333333/333333) | `#333333` | 20.0% | `--color-bg-overlay` | Overlay surfaces. Modal backdrops, top-level menus. |

---

## Borders

| Swatch | Hex | CSS Variable | Role |
|--------|-----|-------------|------|
| ![#333333](https://via.placeholder.com/16/333333/333333) | `#333333` | `--color-border` | Default border. Dividers, card edges, table rules. |
| ![#1A1A1A](https://via.placeholder.com/16/1A1A1A/1A1A1A) | `#1A1A1A` | `--color-border-subtle` | Subtle border. Separators within same-surface panels. |
| ![#4A8BC7](https://via.placeholder.com/16/4A8BC7/4A8BC7) | `#4A8BC7` | `--color-border-focus` | Focus border. Applied on `:focus-visible` for interactive elements. |
| ![#4A8BC726](https://via.placeholder.com/16/4A8BC726/4A8BC726) | `#4A8BC726` | `--color-border-focus-ring` | Focus ring glow (15% opacity). Used with `box-shadow` for the outer ring. |

---

## Semantic Colors

Semantic colors encode meaning: success/failure, bid/ask, warnings, and informational states. Each semantic color ships with hover, active, and subtle variants following the same interaction pattern as Accent.

### Success / Bid

Green. Used for positive outcomes, confirmations, and bid-side order book entries.

| Swatch | Hex | CSS Variable | Role |
|--------|-----|-------------|------|
| ![#22C55E](https://via.placeholder.com/16/22C55E/22C55E) | `#22C55E` | `--color-success` | Default green. Bid prices, positive PnL, success toasts. |
| ![#2DD96B](https://via.placeholder.com/16/2DD96B/2DD96B) | `#2DD96B` | `--color-success-hover` | Hover state. |
| ![#1EA750](https://via.placeholder.com/16/1EA750/1EA750) | `#1EA750` | `--color-success-active` | Active/pressed state. |
| ![#22C55E1F](https://via.placeholder.com/16/22C55E1F/22C55E1F) | `#22C55E1F` | `--color-success-subtle` | Subtle background (12% opacity). Bid row highlights, success banners. |

### Error / Ask

Red. Used for destructive actions, errors, and ask-side order book entries.

| Swatch | Hex | CSS Variable | Role |
|--------|-----|-------------|------|
| ![#EF4444](https://via.placeholder.com/16/EF4444/EF4444) | `#EF4444` | `--color-error` | Default red. Ask prices, negative PnL, error messages. |
| ![#F25D5D](https://via.placeholder.com/16/F25D5D/F25D5D) | `#F25D5D` | `--color-error-hover` | Hover state. |
| ![#D93B3B](https://via.placeholder.com/16/D93B3B/D93B3B) | `#D93B3B` | `--color-error-active` | Active/pressed state. |
| ![#EF44441F](https://via.placeholder.com/16/EF44441F/EF44441F) | `#EF44441F` | `--color-error-subtle` | Subtle background (12% opacity). Ask row highlights, error banners. |

### Warning

Amber. Used for non-blocking alerts, partial fills, and conditions that need attention.

| Swatch | Hex | CSS Variable | Role |
|--------|-----|-------------|------|
| ![#F59E0B](https://via.placeholder.com/16/F59E0B/F59E0B) | `#F59E0B` | `--color-warning` | Default amber. Partial fills, slippage warnings. |
| ![#F7AE2E](https://via.placeholder.com/16/F7AE2E/F7AE2E) | `#F7AE2E` | `--color-warning-hover` | Hover state. |
| ![#D98B09](https://via.placeholder.com/16/D98B09/D98B09) | `#D98B09` | `--color-warning-active` | Active/pressed state. |
| ![#F59E0B1F](https://via.placeholder.com/16/F59E0B1F/F59E0B1F) | `#F59E0B1F` | `--color-warning-subtle` | Subtle background (12% opacity). Warning banners, caution badges. |

### Info

Aliases the Accent color. Used for informational callouts and neutral status indicators.

| Swatch | Hex | CSS Variable | Role |
|--------|-----|-------------|------|
| ![#3467A1](https://via.placeholder.com/16/3467A1/3467A1) | `#3467A1` | `--color-info` | Default info blue. Tooltips, help text callouts. |
| ![#3D78B8](https://via.placeholder.com/16/3D78B8/3D78B8) | `#3D78B8` | `--color-info-hover` | Hover state. |
| ![#2D5A8E](https://via.placeholder.com/16/2D5A8E/2D5A8E) | `#2D5A8E` | `--color-info-active` | Active/pressed state. |
| ![#3467A11F](https://via.placeholder.com/16/3467A11F/3467A11F) | `#3467A11F` | `--color-info-subtle` | Subtle background (12% opacity). Info banners. |

---

## Contrast Matrix (WCAG 2.1)

Pre-calculated contrast ratios for every meaningful foreground-on-background combination. WCAG AA requires 4.5:1 for normal text (below 18px/14px bold) and 3:1 for large text (18px+ or 14px+ bold).

### Foreground on Base (#0D0D0D)

| Foreground | Hex | Ratio | AA Normal (4.5:1) | AA Large (3:1) |
|------------|-----|------:|:------------------:|:--------------:|
| Text Primary | `#F5F5F5` | 17.83:1 | PASS | PASS |
| Text Secondary | `#A0A0A0` | 7.43:1 | PASS | PASS |
| Text Muted | `#666666` | 3.38:1 | FAIL | PASS |
| Accent | `#3467A1` | 3.33:1 | FAIL | PASS |
| Success | `#22C55E` | 8.53:1 | PASS | PASS |
| Error | `#EF4444` | 5.16:1 | PASS | PASS |
| Warning | `#F59E0B` | 10.14:1 | PASS | PASS |

### Foreground on Surface (#1A1A1A)

| Foreground | Hex | Ratio | AA Normal (4.5:1) | AA Large (3:1) |
|------------|-----|------:|:------------------:|:--------------:|
| Text Primary | `#F5F5F5` | 15.98:1 | PASS | PASS |
| Text Secondary | `#A0A0A0` | 6.66:1 | PASS | PASS |

### Foreground on Elevated (#262626)

| Foreground | Hex | Ratio | AA Normal (4.5:1) | AA Large (3:1) |
|------------|-----|------:|:------------------:|:--------------:|
| Text Primary | `#F5F5F5` | 13.57:1 | PASS | PASS |

### Foreground on Accent (#3467A1)

| Foreground | Hex | Ratio | AA Normal (4.5:1) | AA Large (3:1) |
|------------|-----|------:|:------------------:|:--------------:|
| Text Primary | `#F5F5F5` | 5.35:1 | PASS | PASS |

### Full Cross-Reference

The table below covers all foreground colors against all background tiers. Cells marked with a dash indicate combinations that should never appear in production.

| Foreground \ Background | #0D0D0D (Base) | #1A1A1A (Surface) | #262626 (Elevated) | #333333 (Overlay) | #3467A1 (Accent) |
|--------------------------|:--------------:|:-----------------:|:------------------:|:-----------------:|:-----------------:|
| `#F5F5F5` Primary | 17.83 | 15.98 | 13.57 | 11.29 | 5.35 |
| `#A0A0A0` Secondary | 7.43 | 6.66 | 5.66 | 4.71 | -- |
| `#666666` Muted | 3.38 | 3.03 | 2.58 | -- | -- |
| `#3467A1` Accent | 3.33 | 2.99 | -- | -- | -- |
| `#22C55E` Success | 8.53 | 7.65 | 6.50 | 5.41 | -- |
| `#EF4444` Error | 5.16 | 4.63 | 3.93 | 3.27 | -- |
| `#F59E0B` Warning | 10.14 | 9.09 | 7.72 | 6.43 | -- |
| `#0D0D0D` Inverse | -- | -- | -- | -- | 3.33 |

Ratios below 3.0 are omitted (marked `--`) because those pairings are not permitted.

---

## Usage Constraints

These rules are non-negotiable. Violating them produces inaccessible UI.

### Steel Blue (#3467A1) -- Accent limitations

Steel Blue at 3.33:1 on #0D0D0D **fails WCAG AA for normal text**. It passes only for large text (3:1 threshold).

**Permitted uses on dark backgrounds:**
- Button fills and backgrounds (with #F5F5F5 text on top, which passes at 5.35:1)
- Icon fills at 24px+ (decorative, not informational)
- Border and underline accents (not carrying semantic meaning alone)
- Large text (18px+ regular weight, 14px+ bold)

**Prohibited uses on dark backgrounds:**
- Body text (16px or smaller)
- Inline links at body size without an additional visual indicator (underline)
- Labels or metadata text

### Muted Text (#666666) -- Large text only

At 3.38:1 on #0D0D0D, muted text **fails AA for normal text** but passes for large text.

**Permitted uses:**
- Placeholder text in inputs (exempt from contrast requirements per WCAG)
- Watermark or decorative text at 18px+
- Disabled state labels (disabled controls are exempt from WCAG contrast)

**Prohibited uses:**
- Any body-size text that conveys information
- Timestamps, metadata, or secondary labels at body size (use #A0A0A0 instead)

### Semantic Colors on Overlay (#333333)

Error red (#EF4444) drops to 3.27:1 on overlay backgrounds. When displaying error text inside modals or overlays:
- Use #F5F5F5 for the error message text
- Use #EF4444 only for icons, borders, or background washes
- Alternatively, use the subtle variant (#EF44441F) as a background tint with #F5F5F5 text

### Never Use Pure White

`#FFFFFF` and `#FFF` do not exist in this system. Every place that would traditionally use white uses `#F5F5F5` instead. This applies to:
- Text color
- Background fills
- Border colors
- SVG fills and strokes
- Placeholder and disabled states

---

## Conflict Resolution: #0D0D0D vs #000000

The base background is `#0D0D0D` (HSL 0 0% 5.1%), not `#000000` (pure black). This is a deliberate choice:

1. **Depth perception.** Pure black (#000000) creates an infinite void -- there is no darker shade available to indicate depth. By starting at 5.1% lightness, we preserve room for shadows, borders, and visual anchoring. A `box-shadow` with `rgba(0,0,0,0.3)` is invisible on #000000 but perceptible on #0D0D0D.

2. **Contrast management.** #F5F5F5 on #000000 produces a contrast ratio of 19.34:1 -- well above the minimum but high enough to cause halation (perceived glow around white text on pure black), especially on OLED displays. Backing off to #0D0D0D brings the ratio to 17.83:1, which is still far above AA requirements while reducing eye strain.

3. **OLED compatibility.** On OLED panels, #000000 turns pixels fully off. Scrolling or transitioning between #000000 and any non-black color causes visible "black smear" artifacts on many devices. #0D0D0D keeps pixels dimly lit, avoiding this rendering issue while remaining visually indistinguishable from black in ambient lighting.

4. **Design system consistency.** The four-tier surface system requires perceptible steps between layers. Starting from true black would compress the available range: the gap between #000000 and #1A1A1A (10.2%) is harder to perceive than the gap between #0D0D0D (5.1%) and #1A1A1A (10.2%), because human vision responds logarithmically to luminance differences.

---

## Surface Layer Lightness Progression

The background tiers follow a deliberate lightness curve:

```
Base     #0D0D0D    5.1%   |=
Surface  #1A1A1A   10.2%   |==
Elevated #262626   14.9%   |===
Overlay  #333333   20.0%   |====
```

The progression is **roughly linear in percentage points** (~5% steps), but this produces a **perceptually even** spacing because at these low lightness values, human vision requires larger absolute steps to perceive differences.

### How to choose a surface tier

| Layer | Tier | Example |
|-------|------|---------|
| Page canvas | Base (#0D0D0D) | `<body>`, full-bleed background |
| Content panels | Surface (#1A1A1A) | Order book panel, chart container, position table |
| Floating elements | Elevated (#262626) | Dropdowns, popovers, autocomplete menus, tooltips |
| Stacked overlays | Overlay (#333333) | Modal dialogs, command palette, full-screen overlays |

Each tier is one step above its parent in the visual hierarchy. Never skip tiers (e.g., do not place Overlay directly on Base without an intermediate Surface) except for modal backdrops, which intentionally jump to the highest tier to establish a clear separation.

---

## Token File Reference

| File | Purpose |
|------|---------|
| `tokens.json` | Canonical token definitions. Single source of truth for all design values. |
| `variables.css` | CSS custom properties derived from tokens. All components bind to these. |
| `tailwind.theme.css` | Tailwind v4 theme that maps CSS vars into utility classes (`bg-bg-base`, `text-text-primary`, etc.). |

When adding or modifying a color, update `tokens.json` first, then propagate to `variables.css` and `tailwind.theme.css`. Never add a color directly to a component stylesheet.
