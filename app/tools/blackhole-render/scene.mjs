import * as THREE from "/node_modules/three/build/three.module.js";

let config = await fetch(new URL("./config.json", import.meta.url)).then((response) => {
  if (!response.ok) throw new Error(`Unable to load config.json: ${response.status}`);
  return response.json();
});

const debug = new URLSearchParams(window.location.search).has("debug");
if (debug) document.body.dataset.debug = "true";

// Mirrored from omega-docs/03-brand/assets/tokens.json. Keep this renderer
// monochrome-zinc so the exported media stays Omega-native when consumed later.
const palette = {
  background: new THREE.Color("#09090b"),
  neutral900: new THREE.Color("#18181b"),
  neutral800: new THREE.Color("#27272a"),
  neutral500: new THREE.Color("#71717a"),
  neutral300: new THREE.Color("#d4d4d8"),
  foreground: new THREE.Color("#fafafa"),
};

const canvas = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
  preserveDrawingBuffer: true,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(palette.background, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  34,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(0, 0, config.artDirection.cameraDepth);
camera.lookAt(0, 0, 0);

function hashSeed(seed) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed) {
  let value = hashSeed(seed);
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(config.seed);

function smoothstep(edge0, edge1, value) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function easeOutCubic(value) {
  return 1 - (1 - value) ** 3;
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
}

function viewportToWorld(x, y, z = 0) {
  const distance = camera.position.z - z;
  const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance;
  const width = height * camera.aspect;
  return new THREE.Vector3((x - 0.5) * width, (0.5 - y) * height, z);
}

const blackholeMaterial = new THREE.ShaderMaterial({
  transparent: false,
  depthWrite: false,
  depthTest: false,
  uniforms: {
    uTime: { value: 0 },
    uDuration: { value: config.render.durationSeconds },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
    uCoreRadius: { value: config.artDirection.coreRadius },
    uDiskIntensity: { value: config.artDirection.diskIntensity },
    uLensingStrength: { value: config.artDirection.lensingStrength },
    uSpinSpeed: { value: config.artDirection.spinSpeed },
    uThemeTint: { value: config.artDirection.themeTint ?? 0.22 },
    uViewPitch: { value: config.artDirection.view?.pitchDegrees ?? 0 },
    uViewYaw: { value: config.artDirection.view?.yawDegrees ?? 0 },
    uViewZoom: { value: config.artDirection.view?.zoom ?? 1 },
    uDiskSpread: { value: config.artDirection.view?.diskSpread ?? 1 },
    uShowBackgroundGuides: { value: config.artDirection.showBackgroundGuides ? 1 : 0 },
    uShowRadiation: { value: config.artDirection.showRadiation ? 1 : 0 },
    uBackground: { value: palette.background },
    uForeground: { value: palette.foreground },
    uMuted: { value: palette.neutral500 },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;

    uniform float uTime;
    uniform float uDuration;
    uniform vec2 uResolution;
    uniform float uCoreRadius;
    uniform float uDiskIntensity;
    uniform float uLensingStrength;
    uniform float uSpinSpeed;
    uniform float uThemeTint;
    uniform float uViewPitch;
    uniform float uViewYaw;
    uniform float uViewZoom;
    uniform float uDiskSpread;
    uniform float uShowBackgroundGuides;
    uniform float uShowRadiation;
    uniform vec3 uBackground;
    uniform vec3 uForeground;
    uniform vec3 uMuted;

    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p = rot * p * 2.04 + 13.1;
        amplitude *= 0.5;
      }
      return value;
    }

    float hash3(vec3 p) {
      p = fract(p * 0.1031);
      p += dot(p, p.yzx + 33.33);
      return fract((p.x + p.y) * p.z);
    }

    float noise3(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      vec3 u = f * f * (3.0 - 2.0 * f);

      float a = hash3(i + vec3(0.0, 0.0, 0.0));
      float b = hash3(i + vec3(1.0, 0.0, 0.0));
      float c = hash3(i + vec3(0.0, 1.0, 0.0));
      float d = hash3(i + vec3(1.0, 1.0, 0.0));
      float e = hash3(i + vec3(0.0, 0.0, 1.0));
      float f1 = hash3(i + vec3(1.0, 0.0, 1.0));
      float g = hash3(i + vec3(0.0, 1.0, 1.0));
      float h = hash3(i + vec3(1.0, 1.0, 1.0));

      float xy0 = mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      float xy1 = mix(mix(e, f1, u.x), mix(g, h, u.x), u.y);
      return mix(xy0, xy1, u.z);
    }

    float fbm3(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      mat3 warp = mat3(
        0.0, 0.8, 0.6,
        -0.8, 0.36, -0.48,
        -0.6, -0.48, 0.64
      );
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise3(p);
        p = warp * p * 2.03 + vec3(9.1, 3.7, 5.2);
        amplitude *= 0.52;
      }
      return value;
    }

    mat2 rotate2d(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat2(c, -s, s, c);
    }

    float lineGrid(vec2 p, float scale, float width) {
      vec2 grid = abs(fract(p * scale - 0.5) - 0.5) / fwidth(p * scale);
      float line = min(grid.x, grid.y);
      return 1.0 - min(line, 1.0 / max(width, 0.001));
    }

    void main() {
      float loop = mod(uTime * uSpinSpeed, uDuration) / uDuration;
      vec2 uv = vUv;
      vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
      vec2 p = (uv - 0.5) * aspect / max(uViewZoom, 0.2);
      p.x += radians(uViewYaw) * p.y * 0.3;
      p.y += radians(uViewPitch) * 0.04;
      vec2 center = vec2(-0.03, 0.012);
      vec2 coreVec = p - center;
      float r = length(coreVec);
      vec3 warmTint = vec3(1.0, 0.88, 0.68);
      vec3 coolTint = vec3(0.78, 0.95, 0.86);
      vec3 tintedForeground = mix(uForeground, mix(warmTint, coolTint, 0.28), clamp(uThemeTint, 0.0, 0.45));
      vec2 diskPoint = rotate2d(-0.018 + radians(uViewYaw) * 0.12 + sin(loop * 6.283) * 0.004) * coreVec;
      diskPoint.y *= mix(4.4, 7.2, smoothstep(-18.0, 18.0, uViewPitch));
      float diskRadius = length(diskPoint);

      float bend = uLensingStrength * 0.024 / max(r, 0.035);
      vec2 bent = p - normalize(coreVec + 0.0001) * bend;

      vec3 color = uBackground;
      float grain = hash(gl_FragCoord.xy + floor(uTime * 24.0));
      color += tintedForeground * grain * 0.006;

      float grid = lineGrid(bent + vec2(sin(loop * 6.283) * 0.012, 0.0), 13.0, 1.4);
      float lensMask = smoothstep(0.64, 0.18, r);
      float diskBandOcclusion = 1.0 - exp(-pow((diskRadius - 0.47) / 0.16, 2.0)) * 0.92;
      color += tintedForeground * grid * 0.012 * lensMask * diskBandOcclusion * uShowBackgroundGuides;

      float halo = exp(-r * 3.8) * 0.2 + exp(-r * 12.0) * 0.14;
      color += tintedForeground * halo * 0.78;

      vec2 diskDir = diskPoint / max(diskRadius, 0.001);
      float diskAngle = atan(diskPoint.y, diskPoint.x);
      float diskInnerRadius = 0.24;
      float diskOuterRadius = 0.94 * uDiskSpread;
      float diskNorm = clamp((diskRadius - diskInnerRadius) / (diskOuterRadius - diskInnerRadius), 0.0, 1.0);
      float diskPlane = smoothstep(diskInnerRadius, diskInnerRadius + 0.028, diskRadius);
      diskPlane *= 1.0 - smoothstep(diskOuterRadius - 0.18, diskOuterRadius, diskRadius);

      float kepler = 1.0 / pow(max(diskRadius, 0.22), 1.48);
      float phaseA = uTime * uSpinSpeed * 2.4 * kepler;
      float phaseB = phaseA + 6.283;
      float cycle = fract(uTime * uSpinSpeed * 0.5);
      vec3 turbulenceA = vec3(
        diskRadius * 11.5,
        cos(diskAngle + phaseA) * 2.1,
        sin(diskAngle + phaseA) * 2.1
      );
      vec3 turbulenceB = vec3(
        diskRadius * 11.5 + 17.0,
        cos(diskAngle + phaseB) * 2.1,
        sin(diskAngle + phaseB) * 2.1
      );
      float diskNoise = mix(fbm3(turbulenceB), fbm3(turbulenceA), cycle);
      float fineNoise = fbm3(vec3(
        diskRadius * 29.0,
        cos(diskAngle + phaseA * 1.7) * 4.8,
        sin(diskAngle + phaseA * 1.7) * 4.8
      ));

      float heat = pow(1.0 - diskNorm, 1.75);
      float turbulence = mix(0.28, 1.02, smoothstep(0.18, 0.92, diskNoise));
      turbulence *= mix(0.82, 1.14, smoothstep(0.42, 0.9, fineNoise));
      float filaments = pow(smoothstep(0.52, 0.96, fineNoise + abs(diskDir.x) * 0.08), 2.3);
      float doppler = mix(0.72, 1.34, smoothstep(-0.52, 0.62, -diskDir.x));
      float frontLift = mix(0.64, 1.22, smoothstep(-0.08, 0.1, diskPoint.y));
      float innerRidge = exp(-pow((diskRadius - 0.36) / 0.034, 2.0));
      float broadDisk = exp(-pow((diskRadius - 0.56) / 0.16, 2.0)) * 0.42;
      float disk = diskPlane * (innerRidge + broadDisk);
      float diskLight = disk * turbulence * frontLift * doppler * (0.52 + heat * 0.82);
      color += tintedForeground * diskLight * uDiskIntensity * 0.46;
      color += tintedForeground * disk * filaments * frontLift * doppler * uDiskIntensity * 0.07;

      float lensedRadius = uCoreRadius * 1.54 * mix(0.92, 1.08, uDiskSpread);
      float lensedBand = exp(-pow((r - lensedRadius) / 0.074, 2.0));
      float verticalArcMask = smoothstep(0.018, 0.11, abs(coreVec.y));
      verticalArcMask *= 1.0 - smoothstep(0.42, 0.72, abs(coreVec.x));
      float lensedTexture = mix(0.82, 1.14, fbm3(vec3(coreVec * 8.0, loop * 4.0)));
      color += tintedForeground * lensedBand * verticalArcMask * lensedTexture * uDiskIntensity * 0.34;

      float photonRadius = uCoreRadius * 1.24;
      float ringInner = smoothstep(photonRadius - 0.005, photonRadius, r);
      float ringOuter = 1.0 - smoothstep(photonRadius, photonRadius + 0.01, r);
      float photonRing = ringInner * ringOuter;
      float photonTexture = mix(0.76, 1.1, fbm3(vec3(coreVec * 9.0, loop * 5.0)));
      float photonGlow = exp(-pow((r - photonRadius) / 0.024, 2.0));

      float core = smoothstep(uCoreRadius * 1.04, uCoreRadius * 0.99, r);
      color = mix(color, uBackground * 0.08, core);
      color += tintedForeground * (photonRing * 0.08 * photonTexture + photonGlow * 0.13);

      float frontPlaneNoise = fbm3(vec3(coreVec.x * 18.0 + loop * 0.8, coreVec.y * 42.0, loop * 2.0));
      float frontPlane = exp(-pow((coreVec.y + 0.003) / 0.008, 2.0));
      frontPlane *= 1.0 - smoothstep(0.74, 0.98, abs(coreVec.x));
      frontPlane *= mix(0.86, 1.16, frontPlaneNoise);
      color += tintedForeground * frontPlane * uDiskIntensity * 0.18;

      float exhaustGate = uShowRadiation * smoothstep(0.44, 0.62, loop) * (1.0 - smoothstep(0.9, 1.0, loop));
      float exhaustX = smoothstep(0.0, 0.78, p.x + 0.02);
      float exhaustWidth = 0.04 + 0.1 * exhaustX;
      float exhaustPath = abs(p.y - 0.018 * sin((p.x + loop) * 16.0));
      float exhaust = exp(-exhaustPath / exhaustWidth) * exhaustX * exhaustGate;
      float staticNoise = fbm(vec2(p.x * 18.0 - loop * 5.0, p.y * 22.0 + loop * 1.7));
      color += tintedForeground * exhaust * staticNoise * 0.1;

      float vignette = smoothstep(0.92, 0.2, length((uv - 0.5) * vec2(1.05, 0.78)));
      color *= 0.62 + vignette * 0.48;
      color = pow(color, vec3(0.92));

      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

const backgroundPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blackholeMaterial);
scene.add(backgroundPlane);

function setBackgroundGuideState(nextConfig) {
  document.body.dataset.backgroundGuides = String(Boolean(nextConfig.artDirection.showBackgroundGuides));
}

setBackgroundGuideState(config);

function roundedRectShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function makeRectMesh(width, height, radius, color, opacity) {
  const geometry = new THREE.ShapeGeometry(roundedRectShape(width, height, radius), 24);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
}

function makeMarker(width, height, color, opacity) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new THREE.Mesh(geometry, material);
}

