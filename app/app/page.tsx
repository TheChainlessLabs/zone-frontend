import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Omega Markets — Private stablecoin execution",
  description:
    "Omega matches stablecoin orders privately, accesses external liquidity when needed, and settles with verifiable proofs.",
};

export default function HomePage() {
  return <LandingPage />;
}
