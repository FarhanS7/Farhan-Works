"use client"

import { api } from "@/lib/api"
import { Check, ChevronLeft, Clock, ExternalLink, Trash2, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ModerationPage() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = api.getToken()
    if (!token) {
      router.push("/login")
      return
    }

    async function loadComments() {
      try {
        const data = await api.comments.getAdminList(token!)
        setComments(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadComments()
  }, [router])

  const handleApprove = async (id: string) => {
    const token = api.getToken()
    if (!token) return

    try {
      await api.comments.approve(id, token)
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: true } : c))
    } catch (err: any) {
      alert(err.message || "Failed to approve comment")
    }
  }

  const handleDelete = async (id: string) => {
    const token = api.getToken()
    if (!token || !confirm("Delete this comment permanently?")) return

    try {
      await api.comments.delete(id, token)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      alert(err.message || "Failed to delete comment")
    }
  }

  const pendingComments = comments.filter(c => !c.is_approved)
  const approvedComments = comments.filter(c => c.is_approved)

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl text-text-muted hover:text-surface-on hover:bg-surface-muted transition-all"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-on">Comment Moderation</h1>
          <p className="text-text-muted text-sm">Keep the conversation meaningful and respectful.</p>
        </div>
      </header>

      {/* Content */}
      {error ? (
        <div className="p-8 text-center bg-error text-surface rounded-2xl font-medium shadow-md">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-surface-on">
              <Clock size={18} className="text-primary" />
              Pending Review ({pendingComments.length})
            </h2>
            {pendingComments.length === 0 ? (
              <div className="text-center py-12 bg-surface border border-emerald-500/20 rounded-2xl text-emerald-600 shadow-sm">
                Great job! All comments have been reviewed.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingComments.map(comment => (
                  <CommentCard
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
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-text-muted">
                <Check size={18} />
                Approved Comments ({approvedComments.length})
              </h2>
              <div className="space-y-4">
                {approvedComments.slice(0, 5).map(comment => (
                  <CommentCard
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
  )
}

function CommentCard({ comment, onApprove, onDelete, pending = false }: any) {
  return (
    <div className={
      pending
        ? "rounded-2xl border border-primary bg-surface-muted p-5 shadow-level-1 space-y-4"
        : "rounded-2xl border border-border bg-surface p-5 shadow-level-1 space-y-4 opacity-75"
    }>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-muted text-primary flex items-center justify-center font-bold text-sm">
            <User size={16} />
          </div>
          <div>
            <p className="font-bold text-primary">{comment.author_name}</p>
            <p className="text-xs text-text-muted">
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <Link
          href={`/post/${comment.post_id}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-primary hover:bg-surface-muted transition-all"
        >
          on &ldquo;{comment.post_title}&rdquo;
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Content */}
      <div className="px-4 py-3 rounded-xl bg-surface border border-border">
        <p className="text-sm text-text-muted italic leading-relaxed">
          &ldquo;{comment.content}&rdquo;
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {pending && (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all"
            onClick={() => onApprove(comment.id)}
          >
            <Check size={14} /> Approve
          </button>
        )}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-error hover:bg-surface-muted text-sm font-semibold transition-all"
          onClick={() => onDelete(comment.id)}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  )
}