function makePolygonMesh(points, color, opacity) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (const point of points.slice(1)) shape.lineTo(point[0], point[1]);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
}

function setGroupOpacity(group, opacity) {
  group.traverse((child) => {
    if (child.material) child.material.opacity = opacity * (child.userData.baseOpacity ?? 1);
  });
}

function makeOrderCard(index, primary = false) {
  const group = new THREE.Group();
  const width = primary ? 0.54 : 0.34;
  const height = primary ? 0.2 : 0.13;

  const edge = makeRectMesh(width + 0.05, height + 0.05, height * 0.18, palette.foreground, 0.18);
  edge.userData.baseOpacity = 0.18;
  edge.position.z = -0.002;
  group.add(edge);

  const body = makeRectMesh(width, height, height * 0.15, palette.neutral300, primary ? 0.62 : 0.5);
  body.userData.baseOpacity = primary ? 0.62 : 0.5;
  group.add(body);

  const seal = makeRectMesh(width * 0.3, height * 0.52, height * 0.1, palette.background, 0.58);
  seal.userData.baseOpacity = 0.58;
  seal.position.set(-width * 0.22, 0, 0.006);
  group.add(seal);

  const centerLine = makeMarker(width * 0.32, 0.01, palette.background, 0.44);
  centerLine.userData.baseOpacity = 0.44;
  centerLine.position.set(width * 0.12, 0.018, 0.008);
  group.add(centerLine);

  const lowerLine = makeMarker(width * 0.22, 0.007, palette.background, 0.32);
  lowerLine.userData.baseOpacity = 0.32;
  lowerLine.position.set(width * 0.16, -0.036, 0.008);
  group.add(lowerLine);

  for (let tick = 0; tick < 5; tick += 1) {
    const marker = makeMarker(0.006, height * (0.34 - tick * 0.025), palette.background, 0.34);
    marker.userData.baseOpacity = 0.34;
    marker.position.set(width * (-0.02 + tick * 0.055), height * 0.27, 0.009);
    group.add(marker);
  }

  const lock = makePolygonMesh(
    [
      [-0.026, 0],
      [0, 0.022],
      [0.026, 0],
      [0, -0.022],
    ],
    palette.background,
    0.56,
  );
  lock.userData.baseOpacity = 0.56;
  lock.position.set(width * 0.34, -height * 0.24, 0.01);
  group.add(lock);

  group.userData = {
    entryStartSeconds: primary ? 0.18 : 0.48 + index * 0.23 + random() * 0.28,
    travelSeconds: primary ? 4.75 : 3.65 + random() * 0.75,
    from: primary
      ? { x: 0.1, y: 0.62 }
      : {
          x: 0.09 + random() * 0.22,
          y: 0.2 + random() * 0.58,
        },
    controlA: {
      x: primary ? 0.28 : 0.22 + random() * 0.18,
      y: primary ? 0.52 : 0.18 + random() * 0.66,
    },
    controlB: {
      x: 0.4 + random() * 0.08,
      y: 0.4 + random() * 0.18,
    },
    endOffset: {
      x: (random() - 0.5) * 0.16,
      y: (random() - 0.5) * 0.1,
    },
    turn: index % 2 === 0 ? 1 : -1,
    scale: primary ? 1.22 : 0.78 + random() * 0.34,
    primary,
  };
  scene.add(group);
  return group;
}

