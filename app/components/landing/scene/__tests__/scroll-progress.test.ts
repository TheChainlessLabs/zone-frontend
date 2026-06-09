import { describe, expect, it } from "vitest";

import {
  clamp01,
  damp,
  getSceneState,
  interpolate,
  mapScrollToProgress,
} from "@/components/landing/scene/scroll-progress";

describe("landing scroll progress helpers", () => {
  it("clamps values to the 0..1 range", () => {
    expect(clamp01(-0.2)).toBe(0);
    expect(clamp01(0.42)).toBe(0.42);
    expect(clamp01(1.8)).toBe(1);
  });

  it("maps window scroll to section progress", () => {
    expect(
      mapScrollToProgress({
        scrollY: 100,
        sectionTop: 100,
        sectionHeight: 1000,
        viewportHeight: 500,
      }),
    ).toBe(0);
    expect(
      mapScrollToProgress({
        scrollY: 350,
        sectionTop: 100,
        sectionHeight: 1000,
        viewportHeight: 500,
      }),
    ).toBe(0.5);
    expect(
      mapScrollToProgress({
        scrollY: 600,
        sectionTop: 100,
        sectionHeight: 1000,
        viewportHeight: 500,
      }),
    ).toBe(1);
  });

  it("interpolates between numeric values", () => {
    expect(interpolate(10, 20, 0)).toBe(10);
    expect(interpolate(10, 20, 0.5)).toBe(15);
    expect(interpolate(10, 20, 1)).toBe(20);
  });

  it("advances through four evenly-spaced scene states", () => {
    expect(getSceneState(0).activeStep).toBe("intent");
    expect(getSceneState(0.1).activeStep).toBe("intent");
    expect(getSceneState(0.3).activeStep).toBe("matching");
    expect(getSceneState(0.6).activeStep).toBe("liquidity");
    expect(getSceneState(0.9).activeStep).toBe("execution");
  });

  it("indexes each state in order", () => {
    expect(getSceneState(0).index).toBe(0);
    expect(getSceneState(0.99).index).toBe(3);
  });

  it("drops the sealed order into the core after the first phase", () => {
    expect(getSceneState(0.05).orderFalling).toBe(true);
    expect(getSceneState(0.5).orderFalling).toBe(false);
  });

  it("emits the proof capsule and radiation noise during the liquidity phase", () => {
    expect(getSceneState(0.3).proof).toBe(0);
    expect(getSceneState(0.3).noise).toBe(0);
    expect(getSceneState(0.62).proof).toBeGreaterThan(0);
    expect(getSceneState(0.62).noise).toBeGreaterThan(0);
  });

  it("finalizes Tempo blocks only in the final execution phase", () => {
    expect(getSceneState(0.5).tempo).toBe(0);
    expect(getSceneState(0.9).tempo).toBeGreaterThan(0);
  });

  it("damps toward a target without overshooting", () => {
    const next = damp(0, 1, 0.016, 14);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });
});
