'use client'

import React from 'react'

export function WhiteHoleBg() {
  return (
    <>
      {/* Fixed background white hole effect */}
      <div className="fixed inset-0 bg-black pointer-events-none z-0">
        {/* Radial gradient white hole glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(
              circle at 50% 50%,
              rgba(200, 200, 200, 0.15) 0%,
              rgba(150, 150, 150, 0.08) 15%,
              rgba(100, 100, 100, 0.04) 30%,
              rgba(0, 0, 0, 0) 60%
            )`,
          }}
        />

        {/* Orbiting rings for visual depth */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(200, 200, 200, 0.1))',
          }}
        >
          <defs>
            <radialGradient id="hole-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(220, 220, 220, 0.3)" />
              <stop offset="40%" stopColor="rgba(180, 180, 180, 0.15)" />
              <stop offset="100%" stopColor="rgba(100, 100, 100, 0)" />
            </radialGradient>
          </defs>

          {/* Center core glow */}
          <circle cx="50" cy="50" r="8" fill="url(#hole-glow)" opacity="0.8" />

          {/* Orbital rings */}
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="rgba(180, 180, 180, 0.12)"
            strokeWidth="0.3"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="rgba(150, 150, 150, 0.08)"
            strokeWidth="0.3"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgba(120, 120, 120, 0.06)"
            strokeWidth="0.3"
          />
        </svg>

        {/* Subtle animated glow pulse */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(
              circle at 50% 50%,
              rgba(220, 220, 220, 0.05) 0%,
              transparent 50%
            )`,
            animation: 'pulse-glow 4s ease-in-out infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
