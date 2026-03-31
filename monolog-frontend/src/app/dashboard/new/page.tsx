"use client"

import RichTextEditor from "@/components/rich-text-editor"
import { api } from "@/lib/api"
import { ChevronLeft, Save, Send, Image as ImageIcon, Search, Plus, Trash2, BookOpen, Layers } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

export default function NewPostPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <NewPostForm />
    </Suspense>
  )
}

function NewPostForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"single" | "series">("single")
  
  // COMMON STATE
  const [category, setCategory] = useState("Technology")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  
  // SINGLE POST STATE
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seriesId, setSeriesId] = useState(searchParams.get("seriesId") || "") 

  // SERIES WIZARD STATE
  const [seriesTitle, setSeriesTitle] = useState("")
  const [seriesDescription, setSeriesDescription] = useState("")
  const [parts, setParts] = useState([{ title: "", content: "", slug: "", excerpt: "" }])
  
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [targetSeriesId, setTargetSeriesId] = useState(searchParams.get("seriesId") || "") // For Wizard mode

  useEffect(() => {
    const fetchSeries = async () => {
      const token = api.getToken()
      if (token) {
        try {
          const data = await api.series.getAdminList(token)
          setSeriesList(data)
        } catch (err) {
          console.error("Failed to fetch series list", err)
        }
      }
    }
    fetchSeries()
  }, [])

  const handleAddPart = () => {
    setParts([...parts, { title: "", content: "", slug: "", excerpt: "" }])
  }

  const handleRemovePart = (index: number) => {
    if (parts.length > 1) {
      setParts(parts.filter((_, i) => i !== index))
    }
  }

  const updatePart = (index: number, fields: any) => {
    const newParts = [...parts]
    newParts[index] = { ...newParts[index], ...fields }
    
    // Auto-generate slug if title changed
    if (fields.title) {
      newParts[index].slug = fields.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    }
    
    setParts(newParts)
  }

  const handleSingleSubmit = async (isPublished: boolean) => {
    const token = api.getToken()
    if (!token) return router.push("/login")

    setLoading(true)
    try {
      await api.posts.create({
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        category,
        excerpt: "",
        content,
        cover_image_url: coverImageUrl,
        seo_title: seoTitle || title,
        seo_description: seoDescription,
        series_id: seriesId || null,
        is_published: isPublished,
        is_featured: isFeatured
      }, token)
      router.push("/dashboard/posts")
    } catch (err: any) {
      alert(err.message || "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  const handleSeriesSubmit = async () => {
    const token = api.getToken()
    if (!token) return router.push("/login")

    let finalSeriesId = targetSeriesId
    let startOrder = 0

    if (!finalSeriesId) {
      if (!seriesTitle) return alert("Please enter a series title for the new series")
      setLoading(true)
      try {
        const series = await api.series.create({
          title: seriesTitle,
          slug: seriesTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          description: seriesDescription,
          cover_image_url: coverImageUrl,
          seo_title: seriesTitle,
          seo_description: seriesDescription
        }, token)
        finalSeriesId = series.id
      } catch (err: any) {
        setLoading(false)
        return alert(err.message || "Failed to create series")
      }
    } else {
      // Fetch existing series to get current post count for ordering
      try {
        setLoading(true)
        const existing = await api.series.getOne(finalSeriesId)
        startOrder = existing.posts?.length || 0
      } catch (_err) {
        setLoading(false)
        return alert("Failed to fetch existing series details")
      }
    }

    if (parts.some(p => !p.title || !p.content)) {
      setLoading(false)
      return alert("All parts must have a title and content")
    }

    try {
      // Create all posts
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        await api.posts.create({
          title: part.title,
          slug: part.slug || part.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          category,
          excerpt: part.excerpt || part.title,
          content: part.content,
          cover_image_url: coverImageUrl,
          series_id: finalSeriesId,
          series_order: startOrder + i + 1,
          is_published: true
        }, token)
      }

      router.push("/dashboard/posts")
    } catch (err: any) {
      alert(err.message || "Failed to create series posts")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-text-muted hover:text-surface-on hover:bg-surface-muted transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-surface-on tracking-tighter">Content Creator</h1>
            <p className="text-sm text-text-muted font-medium">Draft your next masterpiece</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-surface-muted border border-border rounded-xl">
          <button
            onClick={() => setMode("single")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              mode === "single" ? "bg-surface text-primary shadow-sm" : "text-text-faint hover:text-text-muted"
            }`}
          >
            <BookOpen size={14} /> Single Article
          </button>
          <button
            onClick={() => setMode("series")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              mode === "series" ? "bg-surface text-primary shadow-sm" : "text-text-faint hover:text-text-muted"
            }`}
          >
            <Layers size={14} /> Series Wizard
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Form */}
        <div className="lg:col-span-8 space-y-8">
          {mode === "single" ? (
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-level-1 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-text-faint pl-1">Article Title</label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 rounded-3xl border border-border bg-surface text-surface-on text-xl font-black placeholder:text-text-faint focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    placeholder="The architecture of everything..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-text-faint pl-1">Body Content</label>
                  <RichTextEditor content={content} onChange={setContent} />
                </div>
              </div>

              {/* SEO for Single */}
              <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-level-1 space-y-6">
                <h3 className="text-lg font-black text-surface-on flex items-center gap-2">
                  <Search size={22} className="text-primary" /> Search Optimization
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full px-5 py-3 rounded-2xl border border-border text-sm"
                    placeholder="Meta Title"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full px-5 py-3 rounded-2xl border border-border text-sm h-24"
                    placeholder="Meta Description"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Series Details */}
              <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-level-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-surface-on tracking-tight">Step 1: Series Narrative</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-text-faint uppercase">Target:</span>
                    <select 
                      className="text-[10px] font-black uppercase tracking-widest bg-surface-muted border border-border rounded-lg px-3 py-1 text-primary focus:outline-none"
                      value={targetSeriesId}
                      onChange={(e) => setTargetSeriesId(e.target.value)}
                    >
                      <option value="">+ New Series</option>
                      {seriesList.map(s => <option key={s.id} value={s.id}>Existing: {s.title}</option>)}
                    </select>
                  </div>
                </div>
                
                {!targetSeriesId ? (
                  <div className="grid grid-cols-1 gap-5">
                    <input
                      type="text"
                      className="w-full px-6 py-4 rounded-3xl border border-border bg-surface text-xl font-black placeholder:text-text-faint focus:outline-none focus:border-primary transition-all"
                      placeholder="Series Name (e.g. System Design 101)"
                      value={seriesTitle}
                      onChange={(e) => setSeriesTitle(e.target.value)}
                    />
                    <textarea
                      className="w-full px-6 py-4 rounded-3xl border border-border text-sm h-24"
                      placeholder="What is this series about?"
                      value={seriesDescription}
                      onChange={(e) => setSeriesDescription(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                    <Layers className="text-primary" size={24} />
                    <div>
                      <p className="text-sm font-black text-primary uppercase tracking-widest">Selected Existing Series</p>
                      <p className="text-lg font-bold text-surface-on">{seriesList.find(s => s.id === targetSeriesId)?.title}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Series Parts */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-surface-on tracking-tight">Step 2: Articles in Series</h3>
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                     {parts.length} Parts Total
                   </span>
                </div>
                
                {parts.map((part, index) => (
                  <div key={index} className="group relative bg-surface border border-border rounded-[2.5rem] p-8 shadow-level-1 space-y-6 transition-all border-l-4 border-l-transparent hover:border-l-primary">
                    <div className="flex items-center justify-between mb-2">
                       <span className="w-10 h-10 rounded-full bg-surface-muted border border-border flex items-center justify-center text-xs font-black text-primary">
                         {index + 1}
                       </span>
                       <button 
                         onClick={() => handleRemovePart(index)}
                         className="p-2 rounded-xl text-text-faint hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                    <input
                      type="text"
                      className="w-full px-0 py-0 border-none bg-transparent text-xl font-black placeholder:text-text-faint focus:outline-none"
                      placeholder={`Part ${index + 1} Title`}
                      value={part.title}
                      onChange={(e) => updatePart(index, { title: e.target.value })}
                    />
                    <RichTextEditor 
                      content={part.content} 
                      onChange={(val) => updatePart(index, { content: val })} 
                      placeholder={`What are we diving into in Part ${index + 1}?`}
                    />
                  </div>
                ))}

                <button
                  onClick={handleAddPart}
                  className="w-full py-6 border-2 border-dashed border-border rounded-[2.5rem] text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center group-hover:rotate-90 transition-all">
                    <Plus size={24} />
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest">Append Next Part</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-level-1 sticky top-8 space-y-8">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-faint">Global Settings</h3>
             
             {/* Featured Toggle */}
             <div className="p-4 rounded-3xl bg-surface-muted border border-border flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Featured Post</span>
                  <span className="text-[9px] text-text-faint">Show on Hero section</span>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded-lg border-border text-primary focus:ring-primary transition-all cursor-pointer"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
             </div>
             
             {/* Category */}
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Category Segment</label>
               <input
                 type="text"
                 className="w-full px-5 py-3 rounded-2xl border border-border text-sm font-bold"
                 value={category}
                 onChange={(e) => setCategory(e.target.value)}
               />
             </div>

             {/* Cover Photo */}
             <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                 <ImageIcon size={14} /> Showcase Image
               </label>
               <input
                 type="text"
                 className="w-full px-5 py-3 rounded-2xl border border-border text-xs"
                 placeholder="Wallpaper URL..."
                 value={coverImageUrl}
                 onChange={(e) => setCoverImageUrl(e.target.value)}
               />
               {coverImageUrl && (
                 <div className="rounded-2xl overflow-hidden aspect-video border border-border">
                   <img src={coverImageUrl} className="w-full h-full object-cover" alt="Preview" />
                 </div>
               )}
             </div>

             {/* Existing Series (Only for single) */}
             {mode === "single" && (
               <div className="pt-6 border-t border-border space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Attach to Series</label>
                 <select
                   className="w-full px-5 py-3 rounded-2xl border border-border text-sm"
                   value={seriesId}
                   onChange={(e) => setSeriesId(e.target.value)}
                 >
                   <option value="">Independent Article</option>
                   {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                 </select>
               </div>
             )}

             {/* Submit */}
             <div className="pt-6 border-t border-border space-y-4">
                <button
                  disabled={loading}
                  onClick={mode === "single" ? () => handleSingleSubmit(true) : handleSeriesSubmit}
                  className="w-full py-5 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-blue hover:bg-primary-hover transition-all flex items-center justify-center gap-3"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                  {mode === "single" ? "Launch Article" : "Deploy full Series"}
                </button>
                {mode === "single" && (
                   <button
                    disabled={loading}
                    onClick={() => handleSingleSubmit(false)}
                    className="w-full py-5 rounded-[2rem] border border-border bg-surface-muted text-surface-on font-black text-xs uppercase tracking-[0.2em] hover:bg-surface transition-all flex items-center justify-center gap-3"
                   >
                     <Save size={16} /> Save Manifest
                   </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}