/**
 * Server-side loader for persona artefacts. Reads the markdown + redesign
 * source files from disk at request time so the page renders the latest
 * committed content of each `runs/<id>/`.
 */

import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

const RUNS_ROOT = join(
  process.cwd(),
  "tools",
  "persona-review",
  "runs",
);

export interface PersonaArtefacts {
  manifesto: string;
  critique: string;
  inspirations: string;
  redesignSource: string;
}

function safeRead(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

export function loadPersonaArtefacts(
  id: string,
  redesignFile: string,
): PersonaArtefacts {
  const dir = join(RUNS_ROOT, id);
  return {
    manifesto: safeRead(join(dir, "manifesto.md")).trim(),
    critique: safeRead(join(dir, "critique.md")).trim(),
    inspirations: safeRead(join(dir, "inspirations.md")).trim(),
    redesignSource: safeRead(join(dir, "redesign", redesignFile)),
  };
}

export function loadAllManifestos(): Record<string, string> {
  const out: Record<string, string> = {};
  // The manifest is small — manifestos are <120 words each.
  for (let i = 1; i <= 20; i++) {
    const id = String(i).padStart(2, "0");
    out[id] = safeRead(join(RUNS_ROOT, id, "manifesto.md")).trim();
  }
  return out;
}
