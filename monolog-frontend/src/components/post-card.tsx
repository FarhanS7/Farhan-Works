import { ArrowUpRight, Clock, Eye, MessageCircle } from "lucide-react"
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
  technology: "bg-black/5  border-black/10  text-black  dark:bg-white/10 dark:border-white/20 dark:text-white",
  ideas:      "bg-black/5  border-black/10  text-black  dark:bg-white/10 dark:border-white/20 dark:text-white",
  design:     "bg-black/5  border-black/10  text-black  dark:bg-white/10 dark:border-white/20 dark:text-white",
  code:       "bg-black/5  border-black/10  text-black  dark:bg-white/10 dark:border-white/20 dark:text-white",
}

function getCategoryClasses(category: string) {
  return (
    categoryColour[category.toLowerCase()] ??
    "bg-black/5 border-black/10 text-black dark:bg-white/10 dark:border-white/20 dark:text-white"
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
      <article className="card-hover flex flex-col h-full bg-white dark:bg-surface-muted rounded-2xl border border-border hover:border-black dark:hover:border-white shadow-sm overflow-hidden transition-all duration-300">

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
