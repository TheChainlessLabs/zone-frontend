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

  it("returns four distinct scene states", () => {
    expect(getSceneState(0).activeStep).toBe("private-order");
    expect(getSceneState(0.24).activeStep).toBe("midpoint-match");
    expect(getSceneState(0.5).activeStep).toBe("batch-proof");
    expect(getSceneState(0.78).activeStep).toBe("onchain-settlement");
  });

  it("keeps order motion continuous across segment boundaries", () => {
    const beforeMidpoint = getSceneState(0.329).orderPosition.xPercent;
    const afterMidpoint = getSceneState(0.331).orderPosition.xPercent;
    const beforeProof = getSceneState(0.659).orderPosition.xPercent;
    const afterProof = getSceneState(0.661).orderPosition.xPercent;

    expect(Math.abs(afterMidpoint - beforeMidpoint)).toBeLessThan(1);
    expect(Math.abs(afterProof - beforeProof)).toBeLessThan(1);
  });

  it("reveals Tempo blocks, includes the proof, then finalizes after two newer blocks", () => {
    expect(getSceneState(0.66).tempoBlocks.length).toBe(1);
    expect(getSceneState(0.82).tempoBlocks.some((block) => block.containsSettlement)).toBe(true);

    const pendingProof = getSceneState(0.84).tempoBlocks.find((block) => block.containsSettlement);
    const finalizedProof = getSceneState(0.96).tempoBlocks.find((block) => block.containsSettlement);

    expect(pendingProof?.status).toBe("carrying-proof");
    expect(finalizedProof?.status).toBe("finalized-proof");
  });

  it("shows privacy radiation only during the blackhole-to-proof transition", () => {
    expect(getSceneState(0.12).radiationOpacity).toBe(0);
    expect(getSceneState(0.5).radiationOpacity).toBeGreaterThan(0.6);
    expect(getSceneState(0.92).radiationOpacity).toBe(0);
  });

  it("opens an exit aperture while the proof capsule resolves", () => {
    expect(getSceneState(0.36).apertureOpacity).toBe(0);
    expect(getSceneState(0.58).apertureOpacity).toBeGreaterThan(0.5);
    expect(getSceneState(0.94).apertureOpacity).toBe(0);
  });

  it("damps toward a target without overshooting", () => {
    const next = damp(0, 1, 0.016, 14);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });
});
