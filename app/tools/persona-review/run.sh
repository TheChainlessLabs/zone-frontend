#!/usr/bin/env bash
# run.sh — 20-persona design-review pipeline driver.
#
# Usage:
#   ./run.sh                     # full pipeline (all phases in order)
#   ./run.sh <phase>             # run one phase only
#   ./run.sh all --skip-screenshots
#
# Phases: prep | screenshots | briefs | agents | wrappers | verify | tally | all
#
# Bash 3.2 compatible (macOS default — no associative arrays, no mapfile,
# no ${var,,}). POSIX awk for persona splitting.

set -euo pipefail

# ── resolve paths relative to this script ───────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
APP_DIR="$ROOT_DIR/app"
PERSONAS_FILE="$SCRIPT_DIR/personas.md"
HARNESS_FILE="$SCRIPT_DIR/HARNESS.md"
BRIEFS_DIR="$SCRIPT_DIR/briefs"
RUNS_DIR="$SCRIPT_DIR/runs"
RUNS_ARCHIVE_DIR="$SCRIPT_DIR/runs.archive"
FINDINGS_FILE="$SCRIPT_DIR/findings.md"
WRAPPERS_DIR="$APP_DIR/app/personas/preview/render/_redesigns"
REGISTRY_FILE="$APP_DIR/app/personas/preview/render/_registry.ts"

BASE_URL="${BASE_URL:-https://homelab.tail477b3c.ts.net:8447}"
AGENTS_CONCURRENCY="${AGENTS_CONCURRENCY:-4}"
OMEGA_DOCS_DIR="${OMEGA_DOCS_DIR:-/Users/brianseong/Develop/Chainless/omega-docs}"

# Concurrency note: 20 personas × multi-step agent runs hit Anthropic /
# OpenAI rate limits hard at full fan-out. Cap at 4–5 in flight; the bottleneck
# is per-account TPM, not local CPU. Override with AGENTS_CONCURRENCY=N.

# ── log helpers ─────────────────────────────────────────────────────────────
log()  { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }
warn() { printf '[%s] WARN  %s\n' "$(date '+%H:%M:%S')" "$*" >&2; }
die()  { printf '[%s] ERROR %s\n' "$(date '+%H:%M:%S')" "$*" >&2; exit 1; }

PHASE="${1:-all}"
shift || true

SKIP_SCREENSHOTS=0
for arg in "$@"; do
  case "$arg" in
    --skip-screenshots) SKIP_SCREENSHOTS=1 ;;
    *) ;;
  esac
done

# ────────────────────────────────────────────────────────────────────────────
# phase: prep
# ────────────────────────────────────────────────────────────────────────────
phase_prep() {
  log "prep — verifying inputs"

  [ -f "$PERSONAS_FILE" ] || die "personas.md missing at $PERSONAS_FILE"
  [ -f "$HARNESS_FILE" ]  || die "HARNESS.md missing at $HARNESS_FILE"
  [ -d "$APP_DIR" ]        || die "app/ missing at $APP_DIR"

  # Persona count sanity-check.
  local count
  count=$(grep -c '^## Persona ' "$PERSONAS_FILE" || true)
  [ "$count" = "20" ] || die "personas.md must contain exactly 20 personas (found $count)"

  # Render preview reachability.
  log "prep — checking render preview at $BASE_URL"
  local code
  code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/trade" || echo "000")
  if [ "$code" != "200" ]; then
    warn "render preview returned HTTP $code — verify is meaningful only when this is 200"
  else
    log "prep — render preview reachable (HTTP 200)"
  fi

  # CLIs.
  command -v claude >/dev/null 2>&1 || warn "claude CLI not on PATH — agents phase will fall back to codex for every persona"
  command -v codex  >/dev/null 2>&1 || die "codex CLI not on PATH — required for at least the codex-runtime personas"
  command -v node   >/dev/null 2>&1 || die "node not on PATH — required for screenshots and verify"

  # Archive prior runs/.
  if [ -d "$RUNS_DIR" ] && ls "$RUNS_DIR" 2>/dev/null | grep -q . ; then
    local stamp
    stamp=$(date '+%Y-%m-%d-%H%M')
    mkdir -p "$RUNS_ARCHIVE_DIR"
    log "prep — archiving prior runs/ to runs.archive/$stamp/"
    mv "$RUNS_DIR" "$RUNS_ARCHIVE_DIR/$stamp"
    mkdir -p "$RUNS_DIR"
  else
    mkdir -p "$RUNS_DIR"
  fi

  log "prep — ok"
}

