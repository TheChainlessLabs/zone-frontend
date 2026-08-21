'use client'

import React from 'react'
import { useScrollCard } from '@/hooks/useScrollCard'

interface ScrollCardWrapperProps {
  children: React.ReactNode
  className?: string
}

export function ScrollCardWrapper({ children, className = '' }: ScrollCardWrapperProps) {
  const { containerRef, cardRef } = useScrollCard()

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen w-full ${className}`}
      style={{
        perspective: '1200px',
      }}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full mx-auto"
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
