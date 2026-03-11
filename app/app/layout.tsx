import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/lib/useToast";
import Toast from "@/components/Toast";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Omega Markets",
  description: "Provable FX trading with zero-knowledge proofs",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg-base text-text-primary font-display min-h-screen antialiased">
        <ToastProvider>
          {children}
          <Toast />
        </ToastProvider>
      </body>
    </html>
  );
}
