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

import { EditPostEditor } from "./EditPostEditor";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [seriesList, setSeriesList] = useState<any[]>([]);
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
        
        setPost(postData);
        setSeriesList(seriesData);
      } catch (err: any) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id, router]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-tm">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange mr-3"></div>
        Loading Post...
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
    <EditPostEditor 
      initialPost={post} 
      initialSeriesList={seriesList} 
    />
  );
}
