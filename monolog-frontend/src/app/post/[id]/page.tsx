"use client"

import { CommentSection } from "@/components/comment-section"
import { Reactions }       from "@/components/reactions"
import { api }             from "@/lib/api"
import { ArrowLeft, BookOpen, Calendar, Clock, Eye, User } from "lucide-react"
import Link    from "next/link"
import * as React from "react"
import { useEffect, useState } from "react"

/* ── Reading progress bar ─────────────────────────────────── */
function ReadingProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const total = scrollHeight - clientHeight
      setPct(total > 0 ? Math.round((scrollTop / total) * 100) : 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="fixed top-16 inset-x-0 h-0.5 z-40 bg-border/40">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
        style={{ width: pct + "%" }}
      />
    </div>
  )
}

/* ── Skeleton loader ──────────────────────────────────────── */
function PostSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="h-3 w-20 skeleton rounded" />
      <div className="space-y-2">
        <div className="h-8 w-5/6 skeleton rounded" />
        <div className="h-8 w-4/5 skeleton rounded" />
      </div>
      <div className="flex gap-4">
        {[1,2,3].map(i => <div key={i} className="h-4 w-20 skeleton rounded" />)}
      </div>
      <div className="space-y-3 pt-4">
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} className={"h-4 skeleton rounded " + (i % 3 === 0 ? "w-4/5" : "w-full")} />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [post,    setPost]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [views,   setViews]   = useState<number | string>("…")

  const { id } = React.use(params)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.posts.getOne(id)
        setPost(data)
        const analytics = await api.analytics.recordView(data.id)
        setViews(analytics.views)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <PostSkeleton />

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
        <BookOpen size={28} />
      </div>
      <h1 className="text-2xl font-bold text-surface-on mb-2">Post Not Found</h1>
      <p className="text-text-muted mb-6">{error}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm"
      >
        <ArrowLeft size={15} /> Back to Home
      </Link>
    </div>
  )

  if (!post) return null

  const wordCount  = (post.content || "").split(/\s+/).filter(Boolean).length
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <>
      <ReadingProgress />

      {/* ── Article header ────────────────────────────── */}
      <header className="border-b border-border bg-white dark:bg-[#0B1120]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-10 space-y-6">

          {/* Back link */}
          <Link
            href="/posts"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} /> All Articles
          </Link>

          {/* Category */}
          {post.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {post.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-surface-on leading-[1.15]">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
            <span className="flex items-center gap-1.5">
              <User size={14} /> MonoLogue
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(post.published_at).toLocaleDateString(undefined, {
                month: "long", day: "numeric", year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {readMinutes} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> {views.toLocaleString()} reads
            </span>
          </div>
        </div>
      </header>

      {/* ── Article body ──────────────────────────────── */}
      <div className="bg-white dark:bg-[#0B1120]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <article
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>

      {/* ── Reactions + comments ──────────────────────── */}
      <div className="border-t border-border bg-surface-alt dark:bg-[#0F172A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12">

          {/* Reactions */}
          <section>
            <h3 className="text-xs font-bold text-text-faint uppercase tracking-widest mb-4">
              Reactions
            </h3>
            <Reactions postId={post.id} />
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Comments */}
          <CommentSection postId={post.id} />
        </div>
      </div>

      {/* ── Next article nudge ────────────────────────── */}
      <div className="border-t border-border bg-white dark:bg-[#0B1120]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">Enjoyed this article?</p>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all"
          >
            <BookOpen size={15} /> Browse More Articles
          </Link>
        </div>
      </div>
    </>
  )
}
