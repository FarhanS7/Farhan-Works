"use client";

import { api } from "@/lib/api";
import {
  ChevronLeft,
  Edit,
  ExternalLink,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PostManagementPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-text-muted hover:text-surface-on hover:bg-surface-muted transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-on">
              Manage Articles
            </h1>
            <p className="text-text-muted text-sm">
              Organize and edit your blog content.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all"
        >
          <Plus size={16} /> New Post
        </Link>
      </header>

      {/* Content */}
      {error ? (
        <div className="p-8 text-center bg-error/8 border border-error/20 text-error rounded-2xl font-medium">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-border bg-white dark:bg-[#0F172A] shadow-level-1 overflow-hidden group hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                {/* Post info */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-on group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span
                        className={
                          post.is_published
                            ? "px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "px-2 py-0.5 rounded-full bg-surface-muted text-text-muted border border-border"
                        }
                      >
                        {post.is_published ? "Published" : "Draft"}
                      </span>
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end md:self-center">
                  <Link
                    href={`/post/${post.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg text-text-muted hover:text-surface-on hover:bg-surface-muted transition-all"
                    title="View Public Post"
                  >
                    <ExternalLink size={16} />
                  </Link>
                  <Link
                    href={`/dashboard/posts/${post.id}`}
                    className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-all"
                    title="Edit Content"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg text-error hover:bg-error/10 transition-all"
                    title="Delete Forever"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 text-text-faint">
              No articles found. Start writing your first story!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
