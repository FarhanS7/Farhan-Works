"use client";

import { api } from "@/lib/api";
import {
  Edit3,
  ExternalLink,
  FileText,
  Plus,
  Trash2,
  Search,
  Filter,
  Calendar,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function PostManagementPage() {
  const [posts, setPosts] = useState<any[]>([]);
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

    async function loadPosts() {
      try {
        const data = await api.posts.getAdminList(token!);
        setPosts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [router]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".post-row", {
          x: -20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleDelete = async (id: string) => {
    const token = api.getToken();
    if (!token || !confirm("Are you sure you want to delete this post?"))
      return;

    try {
      await api.posts.delete(id, token);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    }
  };

  return (
    <div ref={containerRef} className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="dash-title">Manage <span className="text-orange">Articles</span></h1>
          <p className="text-tm max-w-md text-sm">
            Review, edit, and organize your published and draft stories.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="btn-orange shadow-orange py-3.5 px-6"
        >
          <Plus size={18} /> New Article
        </Link>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl glass-panel">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-td" size={18} />
          <input 
            type="text" 
            placeholder="Search articles..."
            className="w-full pl-12 pr-4 py-3 bg-transparent text-sm text-tp focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 pr-2">
          <button className="dash-btn-ghost !py-2.5">
            <Filter size={16} /> Filter
          </button>
          <div className="h-6 w-[1px] bg-dash-border mx-1" />
          <p className="text-[10px] font-black uppercase tracking-widest text-td px-2">
            {posts.length} Total
          </p>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="p-8 text-center bg-error/10 border border-error/20 text-error rounded-[2rem] font-bold">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 skeleton rounded-[2rem]" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="post-row group rounded-[2rem] border border-dash-border bg-dash-card hover:border-orange/30 hover:bg-orange/5 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                {/* Post info */}
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-surface-muted border border-dash-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} className="w-full h-full object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <FileText size={20} className="text-orange" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-tp group-hover:text-orange transition-colors truncate">
                      {post.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span
                        className={
                          post.is_published
                            ? "px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-dash-hover text-tm border border-dash-border"
                        }
                      >
                        {post.is_published ? "Published" : "Draft"}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-td uppercase tracking-wider">
                        <Hash size={12} /> {post.category || "General"}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-td uppercase tracking-wider">
                        <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="p-3 rounded-xl text-tm hover:text-orange hover:bg-orange/10 transition-all"
                    title="View Public"
                  >
                    <ExternalLink size={18} />
                  </Link>
                  <Link
                    href={`/dashboard/posts/${post.id}`}
                    className="p-3 rounded-xl text-orange hover:bg-orange/10 transition-all font-bold text-sm flex items-center gap-2"
                  >
                    <Edit3 size={18} /> <span className="hidden sm:inline">Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-3 rounded-xl text-td hover:text-error hover:bg-error/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-32 rounded-[3rem] border-2 border-dashed border-dash-border">
              <p className="text-td font-black uppercase tracking-widest text-sm">
                No stories found
              </p>
              <Link href="/dashboard/new" className="text-orange font-bold text-sm hover:underline mt-2 inline-block">
                Start writing your first one ↗
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
