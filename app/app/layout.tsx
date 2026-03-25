import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { deserialize, type State } from "wagmi";
import "./globals.css";
import Providers from "@/components/Providers";
import Toast from "@/components/Toast";
import MobileTabBar from "@/components/MobileTabBar";
import { config } from "@/lib/wagmiConfig";

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
  const cookieStore = cookies();
  const wagmiCookie = cookieStore.get(`${config.storage?.key}.store`)?.value;
  const initialState = wagmiCookie
    ? deserialize<{ state: State }>(decodeURIComponent(wagmiCookie)).state
    : undefined;

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg-base text-text-primary font-display min-h-screen antialiased pb-[60px] lg:pb-0">
        <Providers initialState={initialState}>
          {children}
          <Toast />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
