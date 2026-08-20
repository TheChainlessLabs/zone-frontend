---
name: Omega Landing
description: Institutional dark-first landing page with glass materials and scroll-driven mechanism
colors:
  background-dark: "#09090b"
  background-light: "#fafafa"
  foreground-dark: "#fafafa"
  foreground-light: "#09090b"
  primary-dark: "#fafafa"
  primary-light: "#18181b"
  secondary-dark: "#27272a"
  secondary-light: "#f4f4f5"
  muted-dark: "#18181b"
  muted-light: "#f4f4f5"
  muted-foreground-dark: "#a1a1aa"
  muted-foreground-light: "#71717a"
  border-dark: "#27272a"
  border-light: "#e4e4e7"
  success-dark: "#10b981"
  success-light: "#059669"
  destructive-dark: "#ef4444"
  destructive-light: "#dc2626"
typography:
  display:
    fontFamily: "Geist Sans"
    fontSize: "48px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist Sans"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist Sans"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Geist Sans"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Sans"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.06em"
  mono:
    fontFamily: "Courier, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.primary-light}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-glass:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  card-glass:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.foreground-dark}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: Omega Landing

## Overview

**Creative North Star: "The Singularity"**

The Omega landing page visualizes private execution as orders entering a private realm — a singularity where intent collapses inward, shielded from external observation. The design is deliberately minimal and institutional, favoring precision over decoration. Dark backgrounds anchor the interface; frosted-glass overlays suggest hidden depths beneath translucent surfaces. Scroll-driven animations guide the narrative without overwhelming: meteors streak toward the center, the mechanism reveals its four steps, and the dot-grid fades in as the hero recedes. Every visual choice serves the core positioning: private execution is the job, and the interface reflects that through architectural clarity and motion restraint.

The landing is a no-frills technical surface for design partners and developers. Typography is clean sans-serif; copy is terse and institutional. High contrast ensures legibility over complex animated backdrops. All motion respects `prefers-reduced-motion`, collapsing to instant transitions for users who prefer accessibility over spectacle.

**Key Characteristics:**
- **Dark-first minimalism.** No wasted visual real estate. Every element earns its presence.
- **Glass and depth through tones.** Overlays are intentionally translucent; permanent surfaces layer by background tone.
- **Institutional voice.** Technical precision over brand personality. Copy is direct and credible.
- **Scroll as narrative.** The mechanism reveals through scroll position, not clicks. Motion is purposeful, not decorative.
- **Accessibility first.** Reduced-motion, high contrast, keyboard navigation non-negotiable.

## Colors

A minimalist monochromatic palette anchors the system. Dark mode is the default; light mode inverts the scale without changing saturation or character. Accents (success, destructive) are reserved for status and critical feedback. Glass surfaces use opacity on the foreground color to maintain contrast over dynamic backdrops.

