'use client'

import React from 'react'
import { useOrbitalScroll } from '@/hooks/useOrbitalScroll'

interface OrbitalSectionProps {
  children: React.ReactNode
  radius?: number
  startAngle?: number
  duration?: number
  className?: string
}

export function OrbitalSection({
  children,
  radius = 300,
  startAngle = 0,
  duration = 600,
  className = '',
}: OrbitalSectionProps) {
  const { containerRef, cardRef } = useOrbitalScroll({
    radius,
    startAngle,
    duration,
  })

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen w-full flex items-center justify-center ${className}`}
      style={{
        perspective: '1200px',
      }}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  )
}
