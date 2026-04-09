"use client";

import { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, Flame, BookOpen } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PostCard } from "@/components/post-card";

interface PostsArchiveClientProps {
  initialPosts: any[];
}

export function PostsArchiveClient({ initialPosts }: PostsArchiveClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const inputRef = useRef<HTMLInputElement>(null);
  const sp = useSearchParams();

  /* ── Initial search from URL ── */
  useEffect(() => {
    const q = sp.get("q") || "";
    setSearch(q);
    if (inputRef.current) inputRef.current.value = q;
  }, [sp]);

  const filtered = search
    ? initialPosts.filter((p) =>
        [p.title, p.excerpt, p.category]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : initialPosts;

  const categories = [
    "All",
    ...Array.from(new Set(initialPosts.map((p) => p.category).filter(Boolean))),
  ];

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
                {initialPosts.length} {initialPosts.length === 1 ? "article" : "articles"} published
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
              defaultValue={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                const url = new URL(window.location.href);
                val ? url.searchParams.set("q", val) : url.searchParams.delete("q");
                window.history.replaceState({}, "", url.toString());
              }}
              className="w-full rounded-xl border border-border/80 bg-black/25 py-2.5 pl-10 pr-4 text-sm text-surface-on placeholder:text-text-faint transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          <button className="flex items-center gap-2 rounded-xl border border-border/80 bg-black/20 px-4 py-2.5 text-sm text-text-muted transition-all hover:border-primary/40 hover:text-primary">
            <SlidersHorizontal size={15} /> Filter
          </button>
        </div>

        {initialPosts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 10).map((cat) => (
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

        {displayed.length === 0 ? (
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
            {displayed.map((post, i) => (
              <PostCard
                key={post.id}
                id={post.id}
                slug={post.slug}
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
                coverImage={post.cover_image_url}
                imgClass={`card-img-${(i % 3) + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
