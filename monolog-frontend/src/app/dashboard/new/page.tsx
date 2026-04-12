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
  X,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import { PostEditor } from "./PostEditor";

function NewPostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    // Load series list for dropdown
    api.series.getAll()
      .then((data) => {
        setSeriesList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  if (loading) return (
     <div className="h-screen flex items-center justify-center text-tm">
       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange mr-3"></div>
       Loading Editor...
     </div>
  );

  return (
    <PostEditor 
      initialSeriesList={seriesList} 
      preSelectedSeriesId={searchParams.get("seriesId") || ""} 
    />
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-tm">Initializing Editor...</div>}>
      <NewPostContent />
    </Suspense>
  );
}
