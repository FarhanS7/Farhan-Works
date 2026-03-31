import { NavigationRail } from "@/components/navigation-rail";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { MainContent } from "@/components/main-content";

// Explicitly request only the weights used in the UI.
// next/font downloads and self-hosts these — no third-party font request at runtime.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // prevents invisible text during font load (FOIT → FOUT)
  weight: ["400", "500", "600", "700"],
  preload: true, // preload critical font for faster rendering
  fallback: [
    // better fallback chain for more consistent layout
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title: "MonoLog – Personal Insight Blog",
  description:
    "A minimal, high-performance personal publishing platform for distraction-free reading.",
};

// Resolve the API origin at build time so we can preconnect to it.
const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : null;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font optimization */}
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* Warm up the TCP+TLS connection to the backend before the first API call */}
        {apiOrigin && <link rel="preconnect" href={apiOrigin} />}
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-surface text-surface-on selection:bg-primary selection:text-surface`}
        suppressHydrationWarning
      >
        {/* Top navbar */}
        <NavigationRail />

        {/* Page content – conditional padding inside wrapper */}
        <MainContent>{children}</MainContent>
      </body>
    </html>
  );
}
