import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Omega Markets",
  description: "Anonymous spot FX. On-chain settlement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
