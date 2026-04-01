"use client"

import { api } from "@/lib/api"
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Layers, 
  Play, 
  List, 
  X,
  Share2,
  Bookmark
} from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { useEffect, useState } from "react"
import DOMPurify from "dompurify"

export default function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [series, setSeries] = useState<any>(null)
  const [firstPost, setFirstPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showChapters, setShowChapters] = useState(false)

  const { slug } = React.use(params)

  useEffect(() => {
    async function loadSeries() {
      try {
        const data = await api.series.getOne(slug)
        setSeries(data)

        // If there are posts, fetch the first one's content immediately
        if (data.posts && data.posts.length > 0) {
          setContentLoading(true)
          try {
            // Fetch the first post by its slug
            const postData = await api.posts.getOne(data.posts[0].slug)
            // Sanitize HTML
            const sanitized = DOMPurify.sanitize(postData.content ?? '', {
              USE_PROFILES: { html: true },
              FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
              FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
            })
            setFirstPost({ ...postData, content: sanitized })
          } catch (e) {
            console.error("Failed to load first chapter", e)
          } finally {
            setContentLoading(false)
          }
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadSeries()
  }, [slug])

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-24 space-y-8 animate-pulse">
      <div className="h-64 bg-surface-muted rounded-[3rem]" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 bg-surface-muted rounded-xl" />
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 bg-surface-muted rounded-lg w-full" />)}
      </div>
    </div>
  )

  if (error || !series) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 text-red-500 mb-6">
        <X size={40} />
      </div>
      <h1 className="text-3xl font-black text-surface-on mb-4">Series Not Found</h1>
      <p className="text-text-muted mb-8">The learning path you're looking for might have been moved or deleted.</p>
      <Link href="/posts" className="px-8 py-4 rounded-2xl bg-primary text-white font-black hover:shadow-lg hover:shadow-primary/20 transition-all">
        Back to all posts
      </Link>
    </div>
  )

  const wordCount = (firstPost?.content || "").replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="bg-surface min-h-screen relative">
      {/* ── Background Aesthetic ── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent rounded-full blur-[100px]" />
      </div>

      {/* ── Main Layout ── */}
      <div className="relative">
        
        {/* ── Hero Header ── */}
        <header className="relative pt-32 pb-16 overflow-hidden">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              
              {/* Series Visual */}
              <div className="w-full md:w-1/3 aspect-[4/5] relative group shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] rotate-3 group-hover:rotate-6 transition-transform duration-500" />
                <div className="absolute inset-0 bg-surface border-2 border-border rounded-[2.5rem] -rotate-3 group-hover:-rotate-1 transition-transform duration-500 overflow-hidden shadow-level-3">
                  {series.cover_image_url ? (
                    <img 
                      src={series.cover_image_url} 
                      alt={series.title}
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-muted flex items-center justify-center">
                      <Layers className="w-20 h-20 text-text-faint" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60" />
                </div>
              </div>

              {/* Series Info */}
              <div className="flex-1 space-y-8 py-4">
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-faint">
                  <Link href="/posts" className="hover:text-primary transition-colors">Digital Garden</Link>
                  <ChevronRight size={10} />
                  <span className="text-primary">Curated Series</span>
                </nav>

                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 backdrop-blur-sm">
                    <BookOpen size={14} /> Comprehensive Learning Path
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-surface-on tracking-tighter leading-[0.9] drop-shadow-sm">
                    {series.title}
                  </h1>
                  <p className="text-xl text-text-muted max-w-2xl font-medium leading-relaxed">
                    {series.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => {
                       const contentEl = document.getElementById('main-content');
                       contentEl?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white font-black hover:shadow-xl hover:shadow-primary/30 transition-all group active:scale-95"
                  >
                    <Play size={18} fill="currentColor" />
                    Start Reading
                  </button>
                  <button 
                    onClick={() => setShowChapters(true)}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-surface-muted border border-border text-surface-on font-black hover:bg-surface hover:border-primary/40 transition-all group active:scale-95"
                  >
                    <List size={18} />
                    View Curriculum
                  </button>
                </div>

                <div className="pt-6 flex items-center gap-8 text-xs font-black uppercase tracking-widest text-text-faint border-t border-border">
                  <span className="flex items-center gap-2"><Layers size={14}/> {series.posts?.length || 0} Modules</span>
                  <span className="flex items-center gap-2"><Clock size={14}/> ~{series.posts?.length * 10}m Read</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content Area ── */}
        <section id="main-content" className="max-w-4xl mx-auto px-6 pb-32">
          {contentLoading ? (
            <div className="space-y-6 pt-12">
               <div className="h-10 w-2/3 skeleton rounded-xl" />
               <div className="h-4 w-full skeleton rounded-lg" />
               <div className="h-4 w-full skeleton rounded-lg" />
               <div className="h-4 w-4/5 skeleton rounded-lg" />
            </div>
          ) : firstPost ? (
            <div className="space-y-16">
               <div className="flex items-center justify-between border-b border-border pb-8">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">Chapter 01</span>
                    <h2 className="text-3xl font-black text-surface-on tracking-tight">{firstPost.title}</h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-text-muted text-sm font-medium">
                     <span className="flex items-center gap-2"><Clock size={14} /> {readMinutes} min read</span>
                     <div className="flex items-center gap-2">
                        <button className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors border border-border">
                          <Bookmark size={16} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors border border-border">
                          <Share2 size={16} />
                        </button>
                     </div>
                  </div>
               </div>

               <article 
                className="article-content max-w-none"
                dangerouslySetInnerHTML={{ __html: firstPost.content }}
               />

               <div className="pt-16 border-t border-border flex flex-col items-center text-center gap-6">
                  <div className="w-16 h-1 bg-primary/20 rounded-full" />
                  <div>
                    <h4 className="text-xl font-black text-surface-on mb-2">Enjoyed the first module?</h4>
                    <p className="text-text-muted">Master the rest of the craft by diving into the full curriculum.</p>
                  </div>
                  <button 
                    onClick={() => setShowChapters(true)}
                    className="flex items-center gap-3 px-10 py-5 rounded-3xl bg-surface-on text-surface font-black hover:scale-105 transition-all shadow-xl active:scale-95"
                  >
                    Launch Full Curriculum
                  </button>
               </div>
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-border rounded-[3rem]">
               <Layers size={48} className="mx-auto text-text-faint mb-4" />
               <p className="font-bold text-text-muted">This series is currently being drafted.</p>
            </div>
          )}
        </section>

      </div>

      {/* ── Curriculum Drawer Overlay ── */}
      {showChapters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-surface/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowChapters(false)}
          />
          
          {/* Drawer */}
          <div className="relative w-full max-w-xl bg-surface border-l border-border h-full overflow-hidden shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col">
            <div className="p-8 border-b border-border flex items-center justify-between shrink-0">
               <div>
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-1">Learning Path</h3>
                 <p className="text-xl font-black text-surface-on tracking-tight">Full Curriculum</p>
               </div>
               <button 
                onClick={() => setShowChapters(false)}
                className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center text-text-muted hover:bg-primary/10 hover:text-primary transition-all border border-border group"
               >
                 <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
               <div className="space-y-4">
                 {series.posts?.map((post: any, idx: number) => (
                    <Link 
                      key={post.id} 
                      href={`/blog/${slug}/${post.slug}`}
                      className="group block p-6 rounded-[2rem] border border-border bg-surface hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-level-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-surface-muted border border-border flex flex-col items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                          <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">Ch.</span>
                          <span className="text-xl font-black leading-none">{idx + 1}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-surface-on group-hover:text-primary transition-colors truncate">
                            {post.title}
                          </h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-faint group-hover:text-primary/60 transition-colors">
                            {post.category || 'Module Content'}
                          </p>
                        </div>

                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-faint group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </Link>
                 ))}
               </div>
            </div>

            <div className="p-8 bg-surface-muted border-t border-border shrink-0">
               <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Progress Tracker</p>
                  <span className="text-xs font-black text-primary">0 / {series.posts?.length} Completed</span>
               </div>
               <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '0%' }} />
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
