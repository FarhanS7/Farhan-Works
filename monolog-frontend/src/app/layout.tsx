import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NavigationRail } from "@/components/navigation-rail";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MonoLog – Personal Insight Blog",
  description: "A minimal, high-performance personal publishing platform for distraction-free reading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-surface text-surface-on selection:bg-primary/20`}
        suppressHydrationWarning
      >
        {/* Top navbar */}
        <NavigationRail />

        {/* Page content – padded below fixed navbar */}
        <main className="min-h-screen pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
