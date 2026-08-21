"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const STEPS_DESKTOP = 240;
const STEPS_MOBILE = 150;

const CONFIG = {
  autoRotate: 0.04,
  exposure: 1.3,
  camera: { distance: 15.5, elevation: 0.4, azimuth: 0.8 },
  maxPixelRatio: 1.5,
  // Asteroids spiral from the spawn shell down into the horizon.
  asteroid: {
    maxCount: 14,
    spawnEveryMs: 800,
    scale: { min: 0.09, max: 0.22 },
    spawnRadius: { min: 12.0, max: 18.0 },
    speed: { min: 1.8, max: 3.0 },
    aimSpread: 0.9,
    captureRadius: 1.7,
    shrinkRadius: 4.0,
  },
};

const PALETTES = {
  mono: {
    hot: [1.0, 1.0, 1.0],
    mid: [0.93, 0.93, 0.95],
    outer: [0.42, 0.42, 0.46],
    glow: [1.0, 1.0, 1.0],
  },
};

interface AsteroidData {
  velocity: THREE.Vector3;
  baseScale: number;
  tumble: THREE.Vector3;
  mesh: THREE.Mesh;
  tail: THREE.Mesh;
  tailDir: THREE.Vector3;
  tailLen: number;
  tailRadius: number;
}