const maxOrderObjectCount = Math.max(18, config.artDirection.orderObjectCount);
const orders = Array.from(
  { length: maxOrderObjectCount },
  (_, index) => makeOrderCard(index, index === 0),
);

function makeProofCapsule() {
  const group = new THREE.Group();
  const glow = makeRectMesh(0.88, 0.28, 0.14, palette.foreground, 0.14);
  glow.userData.baseOpacity = 0.14;
  glow.position.z = -0.01;
  group.add(glow);

  const shell = makeRectMesh(0.78, 0.22, 0.11, palette.neutral300, 0.58);
  shell.userData.baseOpacity = 0.58;
  group.add(shell);

  const core = makeRectMesh(0.62, 0.12, 0.06, palette.background, 0.82);
  core.userData.baseOpacity = 0.82;
  core.position.z = 0.004;
  group.add(core);

  const facet = makePolygonMesh(
    [
      [-0.12, 0],
      [-0.04, 0.055],
      [0.16, 0.055],
      [0.24, 0],
      [0.16, -0.055],
      [-0.04, -0.055],
    ],
    palette.foreground,
    0.18,
  );
  facet.userData.baseOpacity = 0.18;
  facet.position.z = 0.01;
  group.add(facet);

  for (let index = 0; index < 3; index += 1) {
    const marker = makeMarker(0.15 - index * 0.024, 0.006, palette.foreground, 0.34);
    marker.userData.baseOpacity = 0.34;
    marker.position.set(0.05 + index * 0.085, 0.04 - index * 0.04, 0.012);
    group.add(marker);
  }

  const leftSeal = makeRectMesh(0.12, 0.06, 0.03, palette.foreground, 0.3);
  leftSeal.userData.baseOpacity = 0.3;
  leftSeal.position.set(-0.23, 0, 0.012);
  group.add(leftSeal);

  const ringGeometry = new THREE.RingGeometry(0.19, 0.205, 96);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: palette.foreground,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.userData.baseOpacity = 0.14;
  ring.scale.set(1.8, 0.58, 1);
  ring.position.z = -0.006;
  group.add(ring);

  setGroupOpacity(group, 0);
  scene.add(group);
  return group;
}

