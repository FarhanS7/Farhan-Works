"use client"

import { PostCard } from "@/components/post-card"
import { api } from "@/lib/api"
import { BookOpen, Search, SlidersHorizontal } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"

/* ── Skeleton ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bento-card bg-surface p-6 space-y-4">
      <div className="flex justify-between">
        <div className="h-3 w-20 skeleton rounded-full" />
        <div className="h-3 w-16 skeleton rounded-full" />
      </div>
      <div className="h-6 w-5/6 skeleton rounded" />
      <div className="h-4 w-full skeleton rounded mt-2" />
      <div className="flex justify-between pt-4 border-t border-border mt-auto">
        <div className="h-3 w-16 skeleton rounded" />
        <div className="h-3 w-20 skeleton rounded" />
      </div>
    </div>
  )
}

/* ── Posts list ───────────────────────────────────────────── */
function PostsContent() {
  const [posts,   setPosts]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [search,  setSearch]  = useState("")
  const inputRef  = useRef<HTMLInputElement>(null)
  const sp        = useSearchParams()

  useEffect(() => {
    const q = sp.get("q") || ""
    setSearch(q)
    if (inputRef.current) inputRef.current.value = q
    api.posts.getAll()
      .then(setPosts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? posts.filter(p =>
        [p.title, p.excerpt, p.category]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : posts

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))]
  const [activeCategory, setActiveCategory] = useState("All")

  const displayed = activeCategory === "All"
    ? filtered
    : filtered.filter(p => p.category === activeCategory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">

      {/* Page header */}
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold flex items-center gap-1.5">
          <BookOpen size={14} /> Archive
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface-on">
          All Articles
        </h1>
        <p className="text-text-muted text-base">
          {posts.length} {posts.length === 1 ? "article" : "articles"} published
        </p>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" size={16} />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search articles..."
            defaultValue={sp.get("q") || ""}
            onChange={e => {
              setSearch(e.target.value)
              const url = new URL(window.location.href)
              e.target.value
                ? url.searchParams.set("q", e.target.value)
                : url.searchParams.delete("q")
              window.history.replaceState({}, "", url.toString())
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-surface text-surface-on placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* Filter icon */}
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-text-muted hover:border-black transition-all text-sm font-bold uppercase tracking-widest">
          <SlidersHorizontal size={15} /> Filter
        </button>
      </div>

      {/* Category pills */}
      {!loading && posts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                activeCategory === cat
                  ? "px-4 py-1.5 rounded-full text-[10px] font-black bg-black text-white transition-all uppercase tracking-widest"
                  : "px-4 py-1.5 rounded-full text-[10px] font-bold bg-surface text-text-muted border border-border hover:border-surface-on transition-all uppercase tracking-widest"
              }
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="py-12 rounded-2xl border border-error bg-surface text-center">
          <p className="text-error font-medium">Failed to load posts</p>
          <p className="text-sm text-text-muted mt-1">{error}</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-20 text-center">
          <Search size={36} className="text-text-faint mx-auto mb-3" />
          <p className="font-medium text-surface-on">
            {search ? `No results for "${search}"` : "No posts yet."}
          </p>
          <p className="text-sm text-text-muted mt-1">
            {search ? "Try different keywords." : "Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt || ""}
              date={new Date(post.published_at).toLocaleDateString(undefined, {
                month: "short", day: "2-digit", year: "numeric",
              })}
              readTime={`${Math.max(1, Math.ceil((post.content || post.excerpt || "").split(" ").length / 200))} min read`}
              views={parseInt(post.views) || 0}
              comments={parseInt(post.comments) || 0}
              category={post.category || "Uncategorized"}
              coverImageUrl={post.cover_image_url}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PostsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="space-y-2 mb-10">
          <div className="h-3.5 w-24 skeleton rounded" />
          <div className="h-10 w-64 skeleton rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 skeleton rounded-2xl" />)}
        </div>
      </div>
    }>
      <PostsContent />
    </Suspense>
  )
}
