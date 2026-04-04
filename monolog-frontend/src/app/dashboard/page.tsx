"use client";

import { api } from "@/lib/api";
import {
  AlertCircle,
  BarChart3,
  FileText,
  MessageSquare,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadStats() {
      try {
        const data = await api.analytics.getStats(token!);
        setStats(data);
      } catch (err: any) {
        if (err.message?.toLowerCase().includes("unauthorized")) {
          api.setToken(null);
          router.push("/login");
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [router]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".animate-in", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const statCards = [
    {
      label: "Total Posts",
      value: stats?.totalPosts || "0",
      icon: FileText,
      trend: "Articles live",
      color: "text-blue-500",
    },
    {
      label: "Total Reads",
      value: stats?.totalViews || "0",
      icon: BarChart3,
      trend: "Unique entries",
      color: "text-emerald-500",
    },
    {
      label: "Pending",
      value: stats?.pendingComments || "0",
      icon: MessageSquare,
      trend: "Moderation queue",
      color: "text-amber-500",
    },
  ];

  if (loading)
    return (
      <div className="space-y-10">
        <div className="space-y-4">
          <div className="h-10 w-64 skeleton rounded-xl" />
          <div className="h-4 w-96 skeleton rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 skeleton rounded-[2rem]" />
          ))}
        </div>
      </div>
    );

  return (
    <div ref={containerRef} className="space-y-12 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in">
        <div className="space-y-2">
          <h1 className="dash-title">
            Welcome back, <span className="text-orange">Editor</span>
          </h1>
          <p className="text-tm max-w-md">
            Here's a snapshot of your blog's performance and recent activity.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="btn-orange shadow-orange py-3.5 px-6"
        >
          <Plus size={18} /> New Article
        </Link>
      </header>

      {/* Error */}
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-2xl flex items-center gap-3 animate-in">
          <AlertCircle size={20} />
          <p className="font-bold text-sm">Failed to sync: {error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="dash-card p-8 group animate-in"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className={`p-3 rounded-2xl bg-surface-muted border border-dash-border group-hover:border-orange/30 transition-all`}>
                    <Icon size={24} className="text-orange" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-tp tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs font-black uppercase tracking-widest text-td mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <TrendingUp size={10} /> +12%
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-dash-border flex items-center justify-between">
                <span className="text-[10px] font-bold text-tm uppercase tracking-wider">{stat.trend}</span>
                <ArrowRight size={14} className="text-td group-hover:text-orange group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section className="animate-in">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-td mb-6 px-2">
          Management Shortcut
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionLink 
            href="/dashboard/posts"
            icon={FileText}
            title="Articles"
            desc="Manage & edit posts"
          />
          <QuickActionLink 
            href="/dashboard/series"
            icon={Plus}
            title="Series"
            desc="Group your stories"
          />
          <QuickActionLink 
            href="/dashboard/comments"
            icon={MessageSquare}
            title="Moderation"
            desc="Review comments"
          />
          <QuickActionLink 
            href="/"
            icon={ArrowRight}
            title="View Site"
            desc="Public preview"
            ghost
          />
        </div>
      </section>
    </div>
  );
}

function QuickActionLink({ href, icon: Icon, title, desc, ghost }: any) {
  return (
    <Link
      href={href}
      className={`
        p-6 rounded-[2rem] border transition-all group flex flex-col gap-4
        ${ghost 
          ? "bg-transparent border-dash-border hover:border-orange/30 hover:bg-orange/5" 
          : "bg-surface-muted border-dash-border hover:border-orange/40 hover:shadow-orange-sm"}
      `}
    >
      <div className={`
        w-12 h-12 rounded-2xl flex items-center justify-center transition-all
        ${ghost ? "bg-dash-hover text-tm group-hover:text-orange" : "bg-bg text-orange shadow-sm"}
      `}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className="font-bold text-tp group-hover:text-orange transition-colors">{title}</h4>
        <p className="text-xs text-tm mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}
