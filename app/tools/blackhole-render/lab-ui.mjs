const status = document.querySelector("[data-lab-status]");
const controls = Array.from(document.querySelectorAll("[data-config-path]"));
const toggles = Array.from(document.querySelectorAll("[data-config-toggle]"));
const configUrl = new URL("./config.json", import.meta.url);
const valueLabels = new Map(
  Array.from(document.querySelectorAll("[data-lab-value]")).map((element) => [
    element.dataset.labValue,
    element,
  ]),
);
const toggleLabels = new Map(
  Array.from(document.querySelectorAll("[data-toggle-label]")).map((element) => [
    element.dataset.toggleLabel,
    element,
  ]),
);

let draftConfig = null;
let currentTime = 0;
let lastFrameAt = null;

if (new URLSearchParams(window.location.search).has("capture")) {
  document.querySelector("[data-blackhole-lab]")?.remove();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function setStatus(message) {
  if (status) status.textContent = message;
}

function getByPath(target, path) {
  return path.split(".").reduce((current, key) => current?.[key], target);
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  let current = target;
  for (const key of parts.slice(0, -1)) {
    current = current[key];
  }
  current[parts.at(-1)] = value;
}

function formatValue(value) {
  if (Number.isInteger(value)) return String(value);
  return Number(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function syncControls() {
  for (const input of controls) {
    const value = getByPath(draftConfig, input.dataset.configPath);
    input.value = String(value);
    valueLabels.get(input.dataset.configPath).textContent = formatValue(value);
  }

  for (const button of toggles) {
    const value = Boolean(getByPath(draftConfig, button.dataset.configToggle));
    button.setAttribute("aria-pressed", String(value));
    toggleLabels.get(button.dataset.configToggle).textContent = value ? "Shown" : "Hidden";
  }
}

function applyDraft() {
  if (new URLSearchParams(window.location.search).has("capture")) return;
  window.__omegaBlackhole.updateConfig(draftConfig);
  window.__omegaBlackhole.renderAt(currentTime);
}

async function loadConfig() {
  const response = await fetch(configUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`Config load failed: ${response.status}`);
  draftConfig = await response.json();
  syncControls();
  applyDraft();
  setStatus("Live");
}

for (const input of controls) {
  input.addEventListener("input", () => {
    const value = input.step === "1" || Number(input.step) >= 1 ? Number.parseInt(input.value, 10) : Number(input.value);
    setByPath(draftConfig, input.dataset.configPath, value);
    valueLabels.get(input.dataset.configPath).textContent = formatValue(value);
    applyDraft();
    setStatus("Unsaved");
  });
}

for (const button of toggles) {
  button.addEventListener("click", () => {
    const path = button.dataset.configToggle;
    setByPath(draftConfig, path, !Boolean(getByPath(draftConfig, path)));
    syncControls();
    applyDraft();
    setStatus("Unsaved");
  });
}

document.querySelector("[data-save-config]")?.addEventListener("click", async () => {
  setStatus("Saving");
  const response = await fetch("/api/config", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(draftConfig),
  });

  if (!response.ok) {
    setStatus("Save failed");
    return;
  }

  draftConfig = await response.json();
  syncControls();
  applyDraft();
  setStatus("Saved");
});

document.querySelector("[data-reset-config]")?.addEventListener("click", async () => {
  setStatus("Reloading");
  await loadConfig();
});

function tick(now) {
  if (new URLSearchParams(window.location.search).has("capture")) return;
  const deltaSeconds = lastFrameAt == null ? 0 : (now - lastFrameAt) / 1000;
  lastFrameAt = now;
  currentTime = (currentTime + deltaSeconds) % draftConfig.render.durationSeconds;
  window.__omegaBlackhole.renderAt(currentTime);
  window.requestAnimationFrame(tick);
}

function startLab() {
  if (new URLSearchParams(window.location.search).has("capture")) return;
  draftConfig = clone(window.__omegaBlackhole.config);
  syncControls();
  tick();
}

if (window.__omegaBlackhole?.ready) {
  startLab();
} else {
  window.addEventListener("omega-blackhole-ready", startLab, { once: true });
}
