"use client";

import { Check, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommentActions({ id, pending }: { id: string, pending: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approving" | "deleting" | null>(null);

  const handleApprove = async () => {
    const token = api.getToken();
    if (!token) return;

    setLoading("approving");
    try {
      await api.comments.approve(id, token);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to approve comment");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    const token = api.getToken();
    if (!token || !confirm("Delete this comment permanently?")) return;
    
    setLoading("deleting");
    try {
      await api.comments.delete(id, token);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete comment");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex justify-end items-center gap-4 pt-2">
      <button
        disabled={loading !== null}
        className="text-[10px] font-black uppercase tracking-widest text-td hover:text-error disabled:opacity-30 transition-all"
        onClick={handleDelete}
      >
        {loading === "deleting" ? "Discarding..." : "Discard permanently"}
      </button>
      {pending && (
        <button
          disabled={loading !== null}
          className="btn-orange !py-2.5 !px-5 !text-xs shadow-orange-sm disabled:opacity-50"
          onClick={handleApprove}
        >
          <Check size={14} /> {loading === "approving" ? "Approving..." : "Approve Comment"}
        </button>
      )}
    </div>
  );
}
