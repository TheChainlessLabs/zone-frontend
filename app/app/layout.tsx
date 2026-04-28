import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Source_Serif_4 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Source Serif 4 — Adobe, OFL. Used for italic display moments only:
// hero lede, section ledes, mood paragraph, one naming specimen. Adds
// editorial personality without adopting a paid foundry face. See
// omega-docs/03-brand/visual-identity.md for the rule on where it lands.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Omega Markets — Brand Board",
  description: "Anonymous spot FX. On-chain settlement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${sourceSerif.variable}`}
    >
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