# ────────────────────────────────────────────────────────────────────────────
# phase: screenshots
# ────────────────────────────────────────────────────────────────────────────
phase_screenshots() {
  if [ "$SKIP_SCREENSHOTS" = "1" ]; then
    log "screenshots — skipped (--skip-screenshots)"
    return 0
  fi
  log "screenshots — node capture.mjs (BASE_URL=$BASE_URL)"
  ( cd "$APP_DIR" && BASE_URL="$BASE_URL" node "$SCRIPT_DIR/capture.mjs" )
}

# ────────────────────────────────────────────────────────────────────────────
# phase: briefs
# ────────────────────────────────────────────────────────────────────────────
# Split personas.md by `## Persona NN —` headings; for each NN, splice the
# section into HARNESS.md (replace __ID__ and __PERSONA_SECTION__) and write
# briefs/NN.md.
phase_briefs() {
  log "briefs — generating from personas.md + HARNESS.md"
  mkdir -p "$BRIEFS_DIR"

  # Clean stale briefs.
  rm -f "$BRIEFS_DIR"/*.md 2>/dev/null || true

  local tmpdir
  tmpdir=$(mktemp -d)
  trap "rm -rf '$tmpdir'" EXIT

  # POSIX awk: split personas.md into per-persona files at "## Persona NN —"
  # boundaries. Awk emits to "$tmpdir/persona-NN.md".
  awk -v outdir="$tmpdir" '
    /^## Persona [0-9][0-9] / {
      n = substr($3, 1, 2);
      out = outdir "/persona-" n ".md";
      printing = 1;
      print > out;
      next;
    }
    /^---[[:space:]]*$/ {
      if (printing) {
        printing = 0;
        close(out);
      }
      next;
    }
    {
      if (printing) print >> out;
    }
    END {
      if (printing) close(out);
    }
  ' "$PERSONAS_FILE"

  local id
  for id in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20; do
    local persona_file="$tmpdir/persona-$id.md"
    if [ ! -f "$persona_file" ]; then
      die "persona section $id missing — check personas.md heading format"
    fi
    local brief_file="$BRIEFS_DIR/$id.md"
    # Splice: read HARNESS, replace __ID__ globally, replace
    # __PERSONA_SECTION__ with the contents of persona_file.
    awk -v id="$id" -v pf="$persona_file" '
      BEGIN {
        # slurp persona section
        while ((getline line < pf) > 0) {
          persona = persona line "\n";
        }
        close(pf);
        # strip trailing blank lines from persona buffer so we do not double up
        # the gap before the next harness section.
        sub(/\n+$/, "", persona);
      }
      {
        gsub(/__ID__/, id);
        if ($0 ~ /__PERSONA_SECTION__/) {
          print persona;
        } else {
          print $0;
        }
      }
    ' "$HARNESS_FILE" > "$brief_file"
  done

  rm -rf "$tmpdir"
  trap - EXIT
  log "briefs — wrote 20 briefs to $BRIEFS_DIR"
}

# ────────────────────────────────────────────────────────────────────────────
# phase: agents
# ────────────────────────────────────────────────────────────────────────────
# Run 20 personas in parallel, capped to AGENTS_CONCURRENCY. For each persona:
#   - claude-code runtime → claude --print --dangerously-skip-permissions < brief > log
#   - codex runtime       → codex exec --full-auto --add-dir <docs> < brief > log
# If `claude` is missing, fall back to codex for every persona.
phase_agents() {
  log "agents — fanning out 20 personas (concurrency=$AGENTS_CONCURRENCY)"
  command -v codex >/dev/null 2>&1 || die "codex CLI not on PATH"
  local has_claude=1
  command -v claude >/dev/null 2>&1 || has_claude=0
  [ "$has_claude" = "0" ] && warn "claude CLI not found — running every persona via codex"

  mkdir -p "$RUNS_DIR"

  local id pids=""
  for id in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20; do
    local brief_file="$BRIEFS_DIR/$id.md"
    [ -f "$brief_file" ] || die "brief missing: $brief_file (run ./run.sh briefs first)"

    local persona_runtime
    persona_runtime=$(awk -v id="$id" '
      $0 ~ "^## Persona " id " " { found = 1; next }
      found && /^- \*\*Runtime\*\*:/ {
        # match `claude-code` or `codex`
        if ($0 ~ /claude-code/) print "claude-code"
        else if ($0 ~ /codex/)   print "codex"
        exit
      }
    ' "$PERSONAS_FILE")
    [ -n "$persona_runtime" ] || persona_runtime="codex"

    # Throttle.
    while [ "$(jobs -r -p | wc -l | tr -d ' ')" -ge "$AGENTS_CONCURRENCY" ]; do
      sleep 2
    done

    mkdir -p "$RUNS_DIR/$id/redesign"
    echo "$persona_runtime" > "$RUNS_DIR/$id/.runtime"
    local log_file="$RUNS_DIR/$id/.log"

    log "agents — launching persona $id ($persona_runtime)"
    (
      if [ "$persona_runtime" = "claude-code" ] && [ "$has_claude" = "1" ]; then
        claude --print --dangerously-skip-permissions \
          --add-dir "$APP_DIR" \
          --add-dir "$OMEGA_DOCS_DIR" \
          < "$brief_file" \
          > "$log_file" 2>&1
      else
        codex exec --full-auto \
          --add-dir "$APP_DIR" \
          --add-dir "$OMEGA_DOCS_DIR" \
          --output-last-message "$RUNS_DIR/$id/.last-message" \
          < "$brief_file" \
          > "$log_file" 2>&1
      fi
    ) &
    pids="$pids $!"
  done

  log "agents — waiting on $(echo $pids | wc -w | tr -d ' ') jobs"
  local fail=0
  for pid in $pids; do
    wait "$pid" || fail=$((fail + 1))
  done
  if [ "$fail" -gt 0 ]; then
    warn "agents — $fail persona(s) exited non-zero. Inspect runs/<NN>/.log"
  fi
  log "agents — done"
}

# ────────────────────────────────────────────────────────────────────────────
# phase: wrappers
# ────────────────────────────────────────────────────────────────────────────
# For each runs/<id>/redesign/<file>.tsx:
#   - detect whether it has `export default` or a single named function export
#   - emit _redesigns/<id>.ts re-exporting it as default
#   - rebuild _registry.ts from the file names
phase_wrappers() {
  log "wrappers — regenerating _redesigns/<NN>.ts and _registry.ts"
  mkdir -p "$WRAPPERS_DIR"

  # Track per-id: filename, export-form, target. Use parallel files in a tmpdir
  # because bash 3.2 has no associative arrays.
  local tmpdir
  tmpdir=$(mktemp -d)
  trap "rm -rf '$tmpdir'" EXIT

  local id
  for id in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20; do
    local rdir="$RUNS_DIR/$id/redesign"
    if [ ! -d "$rdir" ]; then
      warn "wrappers — runs/$id/redesign missing; skipping persona $id"
      continue
    fi
    # Pick the first .tsx file.
    local tsx
    tsx=$(ls "$rdir"/*.tsx 2>/dev/null | head -n 1 || true)
    if [ -z "$tsx" ]; then
      warn "wrappers — no .tsx in runs/$id/redesign; skipping persona $id"
      continue
    fi
    local stem
    stem=$(basename "$tsx" .tsx)

    # Detect export form.
    local export_line
    if grep -qE '^[[:space:]]*export[[:space:]]+default' "$tsx"; then
      export_line="export { default } from \"../../../../../tools/persona-review/runs/$id/redesign/$stem\";"
    else
      # First named function export, excluding `interface` and `type`.
      local name
      name=$(grep -E '^[[:space:]]*export[[:space:]]+(async[[:space:]]+)?function[[:space:]]+[A-Za-z_][A-Za-z0-9_]*' "$tsx" \
              | head -n 1 \
              | sed -E 's/^[[:space:]]*export[[:space:]]+(async[[:space:]]+)?function[[:space:]]+([A-Za-z_][A-Za-z0-9_]*).*/\2/')
      if [ -z "$name" ]; then
        # Fall back: first const/let/var named export.
        name=$(grep -E '^[[:space:]]*export[[:space:]]+(const|let|var)[[:space:]]+[A-Za-z_][A-Za-z0-9_]*' "$tsx" \
                | head -n 1 \
                | sed -E 's/^[[:space:]]*export[[:space:]]+(const|let|var)[[:space:]]+([A-Za-z_][A-Za-z0-9_]*).*/\2/')
      fi
      if [ -z "$name" ]; then
        warn "wrappers — persona $id: no export found in $tsx; wrapper will render error boundary"
        export_line="export { default } from \"../../../../../tools/persona-review/runs/$id/redesign/$stem\";"
      else
        export_line="export { $name as default } from \"../../../../../tools/persona-review/runs/$id/redesign/$stem\";"
      fi
    fi

    # Emit wrapper.
    local wrapper="$WRAPPERS_DIR/$id.ts"
    {
      echo "// @ts-nocheck"
      echo "$export_line"
    } > "$wrapper"

    # Detect target from filename.
    local target="order-form"
    case "$stem" in
      *trade-mobile*|*trade-page*) target="trade-page" ;;
      *portfolio*)                 target="portfolio-page" ;;
      *batches-page*|*batches-list*) target="batches-page" ;;
      *batch-detail*)              target="batch-detail" ;;
      *account*)                   target="account-page" ;;
      *order-form*)                target="order-form" ;;
      *)                           target="order-form" ;;
    esac

    # Stash for registry emission.
    echo "$target" > "$tmpdir/$id.target"
  done

  # Emit registry.
  {
    echo "/**"
    echo " * Static registry for the 20 persona redesigns. Each \`_redesigns/<id>.ts\`"
    echo " * is a thin wrapper that re-exports its persona's default-or-named export"
    echo " * as \`default\`, with \`// @ts-nocheck\` to skip agent-produced type drift."
    echo " *"
    echo " * The registry maps id → { Component, target } so the renderer can supply"
    echo " * appropriate props per surface (OrderForm needs pair/mode/midpoint;"
    echo " * full-page rebuilds render directly; BatchDetailView needs an id)."
    echo " */"
    echo ""
    echo "import type { ComponentType } from \"react\";"
    echo ""
    for id in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20; do
      echo "import P$id from \"./_redesigns/$id\";"
    done
    echo ""
    echo "export type RenderTarget ="
    echo "  | \"order-form\""
    echo "  | \"trade-page\""
    echo "  | \"portfolio-page\""
    echo "  | \"batches-page\""
    echo "  | \"batch-detail\""
    echo "  | \"account-page\";"
    echo ""
    echo "export interface RedesignEntry {"
    echo "  id: string;"
    echo "  Component: ComponentType<Record<string, unknown>>;"
    echo "  target: RenderTarget;"
    echo "}"
    echo ""
    echo "export const REGISTRY: Record<string, RedesignEntry> = {"
    for id in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20; do
      local target="order-form"
      [ -f "$tmpdir/$id.target" ] && target=$(cat "$tmpdir/$id.target")
      echo "  \"$id\": { id: \"$id\", Component: P$id as unknown as ComponentType<Record<string, unknown>>, target: \"$target\" },"
    done
    echo "};"
  } > "$REGISTRY_FILE"

  rm -rf "$tmpdir"
  trap - EXIT
  log "wrappers — wrote 20 wrappers and $REGISTRY_FILE"
}

