"use client";

import { api } from "@/lib/api";
import {
  AlertCircle,
  BarChart3,
  FileText,
  MessageSquare,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadStats() {
      try {
        if (!token) return;
        const data = await api.analytics.getStats(token);
        setStats(data);
      } catch (err: any) {
        if (
          err.message?.toLowerCase().includes("token") ||
          err.message?.toLowerCase().includes("unauthorized")
        ) {
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

  const statCards = [
    {
      label: "Total Posts",
      value: stats?.totalPosts || "0",
      icon: FileText,
      trend: "Published articles",
    },
    {
      label: "Total Reads",
      value: stats?.totalViews || "0",
      icon: BarChart3,
      trend: "Unique views",
    },
    {
      label: "Pending Comments",
      value: stats?.pendingComments || "0",
      icon: MessageSquare,
      trend: "Review required",
    },
  ];

  if (loading)
    return (
      <div className="p-4 md:p-8 space-y-8">
        <div className="space-y-2">
          <div className="h-6 w-48 skeleton rounded" />
          <div className="h-4 w-72 skeleton rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-surface-on">
            Admin Dashboard
          </h1>
          <p className="text-text-muted mt-1">
            Welcome back, editor. Here's what's happening today.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all"
        >
          <Plus size={16} /> New Post
        </Link>
      </header>

      {/* Error */}
      {error && (
        <div className="p-4 bg-error/8 border border-error/20 text-error rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">Failed to sync dashboard: {error}</p>
        </div>
      )}

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-white dark:bg-[#0F172A] p-6 shadow-level-1"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-text-faint uppercase tracking-widest">
                  {stat.label}
                </p>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-surface-on">
                  {stat.value}
                </p>
                <p className="text-xs text-text-muted">{stat.trend}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section>
        <div className="rounded-2xl border border-border bg-white dark:bg-[#0F172A] shadow-level-1">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-surface-on">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/posts"
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on font-medium hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <FileText size={20} className="text-primary" />
                Manage Articles
              </Link>
              <Link
                href="/dashboard/comments"
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on font-medium hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <MessageSquare size={20} className="text-primary" />
                Moderation Queue
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
