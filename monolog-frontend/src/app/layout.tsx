import "@/styles/globals.css";
import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";

import { NavigationRail } from "@/components/navigation-rail";
import { Footer } from "@/components/footer";
import { MainContent } from "@/components/main-content";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
  weight: ["300", "400", "500"],
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Farhan.Dev – Insights",
  description:
    "Stay up-to-date with the latest insights on no-code/low-code development, digital transformation, and modern web solutions.",
};

const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
  : null;

import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {apiOrigin && <link rel="preconnect" href={apiOrigin} />}
      </head>
      <body
        className={`${dmSans.variable} ${syne.variable}`}
        suppressHydrationWarning
      >
        <NavigationRail />
        <div style={{ paddingTop: 68 }}>
          <MainContent>{children}</MainContent>
        </div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
