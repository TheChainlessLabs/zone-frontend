# Persona review pipeline

A scripted, reusable harness for running a 20-persona design critique of the omega-interface app. Each persona reviews the live deploy, produces four artefacts (`critique.md`, `inspirations.md`, `manifesto.md`, `redesign/<file>.tsx`), and the redesigns are wired into the in-app aggregator at `/personas/preview/render/<NN>` for side-by-side comparison.

The pipeline is **stateless and idempotent**: drop in a new `personas.md`, run `./run.sh`, and end up with a fresh aggregator + tally.

## Quick start

```sh
cd app/tools/persona-review
./run.sh                    # full pipeline (prep -> screenshots -> briefs -> agents -> wrappers -> verify -> tally)
./run.sh prep               # checks only
./run.sh briefs             # regenerate briefs from personas.md
./run.sh wrappers           # regenerate wrapper modules + registry from runs/<id>/redesign/
./run.sh verify             # node diagnose.mjs against the live render preview
```

## Phases

| Phase | What it does | Side effects |
|---|---|---|
| `prep` | Verifies `personas.md`, render preview reachability, `claude` and `codex` on PATH. Archives any prior `runs/` to `runs.archive/<YYYY-MM-DD-HHMM>/`. | Empties `runs/` before the agents phase repopulates it. |
| `screenshots` | `node capture.mjs`. Captures 116 PNGs across desktop/mobile and dark/light. Skip with `--skip-screenshots` flag on `all`. | Writes `screenshots/<viewport>/<theme>/<slug>.png`. |
| `briefs` | Splits `personas.md` into 20 sections, splices each into `HARNESS.md`, writes `briefs/<NN>.md`. | Overwrites all `briefs/*.md`. |
| `agents` | Fans out 20 background processes — `codex exec` for `codex` runtime, `claude --print` for `claude-code` runtime. Concurrency capped at 4 to respect rate limits. Each writes its four artefacts under `runs/<NN>/`. | Long-running. Real API spend. |
| `wrappers` | Reads `runs/<NN>/redesign/*.tsx`, detects export shape (`default` vs named), and regenerates `app/personas/preview/render/_redesigns/<NN>.ts` plus the `_registry.ts` mapping. | Touches `app/app/personas/preview/render/`. |
| `verify` | `node diagnose.mjs`. Hits `/personas/preview/render/<NN>` for each persona and reports working/broken counts. | Read-only. |
| `tally` | Invokes a tally agent (codex exec) over the 20 critiques. Writes `findings.md`. | Long-running. Real API spend. |
| `all` | Phases 1–7 in order. Default if no arg. | Combination of above. |

## Prerequisites

- macOS (the script is bash 3.2 compatible — no `declare -A`, no `mapfile`).
- `node` 20.18+ on PATH for Playwright.
- `playwright` deps: `npx playwright install chromium` once per machine.
- `claude` CLI on PATH (`brew install claude` or follow Anthropic's install instructions).
- `codex` CLI on PATH.
- Render preview reachable. Defaults to `https://homelab.tail477b3c.ts.net:8447`; override with `BASE_URL=https://your-preview.example.com`.

## File map

```
tools/persona-review/
  run.sh                # the pipeline driver
  HARNESS.md            # brief template, __ID__ + __PERSONA_SECTION__ placeholders
  MEGA-PROMPT.md        # paste this into ChatGPT to refresh personas.md
  README.md             # this file
  personas.md           # 20 persona specs (input — refresh as needed)
  capture.mjs           # Playwright screenshot harness
  diagnose.mjs          # render-availability checker
  briefs/<NN>.md        # generated per-persona briefs
  runs/<NN>/            # generated per-persona artefacts
    critique.md
    inspirations.md
    manifesto.md
    redesign/<file>.tsx
  runs.archive/<TS>/    # prior runs, retained
  findings.md           # generated tally output
  screenshots/          # generated, gitignored
```

## Common gotchas

### `claude` headless flag

`claude --print < brief.md` is the supported headless mode and is what the script uses. If the CLI changes (new flag name, JSON-only output, login-required), the script falls back to running every persona via `codex exec` — the pipeline stays scripted, you lose model-variance.

To audit which runtime each persona used, inspect `runs/<NN>/.runtime` (written by the agents phase).

### Playwright + Node 20.18

`capture.mjs` needs Playwright installed against the active Node version. If you see `Cannot find module 'playwright'`, run `pnpm install` from `app/` first. Corepack pins are sometimes mismatched; `nvm use 20` + reinstall is the most direct fix.

### Wrapper export detection

`run.sh wrappers` parses each persona's `runs/<NN>/redesign/*.tsx` and detects whether to use `export { default }` or `export { Name as default }`. The detection rule:
- If the file contains `export default` → wrapper uses `export { default } from "..."`.
- Otherwise the first `export function <Name>(` (excluding `interface`, `type`) is the named export → wrapper uses `export { <Name> as default } from "..."`.

If a persona's file exports neither pattern (e.g., only `export const Foo = ...`), `wrappers` prints a warning and that persona's tile renders the error boundary. Fix by editing the agent's brief or hand-patching the wrapper.

### Wrapper target detection

`_registry.ts` maps persona id → render target (`order-form`, `trade-page`, `portfolio-page`, `batches-page`, `batch-detail`, `account-page`). The detection rule reads the redesign filename:

| Filename contains | Target |
|---|---|
| `trade-page`, `trade-mobile` | `trade-page` |
| `portfolio` | `portfolio-page` |
| `batches-page`, `batches-list` | `batches-page` |
| `batch-detail` | `batch-detail` |
| `account` | `account-page` |
| anything else | `order-form` (fallback) |

Bias the agent's brief if you need a particular surface; the persona's `Redesign attitude` and `Mobile vs desktop priority` already steer them.

### Aggregator URL

After `wrappers` lands the new modules, the aggregator reads them on next request — no rebuild needed for dev. For a deployed preview, push and let the previewer rebuild.

## Hard rules

- No emoji in any agent output. Enforced in `HARNESS.md`.
- No AI attribution. Enforced in `HARNESS.md`.
- No personal-infra references in agent output. Enforced in `HARNESS.md`.
- No git operations from inside an agent. The pipeline opens the PR; the agents only write files.
