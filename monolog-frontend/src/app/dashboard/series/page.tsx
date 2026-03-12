"use client"

import { api } from "@/lib/api"
import { ChevronLeft, Edit, Plus, Search, Trash2, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SeriesDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<any>(null)
  
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-xl text-text-muted hover:text-surface-on hover:bg-surface-muted transition-all">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-surface-on">Series Management</h1>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all"
        >
          <Plus size={18} /> New Series
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 skeleton rounded-2xl" />)}
        </div>
      ) : series.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-border rounded-3xl">
          <p className="text-text-muted">No series created yet. Create one to group your posts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((item) => (
            <div key={item.id} className="group relative rounded-2xl border border-border bg-surface shadow-level-1 overflow-hidden transition-all hover:shadow-level-2 hover:border-primary/30">
              {item.cover_image_url && (
                <div className="h-32 w-full overflow-hidden">
                  <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-surface-on leading-tight">{item.title}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-surface-muted text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {item.post_count} Posts
                  </span>
                </div>
                <p className="text-sm text-text-muted line-clamp-2 mb-4">{item.description || "No description provided."}</p>
                <div className="flex items-center gap-2 pt-4 border-t border-border mt-auto">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <Edit size={16} />
                  </button>
                    <Link
                      href={`/dashboard/new?seriesId=${item.id}`}
                      className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                      title="Add Part to Series"
                    >
                      <Plus size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  <Link 
                    href={`/series/${item.slug}`} 
                    target="_blank"
                    className="ml-auto text-xs font-bold text-primary hover:underline"
                  >
                    View Public Page
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-surface-on">{editingSeries ? 'Edit Series' : 'Create New Series'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-surface-on">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-surface-on focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Slug</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-surface-on focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Description</label>
                <textarea
                  className="w-full h-24 px-4 py-2.5 rounded-xl border border-border bg-surface text-surface-on focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint flex items-center gap-2">
                  <ImageIcon size={14} /> Cover Image URL
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-surface-on focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="text-sm font-bold text-surface-on flex items-center gap-2">
                  <Search size={16} className="text-primary" /> SEO Settings
                </h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Meta Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-surface-on focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Meta Description</label>
                  <textarea
                    className="w-full h-20 px-4 py-2.5 rounded-xl border border-border bg-surface text-surface-on focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface text-surface-on font-semibold hover:bg-surface-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold shadow-blue hover:bg-primary-hover transition-all"
                >
                  {editingSeries ? 'Update Series' : 'Create Series'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
