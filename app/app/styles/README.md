# CSS design system layers

`globals.css` is intentionally only the Tailwind entrypoint and layer manifest. Keep reusable primitives in these files instead of adding more page-era CSS to the root file.

Import order matters:

1. `tokens.css` — generated brand token import plus local compatibility aliases.
2. `atmosphere.css` — body base styling and route-level backdrops.
3. `typography.css` — semantic type utilities and font helpers.
4. `materials.css` — reusable surfaces such as glass, panel, pill, and menu material.
5. `motion.css` — shared keyframes, press states, highlight choreography, and reduced-motion policy.
6. `landing.css` — landing-page-only atmosphere and hero effects.

Rule of thumb: if a selector is page-specific, keep it in that page layer; if it names a reusable primitive, promote it into tokens/typography/materials/motion.
