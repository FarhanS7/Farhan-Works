"use client";

import { api } from "@/lib/api";
import {
  ChevronLeft,
  Save,
  Send,
  Trash2,
  Image as ImageIcon,
  Search,
  ListOrdered,
  Hash,
  Settings2,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seriesList, setSeriesList] = useState<{id: string, title: string}[]>([]);
  
  // Basic fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  
  // New fields
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [seriesOrder, setSeriesOrder] = useState(0);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const [postData, seriesData] = await Promise.all([
          api.posts.getAdminOne(resolvedParams.id, token!),
          api.series.getAll()
        ]);
        
        setSeriesList(seriesData);
        
        // Populate post fields
        setTitle(postData.title);
        setSlug(postData.slug);
        setCategory(postData.category || "");
        setExcerpt(postData.excerpt || "");
        setContent(postData.content);
        setIsPublished(postData.is_published);
        
        // Populate new fields
        setCoverImageUrl(postData.cover_image_url || "");
        setSeriesId(postData.series_id || "");
        setSeriesOrder(postData.series_order || 0);
        setSeoTitle(postData.seo_title || "");
        setSeoDescription(postData.seo_description || "");
        setSeoKeywords(postData.seo_keywords || "");
        
      } catch (err: any) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id, router]);

  const handleSubmit = async (publish: boolean) => {
    const token = api.getToken();
    if (!token) return;

    setSaving(true);
    try {
      await api.posts.update(
        resolvedParams.id,
        {
          title,
          slug,
          category,
          excerpt,
          content,
          is_published: publish,
          cover_image_url: coverImageUrl,
          series_id: seriesId || null,
          series_order: seriesOrder,
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_keywords: seoKeywords,
        },
        token,
      );
      router.push("/dashboard/posts");
    } catch (err: any) {
      alert(err.message || "Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const token = api.getToken();
    if (!token || !confirm("Are you sure you want to delete this post?"))
      return;

    try {
      await api.posts.delete(resolvedParams.id, token);
      router.push("/dashboard/posts");
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    }
  };

  if (loading)
    return (
      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-[100px] h-10 skeleton rounded-2xl" />
          <div className="h-10 w-64 skeleton rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="h-[120px] skeleton rounded-[2rem]" />
            <div className="h-[500px] skeleton rounded-[2rem]" />
          </div>
          <div className="lg:col-span-4 h-[400px] skeleton rounded-[2rem]" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-20 text-center space-y-6">
        <p className="text-error font-black text-2xl uppercase tracking-widest">Error Loading Story</p>
        <p className="text-tm max-w-sm mx-auto">{error}</p>
        <Link
          href="/dashboard/posts"
          className="dash-btn-ghost !inline-flex !w-auto border border-dash-border"
        >
          Back to Articles
        </Link>
      </div>
    );

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/posts"
            className="p-3 rounded-2xl glass-panel text-tm hover:text-tp transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="dash-title">Edit <span className="text-orange">Story</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            className="p-3 rounded-2xl glass-panel text-td hover:text-error hover:bg-error/10 transition-all"
            onClick={handleDelete}
            title="Delete Story"
          >
            <Trash2 size={20} />
          </button>
          <div className="h-8 w-[1px] bg-dash-border mx-1" />
          <button
            className="dash-btn-ghost !px-5 hidden sm:flex"
            disabled={saving}
            onClick={() => handleSubmit(isPublished)}
          >
            <Save size={18} /> Update
          </button>
          <button
            className="btn-orange shadow-orange py-3 px-6"
            disabled={saving}
            onClick={() => handleSubmit(!isPublished)}
          >
            <Send size={18} /> {isPublished ? "Unpublish" : "Publish Now"}
          </button>
        </div>
      </header>

      {/* Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Writing Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="dash-card p-1">
             <input
              type="text"
              className="w-full px-8 py-10 bg-transparent text-4xl md:text-5xl font-black text-tp placeholder:text-td border-none focus:outline-none tracking-tighter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="dash-card min-h-[600px] flex flex-col">
            <div className="px-8 py-4 border-b border-dash-border flex items-center justify-between text-xs font-black uppercase tracking-widest text-td">
               <span>Main Content</span>
               <div className="flex items-center gap-4">
                 <span>Status: {isPublished ? "Live" : "Draft"}</span>
               </div>
            </div>
            <textarea
              className="flex-1 w-full p-8 bg-transparent text-lg text-tp placeholder:text-td focus:outline-none resize-none font-medium leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="lg:col-span-4 sticky top-[100px] space-y-6">
          {/* Metadata Card */}
          <div className="dash-card p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-td mb-8 flex items-center gap-2">
              <Settings2 size={14} className="text-orange" /> Post Settings
            </h3>

            <div className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-td flex items-center gap-2">
                  <Hash size={12} /> Category
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl glass-panel text-sm text-tp focus:border-orange/50 focus:outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-td flex items-center gap-2">
                  <ImageIcon size={12} /> Cover Image URL
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl glass-panel text-sm text-tp focus:border-orange/50 focus:outline-none"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>

              {/* Series Integration */}
              <div className="space-y-4 pt-4 border-t border-dash-border">
                <label className="text-[10px] font-black uppercase tracking-widest text-td flex items-center gap-2">
                  <ListOrdered size={12} /> Series Integration
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl glass-panel text-sm text-tp focus:border-orange/50 focus:outline-none appearance-none cursor-pointer"
                  value={seriesId}
                  onChange={(e) => setSeriesId(e.target.value)}
                >
                  <option value="">None (Standalone)</option>
                  {seriesList.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>

                {seriesId && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-td">Order in Series</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 rounded-xl glass-panel text-sm text-tp focus:border-orange/50 focus:outline-none"
                      value={seriesOrder}
                      onChange={(e) => setSeriesOrder(parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEO Card */}
          <div className="dash-card p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-td mb-8 flex items-center gap-2">
              <Search size={14} className="text-orange" /> SEO Optimization
            </h3>

            <div className="space-y-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-td">SEO Title</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl glass-panel text-sm text-tp focus:border-orange/50 focus:outline-none"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-td">SEO Description</label>
                <textarea 
                  className="w-full h-24 px-4 py-3 rounded-xl glass-panel text-sm text-tp focus:border-orange/50 focus:outline-none resize-none"
                  value={seoDescription}
                  onChange={e => setSeoDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
          
           <div className="dash-card p-6 bg-orange/5 border-orange/20">
            <p className="text-[10px] font-black text-orange uppercase tracking-widest mb-1">Advanced Settings</p>
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-tm uppercase">Custom Slug</label>
               <input 
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-bg/50 border border-dash-border text-xs text-tp focus:border-orange/30 focus:outline-none"
                value={slug}
                onChange={e => setSlug(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
