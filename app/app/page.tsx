import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Omega Markets — Private price discovery for stablecoin FX",
  description:
    "Omega is a payments-focused dark book for private stablecoin FX price discovery.",
};

export default function HomePage() {
  return <LandingPage />;
}
