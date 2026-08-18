import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Keeps Figma and this repo honest about each other.
 *
 * `design/tokens.json` is what the Figma variables currently say; this test
 * fails when it stops matching the CSS that actually renders, so a token
 * changed in Figma and never applied in code shows up as a red test rather
 * than as a colour nobody notices is wrong.
 *
 * `design/component-map.json` is the hand-rolled stand-in for Code Connect
 * (the real thing needs an Org/Enterprise plan). This test asserts every
 * mapped source file still exists, so the map cannot quietly rot.
 *
 * Regenerating either file is a Claude/MCP job — Figma's Variables REST API
 * is Enterprise-only, so no plain script can fetch it on this plan.
 */

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = path.resolve(APP_ROOT, "..");

const readJson = (rel: string) =>
  JSON.parse(readFileSync(path.join(REPO_ROOT, rel), "utf8"));

const componentMap = readJson("design/component-map.json");
const tokens = readJson("design/tokens.json");

/** Pull `--name: value` pairs out of one selector block of a CSS file. */
function declarations(cssPath: string, selector: string): Record<string, string> {
  const css = readFileSync(path.join(APP_ROOT, cssPath), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  const block = new RegExp(
    `${selector.replace(/[[\]"\\]/g, "\\$&")}\\s*\\{([\\s\\S]*?)\\n\\}`,
  ).exec(css);
  if (!block) throw new Error(`no ${selector} block in ${cssPath}`);

  const out: Record<string, string> = {};
  for (const [, name, value] of block[1].matchAll(/--([-\w]+):\s*([\s\S]*?);/g)) {
    out[name] = value.replace(/\s+/g, " ").trim();
  }
  return out;
}

/**
 * The effective value of a token is the generated file with the local
 * override layer on top — that layering is what actually renders, so it is
 * what Figma has to agree with.
 */
const effective = (selector: string) => ({
  ...declarations("app/_generated/tokens.css", selector),
  ...declarations("app/styles/tokens.css", selector),
});

const CASCADE = {
  dark: effective(":root"),
  light: effective('[data-theme="light"]'),
};

describe("colour tokens match Figma", () => {
  for (const scheme of ["dark", "light"] as const) {
    describe(scheme, () => {
      for (const [name, expected] of Object.entries(
        tokens.colors[scheme] as Record<string, string>,
      )) {
        it(`--${name} is ${expected}`, () => {
          expect(CASCADE[scheme][name]).toBe(expected);
        });
      }
    });
  }
});

describe("radius scale matches Figma", () => {
  for (const [step, expected] of Object.entries(
    tokens.radius as Record<string, string>,
  )) {
    it(`--radius-${step} is ${expected}`, () => {
      expect(CASCADE.dark[`radius-${step}`]).toBe(expected);
    });
  }
});

describe("component map points at real files", () => {
  const mapped: Array<{ figmaName: string; source: string }> = [
    ...componentMap.components,
    ...componentMap.frames,
    { figmaName: "landing copy", source: componentMap.copy.source },
  ];

  it("maps at least the landing surface", () => {
    expect(mapped.length).toBeGreaterThan(5);
  });

  for (const { figmaName, source } of mapped) {
    it(`${figmaName} → ${source} exists`, () => {
      expect(existsSync(path.join(REPO_ROOT, source))).toBe(true);
    });
  }

  it("every mapped node carries a Figma node id", () => {
    for (const entry of [...componentMap.components, ...componentMap.frames]) {
      expect(entry.nodeId).toMatch(/^\d+:\d+$/);
    }
  });
});
