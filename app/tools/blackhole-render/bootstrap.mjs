const params = new URLSearchParams(window.location.search);

async function loadRenderer() {
  if (params.get("renderer") === "webgl") {
    document.body.dataset.renderer = "webgl";
    await import("./scene.mjs");
    return;
  }

  try {
    document.body.dataset.renderer = "webgpu";
    await import("./webgpu-scene.mjs");
  } catch (error) {
    console.warn("WebGPU blackhole renderer unavailable; falling back to WebGL.", error);
    document.body.dataset.renderer = "webgl";
    await import("./scene.mjs");
  }
}

await loadRenderer();
