"use client";

import { PostCard } from "@/components/post-card";
import { api } from "@/lib/api";
import { BookOpen, Flame, Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

/* ── Skeleton ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-black/20">
      <div className="h-0.5 w-full bg-border/80" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-3.5 w-20 skeleton rounded-full" />
          <div className="h-3 w-16 skeleton rounded-full" />
        </div>
        <div className="h-5 w-5/6 skeleton rounded" />
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded mt-2" />
        <div className="h-4 w-4/5 skeleton rounded" />
        <div className="flex justify-between pt-3 border-t border-border mt-2">
          <div className="h-3 w-16 skeleton rounded" />
          <div className="h-3 w-20 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}

/* ── Posts list ───────────────────────────────────────────── */
function PostsContent() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sp = useSearchParams();

  useEffect(() => {
    const q = sp.get("q") || "";
    setSearch(q);
    if (inputRef.current) inputRef.current.value = q;
    api.posts
      .getAll()
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? posts.filter((p) =>
        [p.title, p.excerpt, p.category]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : posts;

  const categories = [
    "All",
    ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))),
  ];
  const [activeCategory, setActiveCategory] = useState("All");

  const displayed =
    activeCategory === "All"
      ? filtered
      : filtered.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-canvas">
      <div className="container-px space-y-8 py-10 md:py-14">
        <header className="rounded-3xl border border-border/75 bg-surface/80 p-7 shadow-level-1 backdrop-blur-xl md:p-9">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <BookOpen size={13} />
            Archive
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-text md:text-5xl">
                All Articles
              </h1>
              <p className="mt-2 text-base text-text-muted">
                {posts.length} {posts.length === 1 ? "article" : "articles"} published
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white">
              <Flame size={13} />
              Curated feed
            </div>
          </div>
        </header>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint"
              size={16}
            />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search articles..."
              defaultValue={sp.get("q") || ""}
              onChange={(e) => {
                setSearch(e.target.value);
                const url = new URL(window.location.href);
                e.target.value
                  ? url.searchParams.set("q", e.target.value)
                  : url.searchParams.delete("q");
                window.history.replaceState({}, "", url.toString());
              }}
              className="w-full rounded-xl border border-border/80 bg-black/25 py-2.5 pl-10 pr-4 text-sm text-surface-on placeholder:text-text-faint transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          <button className="flex items-center gap-2 rounded-xl border border-border/80 bg-black/20 px-4 py-2.5 text-sm text-text-muted transition-all hover:border-primary/40 hover:text-primary">
            <SlidersHorizontal size={15} /> Filter
          </button>
        </div>

        {!loading && posts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={
                  activeCategory === cat
                    ? "rounded-full border border-primary/50 bg-primary/20 px-4 py-1.5 text-xs font-semibold text-white shadow-blue transition-all"
                    : "rounded-full border border-border/80 bg-black/20 px-4 py-1.5 text-xs font-medium text-text-muted transition-all hover:border-primary/40 hover:text-primary"
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-error/20 bg-error/5 py-12 text-center">
            <p className="font-medium text-error">Failed to load posts</p>
            <p className="mt-1 text-sm text-text-muted">{error}</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-20 text-center">
            <Search size={36} className="mx-auto mb-3 text-text-faint" />
            <p className="font-medium text-surface-on">
              {search ? `No results for "${search}"` : "No posts yet."}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {search ? "Try different keywords." : "Check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                excerpt={post.excerpt || ""}
                date={new Date(post.published_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
                readTime={`${Math.max(1, Math.ceil((post.content || post.excerpt || "").split(" ").length / 200))} min read`}
                views={parseInt(post.views) || 0}
                comments={parseInt(post.comments) || 0}
                category={post.category || "Uncategorized"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-px py-14">
          <div className="space-y-2 mb-10">
            <div className="h-3.5 w-24 skeleton rounded" />
            <div className="h-10 w-64 skeleton rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 skeleton rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <PostsContent />
    </Suspense>
  );
}
