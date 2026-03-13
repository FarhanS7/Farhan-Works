"use client"

import { api } from "@/lib/api"
import { ArrowLeft, BookOpen, Calendar, Clock, Image as ImageIcon, ChevronRight, Layers } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { useEffect, useState } from "react"

export default function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [series, setSeries] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { slug } = React.use(params)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.series.getOne(slug)
        setSeries(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-24 space-y-8">
      <div className="h-48 skeleton rounded-3xl" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
      </div>
    </div>
  )

  if (error || !series) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-surface-on mb-4">Series Not Found</h1>
      <Link href="/posts" className="text-primary font-bold hover:underline">Back to all posts</Link>
    </div>
  )

  return (
    <div className="bg-surface min-h-screen">
      {/* Header section */}
      <div className="relative h-[45vh] min-h-[400px] flex items-end overflow-hidden">
        {series.cover_image_url ? (
          <img 
            src={series.cover_image_url} 
            alt={series.title} 
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-40" 
          />
        ) : (
          <div className="absolute inset-0 bg-surface-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-4 w-full pb-12 relative">
           <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-faint mb-8">
            <Link href="/posts" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight size={10} />
            <span className="text-primary">Series</span>
          </nav>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 backdrop-blur-sm">
              <Layers size={14} /> Comprehensive Series
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-surface-on tracking-tighter leading-none">
              {series.title}
            </h1>
            <p className="text-lg text-text-muted max-w-2xl font-medium leading-relaxed">
              {series.description}
            </p>
          </div>
        </div>
      </div>

      {/* Chapters Listing */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10 border-b border-border pb-6">
          <h2 className="text-xl font-black text-surface-on tracking-tight flex items-center gap-3">
            <BookOpen className="text-primary" /> Chapter Curriculum
          </h2>
          <span className="px-3 py-1 rounded-lg bg-surface-muted text-[10px] font-black text-text-muted uppercase tracking-widest border border-border">
            {series.posts?.length || 0} Modules
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {series.posts?.map((post: any, idx: number) => (
            <Link 
              key={post.id} 
              href={`/blog/${slug}/${post.slug}`}
              className="group flex items-center gap-6 p-6 rounded-[2rem] border border-border bg-surface hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-level-2 transition-all duration-300"
            >
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-surface-muted border border-border flex flex-col items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Ch.</span>
                <span className="text-2xl font-black leading-none">{idx + 1}</span>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="text-xl font-bold text-surface-on group-hover:text-primary transition-colors truncate">
                  {post.title}
                </h3>
                <p className="text-sm text-text-muted line-clamp-1">
                  {post.excerpt || "Dive into this chapter to learn more about this module."}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-faint group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                <ChevronRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
