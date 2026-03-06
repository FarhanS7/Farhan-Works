"use client"

import { api } from "@/lib/api"
import { ChevronLeft, Save, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")

  const handleSubmit = async (isPublished: boolean) => {
    const token = api.getToken()
    if (!token) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      await api.posts.create({
        title,
        slug,
        category,
        excerpt,
        content,
        is_published: isPublished
      }, token)
      router.push("/dashboard")
    } catch (err: any) {
      alert(err.message || "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl text-text-muted hover:text-surface-on hover:bg-surface-muted transition-all"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-surface-on">Create New Post</h1>
      </header>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-white dark:bg-[#0F172A] shadow-level-1 p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-on">Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-lg font-bold placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="The Art of..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-on">Content (HTML Support)</label>
              <textarea
                className="w-full min-h-[400px] p-4 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm font-mono placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                placeholder="Write your thoughts here..."
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
              <h2 className="text-lg font-bold text-surface-on">Post Settings</h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Slug */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Slug</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Category</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="e.g. Technology"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Excerpt</label>
                <textarea
                  className="w-full h-24 px-3 py-2 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  placeholder="Short summary..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-3">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  onClick={() => handleSubmit(true)}
                >
                  <Send size={16} /> Publish Now
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on font-semibold text-sm hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  onClick={() => handleSubmit(false)}
                >
                  <Save size={16} /> Save Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}