import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jbm",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://epinova.co"),
  title: "EPINOVA — A New Era of Cancer Detection Through AI",
  description:
    "A new era of cancer detection through AI. Precision diagnostics using DNA methylation biomarkers. Riyadh, Saudi Arabia.",
  openGraph: {
    title: "EPINOVA — Detect Earlier, Understand Deeper",
    description:
      "A new era of cancer detection through AI. Precision diagnostics using DNA methylation biomarkers.",
    url: "https://epinova.co",
    siteName: "EPINOVA",
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#071A2A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        {/* Fontshare CSS API — font files must never be committed (EULA) */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700,800&f[]=switzer@400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
