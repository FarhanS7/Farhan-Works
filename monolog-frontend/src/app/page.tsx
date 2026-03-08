"use client"

import { PostCard } from "@/components/post-card"
import { api } from "@/lib/api"
import { Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

/* ── Animated stat bubble ─────────────────────────────────── */
function StatBubble({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl md:text-3xl font-extrabold text-primary">{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
    </div>
  )
}

/* ── Category pill ────────────────────────────────────────── */
function CategoryPill({ label, active }: { label: string; active: boolean }) {
  return (
    <button
      className={
        active
          ? "px-4 py-1.5 rounded-full text-sm font-semibold bg-primary text-white shadow-blue transition-all"
          : "px-4 py-1.5 rounded-full text-sm font-medium bg-surface-muted text-text-muted hover:bg-primary/10 hover:text-primary transition-all border border-border"
      }
    >
      {label}
    </button>
  )
}

/* ── Skeleton card ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="h-3 w-1/3 skeleton rounded m-4 mb-0" />
      <div className="p-4 space-y-2">
        <div className="h-5 w-5/6 skeleton rounded" />
        <div className="h-5 w-4/6 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded mt-3" />
        <div className="h-4 w-4/5 skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [posts,   setPosts]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    api.posts.getAll()
      .then(setPosts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const [search, setSearch] = useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      window.location.href = `/posts?q=${encodeURIComponent(search)}`
    }
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-white dark:bg-black">
        {/* Simple background pattern */}
        <div className="absolute inset-0 hero-pattern opacity-[0.05] pointer-events-none" aria-hidden />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="space-y-8 animate-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-xs font-bold tracking-widest uppercase">
              Blog
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-black dark:text-white">
              Discover our latest news
            </h1>

            {/* Sub */}
            <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
              Discover the achievements that set us apart. From groundbreaking projects to industry accolades,
              we take pride in our accomplishments.
            </p>

            {/* Centered Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mt-10">
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-surface-muted rounded-2xl border border-border shadow-md focus-within:border-black dark:focus-within:border-white transition-all">
                <div className="pl-4 text-text-faint">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Input Placeholder"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-black dark:text-white placeholder:text-text-faint/50 text-base"
                />
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm hover:opacity-90 transition-all"
                >
                  Find Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── Main Content Grid ─────────────────────────────── */}
      <section className="bg-white dark:bg-black border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column: Posts */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter">
                  Whiteboards are remarkable.
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 4, 5].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                  {posts.slice(0, 4).map(post => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      excerpt={post.excerpt || ""}
                      date={new Date(post.published_at).toLocaleDateString(undefined, {
                        month: "short", day: "2-digit", year: "numeric",
                      })}
                      readTime={`${Math.min(10, Math.max(1, Math.ceil((post.content || post.excerpt || "").split(" ").length / 200)))} min read`}
                      views={parseInt(post.views) || 0}
                      comments={parseInt(post.comments) || 0}
                      category={post.category || "Uncategorized"}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <aside className="w-full lg:w-80 space-y-12">
              {/* Featured Section */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Featured</h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-6">
                  {posts.slice(4, 7).map(post => (
                    <Link key={post.id} href={`/post/${post.id}`} className="group flex gap-4">
                      <div className="w-20 h-20 shrink-0 bg-surface-muted rounded-xl overflow-hidden border border-border group-hover:border-black dark:group-hover:border-white transition-all">
                        {/* Placeholder for image */}
                        <div className="w-full h-full bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-text-faint font-bold mb-1">
                          {new Date(post.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <h4 className="text-sm font-bold text-black dark:text-white line-clamp-2 leading-tight group-hover:opacity-70 transition-opacity">
                          {post.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Latest Section */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Latest</h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-6">
                  {posts.slice(7, 10).map(post => (
                    <Link key={post.id} href={`/post/${post.id}`} className="group block">
                      <p className="text-[10px] uppercase tracking-wider text-text-faint font-bold mb-1">
                        {new Date(post.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <h4 className="text-sm font-bold text-black dark:text-white line-clamp-2 leading-tight group-hover:opacity-70 transition-opacity">
                        {post.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────── */}
      <section className="bg-black dark:bg-surface-muted border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 flex flex-col items-center text-center gap-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white dark:text-white tracking-tighter uppercase">
              Stay in the loop.
            </h2>
            <p className="text-text-faint max-w-xl mx-auto text-base md:text-lg">
              New deep-dives and essays — no noise, just signal.
            </p>
          </div>
          <Link
            href="/posts"
            className="px-10 py-4 rounded-full bg-white text-black dark:bg-white dark:text-black font-black uppercase tracking-widest text-sm hover:opacity-80 transition-all shadow-xl"
          >
            Start Reading
          </Link>
        </div>
      </section>
    </>
  )
}
