"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")
  const isHome = pathname === "/"
  const noPadding = isDashboard || isHome

  return (
    <main className={cn("min-h-screen", !noPadding && "pt-16")}>
      {children}
    </main>
  )
}
