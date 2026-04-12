import { CommentSection } from "@/components/comment-section";
import { Reactions } from "@/components/reactions";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  published_at: string;
  updated_at: string;
  cover_image_url?: string;
  category?: string;
  series_title?: string;
  series_slug?: string;
  excerpt?: string;
  seo_title?: string;
  seo_description?: string;
  series_nav?: {
    all: Array<{ id: string; title: string; slug: string }>;
    prev?: { title: string; slug: string };
    next?: { title: string; slug: string };
  };
}

// Generate static params for all posts
export async function generateStaticParams() {
  try {
    const posts = await api.posts.getAll();
    return posts.map((post: any) => ({
      id_or_slug: post.slug || post.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id_or_slug: string }>;
}) {
  const { id_or_slug } = await params;

  try {
    const post = await api.posts.getOne(id_or_slug);

    return {
      title: post.seo_title || `${post.title} | Farhan.Dev`,
      description:
        post.seo_description || post.excerpt || `Read ${post.title} on Farhan.Dev`,
      openGraph: {
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        images: post.cover_image_url
          ? [
              {
                url: post.cover_image_url,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ]
          : [],
        type: "article",
        publishedTime: post.published_at,
        modifiedTime: post.updated_at || post.published_at,
        authors: ["MonoLogue"],
      },
      twitter: {
        card: "summary_large_image",
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        images: post.cover_image_url ? [post.cover_image_url] : [],
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: `/posts/${post.slug}`,
      },
    };
  } catch (error) {
    return {
      title: "Post Not Found | MonoLog",
      description: "The requested post could not be found.",
    };
  }
}

// Enable ISR - revalidate every hour
export const revalidate = 3600;

/* ── Skeleton loader component ──────────────────────────────────────── */
function PostSkeleton() {
  return (
    <div className="container-px py-12 space-y-8">
      <div className="h-3 w-20 skeleton rounded" />
      <div className="space-y-2">
        <div className="h-8 w-5/6 skeleton rounded" />
        <div className="h-8 w-4/5 skeleton rounded" />
      </div>
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-20 skeleton rounded" />
        ))}
      </div>
      <div className="space-y-3 pt-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className={
              "h-4 skeleton rounded " + (i % 3 === 0 ? "w-4/5" : "w-full")
            }
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default async function PostPage({
  params,
}: {
  params: Promise<{ id_or_slug: string }>;
}) {
  const { id_or_slug } = await params;

  let post: Post;

  try {
    // Server-side data fetching
    post = await api.posts.getOne(id_or_slug);
  } catch (error) {
    console.error("Error fetching post:", error);
    notFound();
  }

  const wordCount = (post.content || "").split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Fix Quill editor inserting &nbsp; between every word, which prevents text wrapping
  const sanitizedContent = (post.content || "")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ");


  return (
    <>
      {/* SEO/Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.seo_title || post.title,
            description: post.seo_description || post.excerpt,
            image: post.cover_image_url,
            author: {
              "@type": "Person",
              name: "Farhan",
            },
            datePublished: post.published_at,
            dateModified: post.updated_at || post.published_at,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://farhan.dev/posts/${post.slug}`,
            },
          }),
        }}
      />

      {/* ── Article header ────────────────────────────── */}
      <header className="border-b border-border bg-surface overflow-hidden">
        {post.cover_image_url && (
          <div className="w-full h-[40vh] min-h-[300px] relative overflow-hidden">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
              fill
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          </div>
        )}

        <div className="container-px pt-12 pb-10 relative">
          <div style={{ maxWidth: '820px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }} className="space-y-8">
            {/* Back link */}
            <div className="flex items-center justify-between">
              <Link
                href="/posts"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors"
              >
                <ArrowLeft size={15} /> All Articles
              </Link>

              {/* Series Badge */}
              {post.series_title && (
                <Link
                  href={`/series/${post.series_slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                >
                  Part of: {post.series_title}
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {/* Category */}
              {post.category && (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/20">
                  {post.category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-surface-on leading-[1.1]">
                {post.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-muted pt-2 border-t border-border/50">
                <span className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">F</div> 
                  Farhan
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary/60" />
                  {new Date(post.published_at).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-primary/60" /> {readMinutes} min read
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Article body ──────────────────────────────── */}
      <div className="bg-surface">
        <div className="container-px py-16">
          <div style={{ maxWidth: '820px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            {/* Series Navigator (Table of Contents) */}
            {post.series_nav && post.series_nav.all && (
              <div className="mb-16 rounded-3xl bg-surface border border-border overflow-hidden shadow-level-1 ring-1 ring-border mt-[-2rem]">
                <div className="bg-surface-muted px-8 py-5 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-3">
                    <Layers size={20} className="text-primary" />
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted leading-none mb-1">
                        Learning Series
                      </h4>
                      <p className="text-sm font-black tracking-tight text-surface-on">
                        {post.series_title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20">
                    <BookOpen size={10} /> {post.series_nav.all.length} Topics
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-surface">
                  <div className="grid grid-cols-1 gap-2">
                    {post.series_nav.all.map((item: any, idx: number) => (
                      <Link
                        key={item.id}
                        href={`/posts/${item.slug}`}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative border ${
                          item.id === post.id
                            ? "bg-primary/5 border-primary/30"
                            : "hover:bg-surface-muted border-transparent hover:border-border"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${
                            item.id === post.id
                              ? "bg-primary text-white border-primary"
                              : "bg-surface-muted text-text-faint border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-bold truncate ${
                              item.id === post.id
                                ? "text-primary"
                                : "text-surface-on"
                            }`}
                          >
                            {item.title}
                          </p>
                        </div>
                        {item.id === post.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Quick Prev/Next Container */}
                  <div className="mt-6 pt-6 border-t border-border flex items-center justify-between gap-4">
                    {post.series_nav.prev ? (
                      <Link
                        href={`/posts/${post.series_nav.prev.slug}`}
                        className="flex-1 group flex items-center gap-3 p-3 rounded-xl bg-surface-muted border border-border hover:border-primary/30 transition-all"
                      >
                        <ArrowLeft size={16} className="text-text-faint group-hover:text-primary transition-colors" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-text-faint uppercase tracking-wider">Previous</p>
                          <p className="text-sm font-bold text-surface-on truncate">{post.series_nav.prev.title}</p>
                        </div>
                      </Link>
                    ) : <div className="flex-1" />}

                    {post.series_nav.next ? (
                      <Link
                        href={`/posts/${post.series_nav.next.slug}`}
                        className="flex-1 group flex items-center gap-3 p-3 rounded-xl bg-surface-muted border border-border hover:border-primary/30 transition-all text-right"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-text-faint uppercase tracking-wider">Next</p>
                          <p className="text-sm font-bold text-surface-on truncate">{post.series_nav.next.title}</p>
                        </div>
                        <ArrowLeft size={16} className="text-text-faint group-hover:text-primary transition-colors rotate-180" />
                      </Link>
                    ) : <div className="flex-1" />}
                  </div>
                </div>
              </div>
            )}

            <article
              className="article-content"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
        </div>
      </div>

      {/* ── Reactions + comments ──────────────────────── */}
      <div className="border-t border-border bg-surface-muted">
        <div className="container-px py-16">
          <div style={{ maxWidth: '820px', width: '100%', marginLeft: 'auto', marginRight: 'auto' }} className="space-y-16">
            {/* Reactions */}
            <section>
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-primary/30" />
                Community Reactions
              </h3>
              <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
                <Reactions postId={post.id} />
              </div>
            </section>

            {/* Comments */}
            <section>
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-primary/30" />
                Discussion
              </h3>
              <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
                <CommentSection postId={post.id} />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── Next article nudge ────────────────────────── */}
      <div className="border-t border-border bg-surface">
        <div className="container-px py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">Enjoyed this article?</p>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-blue hover:bg-primary-hover transition-all"
          >
            <BookOpen size={15} /> Browse More Articles
          </Link>
        </div>
      </div>
    </>
  );
}
