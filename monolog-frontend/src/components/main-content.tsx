"use client";

export function MainContent({ children }: { children: React.ReactNode }) {
  return <main style={{ minHeight: "100vh" }}>{children}</main>;
}