### Primary
- **Foreground (Dark)** (#fafafa): Text, headings, and primary actions on dark backgrounds. Maximum contrast, 98% luminance.
- **Background (Dark)** (#09090b): The default surface and hero layer. Absorbs visual complexity so animations read clearly.

### Secondary
- **Secondary Surface (Dark)** (#27272a): Borders, dividers, subtle layering. 10% lighter than background for minimal contrast.

### Neutral
- **Muted (Dark)** (#18181b): Tertiary surface for elevated chrome (panels, cards). 25% lighter than background.
- **Muted Foreground (Dark)** (#a1a1aa): Microcopy, captions, hints. 30% lighter than primary foreground; readable but recessive.
- **Border (Dark)** (#27272a): Hairlines and edges. Subtle hierarchy; glass edges use opacity instead of hex values for flexibility over animated backdrops.

### Status
- **Success (Dark)** (#10b981): Order fills, completion feedback. Reserved for positive state changes.
- **Destructive (Dark)** (#ef4444): Errors and critical actions. High saturation ensures legibility in isolation.

### Glass Tokens (Brand System)
- **Glass Fill** (rgba(255, 255, 255, 0.04)): The base translucent layer for overlay surfaces. Landing rescales to 66% opacity for legibility over the blackhole glow.
- **Glass Edge** (rgba(255, 255, 255, 0.10)): Hairline borders on translucent surfaces. Scoped borders maintain contrast as backdrop brightness shifts.
- **Glass Highlight** (rgba(255, 255, 255, 0.14)): Inset top edge on glass, echoing specular reflection. Reinforces the liquid appearance.

**The Institutional Constraint Rule.** Color is functional, not expressive. Accents (success, destructive) appear only when the interface *must* communicate state. Brand warmth lives in motion and typography, not palette.

## Typography

A neutral sans-serif system (Geist) paired with Source Serif 4 (italic only, for editorial moments). The landing avoids serif entirely to maintain technical clarity; serif appears only on the product side. Monospace sits on the data plane (prices, hashes, block heights) to enforce visual distinction.

**Display Font:** Geist Sans (600 weight) — clean, institutional, geometric.
**Body Font:** Geist Sans (400–600 weight) — readable at any scale.
**Data Font:** Courier, fallback monospace (400 weight, tabular numerals) — for prices and addresses.

**Character:** Precise and terse. No flourish. Every size shift carries information; no arbitrary scales.

### Hierarchy
- **Display** (48px, 600 weight, 1.1 line-height, -0.02em tracking): Hero headline. Single emotional moment on the page; sets the frame.
- **Headline** (28px, 600 weight, 1.2 line-height, -0.01em tracking): Section title (mechanism, why omega). Leads the narrative.
- **Title** (22px, 600 weight, 1.3 line-height): Subsection headings. Maintains hierarchy without noise.
- **Body** (14px, 400 weight, 1.5 line-height): Paragraph copy and form labels. Max line length 65–75ch for legibility.
- **Label** (11px, 500 weight, 0.06em tracking, uppercase): Captions, status labels, field labels. Recessive but scannable.
- **Mono** (14px, 400 weight, 1.4 line-height, tabular numerals): Order hashes, prices, technical identifiers.

**The Terse Copy Rule.** Institutional tone forbids emoji, exclamation, and casual voice. Copy is direct and credible. No hype; no storytelling flourishes. The mechanism *is* the story.

## Layout

The landing centers on a 1240px max-width container, responsive with padding shifts at breakpoints. Sections stack vertically; internal horizontal rhythm is maintained via a 30px grid (visible in the dot-grid background).

**Spacing:** Uses a 4/8/16/24/32px scale for consistency. Gaps between sections: 64–96px (6–8x base unit). Internal padding on cards: 24px (hero), 32px (mechanism callouts).

**Responsive behavior:**
- **Desktop (≥768px):** Full-width sections, 1240px container, 32px horizontal padding, wide meteor field visible.
- **Mobile (<768px):** Full bleed to edges, 16px horizontal padding, single-column layout, narrow meteor field only.

**Grid and rhythm:** The dot-grid (30px spacing) provides an invisible alignment reference. Typography and motion align to it; no arbitrary whitespace. Scroll-driven fade of the dot-grid (via `--landing-dots` CSS variable) creates depth as the hero scrolls away.

## Elevation & Depth

**Tonal layering.** The system conveys depth through background tone shifts rather than shadows. Resting surfaces stack: background (#09090b) < muted (#18181b) < secondary (#27272a). Elevated moments (overlays, hover states) brighten the tone or shift hue. Glass overlays are intentionally translucent to signal they are *events*, not permanent furniture.

Shadows are minimal: only soft diffuse shadows on glass materials, and inset highlights on glass edges (to reinforce the liquid appearance). No drop shadows on panels or cards; the background tone carries hierarchy.

### Elevation Vocabulary
- **Resting glass** (`box-shadow: inset 0 1px 0 var(--glass-highlight); backdrop-filter: blur(24px)`): Overlays (modals, panels, cards). Readable over animated backdrops due to the opaque background base + translucent tint.
- **Hover lift** (`--glass-brightness: 1.16; border-color: var(--ring)`): Glass surfaces brighten on hover. No transform; no offset shadow.
- **Component-scale glass** (`backdrop-filter: blur(18px)`): Smaller surfaces (buttons, chips, pills). Same material, tighter blur for focus.

**The Flat-By-Default Rule.** Surfaces are flat at rest. No drop shadows, no offsets. Depth comes from tone, opacity, and the glass material's intrinsic specular quality. Shadows appear only on glass insets (to reinforce depth within the material itself) and in hover states (for active feedback).

## Shapes

Corners are consistently rounded using the scale: 6px (small buttons), 10px (inputs, smaller cards), 14px (standard cards), 20px (large panels). No hard corners; no extreme radii. Corners are functional, not decorative.

Glass edges use a 1px border with the `--glass-edge` color (opacity-driven for flexibility). Borders on solids are 1px `--border` hex. The recessed glass inset is a single 1px inset highlight at the top, echoing light reflection.

## Components

### Buttons
- **Shape:** Rounded corners (10px radius md, 14px radius lg on glass variant).
- **Primary (Default):** Solid white (#fafafa) text on dark background. 10px radius. Subtle downward press feedback (0.5px translateY). Shadow adds lift: `0 10px 28px -18px var(--foreground)`. Hover darkens the shadow and lifts it further.
- **Glass Variant:** Translucent fill (glass-pill class), white text, 14px radius. Used for secondary CTAs (design partner, docs). Hover brightens the glass backdrop and lifts the shadow.
- **Outline/Secondary:** Sparse use. Border-only variant for lower-priority actions.
- **States:** All buttons have focus-ring (2px ring-offset-2) and disabled state (45% opacity, no pointer). Press feedback is immediate (no delay).

### Cards / Glass Containers
- **Shape:** 20px radius on all corners.
- **Resting:** Opaque dark background (#09090b) with translucent tint (glass-fill), 1px glass-edge border, inset highlight, and soft shadow.
- **Hover:** Border brightens to ring color, shadow blooms to 0 0 32px -12px rgba(255, 255, 255, 0.22). Backdrop brightens via `--glass-brightness: 1.16`.
- **Landing variant:** 66% background opacity (landing-only override) for legibility over the blackhole scene.
- **Internal padding:** 24px standard, 32px on hero sections.

### Navigation
- **Hero nav:** Fixed at top, text-light on dark transparent background initially. Becomes solid (`--nav-solid`) when scroll > 24px. Text links with underline-offset 4px. Active state uses foreground color.
- **Character:** Minimal. No rounded backgrounds or badges. Text only, with icon support (Lucide).

### Inputs / Form Fields
- **Style:** 10px radius border, dark background (#27272a), foreground text. 8px internal padding.
- **Focus:** Ring (2px, offset 2px) via focus-visible, no border change. Placeholder text is muted-foreground (#a1a1aa).
- **Error:** Border shifts to destructive (#ef4444). Error message in destructive color below the field.

### Signature Component: OrderScrollStory (Mechanism)
A pinned 416vh-tall section where scroll position drives a 4-step narrative: Intent → Matching → Liquidity → Settlement. A centered SVG singularity (animated blackhole) sits on the left; the right side carries a progress rail (4 dots), headings, and body copy that advance with scroll depth.

**Motion:** Scroll-driven via JavaScript calculating progress as `(scrollY - sectionTop) / sectionHeight`. The SVG scales and fades via CSS custom properties. Copy fades in staggered; the progress rail animates between dots.

**Reduced motion:** Completely disabled. The section collapses to static text-only view under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep backgrounds dark and content light. The hierarchy is tonal, not chromatic.
- **Do** use the glass material intentionally. Every glass surface must be an overlay or hover moment, not a resting surface (except the landing's cards over the animated backdrop).
- **Do** maintain 4.5:1 contrast minimum text:background even over animated or translucent backgrounds.
- **Do** respect `prefers-reduced-motion`. All animations must have non-motion fallbacks (instant transitions, static states).
- **Do** reserve color (success, destructive) for status only. Never use color for hierarchy.
- **Do** use the 4/8/16/24/32px spacing scale. No arbitrary dimensions.
- **Do** pair sans-serif body with serif italic *only* for display moments. Never mix serif and sans in body copy.
- **Do** ensure buttons and interactive elements have clear focus rings (2px ring-offset-2).

### Don't:
- **Don't** add drop shadows to flat surfaces. Use tonal layering (background-color shifts) instead.
- **Don't** use rounded corners >20px (except border-radius: full for pills/circles). No fluffy, overly-curved feel.
- **Don't** add decorative icons or flourishes. Every visual element must serve the layout or narrative.
- **Don't** increase the default blur on glass (24px surface, 18px pill). Changes will pollute the consistency.
- **Don't** mix light and dark mode in a single viewport. Theme selection is page-wide.
- **Don't** animate scroll-driven elements on mobile where jank is likely. Collapse to instant or remove the animation.
- **Don't** set font weights outside the established scale (400, 500, 600). No arbitrary bold or thin.
- **Don't** use any color besides the palette above without explicit approval. One-off colors pollute the system.
