"use client"

import { api } from "@/lib/api"
import { ArrowLeft, BookOpen, Calendar, Clock, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { useEffect, useState } from "react"

export default function SeriesDetailPage({
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
      {/* SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Series",
            "name": series.title,
            "description": series.description,
            "image": series.cover_image_url,
          })
        }}
      />

      {/* Header section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-end">
        {series.cover_image_url ? (
          <img 
            src={series.cover_image_url} 
            alt={series.title} 
            className="absolute inset-0 w-full h-full object-cover grayscale" 
          />
        ) : (
          <div className="absolute inset-0 bg-surface-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-4 w-full pb-16 relative">
          <Link href="/posts" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary mb-8 transition-all">
            <ArrowLeft size={16} /> All Articles
          </Link>
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
              Blog Series
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-surface-on tracking-tighter leading-none">
              {series.title}
            </h1>
            <p className="text-lg text-text-muted max-w-2xl">
              {series.description}
            </p>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-xl font-bold text-surface-on mb-8 flex items-center gap-3">
          <BookOpen className="text-primary" /> Articles in this series ({series.posts?.length || 0})
        </h2>
        
        <div className="space-y-6">
          {series.posts?.map((post: any, idx: number) => (
            <Link 
              key={post.id} 
              href={`/posts/${post.slug}`}
              className="group flex flex-col md:flex-row gap-6 p-6 rounded-3xl border border-border bg-surface hover:border-primary/30 hover:shadow-level-2 transition-all"
            >
              {post.cover_image_url && (
                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0">
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                   <span className="w-8 h-8 rounded-full bg-surface-muted border border-border flex items-center justify-center text-xs font-black text-primary">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-text-faint">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-surface-on group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-text-muted line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
