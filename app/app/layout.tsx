import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Source_Serif_4, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TempoWalletProvider } from "@/components/shell/TempoWalletProvider";
import { WalletStateProvider } from "@/components/shell/WalletStateProvider";
import { RouteAtmosphere } from "@/components/shell/RouteAtmosphere";
import { HashHighlightMount } from "@/components/shell/HashHighlightMount";
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

// Space Grotesk — SIL OFL. The wordmark display face: the OMEGA MARKETS
// lockup only (navbar/footer/brand moments), uppercase + tracked, weight
// 500–600. Never on body, data, labels, chrome, or headings. Exposed as
// `--font-space-grotesk`, which the generated tokens.css aliases to
// `--font-wordmark` (Tailwind `font-wordmark`). See omega-docs
// 03-brand/visual-identity.md (wordmark face).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Omega Markets",
    template: "%s — Omega Markets",
  },
  description: "Private stablecoin trading on Omega Zone.",
};

// Viewport metadata is required so the /system + /brand showcases reflow
// correctly on phones rather than rendering at desktop width and zooming
// out. Next.js 14's recommended path is the dedicated `viewport` export
// rather than a `<meta>` in head.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      <body className={spaceGrotesk.variable}>
        {/* WalletStateProvider reads `?walletState=` via useSearchParams,
            which Next 14 requires to be inside a Suspense boundary so
            static rendering of /brand and /system stays bailout-free.
            RouteAtmosphere shares that boundary because usePathname() also
            triggers client-side navigation reads. */}
        <Suspense fallback={null}>
          <RouteAtmosphere />
          <HashHighlightMount />
          <TempoWalletProvider>
            <WalletStateProvider>{children}</WalletStateProvider>
          </TempoWalletProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
