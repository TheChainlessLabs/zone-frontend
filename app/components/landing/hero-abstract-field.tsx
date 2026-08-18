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

// Order meteors — the original 3D-perspective ingress. Each streak flies in
// from a screen edge toward the singularity along the Z axis, tilting and
// shrinking as it falls in. Styled entirely through CSS custom properties the
// `omega-order-meteor` rule (globals.css) animates via `omega-order-ingress`.
// `wideOnly` meteors only render at the ≥768px breakpoint (CSS gates display).
const orderMeteors: Array<{
  id: string;
  wideOnly?: boolean;
  style: CSSVars;
}> = [
  {
    id: "left-high",
    style: {
      "--sx": "-58vw",
      "--sy": "-28vh",
      "--z-start": "120px",
      "--z-end": "-360px",
      "--rot-start": "26deg",
      "--rot-end": "26deg",
      "--tilt-x": "18deg",
      "--tilt-y": "-22deg",
      "--scale-start": "1.08",
      "--scale-end": "0.06",
      "--duration": "5.8s",
      "--delay": "-0.9s",
      "--tail": "174px",
      "--opacity": "0.78",
    },
  },
  {
    id: "right-high",
    style: {
      "--sx": "56vw",
      "--sy": "-20vh",
      "--z-start": "80px",
      "--z-end": "-340px",
      "--rot-start": "160deg",
      "--rot-end": "160deg",
      "--tilt-x": "-14deg",
      "--tilt-y": "24deg",
      "--scale-start": "0.96",
      "--scale-end": "0.055",
      "--duration": "5.4s",
      "--delay": "-3.2s",
      "--tail": "154px",
      "--opacity": "0.72",
    },
  },
  {
    id: "left-flat",
    style: {
      "--sx": "-64vw",
      "--sy": "5vh",
      "--z-start": "170px",
      "--z-end": "-390px",
      "--rot-start": "-5deg",
      "--rot-end": "-5deg",
      "--tilt-x": "8deg",
      "--tilt-y": "-28deg",
      "--scale-start": "1.16",
      "--scale-end": "0.065",
      "--duration": "6.4s",
      "--delay": "-4.5s",
      "--tail": "218px",
      "--opacity": "0.76",
    },
  },
  {
    id: "right-flat",
    style: {
      "--sx": "63vw",
      "--sy": "10vh",
      "--z-start": "145px",
      "--z-end": "-380px",
      "--rot-start": "189deg",
      "--rot-end": "189deg",
      "--tilt-x": "-10deg",
      "--tilt-y": "28deg",
      "--scale-start": "1.05",
      "--scale-end": "0.06",
      "--duration": "6s",
      "--delay": "-0.1s",
      "--tail": "196px",
      "--opacity": "0.76",
    },
  },
  {
    id: "upper",
    style: {
      "--sx": "10vw",
      "--sy": "-48vh",
      "--z-start": "60px",
      "--z-end": "-330px",
      "--rot-start": "102deg",
      "--rot-end": "102deg",
      "--tilt-x": "26deg",
      "--tilt-y": "6deg",
      "--scale-start": "0.86",
      "--scale-end": "0.05",
      "--duration": "6.6s",
      "--delay": "-2.4s",
      "--tail": "136px",
      "--opacity": "0.66",
    },
  },
  {
    id: "lower-left",
    wideOnly: true,
    style: {
      "--sx": "-42vw",
      "--sy": "42vh",
      "--z-start": "40px",
      "--z-end": "-340px",
      "--rot-start": "-45deg",
      "--rot-end": "-45deg",
      "--tilt-x": "-24deg",
      "--tilt-y": "-12deg",
      "--scale-start": "0.88",
      "--scale-end": "0.05",
      "--duration": "7s",
      "--delay": "-5.7s",
      "--tail": "132px",
      "--opacity": "0.58",
    },
  },
  {
    id: "upper-left-far",
    wideOnly: true,
    style: {
      "--sx": "-24vw",
      "--sy": "-44vh",
      "--z-start": "-20px",
      "--z-end": "-320px",
      "--rot-start": "61deg",
      "--rot-end": "61deg",
      "--tilt-x": "18deg",
      "--tilt-y": "-10deg",
      "--scale-start": "0.72",
      "--scale-end": "0.045",
      "--duration": "7.6s",
      "--delay": "-6.3s",
      "--tail": "118px",
      "--opacity": "0.52",
    },
  },
  {
    id: "lower-right",
    wideOnly: true,
    style: {
      "--sx": "46vw",
      "--sy": "38vh",
      "--z-start": "30px",
      "--z-end": "-350px",
      "--rot-start": "220deg",
      "--rot-end": "220deg",
      "--tilt-x": "-22deg",
      "--tilt-y": "16deg",
      "--scale-start": "0.82",
      "--scale-end": "0.05",
      "--duration": "7.2s",
      "--delay": "-6.9s",
      "--tail": "126px",
      "--opacity": "0.56",
    },
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

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

// Full-bleed hero atmosphere: blackhole video + starfield + 3D-perspective
// order meteors + legibility gradients. Mirrors app.jsx Hero's background
// layers. A scroll-driven effect fades the meteor field as the hero scrolls
// out (it reads `[data-landing-hero]` for the section to track).
export function HeroAbstractField() {
  const reducedMotion = useReducedMotion();
  const fieldRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const field = fieldRef.current;
    const section = field?.closest<HTMLElement>("[data-landing-hero]");
    if (!field || !section) return;

    // Reduced motion: meteors are not rendered at all, so there is nothing to
    // drive. The CSS field default (full opacity) is moot.
    if (reducedMotion) {
      field.style.setProperty("--hero-meteor-opacity", "0");
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;

      const isMobile = window.innerWidth < 768;
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-section.getBoundingClientRect().top / travel, 0, 1);
      const meteorOpacity = isMobile
        ? clamp(0.82 - progress * 0.44, 0.24, 0.82)
        : clamp(0.96 - progress * 0.58, 0.28, 0.96);

      field.style.setProperty("--hero-meteor-opacity", meteorOpacity.toFixed(3));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={fieldRef}
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
          style={{ width: "min(1700px, 185%)", mixBlendMode: "screen", opacity: 0.5 }}
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
      {!reducedMotion ? (
        <div className="omega-meteor-field absolute inset-0 z-[1]">
          {orderMeteors.map((meteor) => (
            <span
              key={meteor.id}
              className={
                meteor.wideOnly
                  ? "omega-order-meteor omega-order-meteor--wide"
                  : "omega-order-meteor"
              }
              style={meteor.style}
            >
              <span className="omega-order-meteor__tail" />
              <span className="omega-order-meteor__body">
                <span />
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
