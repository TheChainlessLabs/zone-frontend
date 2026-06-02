"use client";

import * as React from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const HERO_VIDEO_SRC =
  "/landing/blackhole/omega-blackhole-hero-desktop.webm";

type MeteorStyle = React.CSSProperties & Record<`--${string}`, string | number>;

const orderMeteors: Array<{
  id: string;
  wideOnly?: boolean;
  style: MeteorStyle;
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

export function HeroAbstractField() {
  const reducedMotion = useReducedMotion();
  const fieldRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const field = fieldRef.current;
    const section = field?.closest<HTMLElement>("[data-landing-hero]");
    if (!field || !section) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const isMobile = window.innerWidth < 768;
      const baseScale = isMobile ? 1.02 : 1.04;

      if (reducedMotion) {
        field.style.setProperty("--hero-video-scale", baseScale.toFixed(3));
        field.style.setProperty("--hero-meteor-opacity", "0");
        section.style.setProperty("--hero-copy-opacity", "1");
        return;
      }

      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-section.getBoundingClientRect().top / travel, 0, 1);
      const eased = 1 - (1 - progress) ** 1.8;
      const zoom = baseScale + eased * (isMobile ? 1.8 : 2.75);
      const copyOpacity = clamp(1 - progress * 1.2, 0, 1);
      const meteorOpacity = isMobile
        ? clamp(0.82 - progress * 0.44, 0.24, 0.82)
        : clamp(0.96 - progress * 0.58, 0.28, 0.96);

      field.style.setProperty("--hero-video-scale", zoom.toFixed(3));
      field.style.setProperty("--hero-meteor-opacity", meteorOpacity.toFixed(3));
      section.style.setProperty("--hero-copy-opacity", copyOpacity.toFixed(3));
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
      section.style.removeProperty("--hero-copy-opacity");
    };
  }, [reducedMotion]);

  return (
    <div
      ref={fieldRef}
      aria-hidden
      data-testid="hero-abstract-field"
      className="absolute inset-0 overflow-hidden bg-[var(--background)]"
    >
      <video
        key={reducedMotion ? "still" : "motion"}
        className="omega-hero-blackhole-video absolute left-1/2 top-[46%] w-[176vw] max-w-none object-contain opacity-[0.72] [filter:contrast(1.14)_saturate(0.94)] md:top-1/2 md:min-h-full md:min-w-full md:w-auto md:object-cover md:opacity-90"
        autoPlay={!reducedMotion}
        loop={!reducedMotion}
        muted
        playsInline
        preload="auto"
      >
        <source src={HERO_VIDEO_SRC} type="video/webm" />
      </video>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, transparent 0%, transparent 30%, color-mix(in oklab, var(--background) 28%, transparent) 58%, var(--background) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--background) 0%, color-mix(in oklab, var(--background) 12%, transparent) 18%, color-mix(in oklab, var(--background) 0%, transparent) 48%, color-mix(in oklab, var(--background) 74%, transparent) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-45"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, color-mix(in oklab, var(--foreground) 20%, transparent) 0%, transparent 18%, transparent 100%)",
        }}
      />
      {!reducedMotion ? (
        <div className="omega-meteor-field absolute inset-0">
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
      <div className="absolute inset-x-[8%] bottom-8 h-px bg-[var(--border)]" />
      <div className="absolute inset-x-[18%] top-[18%] h-px bg-[var(--border)] opacity-35" />
    </div>
  );
}
