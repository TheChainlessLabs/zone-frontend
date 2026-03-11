# Omega Markets Typography

Typography system for the Omega Markets decentralized darkpool FX trading platform. Every text element in the interface draws from a 9-level type scale built on two carefully paired Google Fonts.

> **No pure white (#FFFFFF) anywhere.** The brightest text color in the system is `#F5F5F5`. This is intentional -- pure white on dark backgrounds causes excessive contrast and eye fatigue during extended trading sessions.

---

## Font Pairing

### Space Grotesk (Display)

Geometric sans-serif with a clean, technical character. Used for all headings, UI labels, body copy, and navigation. Its even proportions and slightly squared terminals give the interface a precise, engineered feel without being cold.

- **Source:** [Google Fonts](https://fonts.google.com/specimen/Space+Grotesk)
- **Weights used:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Character set:** Full Latin, including currency symbols
- **CSS variable:** `--font-display`
- **Tailwind:** `font-display`

### JetBrains Mono (Mono)

Purpose-built programming typeface with true fixed-width characters. Used exclusively for financial data: prices, amounts, balances, wallet addresses, and numeric fields. Fixed-width digits prevent layout shift when values change in real time.

- **Source:** [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono)
- **Weights used:** 400 (Regular), 600 (SemiBold)
- **Character set:** Full Latin, box-drawing characters, programming ligatures
- **CSS variable:** `--font-mono`
- **Tailwind:** `font-mono`

### Why this pairing works

Both typefaces share geometric DNA -- open apertures, even stroke widths, and a technical aesthetic. Space Grotesk reads cleanly at all sizes for prose and navigation. JetBrains Mono locks numeric columns into alignment, critical for order books and position tables where the eye needs to compare values vertically. The contrast between proportional (Space Grotesk) and monospaced (JetBrains Mono) also creates a clear visual hierarchy: the moment you see monospaced text, you know it represents data.

---

## Loading Fonts

### HTML `<link>` tag (recommended)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### CSS `@import`

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
```

### Font stack fallbacks

```css
--font-display: 'Space Grotesk', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

---

## Type Scale

Nine levels, covering everything from hero headlines to order book entries.

### Display

The largest text in the system. Reserved for hero sections, landing pages, or dramatic single-stat displays (e.g., total platform volume).

| Property | Value |
|---|---|
| **CSS variable** | `--text-display` |
| **Tailwind class** | `text-display` |
| **Font size** | 64px |
| **Line height** | 70px |
| **Letter spacing** | -0.04em |
| **Font weight** | 700 (Bold) |
| **Font family** | Space Grotesk |

**Example text:** `Omega Markets`

**When to use:** Landing page headlines, marketing hero sections, single large statistics. Never in application UI.

---

### H1

Primary page-level heading. One per view, identifies the current screen.

| Property | Value |
|---|---|
| **CSS variable** | `--text-h1` |
| **Tailwind class** | `text-h1` |
| **Font size** | 32px |
| **Line height** | 38px |
| **Letter spacing** | -0.02em |
| **Font weight** | 700 (Bold) |
| **Font family** | Space Grotesk |

**Example text:** `Trading Dashboard`

**When to use:** Page titles, primary section headings in full-page layouts. One per view.

---

### H2

Section-level heading within a page. Groups related content.

| Property | Value |
|---|---|
| **CSS variable** | `--text-h2` |
| **Tailwind class** | `text-h2` |
| **Font size** | 24px |
| **Line height** | 30px |
| **Letter spacing** | -0.02em |
| **Font weight** | 600 (SemiBold) |
| **Font family** | Space Grotesk |

**Example text:** `Open Positions`

**When to use:** Section headers, card titles for major panels, modal titles.

---

### H3

Subsection heading or card title. The workhorse heading for dense interfaces.

| Property | Value |
|---|---|
| **CSS variable** | `--text-h3` |
| **Tailwind class** | `text-h3` |
| **Font size** | 18px |
| **Line height** | 22px |
| **Letter spacing** | 0 |
| **Font weight** | 500 (Medium) |
| **Font family** | Space Grotesk |

**Example text:** `Order Details`

**When to use:** Card headers, sidebar section titles, dialog subheadings, table group headers.

---

### Body

Default reading text. Used for descriptions, instructions, and general content.

| Property | Value |
|---|---|
| **CSS variable** | `--text-body` |
| **Tailwind class** | `text-body` |
| **Font size** | 16px |
| **Line height** | 24px (1.5x) |
| **Letter spacing** | 0 |
| **Font weight** | 400 (Regular) |
| **Font family** | Space Grotesk |

**Example text:** `Select a trading pair and enter the amount you want to trade.`

**When to use:** Paragraphs, descriptions, help text, tooltips, onboarding copy.

---

### Body Small

Compact body text for information-dense areas.

| Property | Value |
|---|---|
| **CSS variable** | `--text-body-sm` |
| **Tailwind class** | `text-body-sm` |
| **Font size** | 14px |
| **Line height** | 21px (1.5x) |
| **Letter spacing** | 0 |
| **Font weight** | 400 (Regular) |
| **Font family** | Space Grotesk |

**Example text:** `Last updated 3 seconds ago`

**When to use:** Secondary descriptions, table cell text, metadata, timestamps, form help text.

---

### Label

The smallest text in the system. Always uppercase with wide tracking for readability at small sizes.

| Property | Value |
|---|---|
| **CSS variable** | `--text-label` |
| **Tailwind class** | `text-label` |
| **Font size** | 11px |
| **Line height** | 14px |
| **Letter spacing** | 0.08em |
| **Font weight** | 500 (Medium) |
| **Font family** | Space Grotesk |
| **Text transform** | uppercase |

**Example text:** `AVAILABLE BALANCE`

**When to use:** Column headers, badge text, button text, form labels, status indicators, section labels. Always uppercase -- use the `text-label-uppercase` utility.

---

### Mono Large

Large monospaced numerals for primary financial figures.

| Property | Value |
|---|---|
| **CSS variable** | `--text-mono-lg` |
| **Tailwind class** | `text-mono-lg` |
| **Font size** | 28px |
| **Line height** | 34px |
| **Letter spacing** | 0 |
| **Font weight** | 600 (SemiBold) |
| **Font family** | JetBrains Mono |

**Example text:** `1,234,567.89`

**When to use:** Portfolio value, large price displays, key financial metrics shown prominently.

---

### Mono Body

Standard monospaced text for inline financial data.

| Property | Value |
|---|---|
| **CSS variable** | `--text-mono` |
| **Tailwind class** | `text-mono` |
| **Font size** | 14px |
| **Line height** | 21px |
| **Letter spacing** | 0 |
| **Font weight** | 400 (Regular) |
| **Font family** | JetBrains Mono |

**Example text:** `0x3a4F...c29B`

**When to use:** Order book entries, table prices/amounts, wallet addresses, transaction hashes, any inline numeric data.

---

## Tailwind Utility Mapping

All type scale levels are available as Tailwind utilities. Each utility sets `font-size` and `line-height` together.

| Tailwind Class | Font Size | Line Height | Maps to CSS Variable |
|---|---|---|---|
| `text-display` | 64px | 70px | `--text-display` |
| `text-h1` | 32px | 38px | `--text-h1` |
| `text-h2` | 24px | 30px | `--text-h2` |
| `text-h3` | 18px | 22px | `--text-h3` |
| `text-body` | 16px | 24px | `--text-body` |
| `text-body-sm` | 14px | 21px | `--text-body-sm` |
| `text-label` | 11px | 14px | `--text-label` |
| `text-mono-lg` | 28px | 34px | `--text-mono-lg` |
| `text-mono` | 14px | 21px | `--text-mono` |

### Custom utility classes

These are defined in `tailwind.theme.css` under `@layer utilities`:

#### `.font-tabular`

Enables tabular numerals so digits occupy equal width. Prevents layout shift when numbers change.

```css
.font-tabular {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}
```

**Usage:** Apply alongside any mono text class. Required on all numeric data that updates in real time (prices, balances, countdowns).

#### `.text-label-uppercase`

Complete label preset: size, line-height, weight, tracking, and uppercase transform in one class.

```css
.text-label-uppercase {
  font-size: var(--text-label);               /* 11px */
  line-height: var(--text-label--line-height); /* 14px */
  font-weight: var(--text-label--font-weight); /* 500 */
  letter-spacing: var(--text-label--letter-spacing); /* 0.08em */
  text-transform: uppercase;
}
```

**Usage:** Column headers, badges, buttons, form labels. Preferred over manually combining `text-label` with `uppercase` and `tracking-widest`.

#### `.text-mono-price`

Mono font with tabular numerals for price displays. Does not set size -- combine with `text-mono` or `text-mono-lg`.

```css
.text-mono-price {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}
```

**Usage:** Any price or amount display. Combine with a size utility: `class="text-mono-price text-mono-lg"`.

---

## CSS Custom Properties Reference

All typography variables are defined in `variables.css` under `:root`. Each type level has a base variable (font size) plus companion variables for line-height, letter-spacing, and font-weight.

### Font families

```css
--font-display: 'Space Grotesk', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Full variable list

```css
/* Display */
--text-display: 64px;
--text-display--line-height: 70px;
--text-display--letter-spacing: -0.04em;
--text-display--font-weight: 700;

/* H1 */
--text-h1: 32px;
--text-h1--line-height: 38px;
--text-h1--letter-spacing: -0.02em;
--text-h1--font-weight: 700;

/* H2 */
--text-h2: 24px;
--text-h2--line-height: 30px;
--text-h2--letter-spacing: -0.02em;
--text-h2--font-weight: 600;

/* H3 */
--text-h3: 18px;
--text-h3--line-height: 22px;
--text-h3--letter-spacing: 0;
--text-h3--font-weight: 500;

/* Body */
--text-body: 16px;
--text-body--line-height: 24px;
--text-body--letter-spacing: 0;
--text-body--font-weight: 400;

/* Body Small */
--text-body-sm: 14px;
--text-body-sm--line-height: 21px;
--text-body-sm--letter-spacing: 0;
--text-body-sm--font-weight: 400;

/* Label */
--text-label: 11px;
--text-label--line-height: 14px;
--text-label--letter-spacing: 0.08em;
--text-label--font-weight: 500;

/* Mono Large */
--text-mono-lg: 28px;
--text-mono-lg--line-height: 34px;
--text-mono-lg--font-weight: 600;

/* Mono Body */
--text-mono: 14px;
--text-mono--line-height: 21px;
--text-mono--font-weight: 400;
```

---

## JetBrains Mono Rules

JetBrains Mono is the exclusive typeface for financial and numeric data. Follow these rules without exception:

### Always use tabular numerals

Every instance of JetBrains Mono must include `font-variant-numeric: tabular-nums`. This ensures digits are fixed-width, preventing layout shift when values update. Use the `.font-tabular` utility or `.text-mono-price` utility which includes it automatically.

```html
<!-- Correct -->
<span class="font-mono text-mono font-tabular">1,234.56</span>
<span class="text-mono-price text-mono-lg">1,234.56</span>

<!-- Wrong: missing tabular-nums -->
<span class="font-mono text-mono">1,234.56</span>
```

### Always use for prices, amounts, and addresses

Any text that represents a numeric value or blockchain identifier must use JetBrains Mono:

- **Prices:** `$1,234.56`, `0.00045 ETH`
- **Amounts:** `1,000,000 USDC`
- **Balances:** `Available: 5,432.10`
- **Addresses:** `0x3a4F...c29B`
- **Transaction hashes:** `0xabc123...`
- **Percentages in data context:** `+2.45%`, `-0.12%`

### Color coding for positive/negative values

Numeric values that indicate profit/loss or directional change use semantic colors:

| State | Color | CSS Variable | Hex |
|---|---|---|---|
| Positive / Gain | Green | `--color-success` | `#22C55E` |
| Negative / Loss | Red | `--color-error` | `#EF4444` |
| Neutral | Secondary text | `--color-text-secondary` | `#A0A0A0` |

```html
<!-- Positive -->
<span class="text-mono-price text-mono text-success font-tabular">+2.45%</span>

<!-- Negative -->
<span class="text-mono-price text-mono text-error font-tabular">-1.23%</span>

<!-- Neutral -->
<span class="text-mono-price text-mono text-text-secondary font-tabular">0.00%</span>
```

---

## Label Text Rules

Label text has strict formatting rules to ensure readability at 11px.

### Always uppercase

Labels are always rendered in uppercase. The wide letter-spacing (0.08em) and medium weight (500) compensate for the small size, giving uppercase characters enough breathing room to remain legible.

```html
<!-- Correct -->
<span class="text-label-uppercase">AVAILABLE BALANCE</span>

<!-- Wrong: lowercase label -->
<span class="text-label">available balance</span>
```

### Required properties

Every label must include all of these:

- `font-size: 11px`
- `line-height: 14px`
- `font-weight: 500`
- `letter-spacing: 0.08em`
- `text-transform: uppercase`

The `.text-label-uppercase` utility applies all of these in one class. Prefer it over manual composition.

### Where labels appear

- Table column headers
- Form field labels
- Badge text
- Button text
- Sidebar section titles
- Status indicators (LIVE, PENDING, FILLED)
- Metric labels above large numbers

---

## Color and Contrast

Typography colors are carefully calibrated for a dark interface. The goal is comfortable readability during long trading sessions, not maximum contrast.

### Text color hierarchy

| Role | Color | Hex | CSS Variable | Usage |
|---|---|---|---|---|
| **Primary** | Near-white | `#F5F5F5` | `--color-text-primary` | Headlines (H1, H2, H3), primary content, important values |
| **Secondary** | Medium gray | `#A0A0A0` | `--color-text-secondary` | Body text, descriptions, secondary information |
| **Muted** | Dark gray | `#666666` | `--color-text-muted` | Labels, captions, disabled states, tertiary info |
| **Inverse** | Near-black | `#0D0D0D` | `--color-text-inverse` | Text on light/accent backgrounds (buttons, badges) |

### Contrast rationale

**Body text uses `#A0A0A0` (secondary), not `#F5F5F5` (primary).**

On the `#0D0D0D` base background, `#F5F5F5` produces a contrast ratio of approximately 18.1:1 -- well beyond WCAG AAA requirements (7:1) and harsh on the eyes over extended periods. `#A0A0A0` at approximately 9.3:1 still exceeds AAA for normal text while being significantly easier to read for hours at a time.

**Headlines use `#F5F5F5` (primary).**

Headings are scanned, not read at length. Higher contrast helps them stand out in the visual hierarchy and aids quick navigation. The brief reading duration means fatigue is not a concern.

**Labels use `#666666` (muted).**

At 11px, `#666666` on `#0D0D0D` produces a contrast ratio of approximately 5.1:1. For normal lowercase text this would not pass WCAG AA (4.5:1 required). However, labels in this system are always:

1. **Uppercase** -- adding visual weight through larger apparent size
2. **Medium weight (500)** -- thicker strokes than regular weight
3. **Wide tracking (0.08em)** -- improved character differentiation

These factors give uppercase labels effective legibility comparable to larger text. The combination passes WCAG AA requirements for large text (3:1), and the visual weight of uppercase 500-weight text at 0.08em tracking behaves perceptually closer to 14px normal text.

### Rules

- Never use `#FFFFFF` or `#FFF` for any text. The brightest allowed value is `#F5F5F5`.
- Body paragraphs and descriptions: always `--color-text-secondary` (`#A0A0A0`).
- Headlines and primary UI elements: `--color-text-primary` (`#F5F5F5`).
- Labels and tertiary information: `--color-text-muted` (`#666666`).
- Positive values: `--color-success` (`#22C55E`).
- Negative values: `--color-error` (`#EF4444`).
- Neutral numeric values: `--color-text-secondary` (`#A0A0A0`).

---

## Quick Reference

### Headings

```html
<h1 class="text-h1 font-bold text-text-primary">Page Title</h1>
<h2 class="text-h2 font-semibold text-text-primary">Section Title</h2>
<h3 class="text-h3 font-medium text-text-primary">Card Title</h3>
```

### Body text

```html
<p class="text-body text-text-secondary">Main paragraph text.</p>
<p class="text-body-sm text-text-secondary">Smaller descriptive text.</p>
```

### Labels

```html
<span class="text-label-uppercase text-text-muted">Column Header</span>
```

### Prices and amounts

```html
<!-- Large price display -->
<span class="text-mono-price text-mono-lg font-semibold text-text-primary">
  $1,234,567.89
</span>

<!-- Inline price in a table -->
<td class="text-mono-price text-mono font-tabular text-text-secondary">
  0.00045
</td>

<!-- Positive change -->
<span class="text-mono-price text-mono font-tabular text-success">
  +2.45%
</span>

<!-- Negative change -->
<span class="text-mono-price text-mono font-tabular text-error">
  -1.23%
</span>
```

### Wallet addresses

```html
<code class="font-mono text-mono font-tabular text-text-muted">
  0x3a4F8B2c...91d7c29B
</code>
```

---

## Related Files

- **`variables.css`** -- CSS custom properties (runtime source of truth)
- **`tailwind.theme.css`** -- Tailwind v4 theme mapping and custom utilities
- **`tokens.json`** -- Design tokens in JSON format (for tooling and code generation)
