"use client";

import { api } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, ArrowUpRight, LogOut, Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/posts" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "#contact" },
];

export function NavigationRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);
  const navHidden = useRef(false);

  useEffect(() => {
    setIsAdmin(!!api.getToken());
  }, [pathname]);

  /* ── Init theme ── */
  useEffect(() => {
    const saved = localStorage.getItem("inneraktive_theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  /* ── Nav hide/show on scroll ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const nav = navRef.current;
      if (!nav) return;

      if (y > lastY.current && y > 90 && !navHidden.current) {
        nav.style.transform = "translateY(-72px)";
        navHidden.current = true;
      } else if (y < lastY.current && navHidden.current) {
        nav.style.transform = "translateY(0)";
        navHidden.current = false;
      }
      // shadow on scroll
      const prog = Math.min((y / 60), 1);
      nav.style.boxShadow = `0 2px ${20 * prog}px rgba(0,0,0,${0.18 * prog})`;
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("inneraktive_theme", next);
  };

  const handleLogout = () => {
    api.setToken(null);
    setIsAdmin(false);
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav
        ref={navRef}
        className="main-nav"
        style={{ transition: "transform .35s cubic-bezier(.4,0,.2,1), background .42s, border-color .42s, box-shadow .42s" }}
      >
        {/* Logo */}
        <Link href="/" className="nav-logo">
          Farhan.Dev
        </Link>

        {/* Desktop nav links */}
        <ul className="nav-links-pill">
          {navLinks.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className={isActive(href) ? "active" : ""}
              >
                {label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <Link
                href="/dashboard"
                className={pathname.startsWith("/dashboard") ? "active" : ""}
              >
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* Right side (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            <div className="toggle-knob">
              <span style={{ fontSize: 11 }}>{theme === "dark" ? "🌙" : "☀️"}</span>
            </div>
          </button>

          {isAdmin ? (
            <button onClick={handleLogout} className="btn-orange">
              Sign Out
            </button>
          ) : (
            <Link href="/login" className="btn-orange">
              Get Started <span className="arrow-c">↗</span>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-surface-alt border border-border flex items-center justify-center text-tp"
          >
            {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-bg border-l border-border p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-10">
                <span className="font-syne font-bold text-lg">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-surface-alt border border-border flex items-center justify-center text-tp"
                >
                  <X size={20} />
                </button>
              </div>

              <ul className="space-y-4">
                {navLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-xl font-syne font-semibold block py-2 ${
                        isActive(href) ? "text-primary" : "text-tp"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                {isAdmin && (
                  <li>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-xl font-syne font-semibold block py-2 ${
                        pathname.startsWith("/dashboard") ? "text-primary" : "text-tp"
                      }`}
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>

              <div className="absolute bottom-10 left-6 right-6 space-y-4">
                <div className="h-[1px] bg-border w-full mb-6" />
                {isAdmin ? (
                  <button
                    onClick={handleLogout}
                    className="w-full btn-orange flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full btn-orange flex items-center justify-center gap-2"
                  >
                    Get Started <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
