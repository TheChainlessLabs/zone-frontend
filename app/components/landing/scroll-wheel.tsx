'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface WheelSection {
  id: string
  label: string
  angle: number
}

interface ScrollWheelProps {
  sections: WheelSection[]
  onSectionChange?: (section: WheelSection) => void
}

export function ScrollWheel({ sections, onSectionChange }: ScrollWheelProps) {
  const wheelRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wheelRef.current || !containerRef.current) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => {
          const rotation = self.progress * 360 * 2
          gsap.set(wheelRef.current, { rotation })

          const normalizedRotation = rotation % 360
          const visibleAngle = (90 - normalizedRotation + 360) % 360

          const closestSection = sections.reduce((prev, curr) => {
            const prevDist = Math.min(
              Math.abs(prev.angle - visibleAngle),
              360 - Math.abs(prev.angle - visibleAngle)
            )
            const currDist = Math.min(
              Math.abs(curr.angle - visibleAngle),
              360 - Math.abs(curr.angle - visibleAngle)
            )
            return currDist < prevDist ? curr : prev
          })

          onSectionChange?.(closestSection)
        },
      },
    })

    return () => {
      tl.kill()
    }
  }, [sections, onSectionChange])

  const radius = 180
  const cx = 250
  const cy = 250

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-end">
      <div className="relative w-full h-full flex items-center justify-end pr-8">
        {/* Wheel container - only right half visible */}
        <div className="absolute inset-0 overflow-hidden flex items-center justify-end">
          <svg
            ref={wheelRef}
            viewBox="0 0 500 500"
            width="500"
            height="500"
            style={{
              transformOrigin: 'center center',
            }}
            className="drop-shadow-lg"
          >
            {/* Wheel circle */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="2"
            />

            {/* Sections */}
            {sections.map((section, idx) => {
              const angle = (section.angle * Math.PI) / 180
              const x = cx + Math.cos(angle) * radius
              const y = cy + Math.sin(angle) * radius

              return (
                <g key={section.id}>
                  {/* Section dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="var(--foreground)"
                    opacity="0.2"
                  />
                  {/* Section label indicator */}
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="none"
                    stroke="var(--foreground)"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                </g>
              )
            })}

            {/* Center dot */}
            <circle cx={cx} cy={cy} r="8" fill="var(--foreground)" opacity="0.3" />

            {/* Visibility line (right edge) */}
            <line
              x1={cx + radius + 20}
              y1={cy - radius}
              x2={cx + radius + 20}
              y2={cy + radius}
              stroke="var(--success)"
              strokeWidth="2"
              opacity="0.2"
              strokeDasharray="5 5"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
