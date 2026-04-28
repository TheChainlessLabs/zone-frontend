#!/usr/bin/env node
// Sync omega-docs/03-brand/assets/tokens.json -> app/app/_generated/tokens.css.
// omega-docs is canonical; omega-interface consumes. Single-direction.
//
// Output structure:
//   :root                      -> dark-mode tokens (default), plus mode-invariant
//                                 tokens (radius, motion, glass.filter)
//   [data-theme="light"]       -> light-mode token overrides
//   @theme inline              -> Tailwind v4 utility aliases (--color-*, etc.)
//
// Semantic colour references in tokens.json (e.g., "{color.neutral.50}") are
// resolved recursively. The generator is intentionally small and dependency-free.

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.resolve(REPO_ROOT, "app/app/_generated/tokens.css");

// Locate omega-docs/03-brand/assets/tokens.json. omega-docs is expected to be
// a sibling of this repo's canonical clone (e.g., Chainless/omega-docs). When
// this repo is checked out as a git worktree (e.g., Chainless/worktrees/<name>)
// the sibling lives one level higher. Walk parents and probe.
function findTokensPath() {
  const envOverride = process.env.OMEGA_TOKENS_PATH;
  if (envOverride) return path.resolve(envOverride);

  const candidates = [];
  let cursor = REPO_ROOT;
  for (let i = 0; i < 6; i++) {
    candidates.push(
      path.join(cursor, "omega-docs/03-brand/assets/tokens.json"),
    );
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  return candidates.find((p) => fs.existsSync(p));
}

const TOKENS_PATH = findTokensPath();

if (!TOKENS_PATH) {
  console.error(
    "[sync-tokens] FATAL: omega-docs/03-brand/assets/tokens.json not found",
  );
  console.error(
    "[sync-tokens] Expected omega-docs to be cloned as a sibling of this repo,",
  );
  console.error(
    "[sync-tokens] or pointed at via the OMEGA_TOKENS_PATH env var.",
  );
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf8"));

// ---- reference resolver ---------------------------------------------------
// Tokens may reference others via "{color.neutral.50}". Walk dotted paths,
// follow chains, and bail on cycles or excessive depth.
const REF_RE = /^\{([a-zA-Z0-9_.-]+)\}$/;
const MAX_DEPTH = 16;

function getByPath(obj, dotted) {
  return dotted.split(".").reduce((acc, key) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return acc[key];
  }, obj);
}

function resolve(value, depth = 0) {
  if (typeof value !== "string") return value;
  const match = value.match(REF_RE);
  if (!match) return value;
  if (depth > MAX_DEPTH) {
    throw new Error(`[sync-tokens] reference cycle resolving ${value}`);
  }
  const target = getByPath(tokens, match[1]);
  if (!target || typeof target !== "object" || !("$value" in target)) {
    throw new Error(`[sync-tokens] dangling reference ${value}`);
  }
  return resolve(target.$value, depth + 1);
}

function v(dotted) {
  const node = getByPath(tokens, dotted);
  if (!node || !("$value" in node)) {
    throw new Error(`[sync-tokens] missing token ${dotted}`);
  }
  return resolve(node.$value);
}

// ---- emitters -------------------------------------------------------------

const SEMANTIC_KEYS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "success",
  "success-foreground",
  "border",
  "input",
  "ring",
];

const RADIUS_KEYS = ["sm", "md", "lg", "xl", "full"];
const MOTION_DURATION_KEYS = ["press", "small", "medium", "large"];
const MOTION_EASE_KEYS = ["out", "inout", "in"];

function emitSemantic(mode) {
  return SEMANTIC_KEYS.map(
    (k) => `  --${k}: ${v(`color.semantic.${mode}.${k}`)};`,
  ).join("\n");
}

function emitGlass(mode) {
  return [
    `  --glass-fill: ${v(`color.glass.${mode}.fill`)};`,
    `  --glass-edge: ${v(`color.glass.${mode}.edge`)};`,
    `  --glass-highlight: ${v(`color.glass.${mode}.highlight`)};`,
  ].join("\n");
}

