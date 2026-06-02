import { LandingHero } from "@/components/landing/landing-hero";
import { OrderScrollStory } from "@/components/landing/order-scroll-story";
import { PostScrollSections } from "@/components/landing/post-scroll-sections";

export function LandingPage() {
  return (
    <main id="top" className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <LandingHero />
      <OrderScrollStory />
      <PostScrollSections />
    </main>
  );
}
