"use client";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MessageSquare, Send, User } from "lucide-react";
import { useEffect, useState } from "react";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  useEffect(() => {
    api.comments
      .getByPost(postId)
      .then(setComments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await api.comments.submit({
        post_id: postId,
        author_name: name.trim() || "Anonymous",
        content: body,
      });
      setMessage({
        ok: true,
        text: "Comment submitted! It will appear after moderation.",
      });
      setBody("");
      setName("");
    } catch (e: any) {
      setMessage({ ok: false, text: e.message || "Failed to submit comment." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      {/* Section heading */}
      <div className="flex items-center gap-2">
        <MessageSquare size={20} className="text-primary" />
        <h3 className="text-headline-small font-bold text-surface-on">
          Discussion
          {!loading && comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-text-muted">
              ({comments.length})
            </span>
          )}
        </h3>
      </div>

      {/* Comment form */}
      <div className="rounded-2xl border border-border bg-white dark:bg-[#0F172A] overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-surface-on">
            Leave a comment
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            Comments are moderated before appearing.
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Body */}
          <textarea
            rows={4}
            placeholder="Share your thoughts…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
          />

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Name */}
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface-alt dark:bg-[#0B1120] text-surface-on text-sm placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !body.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-blue hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              {submitting ? "Sending…" : "Post Comment"}
            </button>
          </div>

          {/* Status message */}
          {message && (
            <p
              className={cn(
                "text-sm px-4 py-3 rounded-xl border",
                message.ok
                  ? "bg-primary/8 border-primary/20 text-primary"
                  : "bg-error/8 border-error/20 text-error",
              )}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {loading ? (
          [1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border p-5 space-y-2"
            >
              <div className="h-3 w-24 skeleton rounded" />
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-4 w-4/5 skeleton rounded" />
            </div>
          ))
        ) : comments.length > 0 ? (
          comments.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-white dark:bg-[#0F172A] p-5 space-y-3 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={15} />
                  </div>
                  <span className="text-sm font-bold text-surface-on">
                    {c.author_name}
                  </span>
                </div>
                <span className="text-xs text-text-faint">
                  {new Date(c.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed pl-10">
                {c.content}
              </p>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <MessageSquare size={32} className="text-text-faint mx-auto mb-2" />
            <p className="text-sm text-text-muted">
              No comments yet. Be the first!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
