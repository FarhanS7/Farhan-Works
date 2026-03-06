"use client"

import { PostCard } from "@/components/post-card"
import { api } from "@/lib/api"
import { ArrowRight, BookOpen, Rss, Sparkles, TrendingUp } from "lucide-react"
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

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))]

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-[#0B1120]">
        {/* Background decorations */}
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div
          className="hero-blob absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          aria-hidden
        />
        <div
          className="hero-blob absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10"
          aria-hidden
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(to right, var(--color-primary) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: copy */}
            <div className="space-y-8 animate-fade-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles size={14} />
                Personal knowledge base
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                <span className="text-surface-on">Ideas worth</span>{" "}
                <span className="gradient-text">exploring</span>
                <span className="text-surface-on">.</span>
              </h1>

              {/* Sub */}
              <p className="text-lg md:text-xl text-text-muted max-w-xl leading-relaxed">
                Deep thoughts, technical deep-dives, and meditations on the future
                of technology. Written to be re-read, not just skimmed.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/posts"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  Browse All Posts <ArrowRight size={16} />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white dark:bg-surface-muted text-surface-on font-semibold text-sm hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <BookOpen size={16} /> About
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex gap-8 pt-2">
                <StatBubble value={String(posts.length || "—")} label="Articles" />
                <div className="w-px bg-border" />
                <StatBubble value="∞" label="Ideas" />
                <div className="w-px bg-border" />
                <StatBubble value="0" label="Ads" />
              </div>
            </div>

            {/* Right: floating post preview cards */}
            <div className="hidden lg:block relative h-[440px]">
              {/* Card stack decoration */}
              {[
                { top: "0%",  left: "5%",  rotate: "-3deg",  delay: "0ms",   opacity: "0.5",  w: "85%" },
                { top: "5%",  left: "2%",  rotate: "-1.5deg",delay: "100ms",  opacity: "0.75", w: "90%" },
                { top: "10%", left: "0%",  rotate: "0deg",   delay: "200ms",  opacity: "1",    w: "100%" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="absolute bg-white dark:bg-[#0F172A] rounded-2xl border border-border shadow-level-2 p-5 animate-fade-up"
                  style={{
                    top: s.top, left: s.left, width: s.w,
                    transform: `rotate(${s.rotate})`,
                    opacity: s.opacity,
                    animationDelay: s.delay,
                  }}
                >
                  {i === 2 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Technology</span>
                        <span className="text-xs text-text-faint">5 min read</span>
                      </div>
                      <h3 className="font-bold text-surface-on text-lg leading-snug">
                        The Architecture of Clarity
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
                        What separates good systems from great ones is rarely the technology—
                        it is the clarity of thought that shaped the design decisions.
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-3 text-xs text-text-faint">
                          <span className="flex items-center gap-1"><TrendingUp size={12} /> 1.2k reads</span>
                          <span>Mar 2026</span>
                        </div>
                        <ArrowRight size={14} className="text-primary" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-2.5 w-1/3 bg-primary/20 rounded-full" />
                      <div className="h-4 w-5/6 bg-surface-muted dark:bg-surface-muted rounded" />
                      <div className="h-3 w-full bg-border/60 rounded" />
                      <div className="h-3 w-4/5 bg-border/60 rounded" />
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Latest Posts ──────────────────────────────────── */}
      <section className="bg-surface-alt dark:bg-[#0F172A] border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                <Rss size={15} />
                Latest
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-surface-on tracking-tight">
                Recent Articles
              </h2>
            </div>
            <Link
              href="/posts"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              View all posts <ArrowRight size={15} />
            </Link>
          </div>

          {/* Category pills (non-interactive, only visual when there are posts) */}
          {!loading && posts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.slice(0, 6).map((c, i) => (
                <CategoryPill key={c} label={c} active={i === 0} />
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-error font-medium">Could not load posts.</p>
              <p className="text-text-muted text-sm mt-1">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen size={40} className="text-text-faint mx-auto mb-3" />
              <p className="text-text-muted">No posts yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(0, 6).map(post => (
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
                />
              ))}
            </div>
          )}

          {/* Show-more link if more than 6 posts */}
          {posts.length > 6 && (
            <div className="text-center mt-12">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white dark:bg-surface-muted text-surface-on font-semibold text-sm hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                See all {posts.length} articles <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────── */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Stay in the loop.
            </h2>
            <p className="text-primary-container/80 mt-1 text-sm md:text-base">
              New deep-dives and essays — no noise, just signal.
            </p>
          </div>
          <Link
            href="/posts"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-primary-container transition-all shadow-md"
          >
            <BookOpen size={16} /> Start Reading
          </Link>
        </div>
      </section>
    </>
  )
}
