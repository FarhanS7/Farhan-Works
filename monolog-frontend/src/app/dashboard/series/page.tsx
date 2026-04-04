"use client"

import { api } from "@/lib/api"
import { 
  ChevronLeft, 
  Edit3, 
  Plus, 
  Search, 
  Trash2, 
  Image as ImageIcon, 
  ListOrdered,
  Layers,
  ArrowRight,
  X,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

export default function SeriesDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")

  useEffect(() => {
    loadSeries()
  }, [])

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".series-card", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const loadSeries = async () => {
    const token = api.getToken()
    if (!token) {
      router.push("/login")
      return
    }
    try {
      setLoading(true)
      const data = await api.series.getAll()
      setSeries(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingSeries(item)
      setTitle(item.title)
      setSlug(item.slug)
      setDescription(item.description || "")
      setCoverImageUrl(item.cover_image_url || "")
      setSeoTitle(item.seo_title || "")
      setSeoDescription(item.seo_description || "")
    } else {
      setEditingSeries(null)
      setTitle("")
      setSlug("")
      setDescription("")
      setCoverImageUrl("")
      setSeoTitle("")
      setSeoDescription("")
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = api.getToken()
    if (!token) return

    const data = {
      title,
      slug,
      description,
      cover_image_url: coverImageUrl,
      seo_title: seoTitle,
      seo_description: seoDescription
    }

    try {
      if (editingSeries) {
        await api.series.update(editingSeries.id, data, token)
      } else {
        await api.series.create(data, token)
      }
      setIsModalOpen(false)
      loadSeries()
    } catch (err: any) {
      alert(err.message || "Failed to save series")
    }
  }

  const handleDelete = async (id: string) => {
    const token = api.getToken()
    if (!token || !confirm("Delete this series? Posts will not be deleted but will no longer be part of this series.")) return
    try {
      await api.series.delete(id, token)
      loadSeries()
    } catch (err: any) {
      alert(err.message || "Failed to delete series")
    }
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editingSeries) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
      setSeoTitle(val)
    }
  }

  return (
    <div ref={containerRef} className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="dash-title">Learning <span className="text-orange">Series</span></h1>
          <p className="text-tm max-w-md text-sm">
            Group your articles into structured learning paths or thematic series.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-orange shadow-orange py-3.5 px-6"
        >
          <Plus size={18} /> Create Series
        </button>
      </header>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-64 skeleton rounded-[2rem]" />)}
        </div>
      ) : series.length === 0 ? (
        <div className="text-center py-32 rounded-[3rem] border-2 border-dashed border-dash-border">
          <Layers size={48} className="mx-auto text-td mb-4" />
          <p className="text-td font-black uppercase tracking-widest text-sm">
            No series yet
          </p>
          <button onClick={() => handleOpenModal()} className="text-orange font-bold text-sm hover:underline mt-2">
            Create your first collection ↗
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {series.map((item) => (
            <div key={item.id} className="series-card dash-card group overflow-hidden flex flex-col h-[420px]">
              {/* Cover Area */}
              <div className="h-44 bg-surface-muted relative overflow-hidden shrink-0 border-b border-dash-border">
                {item.cover_image_url ? (
                  <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-td">
                    <Layers size={40} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full glass-panel text-[10px] font-black uppercase tracking-widest text-tp">
                    {item.post_count} Chapters
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-xl font-black text-tp group-hover:text-orange transition-colors mb-3 line-clamp-1">{item.title}</h3>
                <p className="text-sm text-tm line-clamp-2 mb-6 flex-1">{item.description || "No description provided."}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-dash-border">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="p-3 rounded-xl text-td hover:text-orange hover:bg-orange/10 transition-all"
                      title="Edit Series"
                    >
                      <Edit3 size={18} />
                    </button>
                    <Link
                      href={`/dashboard/new?seriesId=${item.id}`}
                      className="p-3 rounded-xl text-td hover:text-orange hover:bg-orange/10 transition-all"
                      title="Add Chapter"
                    >
                      <Plus size={18} />
                    </Link>
                    <Link 
                      href={`/dashboard/series/${item.id}/sort`}
                      className="p-3 rounded-xl text-td hover:text-orange hover:bg-orange/10 transition-all"
                      title="Reorder"
                    >
                      <ListOrdered size={18} />
                    </Link>
                  </div>
                  
                  <Link 
                    href={`/series/${item.slug}`} 
                    target="_blank"
                    className="p-3 rounded-xl text-td hover:text-tp hover:bg-dash-hover transition-all"
                  >
                    <ExternalLink size={18} />
                  </Link>
                </div>
              </div>
              
              {/* Delete button hidden in group hover */}
              <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="glass-panel rounded-[3rem] w-full max-w-2xl shadow-orange-lg overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-8 border-b border-dash-border flex justify-between items-center bg-bg/50">
              <h2 className="text-2xl font-black text-tp tracking-tight">
                {editingSeries ? 'Edit' : 'New'} <span className="text-orange">Series</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-tm hover:text-tp"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-td">Series Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-2xl glass-panel bg-surface-muted text-tp focus:border-orange/50 focus:outline-none transition-all"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-td">Custom Slug</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-2xl glass-panel bg-surface-muted text-tp focus:border-orange/50 focus:outline-none transition-all"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-td">Description</label>
                <textarea
                  className="w-full h-32 px-5 py-4 rounded-2xl glass-panel bg-surface-muted text-tp focus:border-orange/50 focus:outline-none transition-all resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-td flex items-center gap-2">
                  <ImageIcon size={12} /> Cover Image URL
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 rounded-2xl glass-panel bg-surface-muted text-tp focus:border-orange/50 focus:outline-none transition-all"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>

              {/* SEO Expandable */}
              <div className="pt-8 border-t border-dash-border space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange">Search Optimization (SEO)</p>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-td">Meta Title</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 rounded-2xl glass-panel bg-surface-muted text-tp focus:border-orange/50 focus:outline-none transition-all"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-td">Meta Description</label>
                  <textarea
                    className="w-full h-24 px-5 py-4 rounded-2xl glass-panel bg-surface-muted text-tp focus:border-orange/50 focus:outline-none transition-all resize-none"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-dash-border bg-bg/50 flex gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl glass-panel text-tm font-bold hover:bg-dash-hover transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e: any) => handleSubmit(e)}
                className="flex-[2] py-4 rounded-2xl bg-orange text-white font-black uppercase tracking-widest shadow-orange hover:bg-orange-dark transition-all"
              >
                {editingSeries ? 'Update Changes' : 'Create Series'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
