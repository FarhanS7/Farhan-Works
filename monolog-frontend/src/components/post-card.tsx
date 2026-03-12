import { ArrowUpRight } from "lucide-react"
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
  coverImageUrl?: string
}

/* ── Category colour mapping ──────────────────────────────── */
const categoryColour: Record<string, string> = {
  technology: "bg-surface-muted border-primary text-primary shadow-sm",
  ideas:      "bg-surface-muted border-sky-500 text-sky-600 shadow-sm",
  design:     "bg-surface-muted border-rose-500 text-rose-600 shadow-sm",
  code:       "bg-surface-muted border-slate-700 text-slate-800 shadow-sm",
}

function getCategoryClasses(category: string) {
  return (
    categoryColour[category.toLowerCase()] ??
    "bg-surface-muted border-border text-surface-on"
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
  coverImageUrl,
}: PostCardProps) {
  return (
    <Link href={`/posts/${id}`} className="group block h-full">
      <article className="bento-card card-hover flex flex-col h-full bg-surface hover:bg-surface-muted overflow-hidden">
        {coverImageUrl && (
          <div className="h-48 w-full overflow-hidden border-b border-border">
            <img 
              src={coverImageUrl} 
              alt={title} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
            />
          </div>
        )}
        <div className="p-6 sm:p-8 flex flex-col flex-1">
          {/* Category Prefix */}
          <div className="flex flex-col mb-6">
            <span className="text-[10px] font-bold text-text-faint tracking-[0.2em] mb-1 opacity-60 uppercase">
              // {category}
            </span>
            <div className="flex items-center justify-between">
              <span
                className={
                  "inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest " +
                  getCategoryClasses(category)
                }
              >
                {category}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-surface-on tracking-tighter leading-[1.1] mb-4 line-clamp-2">
          {title}
        </h2>

        {/* Excerpt */}
        <p className="flex-1 text-sm text-text-muted leading-relaxed line-clamp-3 mb-8">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-text-faint uppercase tracking-wider">
              {date}
            </span>
            <span className="text-[10px] font-black text-surface-on uppercase tracking-tighter">
              {readTime}
            </span>
          </div>
          
          <div className="circle-btn bg-surface-on text-surface group-hover:scale-110 shadow-lg">
            <ArrowUpRight size={18} strokeWidth={3} />
          </div>
        </div>
      </article>
    </Link>
  )
}
