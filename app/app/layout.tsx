import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GeistMono } from "geist/font/mono";
import { Lora, IBM_Plex_Sans, Source_Sans_3 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TempoWalletProvider } from "@/components/shell/TempoWalletProvider";
import { WalletStateProvider } from "@/components/shell/WalletStateProvider";
import { RouteAtmosphere } from "@/components/shell/RouteAtmosphere";
import { HashHighlightMount } from "@/components/shell/HashHighlightMount";
import "./globals.css";

// Lora — Professional serif for body and headings. Elegant and readable,
// appropriate for financial services applications. Used as primary font family.
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

// IBM Plex Sans — Professional sans-serif for branding and wordmark. Clean,
// corporate, and trustworthy. Used for OMEGA MARKETS wordmark and navigation.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-wordmark",
  display: "swap",
});

// Source Sans Pro — Clean professional sans-serif for secondary use.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
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
      className={`${lora.variable} ${ibmPlexSans.variable} ${sourceSans.variable} ${GeistMono.variable}`}
    >
      <body className={ibmPlexSans.variable}>
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
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js?token=59e1018d-579d-497e-9ee3-8f3856bef012"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
