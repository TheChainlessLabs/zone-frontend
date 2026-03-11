# Omega Markets Design System -- Component Specifications

Version 2.0.0 | Dark-first trading UI for decentralized darkpool FX

---

## Token Quick Reference

All components reference CSS custom properties defined in `variables.css`. Tailwind utility classes map 1:1 via `tailwind.theme.css`. The canonical source of truth is `tokens.json`.

| Category    | Token                          | Value                              |
|-------------|--------------------------------|------------------------------------|
| Height      | `--height-sm`                  | 32px                               |
| Height      | `--height-md`                  | 40px                               |
| Height      | `--height-lg`                  | 48px                               |
| Radius      | `--radius-sm`                  | 4px                                |
| Radius      | `--radius-md`                  | 8px                                |
| Radius      | `--radius-lg`                  | 12px                               |
| Radius      | `--radius-full`                | 9999px                             |
| Duration    | `--duration-fast`              | 100ms                              |
| Duration    | `--duration-normal`            | 150ms                              |
| Duration    | `--duration-slow`              | 300ms                              |
| Easing      | `--easing-default`             | cubic-bezier(0.4, 0, 0.2, 1)      |
| Focus Ring  | `--shadow-focus-ring`          | 0 0 0 3px #4A8BC726                |
| Focus Bdr   | `--color-border-focus`         | #4A8BC7                            |
| Font UI     | `--font-display`               | 'Space Grotesk', system-ui, sans-serif |
| Font Mono   | `--font-mono`                  | 'JetBrains Mono', 'Fira Code', monospace |
| Bg Base     | `--color-bg-base`              | #0D0D0D                            |
| Bg Surface  | `--color-bg-surface`           | #1A1A1A                            |
| Bg Elevated | `--color-bg-elevated`          | #262626                            |
| Bg Overlay  | `--color-bg-overlay`           | #333333                            |
| Border      | `--color-border`               | #333333                            |
| Text 1      | `--color-text-primary`         | #F5F5F5                            |
| Text 2      | `--color-text-secondary`       | #A0A0A0                            |
| Text 3      | `--color-text-muted`           | #666666                            |
| Accent      | `--color-accent`               | #3467A1                            |
| Success     | `--color-success`              | #22C55E                            |
| Error       | `--color-error`                | #EF4444                            |
| Warning     | `--color-warning`              | #F59E0B                            |

