"use client";

import { api } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
          <li key={href}>
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

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
    </nav>
  );
}
