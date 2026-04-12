"use client"

import { api } from "@/lib/api"
import { Layers, BookOpen, ChevronRight, LayoutTemplate } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { useEffect, useState } from "react"

export default function SeriesIndexPage() {
  const [allSeries, setAllSeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.series.getAll()
        setAllSeries(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="bg-surface min-h-screen">
      {/* Header section */}
      <div className="border-b border-border bg-surface-muted pb-16 pt-24">
        <div className="container-px">
          <div className="max-w-[820px] mx-auto w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary border border-primary/20 mb-4 shadow-sm">
              <Layers size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-surface-on tracking-tighter">
              Learning Series
            </h1>
            <p className="text-lg text-text-muted max-w-xl mx-auto">
              Curated collections of articles designed to take you from beginner to expert on specific topics. Follow along step-by-step.
            </p>
          </div>
        </div>
      </div>

      {/* Series Grid */}
      <div className="container-px py-24">
        <div className="max-w-[1000px] mx-auto w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[400px] skeleton rounded-3xl" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">Failed to load series: {error}</p>
            </div>
          ) : allSeries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {allSeries.map((series) => (
                <Link
                  key={series.id}
                  href={`/series/${series.slug}`}
                  className="group flex flex-col bg-surface border border-border rounded-4xl overflow-hidden hover:border-primary/50 hover:shadow-level-2 transition-all duration-300"
                >
                  {/* Cover */}
                  <div className="h-48 group-hover:h-52 overflow-hidden relative transition-all duration-500 bg-surface-muted">
                    {series.cover_image_url ? (
                      <>
                        <img 
                          src={series.cover_image_url} 
                          alt={series.title} 
                          className="w-full h-full object-cover grayscale-[80%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-text-faint">
                        <LayoutTemplate size={48} opacity={0.2} />
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur border border-surface-on/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       <BookOpen size={12} className="text-primary" /> {series.post_count || 0} Topics
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-1">
                    <h2 className="text-2xl font-black text-surface-on group-hover:text-primary transition-colors tracking-tight mb-3">
                      {series.title}
                    </h2>
                    <p className="text-text-muted text-sm line-clamp-3 mb-8 flex-1">
                      {series.description || "A curated collection of articles on this topic."}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-border flex items-center justify-between text-xs font-bold text-surface-on group-hover:text-primary transition-colors">
                      <span className="tracking-widest uppercase text-[10px]">Start Learning</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
             <div className="text-center py-20 bg-surface-muted border border-border rounded-4xl">
              <h3 className="text-xl font-bold text-surface-on mb-2">No Series Available</h3>
              <p className="text-text-muted">Stay tuned for upcoming learning series!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
