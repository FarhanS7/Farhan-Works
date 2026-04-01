"use client"

import { CommentSection } from "@/components/comment-section"
import { Reactions } from "@/components/reactions"
import { api } from "@/lib/api"
import DOMPurify from "dompurify"
import { ArrowLeft, BookOpen, Calendar, Clock, Eye, User, Layers, ChevronRight } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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
    <div className="fixed top-16 inset-x-0 h-0.5 z-40 bg-border">
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

export default function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string }>
}) {
  const router = useRouter()
  const [post,    setPost]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [views,   setViews]   = useState<number | string>("…")

  const { slug, chapterSlug } = React.use(params)

  useEffect(() => {
    async function load() {
      try {
        // Fetch post by chapter slug (posts can be fetched by slug)
        const data = await api.posts.getOne(chapterSlug)
        // Sanitize HTML
        const sanitized = DOMPurify.sanitize(data.content ?? '', {
          USE_PROFILES: { html: true },
          FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
        })
        setPost({ ...data, content: sanitized })
        const analytics = await api.analytics.recordView(data.id)
        setViews(analytics.views)
      } catch (e: any) {
        // Redirection logic for missing chapters as per PRD
        router.push(`/blog/${slug}`)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, chapterSlug, router])

  if (loading) return <PostSkeleton />
  if (!post) return null

  const wordCount  = (post.content || "").split(/\s+/).filter(Boolean).length
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200))
  
  // Chapter progress calculation
  const currentChapter = post.series_order || 0
  const totalChapters = post.series_nav?.all?.length || 0

  return (
    <>
      <ReadingProgress />
      
      {/* ── Article header ────────────────────────────── */}
      <header className="border-b border-border bg-surface overflow-hidden">
        {post.cover_image_url && (
          <div className="w-full h-[40vh] min-h-[300px] relative overflow-hidden">
            <img 
              src={post.cover_image_url} 
              alt={post.title} 
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          </div>
        )}
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-10 space-y-6 relative">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-faint">
            <Link href="/posts" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight size={10} />
            <Link href={`/blog/${slug}`} className="hover:text-primary transition-colors line-clamp-1">{post.series_title}</Link>
            <ChevronRight size={10} />
            <span className="text-primary">Chapter {currentChapter}</span>
          </nav>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
               Chapter {currentChapter} of {totalChapters}
             </div>
             {post.category && (
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  • {post.category}
                </span>
             )}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-surface-on leading-[1.15]">
            {post.title}
          </h1>

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
      <div className="bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          
          {/* Series Navigator (Table of Contents) */}
          {post.series_nav && post.series_nav.all && (
            <div className="mb-12 rounded-[2.5rem] bg-surface border-2 border-primary/10 overflow-hidden shadow-level-2 ring-8 ring-primary/5">
              <div className="bg-primary px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <Layers size={20} className="text-white/80" />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 leading-none mb-1">Learning Series</h4>
                    <p className="text-sm font-black tracking-tight">{post.series_title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                  <BookOpen size={10} /> {post.series_nav.all.length} Topics
                </div>
              </div>
              
              <div className="p-4 sm:p-8 bg-surface">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {post.series_nav.all.map((item: any, idx: number) => (
                    <Link
                      key={item.id}
                      href={`/blog/${slug}/${item.slug}`}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative border ${
                        item.id === post.id
                          ? "bg-primary/5 border-primary/20 shadow-sm"
                          : "hover:bg-surface-muted border-transparent hover:border-border"
                      }`}
                    >
                      <span className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${
                        item.id === post.id
                          ? "bg-primary text-white border-primary rotate-3"
                          : "bg-surface-muted text-text-faint border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 group-hover:-rotate-3"
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${
                          item.id === post.id ? "text-primary" : "text-surface-on"
                        }`}>
                          {item.title}
                        </p>
                        {item.id === post.id ? (
                          <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Currently Reading</span>
                        ) : (
                          <span className="text-[10px] font-black text-text-faint uppercase tracking-widest group-hover:text-primary/60 transition-colors">Jump to Topic</span>
                        )}
                      </div>
                      {item.id === post.id && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        </div>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Quick Prev/Next Container */}
                <div className="mt-8 pt-8 border-t border-border flex items-center justify-between gap-6">
                  {post.series_nav.prev ? (
                    <Link href={`/blog/${slug}/${post.series_nav.prev.slug}`} className="flex-1 group flex items-center gap-4 p-4 rounded-2xl bg-surface-muted border border-border hover:border-primary/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-faint group-hover:text-primary transition-colors">
                        <ArrowLeft size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-text-faint uppercase tracking-wider">Previous Part</p>
                        <p className="text-sm font-bold text-surface-on truncate">{post.series_nav.prev.title}</p>
                      </div>
                    </Link>
                  ) : <div className="flex-1" />}

                  {post.series_nav.next ? (
                    <Link href={`/blog/${slug}/${post.series_nav.next.slug}`} className="flex-1 group flex items-center gap-4 p-4 rounded-2xl bg-surface-muted border border-border hover:border-primary/30 transition-all text-right">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-text-faint uppercase tracking-wider">Next Part</p>
                        <p className="text-sm font-bold text-surface-on truncate">{post.series_nav.next.title}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-faint group-hover:text-primary transition-colors">
                        <ArrowLeft size={18} className="translate-x-0.5 rotate-180" />
                      </div>
                    </Link>
                  ) : <div className="flex-1" />}
                </div>
              </div>
            </div>
          )}

          <article
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>

      {/* ── Reactions + comments ──────────────────────── */}
      <div className="border-t border-border bg-surface-muted">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12">
          <section>
            <h3 className="text-xs font-bold text-text-faint uppercase tracking-widest mb-4">Reactions</h3>
            <Reactions postId={post.id} />
          </section>
          <div className="border-t border-border" />
          <CommentSection postId={post.id} />
        </div>
      </div>
    </>
  )
}