function emitGlassFilter() {
  return [
    `  --glass-blur: ${v("color.glass.filter.blur")};`,
    `  --glass-saturate: ${v("color.glass.filter.saturate")};`,
  ].join("\n");
}

function emitRadius() {
  return RADIUS_KEYS.map((k) => `  --radius-${k}: ${v(`radius.${k}`)};`).join(
    "\n",
  );
}

function emitFonts() {
  // Font tokens live as @theme inline aliases only; the actual font-family
  // strings come from next/font CSS variables (--font-geist-sans etc.) wired
  // in app/app/layout.tsx. We do not duplicate the family list here.
  return null;
}

function emitMotion() {
  const lines = [];
  for (const k of MOTION_DURATION_KEYS) {
    lines.push(`  --duration-${k}: ${v(`motion.duration.${k}`)};`);
  }
  for (const k of MOTION_EASE_KEYS) {
    lines.push(`  --ease-${k}: ${v(`motion.ease.${k}`)};`);
  }
  return lines.join("\n");
}

function emitThemeInline() {
  // Tailwind v4 utility aliases. --color-foo unlocks bg-foo, text-foo, etc.
  // Font + radius + motion aliases unlock font-sans, rounded-md, duration-medium, ease-out.
  const lines = [];
  for (const k of SEMANTIC_KEYS) {
    lines.push(`  --color-${k}: var(--${k});`);
  }
  // Fonts pull from next/font CSS variables defined in layout.tsx.
  lines.push(`  --font-sans: var(--font-geist-sans);`);
  lines.push(`  --font-mono: var(--font-geist-mono);`);
  lines.push(`  --font-serif: var(--font-serif);`);
  for (const k of RADIUS_KEYS) {
    lines.push(`  --radius-${k}: var(--radius-${k});`);
  }
  for (const k of MOTION_DURATION_KEYS) {
    lines.push(`  --duration-${k}: var(--duration-${k});`);
  }
  for (const k of MOTION_EASE_KEYS) {
    lines.push(`  --ease-${k}: var(--ease-${k});`);
  }
  return lines.join("\n");
}

// ---- header ---------------------------------------------------------------

function tokensSourceSha() {
  try {
    // Walk up from the tokens file to find its containing git repo.
    // Strip GIT_DIR / GIT_WORK_TREE from the env so any wrapping git context
    // (e.g., a parent pre-commit hook) does not redirect `rev-parse` to the
    // wrong repo.
    const docsDir = path.dirname(TOKENS_PATH);
    const env = { ...process.env };
    delete env.GIT_DIR;
    delete env.GIT_WORK_TREE;
    delete env.GIT_INDEX_FILE;
    const sha = execSync("git rev-parse HEAD", {
      cwd: docsDir,
      env,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return sha || "unknown";
  } catch {
    return "unknown";
  }
}

const sha = tokensSourceSha();
const header = [
  "/* GENERATED FILE — do not edit by hand.",
  " * Regenerate via `pnpm sync-tokens` (auto-runs before `pnpm dev` and `pnpm build`).",
  " * Source: omega-docs/03-brand/assets/tokens.json",
  ` * Source SHA: ${sha}`,
  " * Generator: scripts/sync-tokens.mjs",
  " */",
].join("\n");

// ---- assemble -------------------------------------------------------------

const css = `${header}

:root {
  /* Default mode is dark. Light mode overrides live under [data-theme="light"]. */
${emitSemantic("dark")}

  /* Liquid-glass material — dark surface defaults. */
${emitGlass("dark")}

  /* Glass filter parameters (mode-invariant). */
${emitGlassFilter()}

  /* Radius scale. */
${emitRadius()}

  /* Motion — durations and easing curves. */
${emitMotion()}
}

[data-theme="light"] {
${emitSemantic("light")}

${emitGlass("light")}
}

@theme inline {
${emitThemeInline()}
}
`;

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, css);
console.log(
  `[sync-tokens] wrote ${path.relative(REPO_ROOT, OUT_PATH)} (${css.length} bytes, source SHA ${sha.slice(0, 7)})`,
);
