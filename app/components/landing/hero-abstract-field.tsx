"use client";

import * as React from "react";

import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

// Real blackhole video (the app ships the .webm; the kit only had a poster).
const HERO_VIDEO_SRC = "/landing/blackhole/omega-blackhole-hero-desktop.webm";
const HERO_VIDEO_POSTER = "/landing/blackhole/omega-blackhole-hero-poster.png";

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

// Deterministic discrete starfield (app.jsx Stars). 60 stars, seeded so SSR
// and client render identically. Twinkles slowly via the .lp-star keyframe.
const STARS = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  return Array.from({ length: 60 }).map(() => {
    const x = rnd() * 100;
    const y = rnd() * 100;
    const size = 1.8 + rnd() * 2.8;
    const o = 0.5 + rnd() * 0.5;
    return { x, y, size, o, d: (2.5 + rnd() * 4).toFixed(1) };
  });
})();

// Meteors flying in from the screen edges toward the singularity (app.jsx
// Meteors). 10 deterministic streaks aimed at ~44% height.
const METEORS = (() => {
  let seed = 1487;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const N = 10;
  return Array.from({ length: N }).map((_, i) => {
    const angle = (i / N) * 360 + (rnd() - 0.5) * 70;
    const start = 640 + rnd() * 520;
    const trail = 24 + rnd() * 160;
    const h = 1 + rnd() * 2.6;
    const o = 0.4 + rnd() * 0.55;
    const dur = (5 + rnd() * 13).toFixed(1);
    const delay = (rnd() * 22 - 8).toFixed(1);
    const ox = (rnd() - 0.5) * 90;
    const oy = (rnd() - 0.5) * 70;
    return { angle, start, trail, h, o, dur, delay, ox, oy };
  });
})();

function Stars() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      {STARS.map((s, i) => (
        <span
          key={i}
          className="lp-star"
          style={
            {
              left: s.x + "%",
              top: s.y + "%",
              width: s.size,
              height: s.size,
              "--o": s.o,
              "--d": s.d + "s",
              boxShadow:
                s.size > 2.6
                  ? "0 0 6px rgba(255,255,255,0.6)"
                  : "0 0 3px rgba(255,255,255,0.4)",
            } as CSSVars
          }
        />
      ))}
    </div>
  );
}

function Meteors() {
  return (
    <div className="lp-meteor-field" aria-hidden>
      {METEORS.map((m, i) => (
        <div
          key={i}
          className="lp-meteor-origin"
          style={{ left: `calc(50% + ${m.ox}px)`, top: `calc(44% + ${m.oy}px)` }}
        >
          <div className="lp-meteor-arm" style={{ transform: `rotate(${m.angle}deg)` }}>
            <span
              className="lp-meteor"
              style={
                {
                  width: m.trail,
                  height: m.h,
                  "--start": m.start + "px",
                  "--end": "26px",
                  "--dur": m.dur + "s",
                  "--delay": m.delay + "s",
                  "--o": m.o,
                } as CSSVars
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Full-bleed hero atmosphere: blackhole video + starfield + meteors +
// legibility gradients. Mirrors app.jsx Hero's background layers.
export function HeroAbstractField() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      data-testid="hero-abstract-field"
      className="absolute inset-0 overflow-hidden"
    >
      {/* blackhole graphic — the singularity. Black background drops out via
          mix-blend-mode: screen so the glowing ring sits on the dark page. */}
      <div className="lp-blackhole pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <video
          key={reducedMotion ? "still" : "motion"}
          className="omega-hero-blackhole-video max-w-none object-cover"
          style={{ width: "min(1700px, 185%)", mixBlendMode: "screen", opacity: 0.9 }}
          autoPlay={!reducedMotion}
          loop={!reducedMotion}
          muted
          playsInline
          preload="auto"
          poster={HERO_VIDEO_POSTER}
        >
          <source src={HERO_VIDEO_SRC} type="video/webm" />
        </video>
      </div>

      {/* legibility gradient — fade the graphic toward the edges into pure
          black (the video's native black), then into the page background. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 42%, transparent 30%, #000 80%, transparent 100%)",
        }}
      />
      {/* even dim veil over the whole graphic for legibility */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: "rgba(0,0,0,0.34)" }}
      />
      {/* tall bottom fade — black settles into the page background (no hard cut) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/2"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--background) 82%)",
        }}
      />

      <Stars />
      {!reducedMotion ? <Meteors /> : null}
    </div>
  );
}
