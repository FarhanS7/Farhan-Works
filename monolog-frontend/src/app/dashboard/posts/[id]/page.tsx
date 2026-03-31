"use client";

import { api } from "@/lib/api";
import { ChevronLeft, Save, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadPost() {
      try {
        const data = await api.posts.getAdminOne(resolvedParams.id, token!);
        setTitle(data.title);
        setSlug(data.slug);
        setCategory(data.category || "");
        setExcerpt(data.excerpt || "");
        setContent(data.content);
        setIsPublished(data.is_published);
      } catch (err: any) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [resolvedParams.id, router]);

  const handleSubmit = async (publish: boolean) => {
    const token = api.getToken();
    if (!token) return;

    setSaving(true);
    try {
      await api.posts.update(
        resolvedParams.id,
        {
          title,
          slug,
          category,
          excerpt,
          content,
          is_published: publish,
        },
        token,
      );
      router.push("/dashboard/posts");
    } catch (err: any) {
      alert(err.message || "Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const token = api.getToken();
    if (!token || !confirm("Are you sure you want to delete this post?"))
      return;

    try {
      await api.posts.delete(resolvedParams.id, token);
      router.push("/dashboard/posts");
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    }
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 skeleton rounded-xl" />
          <div className="h-6 w-48 skeleton rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 skeleton rounded-2xl" />
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto p-8 text-center pt-24">
        <p className="text-error mb-4 font-bold text-2xl">Error</p>
        <p className="text-text-muted mb-8">{error}</p>
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-white dark:bg-surface-muted text-surface-on font-semibold text-sm hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          Back to Articles
        </Link>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/posts"
            className="p-2 rounded-xl text-text-muted hover:text-surface-on hover:bg-surface-muted transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-surface-on">Edit Post</h1>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-error hover:bg-error/10 transition-all"
          onClick={handleDelete}
        >
          <Trash2 size={16} /> Delete Post
        </button>
      </header>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-white dark:bg-[#0F172A] shadow-level-1 p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-on">
                Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-lg font-bold placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-on">
                Content (HTML Support)
              </label>
              <textarea
                className="w-full min-h-[500px] p-4 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm font-mono placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="rounded-2xl border border-border bg-white dark:bg-[#0F172A] shadow-level-1">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-surface-on">
                Post Settings
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Status */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-text-faint">
                  Status
                </span>
                <div>
                  <span
                    className={
                      isPublished
                        ? "px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "px-3 py-1 rounded-full text-xs font-semibold bg-surface-muted text-text-muted border border-border"
                    }
                  >
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">
                  Slug
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">
                  Category
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">
                  Excerpt
                </label>
                <textarea
                  className="w-full h-24 px-3 py-2 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-3">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                  onClick={() => handleSubmit(true)}
                >
                  <Send size={16} />{" "}
                  {isPublished ? "Update Post" : "Publish Now"}
                </button>
                {!isPublished && (
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on font-semibold text-sm hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving}
                    onClick={() => handleSubmit(false)}
                  >
                    <Save size={16} /> Save Draft
                  </button>
                )}
                {isPublished && (
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on font-semibold text-sm hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving}
                    onClick={() => handleSubmit(false)}
                  >
                    <Save size={16} /> Switch to Draft
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
