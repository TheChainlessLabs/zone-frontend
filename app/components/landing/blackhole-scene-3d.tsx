"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const STEPS_DESKTOP = 240;
const STEPS_MOBILE = 150;

const SCENE_SCALE = 15.5; // Master scale factor - tuned for raymarching

const CONFIG = {
  theme: "mono",
  autoRotate: 0.04, // Matched to reference
  exposure: 1.3, // Matched to reference
  camera: { distance: 15.5, elevation: 0.4, azimuth: 0.8 }, // Exact reference values
  zoomRange: [11.0, 28.0], // Matched to reference
  maxPixelRatio: 1.5,
  enableWheelZoom: false,
  enableDrag: false,
  // Asteroid parameters scaled for new scene scale
  asteroidScale: { min: 0.4, max: 0.6 },
  asteroidSpawnRadius: { min: 8.0, max: 11.0 },
  asteroidSpeed: { min: 0.004, max: 0.008 },
  asteroidZBias: -2.0,
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
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  scale: number;
  mesh: THREE.Mesh;
  trail: THREE.Vector3[];
  trailLine?: THREE.Line;
}

export function BlackholeScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef({
    az: CONFIG.camera.azimuth,
    el: CONFIG.camera.elevation,
    dist: CONFIG.camera.distance,
    tAz: CONFIG.camera.azimuth,
    tEl: CONFIG.camera.elevation,
    tDist: CONFIG.camera.distance
  });
  const uniformsRef = useRef<Record<string, THREE.Uniform> | null>(null);
  const timeRef = useRef(0);
  const asteroidsRef = useRef<AsteroidData[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const STEPS = isCoarse ? STEPS_MOBILE : STEPS_DESKTOP;
    const pal = PALETTES.mono;

    const vertexShader = `void main() { gl_Position = vec4(position, 1.0); }`;

    const fragmentShaderTest = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  gl_FragColor = vec4(uv.x, uv.y, sin(uTime) * 0.5 + 0.5, 1.0);
}
`;

    const fragmentShader = `
precision highp float;

uniform vec2  uRes;
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
const float FL       = 1.6;

