"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Menu, Bell, User as UserIcon, Search } from "lucide-react";

export function DashboardNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname.includes("/posts")) return "Articles";
    if (pathname.includes("/series")) return "Series";
    if (pathname.includes("/comments")) return "Comments";
    if (pathname.includes("/new")) return "New Post";
    return "Dashboard";
  };

  return (
    <>
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <main className="lg:pl-[280px] min-h-screen flex flex-col transition-all duration-300">
        <header className={`
          sticky top-0 z-[100] h-[72px] px-6 md:px-10
          flex items-center justify-between
          transition-all duration-300
          ${scrolled ? "glass-panel border-b" : "bg-transparent"}
        `}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl glass-panel text-tm hover:text-tp"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-black uppercase tracking-widest text-tm lg:block hidden">
              Dashboard / <span className="text-tp">{getPageTitle()}</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl glass-panel text-tm hover:text-tp hidden md:flex">
              <Search size={18} />
            </button>
            <button className="p-2.5 rounded-xl glass-panel text-tm hover:text-tp relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange rounded-full ring-4 ring-bg" />
            </button>
            <div className="h-8 w-[1px] bg-dash-border mx-2" />
            <button className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full glass-panel hover:border-orange/30 transition-all">
              <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center text-white text-xs font-black shadow-orange">
                <UserIcon size={14} />
              </div>
              <span className="text-xs font-bold text-tp hidden sm:inline">Admin</span>
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
