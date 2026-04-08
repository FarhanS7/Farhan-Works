"use client";

import { api } from "@/lib/api";
import {
  ChevronLeft,
  Save,
  Send,
  Image as ImageIcon,
  Search,
  ListOrdered,
  Hash,
  Settings2,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Series } from "@/types";

export function PostEditor({ 
  initialSeriesList, 
  preSelectedSeriesId = "" 
}: { 
  initialSeriesList: Series[], 
  preSelectedSeriesId?: string 
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [seriesId, setSeriesId] = useState(preSelectedSeriesId);
  const [seriesOrder, setSeriesOrder] = useState(0);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Auto-generate slug from title
  useEffect(() => {
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [title]);

  const handleSubmit = async (publish: boolean) => {
    if (!title || !content) {
      alert("Please fill in the title and content");
      return;
    }

    setSaving(true);
    try {
      await api.posts.create({
        title,
        slug,
        category,
        excerpt,
        content,
        is_published: publish,
        cover_image_url: coverImageUrl,
        series_id: seriesId || undefined,
        series_order: seriesOrder,
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: seoKeywords,
      });
      router.push("/dashboard/posts");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/posts"
            className="p-3 rounded-2xl glass-panel text-tm hover:text-tp transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="dash-title">Draft <span className="text-orange">New Story</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            className="dash-btn-ghost !px-5 hidden sm:flex"
            disabled={saving}
            onClick={() => handleSubmit(false)}
          >
            <Save size={18} /> Save Draft
          </button>
          <button
            className="btn-orange shadow-orange py-3 px-6"
            disabled={saving}
            onClick={() => handleSubmit(true)}
          >
            <Send size={18} /> Publish
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="dash-card p-1">
             <input
              type="text"
              placeholder="Enter your story title..."
              className="w-full px-8 py-10 bg-transparent text-4xl md:text-5xl font-black text-tp placeholder:text-td border-none focus:outline-none tracking-tighter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="dash-card min-h-[600px] flex flex-col">
            <div className="px-8 py-4 border-b border-dash-border flex items-center justify-between text-xs font-black uppercase tracking-widest text-td">
               <span>Main Content</span>
               <span>{content.length} characters</span>
            </div>
            <textarea
              placeholder="Begin your story here..."
              className="flex-1 w-full p-8 bg-transparent text-lg text-tp placeholder:text-td focus:outline-none resize-none font-medium leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        <div className="lg:col-span-4 sticky top-[100px] space-y-6">
          <div className="dash-card p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-td mb-8 flex items-center gap-2">
              <Settings2 size={14} className="text-orange" /> Post Settings
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-td flex items-center gap-2">
                  <Hash size={12} /> Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design, Tech"
                  className="w-full px-4 py-3 rounded-xl glass-panel text-sm text-tp focus:border-orange/50 focus:outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-td flex items-center gap-2">
                  <ImageIcon size={12} /> Cover Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl glass-panel text-sm text-tp focus:border-orange/50 focus:outline-none"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>
              <div className="space-y-4 pt-4 border-t border-dash-border">
                <label className="text-[10px] font-black uppercase tracking-widest text-td flex items-center gap-2">
                  <ListOrdered size={12} /> Series Integration
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl glass-panel text-sm text-tp appearance-none cursor-pointer"
                  value={seriesId}
                  onChange={(e) => setSeriesId(e.target.value)}
                >
                  <option value="">None (Standalone)</option>
                  {initialSeriesList.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                {seriesId && (
                  <input
                    type="number"
                    placeholder="Order"
                    className="w-full px-4 py-3 rounded-xl glass-panel text-sm text-tp"
                    value={seriesOrder}
                    onChange={(e) => setSeriesOrder(parseInt(e.target.value) || 0)}
                  />
                )}
              </div>
            </div>
          </div>
          {/* SEO Optimized Card Snippet */}
          <div className="dash-card p-6 bg-orange/5 border-orange/20">
            <p className="text-[10px] font-black text-orange uppercase tracking-widest mb-2">Custom URL Slug</p>
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
  );
}
