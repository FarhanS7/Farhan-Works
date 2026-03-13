"use client"

import { api } from "@/lib/api"
import { ArrowLeft, BookOpen, Calendar, Clock, Eye, User, Layers, ChevronRight } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SeriesPage from "./SeriesMain"

export default function CatchAllBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [type, setType] = useState<"post" | "series" | "loading">("loading")
  const { slug } = React.use(params)

  useEffect(() => {
    async function checkType() {
      try {
        // Try series first
        await api.series.getOne(slug)
        setType("series")
      } catch (e) {
        // If not series, must be single post
        setType("post")
      }
    }
    checkType()
  }, [slug])

  if (type === "loading") return (
    <div className="max-w-4xl mx-auto px-4 py-24 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (type === "series") {
    return <SeriesPage params={Promise.resolve({ slug })} />
  }

  // Reuse the existing detail logic but wrapped if needed, or just import it.
  // Actually, let's keep it simple: route to single post view.
  // However, single posts in PRD should also be under /blog/{slug}.
  // Since we don't have a dedicated SinglePostComponent yet that handles the same styling as ChapterPage,
  // I will create a refined single post view here.
  return <SinglePostView slug={slug} />
}

function SinglePostView({ slug }: { slug: string }) {
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.posts.getOne(slug)
        setPost(data)
      } catch (e) {
        setPost(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) return <div className="p-24 text-center">Loading article...</div>
  if (!post) return <div className="text-center py-24">Article not found.</div>

  // If it's part of a series but accessed via /blog/{slug}, redirect to /blog/{series}/{slug}
  if (post.series_slug) {
    router.replace(`/blog/${post.series_slug}/${post.slug}`);
    return null;
  }

  const wordCount  = (post.content || "").split(/\s+/).filter(Boolean).length
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="bg-surface min-h-screen">
       <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-faint hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back to Feed
          </Link>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-surface-on leading-none">
            {post.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-text-muted font-medium">
             <span className="flex items-center gap-2"><Calendar size={14}/> {new Date(post.published_at).toLocaleDateString()}</span>
             <span className="flex items-center gap-2"><Clock size={14}/> {readMinutes} min read</span>
          </div>
       </header>
       <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
          <article 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
       </div>
    </div>
  )
}
