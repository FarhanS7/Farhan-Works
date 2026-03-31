"use client"

import RichTextEditor from "@/components/rich-text-editor"
import { api } from "@/lib/api"
import { ChevronLeft, Save, Send, Trash2, Image as ImageIcon, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useEffect, useState } from "react"

export default function EditPostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  
  // New fields
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [seriesId, setSeriesId] = useState("")
  const [seriesOrder, setSeriesOrder] = useState<number | "">("")
  
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = api.getToken()
    if (!token) {
      router.push("/login")
      return
    }

    async function loadData() {
      try {
        const [postData, seriesData] = await Promise.all([
          api.posts.getAdminOne(resolvedParams.id, token!),
          api.series.getAdminList(token!)
        ])
        
        setTitle(postData.title)
        setSlug(postData.slug)
        setCategory(postData.category || '')
        setExcerpt(postData.excerpt || '')
        setContent(postData.content)
        setIsPublished(postData.is_published)
        setIsFeatured(postData.is_featured || false)
        
        // Populate new fields
        setCoverImageUrl(postData.cover_image_url || "")
        setSeoTitle(postData.seo_title || "")
        setSeoDescription(postData.seo_description || "")
        setSeoKeywords(postData.seo_keywords || "")
        setSeriesId(postData.series_id || "")
        setSeriesOrder(postData.series_order ?? "")
        
        setSeriesList(seriesData)
      } catch (err: any) {
        setError(err.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [resolvedParams.id, router])

  const handleSubmit = async (publish: boolean) => {
    const token = api.getToken()
    if (!token) return

    setSaving(true)
    try {
      await api.posts.update(resolvedParams.id, {
        title,
        slug,
        category,
        excerpt,
        content,
        cover_image_url: coverImageUrl,
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: seoKeywords,
        series_id: seriesId || null,
        series_order: seriesOrder === "" ? null : Number(seriesOrder),
        is_published: publish,
        is_featured: isFeatured
      }, token)
      router.push("/dashboard/posts")
    } catch (err: any) {
      alert(err.message || "Failed to update post")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const token = api.getToken()
    if (!token || !confirm("Are you sure you want to delete this post?")) return

    try {
      await api.posts.delete(resolvedParams.id, token)
      router.push("/dashboard/posts")
    } catch (err: any) {
      alert(err.message || "Failed to delete post")
    }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 skeleton rounded-xl" />
        <div className="h-6 w-48 skeleton rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 h-96 skeleton rounded-2xl" />
        <div className="lg:col-span-4 h-80 skeleton rounded-2xl" />
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-7xl mx-auto p-8 text-center pt-24">
      <p className="text-error mb-4 font-bold text-2xl">Error</p>
      <p className="text-text-muted mb-8">{error}</p>
      <Link
        href="/dashboard/posts"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface text-surface-on font-semibold text-sm hover:bg-surface-muted transition-all"
      >
        Back to Articles
      </Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/posts"
            className="p-2 rounded-xl text-text-muted hover:text-surface-on hover:bg-surface-muted transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-surface-on">Edit Post</h1>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-error hover:bg-surface-muted transition-all"
          onClick={handleDelete}
        >
          <Trash2 size={16} /> Delete Post
        </button>
      </header>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-surface shadow-level-1 p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-on">Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-surface-on text-lg font-bold placeholder:text-text-faint focus:outline-none focus:ring-primary focus:border-primary transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-surface-on">Content</label>
              <RichTextEditor
                content={content}
                onChange={setContent}
              />
            </div>
          </div>

          {/* SEO Section */}
          <div className="rounded-2xl border border-border bg-surface shadow-level-1 p-6 space-y-6">
            <h2 className="text-lg font-bold text-surface-on flex items-center gap-2">
              <Search size={20} className="text-primary" /> SEO Optimization
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">SEO Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-surface-on text-sm focus:outline-none focus:ring-primary transition-all"
                  placeholder="Meta title for Google"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">SEO Description</label>
                <textarea
                  className="w-full h-20 px-4 py-2 rounded-xl border border-border bg-surface text-surface-on text-sm focus:outline-none focus:ring-primary transition-all resize-none"
                  placeholder="Brief summary for search results"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Keywords</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-surface-on text-sm focus:outline-none focus:ring-primary transition-all"
                  placeholder="keyword1, keyword2, ..."
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-border bg-surface shadow-level-1 sticky top-8">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-surface-on">Post Settings</h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Status */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-text-faint">Status</span>
                <div className="flex items-center justify-between">
                  <span className={
                    isPublished
                      ? "px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white border border-emerald-500 shadow-sm"
                      : "px-3 py-1 rounded-full text-xs font-semibold bg-surface-muted text-text-muted border border-border"
                  }>
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary transition-all"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    <label htmlFor="isFeatured" className="text-[10px] font-black uppercase tracking-widest text-text-faint cursor-pointer">
                      Featured
                    </label>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint flex items-center gap-2">
                  <ImageIcon size={14} /> Cover Image URL
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-surface-on text-sm focus:outline-none focus:ring-primary transition-all"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
                {coverImageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border h-32 relative group">
                    <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold">Image Preview</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Series Selection */}
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Add to Series</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-surface-on text-sm focus:outline-none focus:ring-primary transition-all"
                    value={seriesId}
                    onChange={(e) => setSeriesId(e.target.value)}
                  >
                    <option value="">None (Single Post)</option>
                    {seriesList.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                {seriesId && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Series Order</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-surface-on text-sm focus:outline-none focus:ring-primary transition-all"
                      placeholder="e.g. 1"
                      value={seriesOrder}
                      onChange={(e) => setSeriesOrder(e.target.value === "" ? "" : parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Slug</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-surface-on text-sm focus:outline-none focus:ring-primary transition-all"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Category</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-surface-on text-sm focus:outline-none focus:ring-primary transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-faint">Excerpt</label>
                <textarea
                  className="w-full h-20 px-3 py-2 rounded-xl border border-border bg-surface text-surface-on text-sm focus:outline-none focus:ring-primary transition-all resize-none"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-3">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                  onClick={() => handleSubmit(true)}
                >
                  <Send size={16} /> {isPublished ? 'Update Post' : 'Publish Now'}
                </button>
                {!isPublished && (
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-surface-alt text-surface-on font-semibold text-sm hover:border-surface-on hover:bg-surface-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving}
                    onClick={() => handleSubmit(false)}
                  >
                    <Save size={16} /> Save Draft
                  </button>
                )}
                {isPublished && (
                  <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-surface-alt text-surface-on font-semibold text-sm hover:border-surface-on hover:bg-surface-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving}
                    onClick={() => handleSubmit(false)}
                  >
                    <Save size={16} /> Switch to Draft
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
