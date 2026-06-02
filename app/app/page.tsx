import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Omega Markets — Darkpool spot FX",
  description:
    "Private spot FX execution with onchain settlement and verifiable fills.",
};

export default function HomePage() {
  return <LandingPage />;
}