const proofCapsule = makeProofCapsule();

const particleCount = Math.max(1800, config.artDirection.radiationParticleCount);
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleSeeds = Array.from({ length: particleCount }, () => ({
  lane: random() < 0.48 ? -1 : random() < 0.55 ? 0 : 1,
  phase: random(),
  angle: random() * Math.PI * 2,
  lift: random(),
  speed: 0.72 + random() * 0.54,
}));
particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({
  color: palette.foreground,
  size: 0.012,
  transparent: true,
  opacity: 0.54,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

const guideGroup = new THREE.Group();
for (let index = 0; index < 4; index += 1) {
  const geometry = new THREE.RingGeometry(0.68 + index * 0.22, 0.684 + index * 0.22, 160);
  const material = new THREE.MeshBasicMaterial({
    color: palette.foreground,
    transparent: true,
    opacity: 0.055 - index * 0.007,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.scale.set(1.7, 0.42, 1);
  ring.rotation.z = -0.16 + index * 0.02;
  guideGroup.add(ring);
}
scene.add(guideGroup);

function updateSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  blackholeMaterial.uniforms.uResolution.value.set(width * dpr, height * dpr);
}

function updateOrders(time) {
  if (!config.artDirection.showOrderObjects) {
    orders.forEach((order) => setGroupOpacity(order, 0));
    return;
  }

  const duration = config.render.durationSeconds;
  const center = viewportToWorld(
    config.artDirection.composition.horizonX,
    config.artDirection.composition.horizonY,
    0.45,
  );

  orders.forEach((order, index) => {
    if (index >= config.artDirection.orderObjectCount) {
      setGroupOpacity(order, 0);
      return;
    }

    const data = order.userData;
    const localSeconds = (time - data.entryStartSeconds + duration) % duration;
    const rawProgress = localSeconds / data.travelSeconds;
    if (rawProgress > 1.18) {
      setGroupOpacity(order, 0);
      return;
    }

    const progress = easeInOutCubic(Math.min(1, rawProgress));
    const from = viewportToWorld(data.from.x, data.from.y, 0.5);
    const controlA = viewportToWorld(data.controlA.x, data.controlA.y, 0.5);
    const controlB = viewportToWorld(data.controlB.x, data.controlB.y, 0.5);
    const end = new THREE.Vector3(
      center.x + data.endOffset.x,
      center.y + data.endOffset.y,
      0.5,
    );
    const a = from.clone().lerp(controlA, progress);
    const b = controlA.clone().lerp(controlB, progress);
    const c = controlB.clone().lerp(end, progress);
    const d = a.clone().lerp(b, progress);
    const e = b.clone().lerp(c, progress);
    const position = d.clone().lerp(e, progress);
    const curl = Math.sin(progress * Math.PI * 2.4 + index) * 0.08 * (1 - progress);
    order.position.set(position.x, position.y + curl, 0.5 + index * 0.002);

    const scale = data.scale * THREE.MathUtils.lerp(1.0, 0.2, smoothstep(0.72, 1.0, progress));
    order.scale.setScalar(scale);
    order.rotation.z =
      THREE.MathUtils.lerp(-0.28 * data.turn, 0.54 * data.turn, progress) +
      Math.sin(progress * Math.PI * 3 + index) * 0.11;
    const fadeIn = smoothstep(0.0, 0.1, rawProgress);
    const fadeOut = 1 - smoothstep(0.68, 1.02, rawProgress);
    const horizonOcclusion = 1 - smoothstep(0.76, 1.0, progress);
    setGroupOpacity(order, fadeIn * fadeOut * horizonOcclusion);
  });
}

function updateProofCapsule(time) {
  if (!config.artDirection.showProofCapsule) {
    setGroupOpacity(proofCapsule, 0);
    return;
  }

  const start = config.artDirection.proofExitSeconds - 1.05;
  const progress = smoothstep(start, config.artDirection.proofExitSeconds + 0.9, time);
  const exitFade =
    1 - smoothstep(config.render.durationSeconds - 1.18, config.render.durationSeconds - 0.28, time);
  const center = viewportToWorld(
    config.artDirection.composition.horizonX + 0.03,
    config.artDirection.composition.horizonY,
    0.8,
  );
  const exit = viewportToWorld(
    config.artDirection.composition.proofExitX,
    config.artDirection.composition.proofExitY,
    0.8,
  );
  const eased = easeOutCubic(progress);
  proofCapsule.position.lerpVectors(center, exit, eased);
  proofCapsule.position.y += Math.sin(progress * Math.PI) * 0.05;
  proofCapsule.rotation.z = THREE.MathUtils.lerp(-0.32, -0.04, eased);
  const scale = THREE.MathUtils.lerp(0.42, 1.22, eased);
  proofCapsule.scale.set(scale, scale, scale);
  setGroupOpacity(proofCapsule, smoothstep(0.04, 0.36, progress) * exitFade);
}

function updateParticles(time) {
  if (!config.artDirection.showRadiation) {
    for (let index = 0; index < particleCount; index += 1) {
      particlePositions[index * 3] = 0;
      particlePositions[index * 3 + 1] = 0;
      particlePositions[index * 3 + 2] = -20;
    }
    particleGeometry.attributes.position.needsUpdate = true;
    particleMaterial.opacity = 0;
    return;
  }

  const duration = config.render.durationSeconds;
  const outputGate = smoothstep(3.15, 4.9, time) * (1 - smoothstep(7.0, duration, time));
  const loop = time / duration;
  const center = viewportToWorld(
    config.artDirection.composition.horizonX + 0.02,
    config.artDirection.composition.horizonY,
    0.3,
  );

  for (let index = 0; index < particleCount; index += 1) {
    if (index >= config.artDirection.radiationParticleCount) {
      particlePositions[index * 3] = 0;
      particlePositions[index * 3 + 1] = 0;
      particlePositions[index * 3 + 2] = -20;
      continue;
    }

    const seed = particleSeeds[index];
    const phase = (seed.phase + loop * seed.speed) % 1;
    const spread = phase * phase;
    const curl = seed.angle + phase * 5.2 + loop * 1.7;
    const stream = seed.lane * 0.19;
    const x = center.x + 0.18 + spread * 4.6 + Math.cos(curl) * (0.04 + spread * 0.22);
    const y =
      center.y +
      stream +
      Math.sin(curl * 1.3) * (0.04 + spread * 0.24) +
      (seed.lift - 0.5) * spread * 0.54;
    const z = 0.32 + (seed.lift - 0.5) * 0.18;
    const visible = outputGate * (1 - smoothstep(0.9, 1.0, phase));

    particlePositions[index * 3] = x;
    particlePositions[index * 3 + 1] = y;
    particlePositions[index * 3 + 2] = visible > 0.02 ? z : -20;
  }

  particleGeometry.attributes.position.needsUpdate = true;
  particleMaterial.opacity = 0.08 + outputGate * 0.58;
}

function renderAt(seconds) {
  const duration = config.render.durationSeconds;
  const time = ((seconds % duration) + duration) % duration;
  updateSize();
  blackholeMaterial.uniforms.uTime.value = time;
  guideGroup.visible = Boolean(config.artDirection.showBackgroundGuides);
  guideGroup.rotation.z = -0.06 + Math.sin((time / duration) * Math.PI * 2) * 0.06;
  updateOrders(time);
  updateProofCapsule(time);
  updateParticles(time);
  renderer.render(scene, camera);
  return true;
}

window.addEventListener("resize", () => renderAt(0));

function updateConfig(nextConfig) {
  config = structuredClone(nextConfig);
  window.__omegaBlackhole.config = config;
  blackholeMaterial.uniforms.uDuration.value = config.render.durationSeconds;
  blackholeMaterial.uniforms.uCoreRadius.value = config.artDirection.coreRadius;
  blackholeMaterial.uniforms.uDiskIntensity.value = config.artDirection.diskIntensity;
  blackholeMaterial.uniforms.uLensingStrength.value = config.artDirection.lensingStrength;
  blackholeMaterial.uniforms.uSpinSpeed.value = config.artDirection.spinSpeed;
  blackholeMaterial.uniforms.uThemeTint.value = config.artDirection.themeTint ?? 0.22;
  blackholeMaterial.uniforms.uViewPitch.value = config.artDirection.view?.pitchDegrees ?? 0;
  blackholeMaterial.uniforms.uViewYaw.value = config.artDirection.view?.yawDegrees ?? 0;
  blackholeMaterial.uniforms.uViewZoom.value = config.artDirection.view?.zoom ?? 1;
  blackholeMaterial.uniforms.uDiskSpread.value = config.artDirection.view?.diskSpread ?? 1;
  blackholeMaterial.uniforms.uShowBackgroundGuides.value = config.artDirection.showBackgroundGuides ? 1 : 0;
  blackholeMaterial.uniforms.uShowRadiation.value = config.artDirection.showRadiation ? 1 : 0;
  setBackgroundGuideState(config);
}

window.__omegaBlackhole = {
  ready: true,
  config,
  renderAt,
  updateConfig,
};

renderAt(0);
window.dispatchEvent(new CustomEvent("omega-blackhole-ready"));
