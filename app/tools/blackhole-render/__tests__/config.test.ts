import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const toolDir = path.resolve(__dirname, "..");
const configPath = path.join(toolDir, "config.json");

function readConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

describe("blackhole render config", () => {
  it("defines a deterministic desktop hero asset target", () => {
    const config = readConfig();

    expect(config.seed).toBe("omega-blackhole-m8-v1");
    expect(config.render.durationSeconds).toBeGreaterThanOrEqual(6);
    expect(config.render.durationSeconds).toBeLessThanOrEqual(10);
    expect(config.render.fps).toBe(24);
    expect(config.render.desktop.width).toBeGreaterThanOrEqual(1920);
    expect(config.render.desktop.height).toBeGreaterThanOrEqual(1080);
    expect(config.render.outputs.desktop.webm).toBe(
      "omega-blackhole-hero-desktop.webm",
    );
    expect(config.render.outputs.desktop.mp4).toBe(
      "omega-blackhole-hero-desktop.mp4",
    );
    expect(config.render.outputs.desktop.poster).toBe(
      "omega-blackhole-hero-poster.png",
    );
  });

  it("keeps the live lab focused on the blackhole before narrative objects return", () => {
    const config = readConfig();

    expect(config.narrative.visibleTextLabels).toBe(false);
    expect(config.artDirection.showOrderObjects).toBe(false);
    expect(config.artDirection.showRadiation).toBe(false);
    expect(config.artDirection.showProofCapsule).toBe(false);
    expect(typeof config.artDirection.showBackgroundGuides).toBe("boolean");
    expect(config.artDirection.spinSpeed).toBeLessThanOrEqual(0.2);
    expect(config.artDirection.view).toMatchObject({
      pitchDegrees: expect.any(Number),
      yawDegrees: expect.any(Number),
      zoom: expect.any(Number),
      diskSpread: expect.any(Number),
    });
  });
});
