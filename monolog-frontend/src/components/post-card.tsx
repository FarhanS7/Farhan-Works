import { Clock, Eye, MessageCircle, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface PostCardProps {
  id: string
  title: string
  excerpt: string
  date: string
  readTime: string
  views: number
  comments: number
  category: string
}

/* ── Category colour mapping ──────────────────────────────── */
const categoryColour: Record<string, string> = {
  technology: "bg-blue-50  border-blue-200  text-blue-700  dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
  ideas:      "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-300",
  design:     "bg-pink-50   border-pink-200  text-pink-700  dark:bg-pink-900/20  dark:border-pink-800  dark:text-pink-300",
  code:       "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300",
}

function getCategoryClasses(category: string) {
  return (
    categoryColour[category.toLowerCase()] ??
    "bg-primary/8 border-primary/20 text-primary dark:bg-primary/10"
  )
}

export function PostCard({
  id,
  title,
  excerpt,
  date,
  readTime,
  views,
  comments,
  category,
}: PostCardProps) {
  return (
    <Link href={`/post/${id}`} className="group block h-full">
      <article className="card-hover flex flex-col h-full bg-white dark:bg-[#0F172A] rounded-2xl border border-border hover:border-primary/30 shadow-level-1 overflow-hidden transition-all duration-250">

        {/* Top accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex flex-col flex-1 p-5">

          {/* Header row: category + date */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border " +
                getCategoryClasses(category)
              }
            >
              {category}
            </span>
            <span className="flex items-center gap-1 text-xs text-text-faint">
              <Clock size={11} />
              {date}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-surface-on group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-2">
            {title}
          </h2>

          {/* Excerpt */}
          <p className="flex-1 text-sm text-text-muted leading-relaxed line-clamp-3 mb-4">
            {excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
            <div className="flex items-center gap-3 text-xs text-text-faint">
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={12} />
                {comments}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              {readTime}
              <ArrowUpRight size={13} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
