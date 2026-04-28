import type { TestRunnerConfig } from "@storybook/test-runner";
import { waitForPageReady } from "@storybook/test-runner";
import { toMatchImageSnapshot } from "jest-image-snapshot";

/**
 * Visual regression baseline for the Omega design system.
 *
 * Boots every story under Chromium via @storybook/test-runner, captures a
 * screenshot, and diffs against the committed baseline under
 * `app/__snapshots__/`. A run fails when a story's pixel diff exceeds the
 * configured threshold — that's the regression signal.
 *
 * Run:
 *   pnpm test:visual          → diff against baseline (fails on regression)
 *   pnpm test:visual:update   → accept current state as the new baseline
 *
 * Re-run `:update` whenever a primitive's visual contract intentionally
 * changes; commit the resulting PNG churn alongside the code change so the
 * diff in review tells the full story.
 *
 * Single-browser (Chromium) for V1. Cross-browser visual coverage is M7.
 */

const customSnapshotsDir = `${process.cwd()}/__snapshots__`;

const config: TestRunnerConfig = {
  setup() {
    // jest-image-snapshot piggybacks on jest's `expect` — register the matcher
    // before any test runs.
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Block until fonts, network, and the iframe's hydration settle. Without
    // this, screenshots race the first paint and produce flaky baselines.
    await waitForPageReady(page);
    // Small extra buffer for any motion/animation library landing in its
    // final state. `animations: 'disabled'` below freezes CSS/web animations
    // for the actual capture; this buffer just covers the JS-driven layout
    // settle (e.g., motion's initial mount springs).
    await page.waitForTimeout(150);

    const image = await page.screenshot({ animations: "disabled" });
    expect(image).toMatchImageSnapshot({
      customSnapshotsDir,
      customSnapshotIdentifier: context.id,
      // Allow 0.1% pixel drift before failing — accommodates font
      // anti-aliasing differences across machines without hiding real
      // regressions. Tighten in M7 once we have a stable CI runner.
      failureThreshold: 0.001,
      failureThresholdType: "percent",
    });
  },
};

export default config;
