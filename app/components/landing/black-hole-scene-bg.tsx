'use client'

import React from 'react'

const CX = 250
const CY = 250

// Deterministic orbiting order-objects
const ORDERS = Array.from({ length: 7 }).map((_, i) => {
  const a = (i / 7) * Math.PI * 2
  return {
    a,
    r: 150 + (i % 3) * 26,
    size: 4 + (i % 3) * 1.5,
    side: i % 2 ? 'buy' : 'sell',
  }
})

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function BlackHoleSceneBg() {
  return (
    <div className="fixed inset-0 bg-black pointer-events-none z-0 flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 500 500"
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
        }}
        aria-label="Omega black hole background"
      >
        <defs>
          <radialGradient id="lp-core-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--foreground)" stopOpacity="1" />
            <stop offset="55%" stopColor="var(--foreground)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lp-halo-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--success)" stopOpacity="0" />
            <stop offset="78%" stopColor="var(--success)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Faint accretion rings */}
        {[210, 168, 126].map((r, i) => (
          <circle
            key={r}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={i === 1 ? '3 7' : undefined}
            opacity={0.5 - i * 0.08}
          />
        ))}

        {/* Event horizon halo */}
        <circle cx={CX} cy={CY} r={66 + 30} fill="url(#lp-halo-bg)" />
        <circle
          cx={CX}
          cy={CY}
          r={66}
          fill="none"
          stroke="var(--success)"
          strokeWidth="1.25"
          strokeDasharray="4 6"
          opacity="0.5"
        />

        {/* Orbiting order objects (static, not animated) */}
        {ORDERS.map((o, i) => {
          const x = CX + Math.cos(o.a) * o.r
          const y = CY + Math.sin(o.a) * o.r
          const col = o.side === 'buy' ? 'var(--success)' : 'var(--destructive)'
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={o.size}
              fill={col}
              opacity="0.6"
            />
          )
        })}

        {/* Core glow */}
        <circle cx={CX} cy={CY} r={36} fill="url(#lp-core-bg)" opacity="0.8" />
        <circle cx={CX} cy={CY} r={13} fill="var(--foreground)" />
      </svg>
    </div>
  )
}
