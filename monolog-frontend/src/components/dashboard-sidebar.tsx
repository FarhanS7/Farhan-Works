"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  MessageSquare, 
  PlusCircle, 
  ArrowLeft,
  X,
  LogOut,
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

const links = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Articles", href: "/dashboard/posts", icon: FileText },
  { label: "Series", href: "/dashboard/series", icon: Layers },
  { label: "Comments", href: "/dashboard/comments", icon: MessageSquare },
  { label: "New Post", href: "/dashboard/new", icon: PlusCircle },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // Basic way to show who's logged in
    const storedName = localStorage.getItem("monolog_username");
    if (storedName) setAdminName(storedName);
  }, []);

  const handleLogout = () => {
    api.setToken(null);
    localStorage.removeItem("monolog_username");
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[250] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-[300]
        w-[280px] glass-panel border-r
        transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="nav-logo !text-2xl">
              MONO<span className="text-orange">LOG</span>
            </Link>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dash-hover lg:hidden text-tm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-td mb-4 px-4">
              Management
            </p>
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`dash-btn-ghost ${active ? "active" : ""}`}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-dash-border space-y-4">
            <Link 
              href="/" 
              className="dash-btn-ghost group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Site
            </Link>

            {/* Admin Profile & Logout */}
            <div className="dash-card p-4 bg-surface-muted/50 mt-4 group">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange flex items-center justify-center text-white shadow-orange-sm">
                    <UserIcon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-td">Moderator</span>
                    <span className="text-sm font-black text-tp truncate max-w-[120px]">{adminName}</span>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-td group-hover:text-tp transition-colors" />
               </div>
               
               <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-td hover:text-error hover:bg-error/10 transition-all text-xs font-black uppercase tracking-widest"
               >
                 <LogOut size={14} />
                 Logout
               </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
