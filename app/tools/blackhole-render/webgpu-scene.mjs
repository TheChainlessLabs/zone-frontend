import * as THREE from "three/webgpu";
import { pass } from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { BlackHoleSimulation } from "./vendor/dgreenheck-webgpu-black-hole/blackhole.js";

if (!navigator.gpu) {
  throw new Error("WebGPU is not available in this browser.");
}

let config = await fetch(new URL("./config.json", import.meta.url)).then((response) => {
  if (!response.ok) throw new Error(`Unable to load config.json: ${response.status}`);
  return response.json();
});

const canvas = document.getElementById("stage");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#030303");

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGPURenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.setClearColor("#030303", 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.domElement.style.filter = "grayscale(1) saturate(0) contrast(1.16) brightness(1)";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mapArtDirection(nextConfig) {
  const art = nextConfig.artDirection;
  const view = art.view ?? {};
  const coreRadius = clamp(art.coreRadius ?? 0.128, 0.1, 0.24);
  const diskIntensity = clamp(art.diskIntensity ?? 0.72, 0.25, 1.25);
  const lensingStrength = clamp(art.lensingStrength ?? 0.38, 0.1, 1.25);
  const spinSpeed = clamp(art.spinSpeed ?? 0.08, 0, 0.25);
  const diskSpread = clamp(view.diskSpread ?? 1, 0.7, 1.5);

  return {
    blackHoleMass: THREE.MathUtils.mapLinear(coreRadius, 0.11, 0.24, 0.54, 0.92),
    diskInnerRadius: 5.2,
    diskOuterRadius: 15.5 * diskSpread,
    diskTemperature: 6.0,
    temperatureFalloff: 0.62,
    diskBrightness: THREE.MathUtils.mapLinear(diskIntensity, 0.35, 1.15, 2.55, 5.45),
    diskRotationSpeed: -THREE.MathUtils.mapLinear(spinSpeed, 0, 0.25, 0.0, 72.0),
    turbulenceScale: 2.15,
    turbulenceStretch: 0.5,
    turbulenceSharpness: 1.42,
    turbulenceCycleTime: 3.8,
    turbulenceLacunarity: 2.42,
    turbulencePersistence: 0.54,
    diskEdgeSoftnessInner: 0.18,
    diskEdgeSoftnessOuter: 0.78,
    gravitationalLensing: THREE.MathUtils.mapLinear(lensingStrength, 0.25, 1.25, 1.85, 3.35),
    dopplerStrength: 0.72,
    stepSize: 0.72,
    starsEnabled: false,
    starBackgroundColor: "#000001",
    starDensity: 0,
    starSize: 1.1,
    starBrightness: 0,
    nebulaEnabled: false,
    nebula1Scale: 2.2,
    nebula1Density: 0,
    nebula1Brightness: 0,
    nebula1Color: "#18181b",
    nebula2Scale: 5.5,
    nebula2Density: 0,
    nebula2Brightness: 0,
    nebula2Color: "#27272a",
    bloomStrength: THREE.MathUtils.mapLinear(diskIntensity, 0.35, 1.15, 0.16, 0.34),
    bloomRadius: 0.3,
    bloomThreshold: 0.68,
  };
}

function setCameraFromConfig(nextConfig) {
  const view = nextConfig.artDirection.view ?? {};
  const composition = nextConfig.artDirection.composition;
  const x = THREE.MathUtils.mapLinear(composition.horizonX ?? 0.5, 0.36, 0.56, 1.5, -1.5);
  const y = THREE.MathUtils.mapLinear(composition.horizonY ?? 0.5, 0.38, 0.6, -1.0, 1.0);
  const pitch = THREE.MathUtils.degToRad(-1.8 + clamp(view.pitchDegrees ?? 0, -18, 18));
  const yaw = THREE.MathUtils.degToRad(clamp(view.yawDegrees ?? 0, -36, 36));
  const zoom = clamp(view.zoom ?? 1, 0.65, 1.65);
  const distance = 26 / zoom;
  const target = new THREE.Vector3(x * 0.1, y * 0.2, 0);
  camera.position.set(
    target.x + Math.sin(yaw) * Math.cos(pitch) * distance,
    target.y + Math.sin(pitch) * distance,
    Math.cos(yaw) * Math.cos(pitch) * distance,
  );
  camera.lookAt(target);
  camera.fov = THREE.MathUtils.mapLinear(zoom, 0.65, 1.65, 56, 40);
  camera.updateProjectionMatrix();
}

function setBackgroundGuideState(nextConfig) {
  document.body.dataset.backgroundGuides = String(Boolean(nextConfig.artDirection.showBackgroundGuides));
}

let simulationConfig = mapArtDirection(config);
setBackgroundGuideState(config);
setCameraFromConfig(config);

const blackHoleSimulation = new BlackHoleSimulation(scene, simulationConfig);
blackHoleSimulation.createBlackHole();

await renderer.init();

const postProcessing = new THREE.PostProcessing(renderer);
const scenePass = pass(scene, camera);
const scenePassColor = scenePass.getTextureNode();
const bloomPassNode = bloom(scenePassColor);
postProcessing.outputNode = scenePassColor.add(bloomPassNode);

function applyPostProcessing() {
  bloomPassNode.threshold.value = simulationConfig.bloomThreshold;
  bloomPassNode.strength.value = simulationConfig.bloomStrength;
  bloomPassNode.radius.value = simulationConfig.bloomRadius;
  renderer.domElement.style.filter = "grayscale(1) saturate(0) contrast(1.16) brightness(1)";
}

function updateSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  blackHoleSimulation.onResize(width, height);
}

function renderAt(seconds) {
  updateSize();
  blackHoleSimulation.uniforms.time.value = seconds;
  blackHoleSimulation.updateCamera(camera);
  postProcessing.render();
  return true;
}

function updateConfig(nextConfig) {
  config = structuredClone(nextConfig);
  window.__omegaBlackhole.config = config;
  simulationConfig = mapArtDirection(config);
  setBackgroundGuideState(config);
  setCameraFromConfig(config);
  blackHoleSimulation.updateUniforms(simulationConfig);
  applyPostProcessing();
}

applyPostProcessing();
window.addEventListener("resize", () => renderAt(0));

window.__omegaBlackhole = {
  ready: true,
  renderer: "webgpu",
  config,
  renderAt,
  updateConfig,
};

renderAt(0);
window.dispatchEvent(new CustomEvent("omega-blackhole-ready"));
