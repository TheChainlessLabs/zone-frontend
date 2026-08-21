'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollCard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current || !containerRef.current) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        markers: false,
      },
    })

    tl.to(
      cardRef.current,
      {
        scale: 0.92,
        rotationX: 8,
        rotationY: 2,
        y: 40,
        opacity: 0.95,
        borderRadius: '20px',
        ease: 'none',
      },
      0
    )

    return () => {
      tl.kill()
    }
  }, [])

  return { containerRef, cardRef }
}
