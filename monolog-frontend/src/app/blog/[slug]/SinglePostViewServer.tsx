import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { BlogPost } from "@/types";
import DOMPurify from "isomorphic-dompurify";

export default function SinglePostViewServer({ post }: { post: BlogPost }) {
  const wordCount = (post.content || "").replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Server-side sanitization
  const sanitized = DOMPurify.sanitize(post.content ?? '', {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });

  return (
    <div className="bg-surface min-h-screen">
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-6">
        <Link 
          href="/posts" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-faint hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} /> Back to Seed Feed
        </Link>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-surface-on leading-none">
          {post.title}
        </h1>
        <div className="flex items-center gap-6 text-sm text-text-muted font-medium">
          <span className="flex items-center gap-2">
            <Calendar size={14}/> {new Date(post.published_at || post.created_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-2">
            <Clock size={14}/> {readMinutes} min read
          </span>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24">
        <article
          className="article-content"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </div>
    </div>
  );
}
