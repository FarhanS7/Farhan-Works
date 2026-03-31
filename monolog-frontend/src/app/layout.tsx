import { NavigationRail } from "@/components/navigation-rail";
import "@/styles/globals.css";
import type { Metadata } from "next";

import { MainContent } from "@/components/main-content";

export const metadata: Metadata = {
  title: "MonoLog – Personal Insight Blog",
  description: "A minimal, high-performance personal publishing platform for distraction-free reading.",
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
        {/* Warm up the TCP+TLS connection to the backend before the first API call */}
        {apiOrigin && <link rel="preconnect" href={apiOrigin} />}
      </head>
      <body
        className="font-sans antialiased bg-surface text-surface-on selection:bg-primary selection:text-surface"
        suppressHydrationWarning
      >
        {/* Top navbar */}
        <NavigationRail />

        {/* Page content – conditional padding inside wrapper */}
        <MainContent>
          {children}
        </MainContent>
      </body>
    </html>
  );
}
