"use client";

import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePostButton({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      await api.posts.delete(id);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`
        p-3 rounded-xl transition-all
        ${isDeleting ? "opacity-30 cursor-not-allowed" : "text-td hover:text-error hover:bg-error/10"}
      `}
      title="Delete"
    >
      <Trash2 size={18} />
    </button>
  );
}
