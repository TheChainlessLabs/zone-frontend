"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useCardScrollAnimation(cardIndex: number, totalCards: number) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const cardContent = card.querySelector(".bg-black") as HTMLElement;
    if (!cardContent) return;

    const cardHeight = window.innerHeight * 0.6; // 60vh
    const updateAnimation = () => {
      // Get card position in viewport
      const rect = card.getBoundingClientRect();
      const cardViewportTop = rect.top;
      const cardViewportBottom = rect.bottom;
      const viewportHeight = window.innerHeight;

      // Calculate how far through this card's view we are (0 to 1)
      // 0 when card is below viewport, 1 when completely above
      const progress = Math.max(0, Math.min(1, (viewportHeight - cardViewportTop) / (viewportHeight + cardHeight)));

      // Current card: move from top-right to center and fade out
      gsap.to(cardContent, {
        x: -cardContent.offsetWidth * 0.15 * progress,
        y: -cardHeight * 0.3 * progress,
        opacity: 1 - progress,
        overwrite: false,
        duration: 0.5,
      });

      // Next card: fade in from bottom
      const nextCard = card.nextElementSibling as HTMLElement | null;
      if (nextCard) {
        const nextCardContent = nextCard.querySelector(".bg-black") as HTMLElement | null;
        if (nextCardContent) {
          gsap.to(nextCardContent, {
            y: Math.max(0, cardHeight * (1 - progress)),
            opacity: progress,
            overwrite: false,
            duration: 0.5,
          });
        }
      }
    };

    window.addEventListener("scroll", updateAnimation, { passive: true });
    updateAnimation(); // Initial call

    return () => {
      window.removeEventListener("scroll", updateAnimation);
    };
  }, [cardIndex, totalCards]);

  return cardRef;
}
