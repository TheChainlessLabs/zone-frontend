'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface OrbitalScrollConfig {
  radius: number
  startAngle: number
  duration: number
}

export function useOrbitalScroll(config: OrbitalScrollConfig) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current || !containerRef.current) return

    const { radius, startAngle, duration } = config
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top center',
        end: `+=${duration}`,
        scrub: 0.6,
        markers: false,
      },
    })

    tl.to(
      cardRef.current,
      {
        onUpdate() {
          if (!cardRef.current) return

          const progress = tl.progress()

          const angle = startAngle - progress * Math.PI * 2
          const x = centerX + Math.cos(angle) * radius * (1 - progress)
          const y = centerY + Math.sin(angle) * radius * (1 - progress)

          const scale = 1 - progress * 0.2
          const opacity = 1 - progress * 0.3

          gsap.set(cardRef.current, {
            x: x - centerX,
            y: y - centerY,
            scale,
            opacity,
            rotation: progress * 360,
          })
        },
      },
      0
    )

    return () => {
      tl.kill()
    }
  }, [config])

  return { containerRef, cardRef }
}