> IMPORTANT: No pure white (#FFFFFF) is used anywhere in the system. The lightest value is #F5F5F5 (`--color-text-primary`).

---

## 1. Button

**Description:** Primary interactive control for form submissions, confirmations, and trade actions. Six visual variants at three sizes cover the full range of trade-specific and general-purpose actions.

### 1.1 Variants

| Variant         | Purpose                        | Bg (default)           | Text Color                | Border               |
|-----------------|--------------------------------|------------------------|---------------------------|-----------------------|
| Primary         | Default CTA                    | `--color-accent`       | `--color-text-primary`    | none                  |
| Success / Buy   | Buy-side trade actions         | `--color-success`      | `--color-text-primary`    | none                  |
| Error / Sell    | Sell-side trade actions         | `--color-error`        | `--color-text-primary`    | none                  |
| Outline         | Secondary actions              | transparent            | `--color-text-primary`    | 1px solid `--color-border` |
| Ghost           | Tertiary / inline actions      | transparent            | `--color-text-secondary`  | none                  |
| Accent          | Steel Blue branded actions     | `--color-accent`       | `--color-text-primary`    | none                  |

### 1.2 Sizes

| Size | Height | Padding Inline | Font Size | Line Height | Token              |
|------|--------|----------------|-----------|-------------|--------------------|
| sm   | 32px   | 12px           | 11px      | 14px        | `--height-sm`      |
| md   | 40px   | 20px           | 14px      | 21px        | `--height-md`      |
| lg   | 48px   | 24px           | 14px      | 21px        | `--height-lg`      |

Default (Paper-derived): height=44px, border-radius=8px (`--radius-md`), padding-inline=24px, font-size=14px, font-weight=600, letter-spacing=0.08em, text-transform=uppercase.

### 1.3 Shared Properties (all variants)

```
font-family:      var(--font-display)
font-weight:      600
letter-spacing:   0.08em
text-transform:   uppercase
border-radius:    var(--radius-md)          /* 8px */
cursor:           pointer
transition:       background-color var(--duration-normal) var(--easing-default),
                  box-shadow var(--duration-normal) var(--easing-default),
                  border-color var(--duration-normal) var(--easing-default)
```

### 1.4 State Matrix

#### Primary

| Property     | Default              | Hover                      | Active                     | Focus                                                        | Disabled                 | Loading                  |
|--------------|----------------------|----------------------------|----------------------------|--------------------------------------------------------------|--------------------------|--------------------------|
| background   | `--color-accent`     | `--color-accent-hover`     | `--color-accent-active`    | `--color-accent`                                             | `--color-accent`         | `--color-accent`         |
| color        | `--color-text-primary` | `--color-text-primary`   | `--color-text-primary`     | `--color-text-primary`                                       | `--color-text-primary`   | `--color-text-primary`   |
| border       | none                 | none                       | none                       | none                                                         | none                     | none                     |
| box-shadow   | none                 | none                       | none                       | `--shadow-focus-ring`                                        | none                     | none                     |
| border-color | --                   | --                         | --                         | `--color-border-focus`                                       | --                       | --                       |
| opacity      | 1                    | 1                          | 1                          | 1                                                            | 0.4                      | 0.7                      |
| pointer      | pointer              | pointer                    | pointer                    | pointer                                                      | none                     | none                     |
| content      | label text           | label text                 | label text                 | label text                                                   | label text               | spinner replaces text    |

#### Success / Buy

| Property     | Default              | Hover                        | Active                       | Focus                    | Disabled              | Loading               |
|--------------|----------------------|------------------------------|------------------------------|--------------------------|-----------------------|-----------------------|
| background   | `--color-success`    | `--color-success-hover`      | `--color-success-active`     | `--color-success`        | `--color-success`     | `--color-success`     |
| color        | `--color-text-primary` | `--color-text-primary`     | `--color-text-primary`       | `--color-text-primary`   | `--color-text-primary`| `--color-text-primary`|
| border       | none                 | none                         | none                         | none                     | none                  | none                  |
| box-shadow   | none                 | none                         | none                         | `--shadow-focus-ring`    | none                  | none                  |
| opacity      | 1                    | 1                            | 1                            | 1                        | 0.4                   | 0.7                   |

#### Error / Sell

| Property     | Default              | Hover                      | Active                     | Focus                    | Disabled              | Loading               |
|--------------|----------------------|----------------------------|----------------------------|--------------------------|-----------------------|-----------------------|
| background   | `--color-error`      | `--color-error-hover`      | `--color-error-active`     | `--color-error`          | `--color-error`       | `--color-error`       |
| color        | `--color-text-primary` | `--color-text-primary`   | `--color-text-primary`     | `--color-text-primary`   | `--color-text-primary`| `--color-text-primary`|
| border       | none                 | none                       | none                       | none                     | none                  | none                  |
| box-shadow   | none                 | none                       | none                       | `--shadow-focus-ring`    | none                  | none                  |
| opacity      | 1                    | 1                          | 1                          | 1                        | 0.4                   | 0.7                   |

#### Outline

| Property     | Default              | Hover                      | Active                     | Focus                    | Disabled              | Loading               |
|--------------|----------------------|----------------------------|----------------------------|--------------------------|-----------------------|-----------------------|
| background   | transparent          | `--color-bg-elevated`      | `--color-bg-surface`       | transparent              | transparent           | transparent           |
| color        | `--color-text-primary` | `--color-text-primary`   | `--color-text-primary`     | `--color-text-primary`   | `--color-text-primary`| `--color-text-primary`|
| border       | 1px solid `--color-border` | 1px solid `--color-border` | 1px solid `--color-border` | 1px solid `--color-border-focus` | 1px solid `--color-border` | 1px solid `--color-border` |
| box-shadow   | none                 | none                       | none                       | `--shadow-focus-ring`    | none                  | none                  |
| opacity      | 1                    | 1                          | 1                          | 1                        | 0.4                   | 0.7                   |

#### Ghost

| Property     | Default              | Hover                      | Active                     | Focus                    | Disabled              | Loading               |
|--------------|----------------------|----------------------------|----------------------------|--------------------------|-----------------------|-----------------------|
| background   | transparent          | `--color-bg-surface`       | `--color-bg-base`          | transparent              | transparent           | transparent           |
| color        | `--color-text-secondary` | `--color-text-primary`  | `--color-text-primary`     | `--color-text-secondary` | `--color-text-secondary` | `--color-text-secondary` |
| border       | none                 | none                       | none                       | none                     | none                  | none                  |
| box-shadow   | none                 | none                       | none                       | `--shadow-focus-ring`    | none                  | none                  |
| opacity      | 1                    | 1                          | 1                          | 1                        | 0.4                   | 0.7                   |

#### Accent

| Property     | Default              | Hover                      | Active                     | Focus                    | Disabled              | Loading               |
|--------------|----------------------|----------------------------|----------------------------|--------------------------|-----------------------|-----------------------|
| background   | `--color-accent`     | `--color-accent-hover`     | `--color-accent-active`    | `--color-accent`         | `--color-accent`      | `--color-accent`      |
| color        | `--color-text-primary` | `--color-text-primary`   | `--color-text-primary`     | `--color-text-primary`   | `--color-text-primary`| `--color-text-primary`|
| border       | none                 | none                       | none                       | none                     | none                  | none                  |
| box-shadow   | none                 | none                       | none                       | `--shadow-focus-ring`    | none                  | none                  |
| opacity      | 1                    | 1                          | 1                          | 1                        | 0.4                   | 0.7                   |

> Contrast note: Accent variant #F5F5F5 on #3467A1 = 5.35:1 contrast ratio (WCAG AA PASS).

### 1.5 Token References (CSS Custom Properties)

```css
.omega-btn {
  height:           var(--height-md);         /* 40px; sm=32px, lg=48px */
  padding-inline:   20px;                     /* sm=12px, lg=24px */
  border-radius:    var(--radius-md);
  font-family:      var(--font-display);
  font-size:        var(--text-body-sm);      /* 14px; sm=11px */
  font-weight:      600;
  letter-spacing:   0.08em;
  text-transform:   uppercase;
  transition:       background-color var(--duration-normal) var(--easing-default),
                    box-shadow var(--duration-normal) var(--easing-default);
}
.omega-btn:focus-visible {
  box-shadow:       var(--shadow-focus-ring);
  border-color:     var(--color-border-focus);
  outline:          none;
}
.omega-btn:disabled {
  opacity:          0.4;
  pointer-events:   none;
}
.omega-btn--loading {
  opacity:          0.7;
  pointer-events:   none;
}
```

### 1.6 Tailwind Class Examples

```html
<!-- Primary md -->
<button class="h-10 px-5 rounded-md bg-accent text-text-primary font-display text-body-sm font-semibold tracking-[0.08em] uppercase transition-normal hover:bg-accent-hover active:bg-accent-active focus-visible:ring-focus disabled:opacity-40 disabled:pointer-events-none">
  SUBMIT
</button>

<!-- Success / Buy lg -->
<button class="h-12 px-6 rounded-md bg-success text-text-primary font-display text-body-sm font-semibold tracking-[0.08em] uppercase transition-normal hover:bg-success-hover active:bg-success-active focus-visible:ring-focus disabled:opacity-40 disabled:pointer-events-none">
  BUY
</button>

<!-- Error / Sell md -->
<button class="h-10 px-5 rounded-md bg-error text-text-primary font-display text-body-sm font-semibold tracking-[0.08em] uppercase transition-normal hover:bg-error-hover active:bg-error-active focus-visible:ring-focus disabled:opacity-40 disabled:pointer-events-none">
  SELL
</button>

<!-- Outline md -->
<button class="h-10 px-5 rounded-md bg-transparent text-text-primary border border-border font-display text-body-sm font-semibold tracking-[0.08em] uppercase transition-normal hover:bg-bg-elevated focus-visible:ring-focus disabled:opacity-40 disabled:pointer-events-none">
  CANCEL
</button>

<!-- Ghost sm -->
<button class="h-8 px-3 rounded-md bg-transparent text-text-secondary font-display text-label font-semibold tracking-[0.08em] uppercase transition-normal hover:bg-bg-surface hover:text-text-primary focus-visible:ring-focus disabled:opacity-40 disabled:pointer-events-none">
  MORE
</button>
```

### 1.7 Accessibility

| Requirement              | Implementation                                                                 |
|--------------------------|--------------------------------------------------------------------------------|
| Role                     | Native `<button>` element; no `role` override needed                           |
| Keyboard                 | `Enter` and `Space` activate; `Tab` for focus navigation                       |
| Focus indicator          | `focus-visible` ring (3px `--color-border-focus-ring`); never suppress outline  |
| Disabled state           | Use `disabled` attribute (not `aria-disabled`) to remove from tab order        |
| Loading state            | Add `aria-busy="true"`, `aria-live="polite"` on wrapper; hide spinner from AT via `aria-hidden="true"` |
| Contrast (Primary)       | #F5F5F5 on #3467A1 = 5.35:1 (AA PASS)                                         |
| Contrast (Success)       | #F5F5F5 on #22C55E = 3.15:1 (AA Large PASS, see note)                         |
| Contrast (Error)         | #F5F5F5 on #EF4444 = 3.94:1 (AA Large PASS, see note)                         |
| Contrast note            | Success and Error buttons use bold uppercase 14px text qualifying as "large text" under WCAG. Font-weight 600 + uppercase + 14px meets the threshold. |
| Icon-only buttons        | Must include `aria-label` describing the action                                |

---

## 2. Input

**Description:** Text entry field for forms and trade parameters. Supports plain text and numeric variants. Numeric mode switches to JetBrains Mono with tabular figures for aligned columnar data.

### 2.1 Variants

| Variant  | Font Family            | Features               | Use Case                  |
|----------|------------------------|------------------------|---------------------------|
| Text     | `--font-display`       | --                     | Names, labels, search     |
| Numeric  | `--font-mono`          | `tabular-nums`         | Prices, amounts, totals   |

### 2.2 Sizes

| Size | Height | Padding Inline | Font Size | Token         |
|------|--------|----------------|-----------|---------------|
| sm   | 32px   | 12px           | 14px      | `--height-sm` |
| md   | 40px   | 16px           | 14px      | `--height-md` |
| lg   | 48px   | 16px           | 14px      | `--height-lg` |

Default (Paper-derived): height=44px, border-radius=8px, padding-inline=16px, font-size=14px, font-weight=400.

### 2.3 Shared Properties

```
background:       var(--color-bg-base)       /* #0D0D0D */
border:           1px solid var(--color-border)
border-radius:    var(--radius-md)           /* 8px */
font-size:        var(--text-body-sm)        /* 14px */
font-weight:      var(--text-body-sm--font-weight)  /* 400 */
color:            var(--color-text-primary)  /* #F5F5F5 */
caret-color:      var(--color-accent-muted)  /* #4A8BC7 */
transition:       border-color var(--duration-normal) var(--easing-default),
                  box-shadow var(--duration-normal) var(--easing-default)
```

### 2.4 State Matrix

| Property       | Default                        | Focus                                      | Error                                      | Disabled                    |
|----------------|--------------------------------|--------------------------------------------|--------------------------------------------|-----------------------------|
| background     | `--color-bg-base`              | `--color-bg-base`                          | `--color-bg-base`                          | `--color-bg-base`           |
| border-color   | `--color-border`               | `--color-border-focus`                     | `--color-error`                            | `--color-border`            |
| box-shadow     | none                           | `--shadow-focus-ring` (0 0 0 3px #4A8BC726)| 0 0 0 3px #EF44441F                        | none                        |
| color          | `--color-text-primary`         | `--color-text-primary`                     | `--color-text-primary`                     | `--color-text-primary`      |
| placeholder    | `--color-text-muted`           | `--color-text-muted`                       | `--color-text-muted`                       | `--color-text-muted`        |
| opacity        | 1                              | 1                                          | 1                                          | 0.4                         |
| pointer        | text                           | text                                       | text                                       | not-allowed                 |

### 2.5 Suffix Slot

A right-aligned inline label inside the input (e.g., "EUR", "USD", "Midpoint").

```
position:         absolute; right: 16px; top: 50%; transform: translateY(-50%)
font-size:        var(--text-body-sm)   /* 14px */
color:            var(--color-text-muted)  /* #666666 */
pointer-events:   none
```

When a suffix is present, the input's `padding-right` must be increased to prevent text overlap. Recommended: `padding-right: 60px` (adjust per suffix width).

### 2.6 Token References (CSS Custom Properties)

```css
.omega-input {
  height:           var(--height-md);
  padding-inline:   var(--space-4);          /* 16px */
  background:       var(--color-bg-base);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius-md);
  font-family:      var(--font-display);
  font-size:        var(--text-body-sm);
  line-height:      var(--text-body-sm--line-height);
  font-weight:      var(--text-body-sm--font-weight);
  color:            var(--color-text-primary);
  transition:       border-color var(--duration-normal) var(--easing-default),
                    box-shadow var(--duration-normal) var(--easing-default);
}
.omega-input::placeholder {
  color:            var(--color-text-muted);
}
.omega-input:focus {
  outline:          none;
  border-color:     var(--color-border-focus);
  box-shadow:       var(--shadow-focus-ring);
}
.omega-input--error {
  border-color:     var(--color-error);
  box-shadow:       0 0 0 3px #EF44441F;
}
.omega-input--numeric {
  font-family:      var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}
.omega-input:disabled {
  opacity:          0.4;
  cursor:           not-allowed;
}
```

### 2.7 Tailwind Class Examples

```html
<!-- Text input md -->
<input
  type="text"
  class="h-10 px-4 bg-bg-base border border-border rounded-md font-display text-body-sm text-text-primary placeholder:text-text-muted transition-normal focus:border-border-focus focus:shadow-focus-ring focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
  placeholder="Enter value..."
/>

<!-- Numeric input md with suffix -->
<div class="relative">
  <input
    type="text"
    inputmode="decimal"
    class="h-10 pl-4 pr-15 bg-bg-base border border-border rounded-md font-mono text-body-sm text-text-primary font-tabular placeholder:text-text-muted transition-normal focus:border-border-focus focus:shadow-focus-ring focus:outline-none"
    placeholder="0.00"
  />
  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-text-muted pointer-events-none">
    EUR
  </span>
</div>

<!-- Error state -->
<input
  type="text"
  class="h-10 px-4 bg-bg-base border border-error rounded-md font-display text-body-sm text-text-primary shadow-[0_0_0_3px_#EF44441F] focus:outline-none"
  aria-invalid="true"
/>
```

### 2.8 Accessibility

| Requirement              | Implementation                                                                 |
|--------------------------|--------------------------------------------------------------------------------|
| Role                     | Native `<input>` element                                                       |
| Label                    | Always pair with `<label>` via `for`/`id`; or use `aria-label`                 |
| Error state              | Set `aria-invalid="true"`; associate error message via `aria-describedby`       |
| Numeric input            | Use `inputmode="decimal"` (not `type="number"`) to avoid spin button issues    |
| Suffix                   | Suffix text is decorative; use `aria-hidden="true"` on suffix span. Include unit in `aria-label` (e.g., `aria-label="Amount in EUR"`) |
| Disabled                 | Use `disabled` attribute                                                       |
| Keyboard                 | Standard text input behavior; `Tab` to enter/exit                              |
| Contrast                 | Placeholder #666666 on #0D0D0D = 3.75:1 (AA for non-essential text); Input text #F5F5F5 on #0D0D0D = 18.06:1 (AAA PASS) |

---

## 3. Card

**Description:** Static container for grouping related content. Used as the structural shell for order books, position tables, charts, and forms. Cards are not interactive -- they serve as layout primitives.

### 3.1 Variants

| Variant   | Background             | Border                         | Shadow                           |
|-----------|------------------------|--------------------------------|----------------------------------|
| Surface   | `--color-bg-surface`   | 1px solid `--color-border`     | none                             |
| Elevated  | `--color-bg-elevated`  | none                           | `--shadow-md` (0 4px 12px rgba(0,0,0,0.4)) |

### 3.2 Shared Properties

```
border-radius:    var(--radius-lg)           /* 12px */
padding:          var(--space-6)             /* 24px */
```

### 3.3 Slots

| Slot    | Typography                                                  | Notes                                           |
|---------|------------------------------------------------------------|-------------------------------------------------|
| Header  | `--text-h3` (18px, weight 500, line-height 22px)           | Optional. Top of card, no extra padding needed. |
| Content | Inherits body styles                                        | Main content area. Flex column layout.          |
| Footer  | Inherits body styles                                        | Optional. Separated by `border-top: 1px solid var(--color-border)` with `padding-top: var(--space-4)` (16px) and `margin-top: var(--space-4)`. |

### 3.4 State Matrix

Cards have no interactive states. They are layout containers only.

| Property     | Default (Surface)              | Default (Elevated)              |
|--------------|--------------------------------|---------------------------------|
| background   | `--color-bg-surface`           | `--color-bg-elevated`           |
| border       | 1px solid `--color-border`     | none                            |
| box-shadow   | none                           | `--shadow-md`                   |
| border-radius| `--radius-lg`                  | `--radius-lg`                   |
| padding      | `--space-6`                    | `--space-6`                     |

### 3.5 Token References (CSS Custom Properties)

```css
.omega-card {
  border-radius:    var(--radius-lg);
  padding:          var(--space-6);
}
.omega-card--surface {
  background:       var(--color-bg-surface);
  border:           1px solid var(--color-border);
}
.omega-card--elevated {
  background:       var(--color-bg-elevated);
  box-shadow:       var(--shadow-md);
}
.omega-card__header {
  font-size:        var(--text-h3);
  line-height:      var(--text-h3--line-height);
  font-weight:      var(--text-h3--font-weight);
  color:            var(--color-text-primary);
  margin-bottom:    var(--space-4);
}
.omega-card__footer {
  border-top:       1px solid var(--color-border);
  padding-top:      var(--space-4);
  margin-top:       var(--space-4);
}
```

### 3.6 Tailwind Class Examples

```html
<!-- Surface card -->
<div class="bg-bg-surface border border-border rounded-lg p-6">
  <h3 class="text-h3 leading-[22px] font-medium text-text-primary mb-4">
    Card Title
  </h3>
  <div>
    <!-- content -->
  </div>
  <div class="border-t border-border pt-4 mt-4">
    <!-- footer -->
  </div>
</div>

<!-- Elevated card -->
<div class="bg-bg-elevated rounded-lg p-6 shadow-md">
  <h3 class="text-h3 leading-[22px] font-medium text-text-primary mb-4">
    Card Title
  </h3>
  <div>
    <!-- content -->
  </div>
</div>
```

### 3.7 Accessibility

| Requirement              | Implementation                                                                 |
|--------------------------|--------------------------------------------------------------------------------|
| Role                     | No ARIA role required for generic containers; use `role="region"` with `aria-label` only if the card represents a distinct landmark |
| Heading                  | Card header should use semantic heading tag (`<h2>`, `<h3>`) appropriate to document outline |
| Focus                    | Cards are not focusable. If a card links somewhere, wrap content in `<a>` or use `role="link"` |
| Color contrast           | #F5F5F5 text on #1A1A1A = 14.76:1 (AAA PASS); #F5F5F5 on #262626 = 12.04:1 (AAA PASS) |

---

## 4. Table

**Description:** Data-dense tabular layout for order books, positions, trade history, and portfolio data. Optimized for scanability with monospaced numeric columns and directional color coding.

### 4.1 Anatomy

| Part         | Element    | Background         | Text Style                                                   |
|--------------|------------|--------------------|------------------------------------------------------------- |
| Header Row   | `<thead>`  | `--color-bg-surface` | Label style: 11px, uppercase, weight 500, #666666, tracking 0.08em |
| Body Row     | `<tr>`     | transparent        | body-sm: 14px, weight 400, #F5F5F5                           |
| Body Row Hover | `<tr>:hover` | `--color-bg-surface` | (text unchanged)                                          |

### 4.2 Cell Specifications

| Cell Type    | Font Family      | Alignment  | Color                          | Features         |
|--------------|------------------|------------|--------------------------------|------------------|
| Text         | `--font-display` | left       | `--color-text-primary`         | --               |
| Numeric      | `--font-mono`    | right      | `--color-text-primary`         | `tabular-nums`   |
| Bid Price    | `--font-mono`    | right      | `--color-success` (#22C55E)    | `tabular-nums`   |
| Ask Price    | `--font-mono`    | right      | `--color-error` (#EF4444)      | `tabular-nums`   |
| Label/Header | `--font-display` | left       | `--color-text-muted` (#666666) | uppercase        |

### 4.3 Row Dimensions

```
row-height:       36px
padding-inline:   var(--space-4)             /* 16px */
border-bottom:    1px solid var(--color-border-subtle)  /* #1A1A1A */
```

### 4.4 State Matrix

| Property       | Default              | Hover                        | Selected (optional)          |
|----------------|----------------------|------------------------------|------------------------------|
| background     | transparent          | `--color-bg-surface`         | `--color-accent-subtle`      |
| border-bottom  | 1px solid `--color-border-subtle` | 1px solid `--color-border-subtle` | 1px solid `--color-border-subtle` |
| text color     | `--color-text-primary` | `--color-text-primary`     | `--color-text-primary`       |
| cursor         | default              | pointer (if interactive)     | pointer                      |
| transition     | --                   | background var(--duration-fast) var(--easing-default) | -- |

### 4.5 Sticky Header

```css
.omega-table thead {
  position:         sticky;
  top:              0;
  z-index:          10;
  background:       var(--color-bg-surface);
}
```

### 4.6 Token References (CSS Custom Properties)

```css
.omega-table {
  width:            100%;
  border-collapse:  collapse;
  font-family:      var(--font-display);
}
.omega-table th {
  height:           36px;
  padding-inline:   var(--space-4);
  background:       var(--color-bg-surface);
  font-size:        var(--text-label);
  line-height:      var(--text-label--line-height);
  font-weight:      var(--text-label--font-weight);
  letter-spacing:   var(--text-label--letter-spacing);
  text-transform:   uppercase;
  color:            var(--color-text-muted);
  text-align:       left;
}
.omega-table td {
  height:           36px;
  padding-inline:   var(--space-4);
  font-size:        var(--text-body-sm);
  line-height:      var(--text-body-sm--line-height);
  color:            var(--color-text-primary);
  border-bottom:    1px solid var(--color-border-subtle);
}
.omega-table tr:hover td {
  background:       var(--color-bg-surface);
}
.omega-table td.numeric {
  font-family:      var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
  text-align:       right;
}
.omega-table td.bid {
  color:            var(--color-success);
}
.omega-table td.ask {
  color:            var(--color-error);
}
```

### 4.7 Tailwind Class Examples

```html
<div class="overflow-auto">
  <table class="w-full border-collapse font-display">
    <thead class="sticky top-0 z-10 bg-bg-surface">
      <tr>
        <th class="h-9 px-4 text-left text-label-uppercase text-text-muted">Price</th>
        <th class="h-9 px-4 text-right text-label-uppercase text-text-muted">Size</th>
        <th class="h-9 px-4 text-right text-label-uppercase text-text-muted">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr class="hover:bg-bg-surface transition-fast">
        <td class="h-9 px-4 font-mono font-tabular text-right text-success">1.0842</td>
        <td class="h-9 px-4 font-mono font-tabular text-right text-text-primary">500,000</td>
        <td class="h-9 px-4 font-mono font-tabular text-right text-text-primary">1,250,000</td>
      </tr>
      <tr class="hover:bg-bg-surface transition-fast">
        <td class="h-9 px-4 font-mono font-tabular text-right text-error">1.0845</td>
        <td class="h-9 px-4 font-mono font-tabular text-right text-text-primary">750,000</td>
        <td class="h-9 px-4 font-mono font-tabular text-right text-text-primary">2,000,000</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 4.8 Accessibility

| Requirement              | Implementation                                                                 |
|--------------------------|--------------------------------------------------------------------------------|
| Role                     | Use native `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` elements            |
| Caption                  | Include `<caption class="sr-only">` describing the table purpose               |
| Scope                    | Add `scope="col"` to `<th>` elements                                           |
| Sort indication          | Use `aria-sort="ascending"` / `"descending"` / `"none"` on sortable `<th>`     |
| Keyboard (if interactive)| Arrow keys for row navigation; `Enter` to select a row                         |
| Color semantics          | Do not rely on color alone for bid/ask. Include a text label or column header that clarifies direction |
| Contrast                 | #666666 header text on #1A1A1A bg = 2.64:1 (acceptable for labels per WCAG 1.4.3 exception for incidental text). Header text is supplementary; column position conveys primary meaning. |

---

## 5. Modal

**Description:** Overlay dialog for confirmations, settings, and focused workflows. Blocks interaction with the underlying page and captures focus.

### 5.1 Overlay

```
background:       rgba(0, 0, 0, 0.6)
backdrop-filter:  blur(4px)
position:         fixed
inset:            0
z-index:          50
display:          flex
align-items:      center
justify-content:  center
```

### 5.2 Container

```
background:       var(--color-bg-surface)     /* #1A1A1A */
border:           1px solid var(--color-border)
border-radius:    var(--radius-lg)            /* 12px */
padding:          var(--space-6)              /* 24px */
max-width:        480px
width:            calc(100% - 48px)           /* 24px margin each side on mobile */
box-shadow:       var(--shadow-lg)            /* 0 8px 24px rgba(0,0,0,0.5) */
```

### 5.3 Header

```
font-size:        var(--text-h2)              /* 24px */
line-height:      var(--text-h2--line-height) /* 30px */
font-weight:      var(--text-h2--font-weight) /* 600 */
letter-spacing:   var(--text-h2--letter-spacing) /* -0.02em */
color:            var(--color-text-primary)
margin-bottom:    var(--space-4)              /* 16px */
```

Close button: positioned `absolute`, `top: 16px`, `right: 16px`. Uses Ghost button styling at sm size (32px).

### 5.4 Animation

```css
/* Enter */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Exit */
@keyframes modal-exit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.omega-modal-enter {
  animation: modal-enter var(--duration-normal) var(--easing-default);
}
.omega-modal-exit {
  animation: modal-exit var(--duration-normal) var(--easing-default);
}
```

Duration: 150ms (`--duration-normal`). Easing: `--easing-default`.

### 5.5 State Matrix

| Property          | Closed                  | Open                                       |
|-------------------|-------------------------|---------------------------------------------|
| overlay opacity   | 0                       | 1                                           |
| overlay bg        | transparent             | rgba(0, 0, 0, 0.6)                          |
| container scale   | 0.95                    | 1                                           |
| container opacity | 0                       | 1                                           |
| body scroll       | normal                  | `overflow: hidden` on `<body>`              |
| focus trap        | inactive                | active (focus cycles within modal)           |

### 5.6 Token References (CSS Custom Properties)

```css
.omega-modal-overlay {
  position:         fixed;
  inset:            0;
  z-index:          50;
  display:          flex;
  align-items:      center;
  justify-content:  center;
  background:       rgba(0, 0, 0, 0.6);
  backdrop-filter:  blur(4px);
}
.omega-modal {
  background:       var(--color-bg-surface);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius-lg);
  padding:          var(--space-6);
  max-width:        480px;
  width:            calc(100% - 48px);
  box-shadow:       var(--shadow-lg);
  position:         relative;
}
.omega-modal__title {
  font-size:        var(--text-h2);
  line-height:      var(--text-h2--line-height);
  font-weight:      var(--text-h2--font-weight);
  letter-spacing:   var(--text-h2--letter-spacing);
  color:            var(--color-text-primary);
  margin-bottom:    var(--space-4);
  padding-right:    var(--space-8);           /* clearance for close button */
}
.omega-modal__close {
  position:         absolute;
  top:              var(--space-4);
  right:            var(--space-4);
}
```

### 5.7 Tailwind Class Examples

```html
<!-- Overlay -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[4px]">
  <!-- Container -->
  <div
    class="relative bg-bg-surface border border-border rounded-lg p-6 max-w-[480px] w-[calc(100%-48px)] shadow-lg animate-[modal-enter_150ms_cubic-bezier(0.4,0,0.2,1)]"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <!-- Header -->
    <h2 id="modal-title" class="text-h2 leading-[30px] font-semibold tracking-[-0.02em] text-text-primary mb-4 pr-8">
      Confirm Order
    </h2>
    <!-- Close -->
    <button class="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-md text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-normal focus-visible:ring-focus" aria-label="Close dialog">
      <!-- X icon SVG -->
    </button>
    <!-- Content -->
    <div>
      <!-- modal body -->
    </div>
  </div>
</div>
```

### 5.8 Accessibility

| Requirement              | Implementation                                                                 |
|--------------------------|--------------------------------------------------------------------------------|
| Role                     | `role="dialog"` and `aria-modal="true"` on container                           |
| Label                    | `aria-labelledby` pointing to the title element's `id`                         |
| Focus trap               | On open, move focus to first focusable element inside modal. `Tab` and `Shift+Tab` cycle within modal only. |
| Close                    | `Escape` key closes modal. Close button is focusable and labeled.              |
| Scroll lock              | Set `overflow: hidden` on `<body>` while modal is open. Restore on close.      |
| Return focus             | On close, return focus to the element that triggered the modal                 |
| Background inert         | Apply `inert` attribute to content behind the overlay (or `aria-hidden="true"` on siblings) |

---

## 6. Badge / Tag

**Description:** Non-interactive label for status indication, categorization, and metadata display. Four semantic color variants provide at-a-glance context without requiring user action.

### 6.1 Variants

| Variant  | Text Color                   | Background                   | Use Case                     |
|----------|------------------------------|------------------------------|------------------------------|
| Success  | `--color-success` (#22C55E)  | `--color-success-subtle` (#22C55E1F) | Filled, matched, active      |
| Error    | `--color-error` (#EF4444)    | `--color-error-subtle` (#EF44441F)   | Failed, rejected, expired    |
| Info     | `--color-accent-muted` (#4A8BC7) | `--color-accent-subtle` (#4A8BC71F) | Pending, informational       |
| Neutral  | `--color-text-secondary` (#A0A0A0) | `--color-bg-elevated` (#262626) | Default, label, category    |

### 6.2 Dimensions

Badges are single-size. No sm/md/lg variants.

```
height:           22px
padding-inline:   var(--space-2)             /* 8px */
border-radius:    var(--radius-sm)           /* 4px */
font-size:        var(--text-label)          /* 11px */
line-height:      var(--text-label--line-height)  /* 14px */
font-weight:      var(--text-label--font-weight)  /* 500 */
letter-spacing:   var(--text-label--letter-spacing) /* 0.08em */
text-transform:   uppercase
display:          inline-flex
align-items:      center
```

### 6.3 State Matrix

Badges are NOT interactive. No hover, focus, active, or disabled states.

| Property       | Default                                     |
|----------------|---------------------------------------------|
| background     | Variant-specific subtle color               |
| color          | Variant-specific text color                 |
| border         | none                                        |
| cursor         | default                                     |
| pointer-events | none (badges do not capture interaction)    |

### 6.4 Token References (CSS Custom Properties)

```css
.omega-badge {
  display:          inline-flex;
  align-items:      center;
  height:           22px;
  padding-inline:   var(--space-2);
  border-radius:    var(--radius-sm);
  font-family:      var(--font-display);
  font-size:        var(--text-label);
  line-height:      var(--text-label--line-height);
  font-weight:      var(--text-label--font-weight);
  letter-spacing:   var(--text-label--letter-spacing);
  text-transform:   uppercase;
  white-space:      nowrap;
}
.omega-badge--success {
  color:            var(--color-success);
  background:       var(--color-success-subtle);
}
.omega-badge--error {
  color:            var(--color-error);
  background:       var(--color-error-subtle);
}
.omega-badge--info {
  color:            var(--color-accent-muted);
  background:       var(--color-accent-subtle);
}
.omega-badge--neutral {
  color:            var(--color-text-secondary);
  background:       var(--color-bg-elevated);
}
```

### 6.5 Tailwind Class Examples

```html
<!-- Success badge -->
<span class="inline-flex items-center h-[22px] px-2 rounded-sm bg-success-subtle text-success text-label-uppercase whitespace-nowrap">
  FILLED
</span>

<!-- Error badge -->
<span class="inline-flex items-center h-[22px] px-2 rounded-sm bg-error-subtle text-error text-label-uppercase whitespace-nowrap">
  REJECTED
</span>

<!-- Info badge -->
<span class="inline-flex items-center h-[22px] px-2 rounded-sm bg-accent-subtle text-accent-muted text-label-uppercase whitespace-nowrap">
  PENDING
</span>

<!-- Neutral badge -->
<span class="inline-flex items-center h-[22px] px-2 rounded-sm bg-bg-elevated text-text-secondary text-label-uppercase whitespace-nowrap">
  LIMIT
</span>
```

### 6.6 Accessibility

| Requirement              | Implementation                                                                 |
|--------------------------|--------------------------------------------------------------------------------|
| Role                     | Use `<span>` -- no interactive role needed                                     |
| Semantics                | Include badge text in the reading order; do not use `aria-hidden`              |
| Color independence       | Badge text (e.g., "FILLED", "REJECTED") conveys meaning; never rely on color alone |
| Contrast                 | #22C55E on #22C55E1F (effective ~#0F2616 composited on #0D0D0D) = high contrast. All variants pass WCAG AA. |

---

## 7. Tabs

**Description:** Navigation control for switching between views within a single context (e.g., order types, position categories). Renders as a horizontal bar with individually selectable tab items.

### 7.1 Anatomy

```
Tab Bar:          border-bottom: 1px solid var(--color-border)
Tab Item:         padding: 8px 16px (--space-2 --space-4)
Active Indicator: border-bottom: 2px solid var(--color-accent)
```

### 7.2 Tab Item Properties

```
font-family:      var(--font-display)
font-size:        var(--text-body-sm)        /* 14px */
line-height:      var(--text-body-sm--line-height) /* 21px */
font-weight:      400 (inactive), 500 (active)
padding:          var(--space-2) var(--space-4)  /* 8px 16px */
cursor:           pointer
transition:       color var(--duration-normal) var(--easing-default),
                  border-color var(--duration-normal) var(--easing-default)
```

### 7.3 State Matrix

| Property       | Default                      | Hover                        | Active (selected)            | Focus                        | Disabled                |
|----------------|------------------------------|------------------------------|------------------------------|------------------------------|-------------------------|
| color          | `--color-text-secondary`     | `--color-text-primary`       | `--color-text-primary`       | `--color-text-primary`       | `--color-text-muted`    |
| font-weight    | 400                          | 400                          | 500                          | --                           | 400                     |
| border-bottom  | 2px solid transparent        | 2px solid transparent        | 2px solid `--color-accent`   | 2px solid transparent        | 2px solid transparent   |
| background     | transparent                  | transparent                  | transparent                  | transparent                  | transparent             |
| box-shadow     | none                         | none                         | none                         | `--shadow-focus-ring`        | none                    |
| opacity        | 1                            | 1                            | 1                            | 1                            | 0.4                     |
| cursor         | pointer                      | pointer                      | default                      | pointer                      | not-allowed             |

### 7.4 Token References (CSS Custom Properties)

```css
.omega-tabs {
  display:          flex;
  border-bottom:    1px solid var(--color-border);
  gap:              0;
}
.omega-tab {
  padding:          var(--space-2) var(--space-4);
  font-family:      var(--font-display);
  font-size:        var(--text-body-sm);
  line-height:      var(--text-body-sm--line-height);
  font-weight:      400;
  color:            var(--color-text-secondary);
  border-bottom:    2px solid transparent;
  margin-bottom:    -1px;                    /* overlap the bar border */
  cursor:           pointer;
  background:       transparent;
  transition:       color var(--duration-normal) var(--easing-default),
                    border-color var(--duration-normal) var(--easing-default);
}
.omega-tab:hover {
  color:            var(--color-text-primary);
}
.omega-tab--active {
  color:            var(--color-text-primary);
  font-weight:      500;
  border-bottom:    2px solid var(--color-accent);
}
.omega-tab:focus-visible {
  outline:          none;
  box-shadow:       var(--shadow-focus-ring);
}
.omega-tab:disabled {
  opacity:          0.4;
  cursor:           not-allowed;
}
```

### 7.5 Tailwind Class Examples

```html
<div class="flex border-b border-border" role="tablist">
  <!-- Active tab -->
  <button
    class="-mb-px px-4 py-2 font-display text-body-sm font-medium text-text-primary border-b-2 border-accent bg-transparent transition-normal focus-visible:ring-focus focus-visible:outline-none"
    role="tab"
    aria-selected="true"
    aria-controls="panel-limit"
    id="tab-limit"
  >
    Limit
  </button>
  <!-- Inactive tab -->
  <button
    class="-mb-px px-4 py-2 font-display text-body-sm font-normal text-text-secondary border-b-2 border-transparent bg-transparent transition-normal hover:text-text-primary focus-visible:ring-focus focus-visible:outline-none"
    role="tab"
    aria-selected="false"
    aria-controls="panel-market"
    id="tab-market"
    tabindex="-1"
  >
    Market
  </button>
</div>
<!-- Tab panel -->
<div role="tabpanel" id="panel-limit" aria-labelledby="tab-limit">
  <!-- content -->
</div>
```

### 7.6 Accessibility

| Requirement              | Implementation                                                                 |
|--------------------------|--------------------------------------------------------------------------------|
| Roles                    | Container: `role="tablist"`. Tabs: `role="tab"`. Panels: `role="tabpanel"`.    |
| ARIA selected            | Active tab: `aria-selected="true"`. Inactive tabs: `aria-selected="false"`.    |
| ARIA controls            | Each tab has `aria-controls` pointing to its panel `id`.                       |
| ARIA labelledby          | Each panel has `aria-labelledby` pointing to its tab `id`.                     |
| Keyboard - Arrow keys    | `ArrowLeft` / `ArrowRight` move between tabs. Focus follows selection (automatic activation) or focus moves independently (manual activation). |
| Keyboard - Home/End      | `Home` focuses first tab. `End` focuses last tab.                              |
| Keyboard - Tab key       | `Tab` moves focus into the active panel (not to the next tab).                 |
| Tab index                | Active tab: `tabindex="0"`. Inactive tabs: `tabindex="-1"`.                   |
| Focus indicator          | Visible focus ring on tab items. Never suppress.                               |
| Orientation              | `aria-orientation="horizontal"` (default, can be omitted).                     |

---

## 8. Tooltip

**Description:** Contextual popup providing supplementary information on hover or focus. Non-interactive -- disappears when the trigger loses hover/focus.

### 8.1 Container

```
background:       var(--color-bg-elevated)    /* #262626 */
border:           1px solid var(--color-border)
border-radius:    var(--radius-md)            /* 8px */
padding:          var(--space-2) var(--space-3) /* 8px 12px */
box-shadow:       var(--shadow-md)            /* 0 4px 12px rgba(0,0,0,0.4) */
max-width:        240px
z-index:          60
```

### 8.2 Text

```
font-family:      var(--font-display)
font-size:        var(--text-body-sm)         /* 14px */
line-height:      var(--text-body-sm--line-height) /* 21px */
font-weight:      var(--text-body-sm--font-weight) /* 400 */
color:            var(--color-text-primary)   /* #F5F5F5 */
```

### 8.3 Arrow

```
size:             6px (width and height)
background:       var(--color-bg-elevated)    /* matches container bg */
border:           inherits 1px solid var(--color-border) on exposed edges
transform:        rotate(45deg)
```

### 8.4 Placement

| Position | Arrow Location | Offset from Trigger |
|----------|---------------|---------------------|
| top      | bottom center | 8px above           |
| right    | left center   | 8px right           |
| bottom   | top center    | 8px below           |
| left     | right center  | 8px left            |

### 8.5 Animation

```css
@keyframes tooltip-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.omega-tooltip-enter {
  animation: tooltip-enter var(--duration-fast) var(--easing-default);
}
```

Duration: 100ms (`--duration-fast`). Easing: `--easing-default`.

Delay: 200ms before showing (prevents flicker on quick mouse movements). No delay on hide.

### 8.6 State Matrix

Tooltips are not stateful components. They appear (visible) or do not (hidden).

| Property       | Hidden           | Visible                                     |
|----------------|------------------|---------------------------------------------|
| opacity        | 0                | 1                                           |
| visibility     | hidden           | visible                                     |
| pointer-events | none             | none (tooltips are never interactive)        |

### 8.7 Token References (CSS Custom Properties)

```css
.omega-tooltip {
  position:         absolute;
  z-index:          60;
  background:       var(--color-bg-elevated);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius-md);
  padding:          var(--space-2) var(--space-3);
  box-shadow:       var(--shadow-md);
  max-width:        240px;
  font-family:      var(--font-display);
  font-size:        var(--text-body-sm);
  line-height:      var(--text-body-sm--line-height);
  color:            var(--color-text-primary);
  pointer-events:   none;
  animation:        tooltip-enter var(--duration-fast) var(--easing-default);
}
.omega-tooltip__arrow {
  width:            6px;
  height:           6px;
  background:       var(--color-bg-elevated);
  border:           1px solid var(--color-border);
  transform:        rotate(45deg);
  position:         absolute;
}
```

### 8.8 Tailwind Class Examples

```html
<!-- Trigger -->
<button aria-describedby="tooltip-1" class="relative">
  Hover me
</button>

<!-- Tooltip (positioned via JS) -->
<div
  id="tooltip-1"
  role="tooltip"
  class="absolute z-60 bg-bg-elevated border border-border rounded-md px-3 py-2 shadow-md max-w-60 font-display text-body-sm text-text-primary pointer-events-none animate-[tooltip-enter_100ms_cubic-bezier(0.4,0,0.2,1)]"
>
  Tooltip content goes here
  <!-- Arrow -->
  <div class="absolute w-1.5 h-1.5 bg-bg-elevated border border-border rotate-45"></div>
</div>
```

### 8.9 Accessibility

| Requirement              | Implementation                                                                 |
|--------------------------|--------------------------------------------------------------------------------|
| Role                     | `role="tooltip"` on the tooltip element                                        |
| Association              | Trigger uses `aria-describedby` pointing to tooltip `id`                       |
| Keyboard                 | Tooltip appears on focus of trigger element, not just hover                    |
| Dismiss                  | `Escape` key hides the tooltip                                                |
| Timing                   | Tooltip must remain visible long enough to be read; do not auto-dismiss        |
| Non-interactive          | Tooltips must not contain interactive elements (links, buttons)                |
| Touch                    | On touch devices, show tooltip on long press or use an explicit info icon trigger |
| Contrast                 | #F5F5F5 on #262626 = 12.04:1 (AAA PASS)                                       |

---

## 9. Toast

**Description:** Transient notification for system feedback (trade confirmations, errors, warnings). Appears in the viewport corner and auto-dismisses after a timeout (except error toasts, which persist).

### 9.1 Container

```
background:       var(--color-bg-surface)     /* #1A1A1A */
border:           1px solid var(--color-border)
border-radius:    var(--radius-md)            /* 8px */
padding:          var(--space-3) var(--space-4) /* 12px 16px */
box-shadow:       var(--shadow-lg)            /* 0 8px 24px rgba(0,0,0,0.5) */
min-width:        320px
max-width:        420px
```

### 9.2 Left Accent Border

A 3px solid vertical border on the left edge provides semantic color at a glance.

```
border-left:      3px solid [semantic color]
```

### 9.3 Types

| Type    | Accent Border Color      | Icon Color (optional)    | Auto-dismiss |
|---------|--------------------------|--------------------------|--------------|
| Success | `--color-success`        | `--color-success`        | 5 seconds    |
| Error   | `--color-error`          | `--color-error`          | Persistent   |
| Warning | `--color-warning`        | `--color-warning`        | 5 seconds    |
| Info    | `--color-accent`         | `--color-accent`         | 5 seconds    |

### 9.4 Text

| Part    | Font Size              | Font Weight | Color                       |
|---------|------------------------|-------------|-----------------------------|
| Title   | `--text-body-sm` (14px)| 600         | `--color-text-primary`      |
| Message | `--text-body-sm` (14px)| 400         | `--color-text-secondary`    |

### 9.5 Dismiss Button

Positioned top-right within the toast. Uses Ghost button styling at sm size.

```
position:         absolute
top:              var(--space-3)             /* 12px */
right:            var(--space-3)             /* 12px */
```

### 9.6 Animation

```css
@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-exit {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.omega-toast-enter {
  animation: toast-enter var(--duration-slow) var(--easing-default);
}
.omega-toast-exit {
  animation: toast-exit var(--duration-slow) var(--easing-default);
}
```

Duration: 300ms (`--duration-slow`). Direction: slide in from right.

### 9.7 Positioning

```
position:         fixed
bottom:           var(--space-6)             /* 24px */
right:            var(--space-6)             /* 24px */
z-index:          70
```

Multiple toasts stack vertically with `gap: var(--space-3)` (12px) between them. Newest toast appears at the bottom.

### 9.8 State Matrix

| Property       | Hidden           | Entering                     | Visible          | Exiting                      |
|----------------|------------------|------------------------------|------------------|------------------------------|
| opacity        | 0                | 0 -> 1                       | 1                | 1 -> 0                       |
| transform      | translateX(100%) | translateX(100%) -> translateX(0) | translateX(0) | translateX(0) -> translateX(100%) |
| pointer-events | none             | auto                         | auto             | none                         |

### 9.9 Token References (CSS Custom Properties)

```css
.omega-toast {
  position:         relative;
  background:       var(--color-bg-surface);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius-md);
  padding:          var(--space-3) var(--space-4);
  padding-right:    var(--space-8);           /* clearance for close button */
  box-shadow:       var(--shadow-lg);
  min-width:        320px;
  max-width:        420px;
}
.omega-toast--success {
  border-left:      3px solid var(--color-success);
}
.omega-toast--error {
  border-left:      3px solid var(--color-error);
}
.omega-toast--warning {
  border-left:      3px solid var(--color-warning);
}
.omega-toast--info {
  border-left:      3px solid var(--color-accent);
}
.omega-toast__title {
  font-family:      var(--font-display);
  font-size:        var(--text-body-sm);
  line-height:      var(--text-body-sm--line-height);
  font-weight:      600;
  color:            var(--color-text-primary);
  margin-bottom:    var(--space-1);
}
.omega-toast__message {
  font-family:      var(--font-display);
  font-size:        var(--text-body-sm);
  line-height:      var(--text-body-sm--line-height);
  font-weight:      400;
  color:            var(--color-text-secondary);
}
.omega-toast__dismiss {
  position:         absolute;
  top:              var(--space-3);
  right:            var(--space-3);
}
.omega-toast-container {
  position:         fixed;
  bottom:           var(--space-6);
  right:            var(--space-6);
  z-index:          70;
  display:          flex;
  flex-direction:   column;
  gap:              var(--space-3);
}
```

### 9.10 Tailwind Class Examples

```html
<!-- Toast container (fixed position) -->
<div class="fixed bottom-6 right-6 z-70 flex flex-col gap-3" aria-live="polite">

  <!-- Success toast -->
  <div
    class="relative bg-bg-surface border border-border border-l-[3px] border-l-success rounded-md py-3 pl-4 pr-8 shadow-lg min-w-80 max-w-[420px] animate-[toast-enter_300ms_cubic-bezier(0.4,0,0.2,1)]"
    role="alert"
  >
    <p class="font-display text-body-sm font-semibold text-text-primary mb-1">
      Order Filled
    </p>
    <p class="font-display text-body-sm text-text-secondary">
      Buy 500,000 EUR/USD at 1.0842 has been filled.
    </p>
    <button
      class="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded text-text-secondary hover:text-text-primary transition-fast"
      aria-label="Dismiss notification"
    >
      <!-- X icon -->
    </button>
  </div>

  <!-- Error toast (persistent) -->
  <div
    class="relative bg-bg-surface border border-border border-l-[3px] border-l-error rounded-md py-3 pl-4 pr-8 shadow-lg min-w-80 max-w-[420px] animate-[toast-enter_300ms_cubic-bezier(0.4,0,0.2,1)]"
    role="alert"
  >
    <p class="font-display text-body-sm font-semibold text-text-primary mb-1">
      Order Rejected
    </p>
    <p class="font-display text-body-sm text-text-secondary">
      Insufficient margin for this trade. Reduce position size.
    </p>
    <button
      class="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded text-text-secondary hover:text-text-primary transition-fast"
      aria-label="Dismiss notification"
    >
      <!-- X icon -->
    </button>
  </div>

</div>
```

### 9.11 Accessibility

| Requirement              | Implementation                                                                 |
|--------------------------|--------------------------------------------------------------------------------|
| Role                     | `role="alert"` for error/warning toasts (assertive). `role="status"` or use `aria-live="polite"` container for success/info. |
| Live region              | Toast container uses `aria-live="polite"` (or `"assertive"` for errors). New toasts are announced automatically. |
| Dismiss                  | Dismiss button has `aria-label="Dismiss notification"`                         |
| Auto-dismiss             | Provide a way to pause auto-dismiss on hover/focus. Users with cognitive disabilities may need more time. |
| Keyboard                 | Dismiss button is focusable via `Tab`. `Escape` could optionally dismiss the top toast. |
| Stacking                 | Limit visible toasts to 3-5 to avoid overwhelming screen readers              |
| Contrast                 | All text colors on #1A1A1A exceed WCAG AA requirements                         |

---

## 10. Order Entry Panel

**Description:** Composite component for placing buy and sell orders. Combines Card, Tabs, Input, and Button components into a cohesive trade entry form. This is the highest-level component in the system, built entirely from primitives defined above.

### 10.1 Container

Uses the Card Surface variant.

```
background:       var(--color-bg-surface)     /* #1A1A1A */
border:           1px solid var(--color-border)
border-radius:    var(--radius-lg)            /* 12px */
padding:          0                           /* managed by internal sections */
overflow:         hidden                      /* respect border-radius */
```

### 10.2 Header (Buy/Sell Tabs)

Modified Tabs component where the active indicator color changes based on the selected side.

| Tab     | Inactive Color               | Active Color                 | Active Border-Bottom          |
|---------|------------------------------|------------------------------|-------------------------------|
| Buy     | `--color-text-secondary`     | `--color-text-primary`       | 2px solid `--color-success`   |
| Sell    | `--color-text-secondary`     | `--color-text-primary`       | 2px solid `--color-error`     |

Tab bar padding: `padding-inline: var(--space-6)` (24px) to align with card padding.

### 10.3 Form Section

```
padding:          var(--space-6)              /* 24px */
display:          flex
flex-direction:   column
gap:              var(--space-4)              /* 16px */
```

### 10.4 Form Fields

Each field is a stacked label + input pair.

```
Label:
  font-size:      var(--text-label)           /* 11px */
  line-height:    var(--text-label--line-height) /* 14px */
  font-weight:    var(--text-label--font-weight) /* 500 */
  letter-spacing: var(--text-label--letter-spacing) /* 0.08em */
  text-transform: uppercase
  color:          var(--color-text-muted)      /* #666666 */
  margin-bottom:  var(--space-2)              /* 8px */

Input:
  Uses Input component (Numeric variant)
  height:         var(--height-md)            /* 40px */
  Suffix slot for currency codes (e.g., "EUR", "USD")
```

Standard fields:

| Field   | Label    | Input Type | Suffix   |
|---------|----------|------------|----------|
| Amount  | AMOUNT   | Numeric    | EUR      |
| Price   | PRICE    | Numeric    | Midpoint |
| Total   | TOTAL    | Numeric    | USD      |

### 10.5 Summary Row

Key-value pairs below the form fields showing order summary details.

```
Container:
  display:        flex
  justify-content: space-between
  align-items:    center
  padding:        var(--space-3) 0            /* 12px vertical */
  border-top:     1px solid var(--color-border)  /* only between rows if stacked */

Label (left):
  font-size:      var(--text-body-sm)         /* 14px */
  color:          var(--color-text-secondary)  /* #A0A0A0 */

Value (right):
  font-family:    var(--font-mono)
  font-size:      var(--text-body-sm)         /* 14px */
  font-variant-numeric: tabular-nums
  color:          var(--color-text-primary)    /* #F5F5F5 */
```

### 10.6 Submit Button

Full-width button that changes variant based on active tab.

| Active Tab | Button Variant  | Label | Background          | Text Color                |
|------------|-----------------|-------|---------------------|---------------------------|
| Buy        | Success / Buy   | BUY   | `--color-success`   | `--color-text-primary`    |
| Sell       | Error / Sell    | SELL  | `--color-error`     | `--color-text-primary`    |

```
width:            100%
height:           var(--height-lg)            /* 48px */
margin-top:       var(--space-4)              /* 16px */
```

### 10.7 State Matrix

The Order Entry Panel is a composite. Its states are derived from its child components. The panel itself tracks one piece of state: the active side (Buy or Sell).

| Property                    | Buy Active                        | Sell Active                       |
|-----------------------------|-----------------------------------|-----------------------------------|
| Buy tab color               | `--color-text-primary`            | `--color-text-secondary`          |
| Buy tab border-bottom       | 2px solid `--color-success`       | 2px solid transparent             |
| Sell tab color              | `--color-text-secondary`          | `--color-text-primary`            |
| Sell tab border-bottom      | 2px solid transparent             | 2px solid `--color-error`         |
| Submit button bg            | `--color-success`                 | `--color-error`                   |
| Submit button hover bg      | `--color-success-hover`           | `--color-error-hover`             |
| Submit button active bg     | `--color-success-active`          | `--color-error-active`            |
| Submit button text          | `--color-text-primary`            | `--color-text-primary`            |
| Submit button label         | "BUY"                             | "SELL"                            |

### 10.8 Token References (CSS Custom Properties)

```css
.omega-order-entry {
  background:       var(--color-bg-surface);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius-lg);
  overflow:         hidden;
}

/* Tab overrides for buy/sell semantic colors */
.omega-order-entry .omega-tab--buy.omega-tab--active {
  color:            var(--color-text-primary);
  border-bottom:    2px solid var(--color-success);
}
.omega-order-entry .omega-tab--sell.omega-tab--active {
  color:            var(--color-text-primary);
  border-bottom:    2px solid var(--color-error);
}

.omega-order-entry__form {
  padding:          var(--space-6);
  display:          flex;
  flex-direction:   column;
  gap:              var(--space-4);
}

.omega-order-entry__field-label {
  font-size:        var(--text-label);
  line-height:      var(--text-label--line-height);
  font-weight:      var(--text-label--font-weight);
  letter-spacing:   var(--text-label--letter-spacing);
  text-transform:   uppercase;
  color:            var(--color-text-muted);
  margin-bottom:    var(--space-2);
}

.omega-order-entry__summary {
  display:          flex;
  justify-content:  space-between;
  align-items:      center;
  padding-block:    var(--space-3);
}
.omega-order-entry__summary-label {
  font-size:        var(--text-body-sm);
  color:            var(--color-text-secondary);
}
.omega-order-entry__summary-value {
  font-family:      var(--font-mono);
  font-size:        var(--text-body-sm);
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
  color:            var(--color-text-primary);
}

.omega-order-entry__submit {
  width:            100%;
  height:           var(--height-lg);
  margin-top:       var(--space-4);
}
```

### 10.9 Tailwind Class Examples

```html
<div class="bg-bg-surface border border-border rounded-lg overflow-hidden">

  <!-- Buy/Sell Tabs -->
  <div class="flex border-b border-border px-6" role="tablist">
    <button
      class="-mb-px px-4 py-2 font-display text-body-sm font-medium text-text-primary border-b-2 border-success bg-transparent transition-normal"
      role="tab"
      aria-selected="true"
    >
      Buy
    </button>
    <button
      class="-mb-px px-4 py-2 font-display text-body-sm font-normal text-text-secondary border-b-2 border-transparent bg-transparent transition-normal hover:text-text-primary"
      role="tab"
      aria-selected="false"
      tabindex="-1"
    >
      Sell
    </button>
  </div>

  <!-- Form -->
  <div class="p-6 flex flex-col gap-4">

    <!-- Amount field -->
    <div>
      <label class="block text-label-uppercase text-text-muted mb-2">Amount</label>
      <div class="relative">
        <input
          type="text"
          inputmode="decimal"
          class="w-full h-10 pl-4 pr-15 bg-bg-base border border-border rounded-md font-mono text-body-sm text-text-primary font-tabular placeholder:text-text-muted transition-normal focus:border-border-focus focus:shadow-focus-ring focus:outline-none"
          placeholder="0.00"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-text-muted pointer-events-none">
          EUR
        </span>
      </div>
    </div>

    <!-- Price field -->
    <div>
      <label class="block text-label-uppercase text-text-muted mb-2">Price</label>
      <div class="relative">
        <input
          type="text"
          inputmode="decimal"
          class="w-full h-10 pl-4 pr-20 bg-bg-base border border-border rounded-md font-mono text-body-sm text-text-primary font-tabular placeholder:text-text-muted transition-normal focus:border-border-focus focus:shadow-focus-ring focus:outline-none"
          placeholder="0.00000"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-text-muted pointer-events-none">
          Midpoint
        </span>
      </div>
    </div>

    <!-- Total field -->
    <div>
      <label class="block text-label-uppercase text-text-muted mb-2">Total</label>
      <div class="relative">
        <input
          type="text"
          inputmode="decimal"
          class="w-full h-10 pl-4 pr-15 bg-bg-base border border-border rounded-md font-mono text-body-sm text-text-primary font-tabular placeholder:text-text-muted transition-normal focus:border-border-focus focus:shadow-focus-ring focus:outline-none"
          placeholder="0.00"
          readonly
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-body-sm text-text-muted pointer-events-none">
          USD
        </span>
      </div>
    </div>

    <!-- Summary rows -->
    <div class="border-t border-border pt-3 mt-1 flex flex-col gap-0">
      <div class="flex justify-between items-center py-1">
        <span class="text-body-sm text-text-secondary">Estimated Fee</span>
        <span class="font-mono text-body-sm text-text-primary font-tabular">0.05%</span>
      </div>
      <div class="flex justify-between items-center py-1">
        <span class="text-body-sm text-text-secondary">Slippage Tolerance</span>
        <span class="font-mono text-body-sm text-text-primary font-tabular">0.10%</span>
      </div>
    </div>

    <!-- Submit (Buy mode) -->
    <button class="w-full h-12 rounded-md bg-success text-text-primary font-display text-body-sm font-semibold tracking-[0.08em] uppercase transition-normal hover:bg-success-hover active:bg-success-active focus-visible:ring-focus disabled:opacity-40 disabled:pointer-events-none mt-2">
      BUY
    </button>

  </div>
</div>
```

### 10.10 Accessibility

| Requirement              | Implementation                                                                 |
|--------------------------|--------------------------------------------------------------------------------|
| Form semantics           | Wrap fields in `<form>`. Submit button is `type="submit"`.                     |
| Labels                   | Every input has an associated `<label>` with `for`/`id` binding.               |
| Tab navigation           | Buy/Sell tabs follow the Tabs accessibility spec (section 7.6).                |
| Input specifics          | Numeric inputs follow the Input accessibility spec (section 2.8).              |
| Read-only fields         | Total field uses `readonly` attribute and `aria-readonly="true"`.              |
| Error feedback           | Inline validation errors use `aria-invalid="true"` and `aria-describedby` linking to error message. |
| Submit feedback          | On submit, announce result via toast (section 9) or inline status with `aria-live="polite"`. |
| Side context             | Include current side in submit button label (e.g., "BUY EUR/USD") or use `aria-label` for full context. |
| Keyboard                 | `Enter` in any field submits the form. Arrow keys in tabs switch sides.        |

---

## Appendix A: Complete CSS Variable Index

Every CSS custom property used across all 10 components, grouped by category.

### Colors

| Variable                      | Value       | Used By                                    |
|-------------------------------|-------------|--------------------------------------------|
| `--color-accent`              | #3467A1     | Button (Primary, Accent), Tabs, Toast info |
| `--color-accent-hover`        | #3D78B8     | Button hover                               |
| `--color-accent-active`       | #2D5A8E     | Button active                              |
| `--color-accent-muted`        | #4A8BC7     | Badge info, Input caret                    |
| `--color-accent-subtle`       | #4A8BC71F   | Badge info bg                              |
| `--color-text-primary`        | #F5F5F5     | All component text, button labels          |
| `--color-text-secondary`      | #A0A0A0     | Ghost button, inactive tabs, toast message |
| `--color-text-muted`          | #666666     | Input placeholder, labels, table headers   |
| `--color-text-inverse`        | #0D0D0D     | (Reserved for light theme)                 |
| `--color-bg-base`             | #0D0D0D     | Input background                           |
| `--color-bg-surface`          | #1A1A1A     | Card surface, modal, toast, table header   |
| `--color-bg-elevated`         | #262626     | Card elevated, tooltip, badge neutral      |
| `--color-bg-overlay`          | #333333     | (Available for overlays)                   |
| `--color-border`              | #333333     | All borders                                |
| `--color-border-subtle`       | #1A1A1A     | Table row borders                          |
| `--color-border-focus`        | #4A8BC7     | Focus states                               |
| `--color-border-focus-ring`   | #4A8BC726   | Focus ring shadow                          |
| `--color-success`             | #22C55E     | Buy button, badge, toast, bid price        |
| `--color-success-hover`       | #2DD96B     | Buy button hover                           |
| `--color-success-active`      | #1EA750     | Buy button active                          |
| `--color-success-subtle`      | #22C55E1F   | Badge success bg                           |
| `--color-error`               | #EF4444     | Sell button, badge, toast, ask price, error|
| `--color-error-hover`         | #F25D5D     | Sell button hover                          |
| `--color-error-active`        | #D93B3B     | Sell button active                         |
| `--color-error-subtle`        | #EF44441F   | Badge error bg, input error ring           |
| `--color-warning`             | #F59E0B     | Toast warning                              |
| `--color-warning-hover`       | #F7AE2E     | (Available)                                |
| `--color-warning-active`      | #D98B09     | (Available)                                |
| `--color-warning-subtle`      | #F59E0B1F   | (Available for warning badge if needed)    |
| `--color-info`                | #3467A1     | Toast info (aliases --color-accent)        |

### Typography

| Variable                            | Value                                      |
|-------------------------------------|--------------------------------------------|
| `--font-display`                    | 'Space Grotesk', system-ui, sans-serif     |
| `--font-mono`                       | 'JetBrains Mono', 'Fira Code', monospace   |
| `--text-display` / `--line-height`  | 64px / 70px                                |
| `--text-h1` / `--line-height`       | 32px / 38px                                |
| `--text-h2` / `--line-height`       | 24px / 30px                                |
| `--text-h3` / `--line-height`       | 18px / 22px                                |
| `--text-body` / `--line-height`     | 16px / 24px                                |
| `--text-body-sm` / `--line-height`  | 14px / 21px                                |
| `--text-label` / `--line-height`    | 11px / 14px                                |
| `--text-mono-lg` / `--line-height`  | 28px / 34px                                |
| `--text-mono` / `--line-height`     | 14px / 21px                                |

### Spacing, Radius, Shadow, Transition

| Variable              | Value                              |
|-----------------------|------------------------------------|
| `--space-1`           | 4px                                |
| `--space-2`           | 8px                                |
| `--space-3`           | 12px                               |
| `--space-4`           | 16px                               |
| `--space-6`           | 24px                               |
| `--space-8`           | 32px                               |
| `--space-12`          | 48px                               |
| `--space-16`          | 64px                               |
| `--space-24`          | 96px                               |
| `--radius-sm`         | 4px                                |
| `--radius-md`         | 8px                                |
| `--radius-lg`         | 12px                               |
| `--radius-full`       | 9999px                             |
| `--shadow-sm`         | 0 1px 2px rgba(0,0,0,0.3)         |
| `--shadow-md`         | 0 4px 12px rgba(0,0,0,0.4)        |
| `--shadow-lg`         | 0 8px 24px rgba(0,0,0,0.5)        |
| `--shadow-focus-ring` | 0 0 0 3px #4A8BC726                |
| `--height-sm`         | 32px                               |
| `--height-md`         | 40px                               |
| `--height-lg`         | 48px                               |
| `--duration-fast`     | 100ms                              |
| `--duration-normal`   | 150ms                              |
| `--duration-slow`     | 300ms                              |
| `--easing-default`    | cubic-bezier(0.4, 0, 0.2, 1)      |

---

## Appendix B: Component Composition Map

Shows how primitive components compose into higher-level structures.

```
Order Entry Panel
  +-- Card (surface variant, container)
  +-- Tabs (Buy/Sell, with semantic color overrides)
  +-- Input (numeric variant) x3
  |     +-- Suffix slot (currency code)
  +-- Summary rows (label + mono value pairs)
  +-- Button (Success for Buy, Error for Sell)

Order Book
  +-- Card (surface variant, container)
  +-- Table (with bid/ask color coding)
  |     +-- Sticky header
  |     +-- Numeric cells (JetBrains Mono, tabular-nums)

Position Card
  +-- Card (surface variant)
  +-- Badge (status indicator)
  +-- Table (position details)

Trade Confirmation
  +-- Modal (overlay + container)
  +-- Summary rows (label + mono value pairs)
  +-- Button (Primary or Success to confirm)
  +-- Toast (feedback after submission)
```

---

## Appendix C: Z-Index Scale

| Layer             | z-index | Component               |
|-------------------|---------|-------------------------|
| Table sticky head | 10      | Table `<thead>`         |
| Dropdown          | 40      | (Future: Select, Menu)  |
| Modal overlay     | 50      | Modal overlay           |
| Tooltip           | 60      | Tooltip                 |
| Toast             | 70      | Toast notification      |
