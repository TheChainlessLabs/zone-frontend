# M3 state coverage matrix

The cells below say which `(surface, state)` fixtures live in
`app/lib/fixtures/`. Cells use `[x]` for present, `[ ]` for not yet
built, and `—` for not applicable. No emoji glyphs (per
`omega-docs/03-brand/messaging.md` — decorative Unicode is banned).

> Spec originally placed this file at `app/.claude/M3-state-coverage.md`.
> The agent harness blocked writes to any `.claude/` path, so it lives
> alongside the fixture registry instead. Move it back to `app/.claude/`
> if/when the dotfile is desired.

## Pages

| Page                | default | empty | loading | error | skeleton | disconnected | wrong-network |
| ------------------- | :-----: | :---: | :-----: | :---: | :------: | :----------: | :-----------: |
| /trade Market       |  [x]   |  [x]  |   [x]   |  [x]  |   [x]    |     [x]      |      [x]      |
| /trade Limit        |  [x]   |  [x]  |   [x]   |  [x]  |   [x]    |     [x]      |      [x]      |
| /portfolio          |  [x]   |  [x]  |   [x]   |  [x]  |   [x]    |     [x]      |       —       |
| /batches list       |  [x]   |  [x]  |   [x]   |  [x]  |    —     |      —       |       —       |
| /batches detail     |  [x]   |   —   |   [x]   |  [x]  |    —     |      —       |       —       |
| /account            |  [x]   |   —   |    —    |   —   |    —     |     [x]      |       —       |
| /not-found          |  [x]   |   —   |    —    |   —   |    —     |      —       |       —       |

The /trade Market and /trade Limit rows share the same fixture set —
the order-form variant is a UI toggle on top of the same backend data.
Loading / error on `/batches detail` are page-level fetch states distinct
from the per-batch `verified` / `pending` / `failed` cells below.

`/not-found` ships a static fixture (no data shape — the page is the
fixture). It's listed here for completeness so reviewers don't think
it's missing.

## /batches detail (per-status cells)

| Cell                   | present |
| ---------------------- | :-----: |
| detail — verified      |  [x]   |
| detail — pending       |  [x]   |
| detail — failed        |  [x]   |

## /batches search

| Cell                   | present |
| ---------------------- | :-----: |
| search — results       |  [x]   |
| search — no results    |  [x]   |

## Modals

| Modal                     | states                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| ConnectWallet             | idle [x] · connecting [x] · connected [x] · failed [x] · no-nft-pass [x] |
| Deposit                   | idle [x] · approving [x] · depositing [x] · pending [x] · success [x] · failed [x] |
| Withdraw                  | idle [x] · signing [x] · pending [x] · success [x] · failed [x]     |
| Order Confirmation        | idle [x] · signing [x] · submitting [x] · failed [x]                |

## Notes

- `/portfolio` has no `wrong-network` variant: the page is read-only and
  doesn't gate on chain ID. A wrong-network wallet sees the disconnected
  variant.
- `/batches list` has no `skeleton` / `disconnected` / `wrong-network`
  variants: the page is public read-only and uses inline loading
  affordances rather than skeleton primitives.
- `/account` exposes only `default` / `disconnected`: it's a profile
  surface that's either rendered or not.
- `/not-found` is a static surface; only `default` is meaningful.
