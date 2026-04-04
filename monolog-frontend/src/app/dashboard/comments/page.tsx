"use client";

import { api } from "@/lib/api";
import {
  Check,
  ChevronLeft,
  Clock,
  ExternalLink,
  Trash2,
  User,
  MessageSquare,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function ModerationPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadComments() {
      try {
        const data = await api.comments.getAdminList(token!);
        setComments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [router]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".comment-card", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleApprove = async (id: string) => {
    const token = api.getToken();
    if (!token) return;

    try {
      await api.comments.approve(id, token);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_approved: true } : c)),
      );
    } catch (err: any) {
      alert(err.message || "Failed to approve comment");
    }
  };

  const handleDelete = async (id: string) => {
    const token = api.getToken();
    if (!token || !confirm("Delete this comment permanently?")) return;

    try {
      await api.comments.delete(id, token);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete comment");
    }
  };

  const pendingComments = comments.filter((c) => !c.is_approved);
  const approvedComments = comments.filter((c) => c.is_approved);

  return (
    <div ref={containerRef} className="space-y-10 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="dash-title">Comment <span className="text-orange">Moderation</span></h1>
          <p className="text-tm max-w-md text-sm">
            Review and manage audience feedback to maintain a healthy community.
          </p>
        </div>
        <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-td uppercase tracking-widest">Queue</span>
            <span className="text-sm font-black text-tp">{pendingComments.length} Pending</span>
          </div>
          <div className="w-[1px] h-8 bg-dash-border mx-2" />
          <ShieldAlert size={20} className={pendingComments.length > 0 ? "text-orange animate-pulse" : "text-td"} />
        </div>
      </header>

      {/* Content */}
      {error ? (
        <div className="p-8 text-center bg-error/10 border border-error/20 text-error rounded-[2rem] font-bold">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 skeleton rounded-[2rem]" />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Pending */}
          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-td px-2 flex items-center gap-2">
              <Clock size={14} className="text-orange" /> Pending Review
            </h2>
            {pendingComments.length === 0 ? (
              <div className="text-center py-20 rounded-[3rem] border-2 border-dashed border-dash-border">
                <Check size={40} className="mx-auto text-emerald-500 mb-4" />
                <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">
                  Inbox Zero! All comments are reviewed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onApprove={handleApprove}
                    onDelete={handleDelete}
                    pending
                  />
                ))}
              </div>
            )}
          </section>

          {/* Approved */}
          {approvedComments.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-td px-2 flex items-center gap-2">
                <Check size={14} /> Approved Recently
              </h2>
              <div className="space-y-4 opacity-70 hover:opacity-100 transition-opacity">
                {approvedComments.slice(0, 5).map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onApprove={handleApprove}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, onApprove, onDelete, pending = false }: any) {
  return (
    <div
      className={`
        comment-card dash-card p-8 space-y-6 transition-all group
        ${pending ? "border-orange/20 bg-orange/5 shadow-orange-sm" : ""}
      `}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-muted border border-dash-border flex items-center justify-center font-black text-tp text-lg group-hover:bg-orange group-hover:text-white transition-all">
            {comment.author_name.charAt(0)}
          </div>
          <div>
            <p className="font-black text-tp group-hover:text-orange transition-colors">{comment.author_name}</p>
            <p className="text-[10px] font-bold text-td uppercase tracking-wider">
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <Link
          href={`/posts/${comment.post_id}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-[10px] font-black uppercase tracking-widest text-tm hover:text-tp transition-all"
        >
          Post: {comment.post_title}
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Content */}
      <div className="p-6 rounded-2xl bg-bg/50 border border-dash-border relative">
        <MessageSquare size={16} className="absolute -top-2 -left-2 text-orange opacity-50" />
        <p className="text-sm text-tm leading-relaxed italic">
          "{comment.content}"
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center gap-4 pt-2">
        <button
          className="text-[10px] font-black uppercase tracking-widest text-td hover:text-error transition-all"
          onClick={() => onDelete(comment.id)}
        >
          Discard permanently
        </button>
        {pending && (
          <button
            className="btn-orange !py-2.5 !px-5 !text-xs shadow-orange-sm"
            onClick={() => onApprove(comment.id)}
          >
            <Check size={14} /> Approve Comment
          </button>
        )}
      </div>
    </div>
  );
}
