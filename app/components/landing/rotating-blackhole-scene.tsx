"use client";

import * as React from "react";

import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import type { SceneState } from "@/components/landing/scene/types";
import {
  clamp,
  easeInOut,
  lerp,
} from "@/components/landing/scene/scroll-progress";

const CX = 250;
const CY = 250;

// Deterministic orbiting order-objects
const ORDERS = Array.from({ length: 7 }).map((_, i) => {
  const a = (i / 7) * Math.PI * 2;
  return {
    a,
    r: 150 + (i % 3) * 26,
    size: 4 + (i % 3) * 1.5,
    side: i % 2 ? "buy" : "sell",
    speed: 0.6 + (i % 4) * 0.18,
  };
});

interface RotatingBlackholeProps {
  sceneRef?: React.Ref<SVGSVGElement>;
}

/** The rotating black-hole SVG. Time-driven animation instead of scroll-driven. */
export function RotatingBlackhole({ sceneRef }: RotatingBlackholeProps) {
  const [rotation, setRotation] = React.useState(0);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (reducedMotion) return;

    let animationId: number;
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      setRotation((prev) => (prev + deltaTime * 0.2) % (Math.PI * 2));
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [reducedMotion]);

  // Calculate scene state based on continuous rotation
  const p = (rotation / (Math.PI * 2)) % 1;
  const horizon = lerp(28, 55, easeInOut(Math.abs(Math.sin(rotation * 0.5)) * 0.3));
  const coreR = lerp(6, 18, easeInOut(Math.sin(rotation * 0.3) * 0.5 + 0.5));
  const pull = easeInOut(Math.sin(rotation * 0.4) * 0.5 + 0.5);
  const spin = rotation * 0.8;
  const fallProgress = Math.max(0, Math.sin(rotation * 0.6));
  const noise = Math.max(0, Math.sin(rotation * 0.5 - Math.PI * 0.3) * 0.8);
  const proof = Math.max(0, Math.sin(rotation * 0.7 - Math.PI * 0.6) * 0.9);
  const proofX = lerp(CX - 40, CX + 40, (Math.sin(rotation * 0.5) + 1) * 0.5);
  const tempo = easeInOut(Math.sin(rotation * 0.4) * 0.5 + 0.5);

  const orderFalling = Math.sin(rotation * 0.3) > 0;
  const orderY = lerp(50, 450, Math.sin(rotation * 0.6) * 0.5 + 0.5);

  return (
    <svg
      ref={sceneRef}
      data-testid="rotating-blackhole-scene"
      viewBox="0 0 500 500"
      width="100%"
      height="100%"
      style={{ display: "block", maxHeight: "70vh" }}
      aria-label="Omega private order lifecycle animation"
    >
      <defs>
        <radialGradient id="lp-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--foreground)" stopOpacity="1" />
          <stop offset="55%" stopColor="var(--foreground)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lp-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--success)" stopOpacity="0" />
          <stop offset="78%" stopColor="var(--success)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* faint accretion rings */}
      {[210, 168, 126].map((r, i) => (
        <circle
          key={r}
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray={i === 1 ? "3 7" : undefined}
          opacity={0.5 - i * 0.08}
        />
      ))}

      {/* event horizon halo */}
      <circle cx={CX} cy={CY} r={horizon + 30} fill="url(#lp-halo)" />
      <circle
        cx={CX}
        cy={CY}
        r={horizon}
        fill="none"
        stroke="var(--success)"
        strokeWidth="1.25"
        strokeDasharray="4 6"
        opacity={clamp((p - 0.1) / 0.3, 0, 0.7)}
      />

      {/* orbiting order objects (buy = emerald, sell = red) pulled into the core */}
      {ORDERS.map((o, i) => {
        const ang = o.a + spin * o.speed;
        const r = lerp(o.r, coreR + 6, pull);
        const x = CX + Math.cos(ang) * r;
        const y = CY + Math.sin(ang) * r;
        const fade = 1 - clamp((pull - 0.6) / 0.4, 0, 1);
        const col = o.side === "buy" ? "var(--success)" : "var(--destructive)";
        return <circle key={i} cx={x} cy={y} r={o.size} fill={col} opacity={0.25 + fade * 0.55} />;
      })}

      {/* incoming sealed order (phase 1) */}
      {orderFalling ? (
        <g opacity={1}>
          <line
            x1={CX}
            y1={orderY - 26}
            x2={CX}
            y2={orderY}
            stroke="var(--foreground)"
            strokeWidth="1"
            opacity="0.3"
          />
          <rect
            x={CX - 6}
            y={orderY - 6}
            width="12"
            height="12"
            rx="3"
            fill="var(--foreground)"
            transform={`rotate(${fallProgress * 90} ${CX} ${orderY})`}
          />
        </g>
      ) : null}

      {/* radiation noise out (phase 3) */}
      {noise > 0
        ? Array.from({ length: 14 }).map((_, i) => {
            const ang = (i / 14) * Math.PI * 2 + 0.3;
            const rr = lerp(coreR, 170, easeInOut(noise)) * (0.6 + (i % 3) * 0.2);
            return (
              <circle
                key={i}
                cx={CX + Math.cos(ang) * rr}
                cy={CY + Math.sin(ang) * rr}
                r={1.5}
                fill="var(--muted-foreground)"
                opacity={(1 - noise) * 0.5}
              />
            );
          })
        : null}

      {/* core */}
      <circle cx={CX} cy={CY} r={coreR + 14} fill="url(#lp-core)" opacity="0.5" />
      <circle cx={CX} cy={CY} r={coreR} fill="var(--foreground)" />

      {/* proof capsule (phase 3 → 4) */}
      {proof > 0 ? (
        <g opacity={proof} transform={`translate(${proofX} ${CY})`}>
          <rect x={-18} y={-13} width="36" height="26" rx="8" fill="var(--background)" stroke="var(--success)" strokeWidth="1.5" />
          <path
            d="M -6 0 L -1 5 L 7 -5"
            fill="none"
            stroke="var(--success)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : null}

      {/* tempo blocks finalize (phase 4) */}
      {tempo > 0 ? (
        <g opacity={tempo}>
          {Array.from({ length: 5 }).map((_, i) => {
            const bx = lerp(330, 150, easeInOut(tempo)) + i * 36;
            const filled = i <= Math.floor(tempo * 4);
            return (
              <rect
                key={i}
                x={bx}
                y={430}
                width="26"
                height="26"
                rx="5"
                fill={filled ? "color-mix(in oklab, var(--success) 20%, transparent)" : "transparent"}
                stroke={filled ? "var(--success)" : "var(--border)"}
                strokeWidth="1.25"
              />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
}