float hash12(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
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
  // Center the blackhole in the middle of the screen
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  // Debug disabled - UV coordinates are correct

  // Scale the blackhole - adjust for proper visibility
  uv *= 3.0;

  vec3 ro = uCamPos;
  vec3 fw = normalize(-ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);

  // Focal length matched to reference implementation
  float FL = 1.6;
  vec3 rd = normalize(fw * FL + uv.x * rt + uv.y * up);

  vec3 hv = cross(ro, rd);
  float h2 = dot(hv, hv);

  vec3 pos = ro;
  vec3 dir = rd;
  vec3 colAcc = vec3(0.0);
  float aAcc = 0.0;
  float minR = 1000.0;
  bool captured = false;

  for (int i = 0; i < STEPS; i++) {
    float r2 = dot(pos, pos);
    float r = sqrt(r2);
    minR = min(minR, r);

    if (r < 1.0) { captured = true; break; }
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

  vec3 bg = vec3(0.0);

  vec3 col = colAcc + (1.0 - aAcc) * bg;
  col = pow(1.0 - exp(-col * uExposure), vec3(0.9));
  col *= 1.0 - 0.15 * smoothstep(0.55, 1.25, length(uv));

  gl_FragColor = vec4(col, 1.0);
}
`;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.autoClear = true;
    containerRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

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

    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starsPositions, 3)
    );
    starsGeometry.setAttribute(
      "brightness",
      new THREE.BufferAttribute(starsBrightness, 1)
    );

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

    // ===== ASTEROID GEOMETRIES =====
    const asteroidGeometries = [
      new THREE.IcosahedronGeometry(1, 2),
      new THREE.TetrahedronGeometry(1),
      new THREE.OctahedronGeometry(1),
      new THREE.DodecahedronGeometry(0.8, 0),
      new THREE.BoxGeometry(1.2, 0.8, 0.6),
    ];

    const asteroidMaterial = new THREE.MeshPhongMaterial({
      color: 0xeeeeee,
      emissive: 0xaaaaaa,
      shininess: 120,
      wireframe: false,
    });

    // Lighting - increased for visibility
    const light = new THREE.DirectionalLight(0xffffff, 3.0);
    light.position.set(20, 20, 20);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 2.5));

    const fillLight = new THREE.DirectionalLight(0xccddff, 2.0);
    fillLight.position.set(-20, -15, 15);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(0xffffff, 2.0);
    pointLight.position.set(0, 0, 30);
    scene.add(pointLight);

    const spawnAsteroid = () => {
      const geometry = asteroidGeometries[Math.floor(Math.random() * asteroidGeometries.length)];
      const asteroid = new THREE.Mesh(geometry, asteroidMaterial);

      const scale = CONFIG.asteroidScale.min + Math.random() * (CONFIG.asteroidScale.max - CONFIG.asteroidScale.min);
      asteroid.scale.set(scale, scale, scale);

      // Scale spawn radius based on viewport width for responsive mobile layout
      const vw = Math.max(320, window.innerWidth);
      const aspect = vw / (window.innerHeight - 72);
      const spawnRadius = aspect < 0.6 ? CONFIG.asteroidSpawnRadius.min : CONFIG.asteroidSpawnRadius.max;

      // Spawn asteroids in a sphere around the origin, in front of camera
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = spawnRadius;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi) + CONFIG.asteroidZBias;

      asteroid.position.set(x, y, z);

      const speed = CONFIG.asteroidSpeed.min + Math.random() * (CONFIG.asteroidSpeed.max - CONFIG.asteroidSpeed.min);
      const distanceToCenter = Math.sqrt(x * x + y * y + z * z);
      const velocity = new THREE.Vector3(
        (-x / distanceToCenter) * speed,
        (-y / distanceToCenter) * speed,
        (-z / distanceToCenter) * speed
      );

      asteroid.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const trailGeometry = new THREE.BufferGeometry();
      const trailMaterial = new THREE.ShaderMaterial({
        transparent: true,
        linewidth: 6,
        vertexShader: `
          attribute float opacity;
          varying float vOpacity;

          void main() {
            vOpacity = opacity;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 2.0;
          }
        `,
        fragmentShader: `
          varying float vOpacity;

          void main() {
            gl_FragColor = vec4(0.53, 0.8, 1.0, vOpacity);
          }
        `,
      });
      const trailLine = new THREE.Line(trailGeometry, trailMaterial);
      scene.add(trailLine);

      scene.add(asteroid);
      asteroidsRef.current.push({
        position: asteroid.position.clone(),
        velocity,
        scale,
        mesh: asteroid,
        trail: [asteroid.position.clone()],
        trailLine,
      });
    };

    // Asteroids temporarily disabled to focus on blackhole
    // let spawnCount = 0;
    // const testSpawner = setInterval(() => {
    //   try {
    //     spawnAsteroid();
    //     spawnCount++;
    //     console.log(`[Asteroid ${spawnCount}] Total in scene: ${asteroidsRef.current.length}, Scene children: ${scene.children.length}`);
    //   } catch (e) {
    //     console.error("Spawn error:", e);
    //   }
    // }, 200);
    const testSpawner = null;

    const uniforms = {
      uRes: new THREE.Uniform(new THREE.Vector2(1, 1)),
      uTime: new THREE.Uniform(0),
      uCamPos: new THREE.Uniform(new THREE.Vector3()),
      uExposure: new THREE.Uniform(CONFIG.exposure),
      uColHot: new THREE.Uniform(new THREE.Vector3().fromArray(pal.hot)),
      uColMid: new THREE.Uniform(new THREE.Vector3().fromArray(pal.mid)),
      uColOuter: new THREE.Uniform(new THREE.Vector3().fromArray(pal.outer)),
      uColGlow: new THREE.Uniform(new THREE.Vector3().fromArray(pal.glow)),
    };
    uniformsRef.current = uniforms;

    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        depthWrite: false,
        depthTest: false,
        transparent: false,
      })
    );
    quad.position.set(0, 0, 0);
    scene.add(quad);

    // Create a perspective camera for scene objects to match raymarching view
    const perspCamera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Handle resize
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio);
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      if (uniformsRef.current) {
        uniformsRef.current.uRes.value.set(w * dpr, h * dpr);
      }
      // Update perspective camera aspect ratio on resize (use visible height minus navbar)
      const visibleH = h - 72 / window.devicePixelRatio;
      perspCamera.aspect = w / visibleH;
      perspCamera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resize);
    resize();

    // Debug camera setup
    console.log("=== CAMERA DEBUG ===");
    console.log("Perspective Camera FOV:", perspCamera.fov);
    console.log("Perspective Camera Near/Far:", perspCamera.near, perspCamera.far);
    console.log("Perspective Camera Aspect:", perspCamera.aspect);
    console.log("SCENE_SCALE:", SCENE_SCALE);
    console.log("Initial camera distance:", cameraRef.current.dist);

    // Interactive controls
    let dragging = false;
    let px = 0,
      py = 0;
    let lastInteraction = -10;
    let isLocked = false;
    let rotationSpeedMultiplier = 1.0;
    let asteroidSpeedMultiplier = 1.0;

    function onDown(x: number, y: number) {
      dragging = true;
      px = x;
      py = y;
      lastInteraction = timeRef.current;
    }

    function onMove(x: number, y: number) {
      if (!dragging) return;
      const dx = x - px;
      const dy = y - py;
      px = x;
      py = y;

      const cam = cameraRef.current;
      cam.tAz += dx * 0.005;
      cam.tEl = Math.max(-1.25, Math.min(1.25, cam.tEl + dy * 0.004));
      lastInteraction = timeRef.current;
    }

    function onUp() {
      dragging = false;
    }

    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    // Use window-level listeners without DOM checks
    const handlePointerDown = (e: PointerEvent) => {
      onDown(e.clientX, e.clientY);
    };
    const handlePointerMove = (e: PointerEvent) => {
      onMove(e.clientX, e.clientY);
    };
    const handlePointerUp = (e: PointerEvent) => {
      onUp();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    // Wheel zoom disabled for landing page
    // canvas.addEventListener("wheel", (e) => { ... });

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        isLocked = !isLocked;
      }
      // Left/Right arrows to adjust rotation speed
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        rotationSpeedMultiplier = Math.max(0.1, rotationSpeedMultiplier - 0.1);
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        rotationSpeedMultiplier = Math.min(3.0, rotationSpeedMultiplier + 0.1);
      }
      // Up/Down arrows to adjust asteroid speed
      if (e.code === "ArrowUp") {
        e.preventDefault();
        asteroidSpeedMultiplier = Math.min(5.0, asteroidSpeedMultiplier + 0.1);
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        asteroidSpeedMultiplier = Math.max(0.1, asteroidSpeedMultiplier - 0.1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Scroll effect - rotate camera based on scroll
    const handleScroll = () => {
      const scrollProgress = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const cam = cameraRef.current;
      cam.tAz = 0.6 + scrollProgress * 2.0; // Direct scroll-based azimuth
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.05);
      timeRef.current += dt;

      if (uniformsRef.current) {
        uniformsRef.current.uTime.value = timeRef.current;

        // Debug: log camera position every 120 frames
        if (Math.floor(timeRef.current * 60) % 120 === 0) {
          console.log("Shader uCamPos being updated:", uniformsRef.current.uCamPos.value);
        }

        const cam = cameraRef.current;
        const EL_LIMIT = 1.25;

        // Auto-rotate (unless locked with spacebar)
        if (!isLocked) {
          cam.tAz += CONFIG.autoRotate * dt * rotationSpeedMultiplier;
        }

        // Smooth camera pursuit
        const k = 1.0 - Math.pow(0.0001, dt);
        cam.az += (cam.tAz - cam.az) * k;
        cam.el += (cam.tEl - cam.el) * k;
        cam.dist += (cam.tDist - cam.dist) * k;

        // Clamp elevation
        cam.el = Math.max(-EL_LIMIT, Math.min(EL_LIMIT, cam.el));

        const camPos = new THREE.Vector3(
          cam.dist * Math.cos(cam.el) * Math.cos(cam.az),
          cam.dist * Math.sin(cam.el),
          cam.dist * Math.cos(cam.el) * Math.sin(cam.az)
        );

        uniformsRef.current.uCamPos.value.copy(camPos);

        // Update perspective camera to match raymarching view
        perspCamera.position.copy(camPos);
        perspCamera.lookAt(0, 0, 0);
        perspCamera.updateMatrixWorld();

        // Debug every 60 frames
        if (timeRef.current % 1 === 0 && Math.floor(timeRef.current) % 60 === 0) {
          console.log("Camera pos:", camPos.length().toFixed(2), "units | Az:", cam.az.toFixed(2), "El:", cam.el.toFixed(2));
          console.log("Active asteroids:", asteroidsRef.current.length, "| Scene children:", scene.children.length);
        }

        // Update stars
        if (starsMaterial.uniforms.time) {
          starsMaterial.uniforms.time.value += dt;
        }

        // Update asteroids - disabled for now to focus on blackhole
        // asteroidsRef.current = asteroidsRef.current.filter((asteroid) => { ... });
      }

      // Single unified render with perspective camera
      renderer.render(scene, perspCamera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("scroll", handleScroll);
      if (testSpawner) clearInterval(testSpawner);
      cancelAnimationFrame(animationId);

      // Clean up asteroids
      asteroidsRef.current.forEach((asteroid) => {
        scene.remove(asteroid.mesh);
        if (asteroid.trailLine) scene.remove(asteroid.trailLine);
        asteroid.mesh.geometry.dispose();
        if (asteroid.trailLine) asteroid.trailLine.geometry.dispose();
      });

      // Clean up stars
      scene.remove(stars);
      starsGeometry.dispose();
      starsMaterial.dispose();

      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed z-0 overflow-hidden select-none"
      style={{
        top: "72px",
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: "none",
        paddingTop: "clamp(0px, 12vw, 100px)",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    />
  );
}
