import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Source_Serif_4 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { WalletStateProvider } from "@/components/shell/WalletStateProvider";
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
      <body>
        {/* WalletStateProvider reads `?walletState=` via useSearchParams,
            which Next 14 requires to be inside a Suspense boundary so
            static rendering of /brand and /system stays bailout-free. */}
        <Suspense fallback={null}>
          <WalletStateProvider>{children}</WalletStateProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
