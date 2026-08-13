import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../..");

describe("production build inputs", () => {
  it("builds from versioned app sources without the external token repository", () => {
    const rootPackage = JSON.parse(
      readFileSync(path.join(repoRoot, "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    const appPackage = JSON.parse(
      readFileSync(path.join(repoRoot, "app/package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    const globals = readFileSync(
      path.join(repoRoot, "app/app/globals.css"),
      "utf8",
    );
    const tokenLayer = readFileSync(
      path.join(repoRoot, "app/app/styles/tokens.css"),
      "utf8",
    );
    const generatedTokens = readFileSync(
      path.join(repoRoot, "app/app/_generated/tokens.css"),
      "utf8",
    );

    expect(rootPackage.scripts.build).toBe("pnpm --filter @omega/app build");
    expect(appPackage.scripts.build).toBe("next build");
    expect(globals).toMatch(/@import\s+["']\.\/styles\/tokens\.css["']/);
    expect(tokenLayer).toMatch(/@import\s+["']\.\.\/_generated\/tokens\.css["']/);
    expect(generatedTokens).toContain("GENERATED FILE");
  });
});