export function BlackholeScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef({
    az: CONFIG.camera.azimuth,
    el: CONFIG.camera.elevation,
    dist: CONFIG.camera.distance,
    tAz: CONFIG.camera.azimuth,
    tEl: CONFIG.camera.elevation,
    tDist: CONFIG.camera.distance,
  });
  const uniformsRef = useRef<Record<string, THREE.Uniform> | null>(null);
  const timeRef = useRef(0);
  const asteroidsRef = useRef<AsteroidData[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const STEPS = isCoarse ? STEPS_MOBILE : STEPS_DESKTOP;
    const pal = PALETTES.mono;

    const vertexShader = `void main() { gl_Position = vec4(position, 1.0); }`;

    const fragmentShader = `
precision highp float;

uniform vec2  uRes;
uniform vec2  uCenterPx;
uniform float uTime;
uniform vec3  uCamPos;
uniform float uExposure;
uniform vec3  uColHot;
uniform vec3  uColMid;
uniform vec3  uColOuter;
uniform vec3  uColGlow;

const int   STEPS    = ${STEPS};
const float DISK_IN  = 2.4;
const float DISK_OUT = 9.5;
const float ESCAPE_R = 42.0;

float hash12(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

vec4 diskShade(vec3 hit, vec3 rd) {
  float hr = length(hit.xz);
  float t  = clamp((hr - DISK_IN) / (DISK_OUT - DISK_IN), 0.0, 1.0);

  float om = 2.0 / (pow(hr, 1.5) + 0.4);
  float th = uTime * om;
  float co = cos(th);
  float si = sin(th);
  vec2 q = vec2(co * hit.x + si * hit.z, -si * hit.x + co * hit.z);

  float n1 = fbm(q * 0.45 + vec2(3.7, 1.3));
  float n2 = fbm(q * 1.30 + n1 * 1.2);
  float filaments = n1 * 0.45 + n2 * 0.35;
  float density = smoothstep(0.05, 0.85, filaments) + 0.38;
  density *= 0.72 + 0.55 * fbm(vec2(hr * 4.5, filaments * 1.2));

  float fadeIn  = smoothstep(DISK_IN - 0.4, DISK_IN + 0.9, hr);
  float fadeOut = 1.0 - smoothstep(DISK_OUT - 3.5, DISK_OUT, hr);

  vec3 ccol = mix(uColHot, uColMid, smoothstep(0.0, 0.35, t));
  ccol = mix(ccol, uColOuter, smoothstep(0.30, 1.0, t));

  float br = mix(3.5, 0.5, pow(t, 0.7));
  br += 1.4 * exp(-(hr - DISK_IN) * (hr - DISK_IN) * 1.2);

  vec3 vd = normalize(vec3(-hit.z, 0.0, hit.x));
  float dop = dot(vd, -rd);
  float dopf = mix(0.78, 1.45, smoothstep(-0.9, 0.9, dop));
  ccol = mix(ccol, uColHot, clamp(dop * 0.2, 0.0, 0.25));

  float alpha = clamp(density * fadeIn * fadeOut, 0.0, 1.0) * 0.95;
  return vec4(ccol * br * dopf * alpha, alpha);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - uCenterPx) / uRes.y;
  uv *= 3.0;

  vec3 ro = uCamPos;
  vec3 fw = normalize(-ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);

  float FL = 1.6;
  vec3 rd = normalize(fw * FL + uv.x * rt + uv.y * up);

  vec3 hv = cross(ro, rd);
  float h2 = dot(hv, hv);

  vec3 pos = ro;
  vec3 dir = rd;
  vec3 colAcc = vec3(0.0);
  float aAcc = 0.0;

  for (int i = 0; i < STEPS; i++) {
    float r2 = dot(pos, pos);
    float r = sqrt(r2);

    if (r < 1.0) { break; }
    if (r > ESCAPE_R && dot(pos, dir) > 0.0) { break; }

    float dt = clamp(r * 0.12, 0.045, 0.5);
    vec3 accel = -1.5 * h2 * pos / pow(r2, 2.5);
    dir += accel * dt;
    vec3 npos = pos + dir * dt;

    if (pos.y * npos.y < 0.0 && aAcc < 0.98) {
      float f = pos.y / (pos.y - npos.y);
      vec3 hit = mix(pos, npos, f);
      float hr = length(hit.xz);
      if (hr > DISK_IN - 0.5 && hr < DISK_OUT) {
        vec4 d = diskShade(hit, normalize(dir));
        colAcc += (1.0 - aAcc) * d.rgb;
        aAcc += (1.0 - aAcc) * d.a;
      }
    }
    pos = npos;
  }

  vec3 col = colAcc;
  col = pow(1.0 - exp(-col * uExposure), vec3(0.9));
  col *= 1.0 - 0.15 * smoothstep(0.55, 1.25, length(uv));

  gl_FragColor = vec4(col, 1.0);
}
`;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Degrade to the plain dark background when WebGL is unavailable
    // (old hardware, disabled contexts, jsdom).
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 1);
    renderer.autoClear = true;
    container.appendChild(renderer.domElement);

    // ===== STARFIELD =====
    const starsGeometry = new THREE.BufferGeometry();
    const starsPositions = new Float32Array(3000);
    const starsBrightness = new Float32Array(1000);

    for (let i = 0; i < 1000; i++) {
      const idx = i * 3;
      starsPositions[idx] = (Math.random() - 0.5) * 500;
      starsPositions[idx + 1] = (Math.random() - 0.5) * 500;
      starsPositions[idx + 2] = (Math.random() - 0.5) * 500;
      starsBrightness[i] = Math.random();
    }

    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute("brightness", new THREE.BufferAttribute(starsBrightness, 1));

    const starsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float brightness;
        varying float vBrightness;

        void main() {
          vBrightness = brightness;
          gl_PointSize = 1.0 + brightness * 2.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying float vBrightness;

        void main() {
          float twinkle = sin(time * 2.0 + vBrightness * 6.28) * 0.2 + 0.8;
          gl_FragColor = vec4(0.95, 0.98, 1.0, twinkle * vBrightness * 1.2);
        }
      `,
      transparent: true,
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // ===== ASTEROIDS =====
    // Lumpy rock: a squashed icosahedron with position-hashed radial
    // displacement (shared verts hash identically, so no cracks) and flat
    // shading for hard facets.
    const rockGeometry = () => {
      const g = new THREE.IcosahedronGeometry(1, 1).toNonIndexed();
      g.scale(1, 0.7 + Math.random() * 0.5, 0.78 + Math.random() * 0.42);
      const pos = g.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const seed =
          Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719) * 43758.5453;
        const f = 0.76 + (seed - Math.floor(seed)) * 0.52;
        pos.setXYZ(i, v.x * f, v.y * f, v.z * f);
      }
      g.computeVertexNormals();
      return g;
    };
    const asteroidGeometries = Array.from({ length: 6 }, rockGeometry);

    // Mono rock — lit primarily by the point light at the singularity so the
    // debris reads as catching the disk's glow.
    const asteroidMaterial = new THREE.MeshPhongMaterial({
      color: 0xb2b2b8,
      emissive: 0x121214,
      shininess: 24,
      flatShading: true,
    });

    // Meteor streak — one shared unit cone (apex trailing) with an additive
    // white gradient that is brightest at the rock and dies out along the
    // tail. Scaled per-asteroid; orientation is fixed at spawn since each
    // rock's velocity is constant.
    const tailGeometry = new THREE.ConeGeometry(1, 1, 8, 1, true);
    const tailMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying float vAlong;
        void main() {
          vAlong = position.y + 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float vAlong;
        void main() {
          float a = pow(1.0 - vAlong, 1.8) * 0.5;
          gl_FragColor = vec4(vec3(0.92, 0.94, 1.0) * a, 1.0);
        }
      `,
    });

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const coreLight = new THREE.PointLight(0xffffff, 3.0, 0, 1.2);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(14, 18, 12);
    scene.add(keyLight);

    const A = CONFIG.asteroid;

    // `progress` (0..1) starts an asteroid partway along its flight so the
    // scene is populated on first paint instead of building up over minutes.
    const spawnAsteroid = (progress = 0) => {
      if (asteroidsRef.current.length >= A.maxCount) return;

      const geometry =
        asteroidGeometries[Math.floor(Math.random() * asteroidGeometries.length)];
      const asteroid = new THREE.Mesh(geometry, asteroidMaterial);

      const baseScale = A.scale.min + Math.random() * (A.scale.max - A.scale.min);
      asteroid.scale.setScalar(baseScale);

      // Spawn uniformly on a distant sphere shell so rocks fly in from the
      // full 360° of 3D directions.
      const r =
        A.spawnRadius.min + Math.random() * (A.spawnRadius.max - A.spawnRadius.min);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      asteroid.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );

      // Aim at (or just past) the singularity so the flight line crosses the
      // capture sphere and the rock is absorbed on intersection.
      const target = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).multiplyScalar(2 * A.aimSpread);
      const speed = A.speed.min + Math.random() * (A.speed.max - A.speed.min);
      const velocity = target.sub(asteroid.position).normalize().multiplyScalar(speed);

      if (progress > 0) {
        const flightTime = asteroid.position.length() / speed;
        asteroid.position.addScaledVector(velocity, flightTime * progress);
      }

      asteroid.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const tailDir = velocity.clone().normalize().negate();
      const tailLen = baseScale * 4 + speed * 1.1;
      const tailRadius = baseScale * 0.55;

      const tail = new THREE.Mesh(tailGeometry, tailMaterial);
      tail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tailDir);
      tail.scale.set(tailRadius, tailLen, tailRadius);
      tail.position.copy(asteroid.position).addScaledVector(tailDir, tailLen / 2);

      scene.add(asteroid);
      scene.add(tail);
      asteroidsRef.current.push({
        velocity,
        baseScale,
        tumble: new THREE.Vector3(
          (Math.random() - 0.5) * 1.7,
          (Math.random() - 0.5) * 1.7,
          (Math.random() - 0.5) * 1.7
        ),
        mesh: asteroid,
        tail,
        tailDir,
        tailLen,
        tailRadius,
      });
    };

    const uniforms = {
      uRes: new THREE.Uniform(new THREE.Vector2(1, 1)),
      uCenterPx: new THREE.Uniform(new THREE.Vector2(0.5, 0.5)),
      uTime: new THREE.Uniform(0),
      uCamPos: new THREE.Uniform(new THREE.Vector3()),
      uExposure: new THREE.Uniform(CONFIG.exposure),
      uColHot: new THREE.Uniform(new THREE.Vector3().fromArray(pal.hot)),
      uColMid: new THREE.Uniform(new THREE.Vector3().fromArray(pal.mid)),
      uColOuter: new THREE.Uniform(new THREE.Vector3().fromArray(pal.outer)),
      uColGlow: new THREE.Uniform(new THREE.Vector3().fromArray(pal.glow)),
    };
    uniformsRef.current = uniforms;

    // Full-screen raymarched background. renderOrder -1 + disabled depth keeps
    // it painting first so the asteroid meshes and stars composite on top.
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        depthWrite: false,
        depthTest: false,
      })
    );
    quad.renderOrder = -1;
    quad.frustumCulled = false;
    scene.add(quad);

    const perspCamera = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio);
      const w = container!.clientWidth || window.innerWidth;
      const h = container!.clientHeight || window.innerHeight;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);

      if (uniformsRef.current) {
        uniformsRef.current.uRes.value.set(w * dpr, h * dpr);
        uniformsRef.current.uCenterPx.value.set(0.5 * w * dpr, 0.5 * h * dpr);
      }
      perspCamera.aspect = w / h;
      perspCamera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resize);
    resize();

    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    let spawner: ReturnType<typeof setInterval> | null = null;
    if (!reducedMotion) {
      // Seed the field so debris is present from the first frame.
      for (let i = 0; i < 8; i++) {
        spawnAsteroid(Math.random() * 0.7);
      }
      spawner = setInterval(() => spawnAsteroid(), A.spawnEveryMs);
    }

    // Drag anywhere to orbit the black hole (rotation only — no zoom, no
    // pan). Window-level so it works despite the canvas being pointer-inert;
    // plain clicks on links and buttons are unaffected.
    let dragging = false;
    let dragAz = 0;
    let dragEl = 0;
    let px = 0;
    let py = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      px = e.clientX;
      py = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      dragAz += (e.clientX - px) * 0.005;
      // Clamp so target elevation stays within the render loop's ±1.25 limit
      // and reversing the drag responds immediately.
      dragEl = Math.max(
        -1.25 - CONFIG.camera.elevation,
        Math.min(
          1.25 - CONFIG.camera.elevation,
          dragEl + (e.clientY - py) * 0.004
        )
      );
      px = e.clientX;
      py = e.clientY;
    };
    const onPointerUp = () => {
      dragging = false;
    };

    if (!reducedMotion) {
      window.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    }

    let animationId = 0;
    let lastTime = performance.now();
    let azBase = CONFIG.camera.azimuth;

    const renderFrame = (dt: number) => {
      timeRef.current += dt;
      const u = uniformsRef.current;
      if (!u) return;

      u.uTime.value = timeRef.current;

      const cam = cameraRef.current;
      const EL_LIMIT = 1.25;

      azBase += CONFIG.autoRotate * dt;
      cam.tAz = azBase + dragAz;
      cam.tEl = CONFIG.camera.elevation + dragEl;

      const k = 1.0 - Math.pow(0.0001, dt);
      cam.az += (cam.tAz - cam.az) * k;
      cam.el += (cam.tEl - cam.el) * k;
      cam.dist += (cam.tDist - cam.dist) * k;
      cam.el = Math.max(-EL_LIMIT, Math.min(EL_LIMIT, cam.el));

      const camPos = new THREE.Vector3(
        cam.dist * Math.cos(cam.el) * Math.cos(cam.az),
        cam.dist * Math.sin(cam.el),
        cam.dist * Math.cos(cam.el) * Math.sin(cam.az)
      );

      u.uCamPos.value.copy(camPos);
      perspCamera.position.copy(camPos);
      perspCamera.lookAt(0, 0, 0);
      perspCamera.updateMatrixWorld();

      starsMaterial.uniforms.time.value = timeRef.current;

      asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
        const mesh = asteroid.mesh;
        mesh.position.addScaledVector(asteroid.velocity, dt);

        mesh.rotation.x += asteroid.tumble.x * dt;
        mesh.rotation.y += asteroid.tumble.y * dt;
        mesh.rotation.z += asteroid.tumble.z * dt;

        const dist = mesh.position.length();

        // Shrink toward the horizon, then capture.
        const shrink = Math.max(
          0.05,
          THREE.MathUtils.smoothstep(dist, A.captureRadius, A.shrinkRadius)
        );
        mesh.scale.setScalar(asteroid.baseScale * shrink);

        const tailLen = asteroid.tailLen * shrink;
        asteroid.tail.scale.set(
          asteroid.tailRadius * shrink,
          tailLen,
          asteroid.tailRadius * shrink
        );
        asteroid.tail.position
          .copy(mesh.position)
          .addScaledVector(asteroid.tailDir, tailLen / 2);

        if (dist < A.captureRadius || dist > 60) {
          scene.remove(mesh);
          scene.remove(asteroid.tail);
          return false;
        }
        return true;
      });

      renderer.render(scene, perspCamera);
    };

    if (reducedMotion) {
      // Static fallback: settle the shader at t=0 and paint one frame.
      renderFrame(0);
    } else {
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        renderFrame(dt);
      };
      animate();
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      if (spawner) clearInterval(spawner);
      cancelAnimationFrame(animationId);

      asteroidsRef.current.forEach((asteroid) => {
        scene.remove(asteroid.mesh);
        scene.remove(asteroid.tail);
      });
      asteroidsRef.current = [];
      asteroidGeometries.forEach((g) => g.dispose());
      asteroidMaterial.dispose();
      tailGeometry.dispose();
      tailMaterial.dispose();

      scene.remove(stars);
      starsGeometry.dispose();
      starsMaterial.dispose();
      quad.geometry.dispose();
      (quad.material as THREE.Material).dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 top-[96px] z-0 overflow-hidden"
    />
  );
}