# ────────────────────────────────────────────────────────────────────────────
# phase: verify
# ────────────────────────────────────────────────────────────────────────────
phase_verify() {
  log "verify — node diagnose.mjs (BASE_URL=$BASE_URL)"
  ( cd "$APP_DIR" && BASE_URL="$BASE_URL" node "$SCRIPT_DIR/diagnose.mjs" )
}

# ────────────────────────────────────────────────────────────────────────────
# phase: tally
# ────────────────────────────────────────────────────────────────────────────
phase_tally() {
  log "tally — codex exec over runs/<NN>/critique.md → findings.md"
  command -v codex >/dev/null 2>&1 || die "codex CLI not on PATH"

  # Sanity-check critiques exist.
  local id missing=0
  for id in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20; do
    if [ ! -f "$RUNS_DIR/$id/critique.md" ]; then
      missing=$((missing + 1))
    fi
  done
  if [ "$missing" -gt 0 ]; then
    warn "tally — $missing critique(s) missing; tally will be partial"
  fi

  local prompt
  prompt=$(cat <<'PROMPT'
You are tallying a 20-persona design-review batch for the omega-interface frontend.

Input: read every file at /Users/brianseong/Develop/Chainless/omega-interface/app/tools/persona-review/runs/<NN>/critique.md (NN = 01..20).

Output: write a single file at /Users/brianseong/Develop/Chainless/omega-interface/app/tools/persona-review/findings.md with this exact structure:

# Findings — 20-persona design review tally

Coverage: <one line on coverage>.

## Summary
- Total kill clusters: <N>
- Total build clusters: <N>
- Highest-voted: <one line>
- Strongest convergence by surface: <one line>

## Top-3 highest-voted
1. ...
2. ...
3. ...

## Convergent — votes ≥ 5

### KILL — <cluster name> (<N>: id1, id2, ...)
<2 sentences — what to do, behaviour-cost framing if available>

### BUILD — <cluster name> (<N>: id1, id2, ...)
<2 sentences — what to do, behaviour-cost framing if available>

(repeat for every cluster ≥ 5 votes)

## Strong — votes 3–4

### KILL
- <cluster> (<N>: ids)
...

### BUILD
- <cluster> (<N>: ids)
...

## Disagreements

### <name of disagreement>
<one paragraph reconciling or naming the split>

## Single-voter items worth flagging
1. Persona NN — <item>
...

## Surface heatmap

| Surface | Kill ≥5 | Build ≥5 | Kill 3–4 | Build 3–4 |
|---|---|---|---|---|
| OrderForm | ... |
| /trade | ... |
| /portfolio | ... |
| /batches | ... |
| /batches/[id] | ... |
| /account | ... |
| modals | ... |
| MobileTabBar | ... |
| cross-surface | ... |

Hard rules:
- No emoji.
- No AI attribution.
- No personal-infra references — frame for the next engineer.
- Cite persona ids by 2-digit (01..20) in cluster vote lists.
- Only count a persona toward a cluster when their critique materially advocates it; do not infer.

When done, print "wrote findings.md".
PROMPT
)

  ( cd "$SCRIPT_DIR" && printf '%s\n' "$prompt" | codex exec --full-auto \
      --add-dir "$RUNS_DIR" \
      --output-last-message "$SCRIPT_DIR/.tally.last-message" \
      > "$SCRIPT_DIR/.tally.log" 2>&1 )

  if [ -f "$FINDINGS_FILE" ]; then
    log "tally — wrote $FINDINGS_FILE"
  else
    warn "tally — findings.md not written; inspect .tally.log"
  fi
}

# ────────────────────────────────────────────────────────────────────────────
# dispatch
# ────────────────────────────────────────────────────────────────────────────
case "$PHASE" in
  prep)        phase_prep ;;
  screenshots) phase_screenshots ;;
  briefs)      phase_briefs ;;
  agents)      phase_agents ;;
  wrappers)    phase_wrappers ;;
  verify)      phase_verify ;;
  tally)       phase_tally ;;
  all)
    phase_prep
    phase_screenshots
    phase_briefs
    phase_agents
    phase_wrappers
    phase_verify
    phase_tally
    ;;
  *)
    die "unknown phase: $PHASE (expected: prep|screenshots|briefs|agents|wrappers|verify|tally|all)"
    ;;
esac

log "done — phase=$PHASE"
