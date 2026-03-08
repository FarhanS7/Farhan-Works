"use client"

import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
    BookOpen, Home, LogOut, Menu, Moon, Search, Settings, Sun, User, X,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const navLinks = [
  { label: "Home",  href: "/" },
  { label: "Posts", href: "/posts" },
  { label: "About", href: "/about" },
]

const DARK_KEY = "monolog_dark_mode"

export function NavigationRail() {
  const pathname     = usePathname()
  const router       = useRouter()
  const [isAdmin,    setIsAdmin]    = useState(false)
  const [dark,       setDark]       = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  /* ── Init dark mode & admin state ── */
  useEffect(() => {
    const saved = localStorage.getItem(DARK_KEY)
    if (saved === "true") {
      setDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  useEffect(() => {
    setIsAdmin(!!api.getToken())
    setMobileOpen(false)
  }, [pathname])

  /* ── Scroll blur effect ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem(DARK_KEY, String(next))
    document.documentElement.classList.toggle("dark", next)
  }

  const handleSearch = () => {
    const q = window.prompt("Search posts:")
    if (q) window.location.href = "/posts?q=" + encodeURIComponent(q)
  }

  const handleLogout = () => {
    api.setToken(null)
    setIsAdmin(false)
    router.push("/")
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <>
      {/* ─── Top Navbar ─── */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300",
          scrolled
            ? "bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md shadow-level-1 border-b border-border/60"
            : "bg-white dark:bg-[#0B1120] border-b border-border/40"
        )}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <BookOpen size={20} className="text-white dark:text-black" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-black dark:text-white group-hover:opacity-70 transition-opacity uppercase">
              MonoLog
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(href)
                    ? "text-black dark:text-white"
                    : "text-text-muted hover:text-black dark:hover:text-white hover:bg-surface-muted"
                )}
              >
                {label}
                {isActive(href) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-black dark:bg-white" />
                )}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/dashboard"
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname.startsWith("/dashboard")
                    ? "text-primary bg-primary/10"
                    : "text-text-muted hover:text-surface-on hover:bg-surface-muted"
                )}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={handleSearch}
              aria-label="Search"
              className="p-2 rounded-lg text-text-muted hover:text-surface-on hover:bg-surface-muted transition-all"
            >
              <Search size={18} />
            </button>
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-text-muted hover:text-surface-on hover:bg-surface-muted transition-all"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAdmin ? (
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="p-2 rounded-lg text-text-muted hover:text-error transition-all"
              >
                <LogOut size={18} />
              </button>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-5 py-2 rounded-full text-sm font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={handleSearch}
              aria-label="Search"
              className="p-2 rounded-lg text-text-muted hover:bg-surface-muted transition-all"
            >
              <Search size={18} />
            </button>
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-text-muted hover:bg-surface-muted transition-all"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Open menu"
              className="p-2 rounded-lg text-text-muted hover:bg-surface-muted transition-all"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile drawer ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <nav
            className="absolute top-16 inset-x-0 bg-white dark:bg-[#0F172A] border-b border-border shadow-level-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive(href)
                      ? "bg-primary/10 text-primary"
                      : "text-text-muted hover:text-surface-on hover:bg-surface-muted"
                  )}
                >
                  {label === "Home"  && <Home     size={18} />}
                  {label === "Posts" && <BookOpen size={18} />}
                  {label === "About" && <User     size={18} />}
                  {label}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      pathname.startsWith("/dashboard")
                        ? "bg-primary/10 text-primary"
                        : "text-text-muted hover:text-surface-on hover:bg-surface-muted"
                    )}
                  >
                    <Settings size={18} /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error transition-all"
                  >
                    <LogOut size={18} /> Log Out
                  </button>
                </>
              )}
              {!isAdmin && (
                <Link
                  href="/login"
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-white mt-2"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
