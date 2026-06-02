import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appDir = path.resolve(__dirname, "../../..");
const toolDir = path.resolve(__dirname, "..");

describe("blackhole live lab", () => {
  it("is exposed as a local tuning command", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(appDir, "package.json"), "utf8"),
    );

    expect(packageJson.scripts["blackhole:lab"]).toBe(
      "node tools/blackhole-render/lab-server.mjs",
    );
  });

  it("renders live tuning controls for the configurable art direction", () => {
    const html = fs.readFileSync(path.join(toolDir, "index.html"), "utf8");

    expect(html).toContain("data-blackhole-lab");
    expect(html).toContain("three/webgpu");
    expect(html).toContain("bootstrap.mjs");
    expect(html).toContain("Core Radius");
    expect(html).toContain("Disk Intensity");
    expect(html).toContain("Spin Speed");
    expect(html).toContain("Tilt Up / Down");
    expect(html).toContain("Turn Left / Right");
    expect(html).toContain("Disk Spread");
    expect(html).toContain("Background Guides");
    expect(html).toContain("Save Config");
    expect(html).not.toContain("Order Object Count");
    expect(html).not.toContain("Proof Timing");
  });

  it("has a local lab server for saving config edits", () => {
    expect(fs.existsSync(path.join(toolDir, "lab-server.mjs"))).toBe(true);
  });

  it("preserves the vendored WebGPU renderer license", () => {
    const licensePath = path.join(
      toolDir,
      "vendor/dgreenheck-webgpu-black-hole/LICENSE",
    );

    expect(fs.readFileSync(licensePath, "utf8")).toContain("MIT License");
  });
});
