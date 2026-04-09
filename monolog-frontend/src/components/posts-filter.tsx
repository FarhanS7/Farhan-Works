"use client";

import { PostCard } from "@/components/post-card";
import { Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";

interface PostsFilterProps {
  posts: any[];
}

function PostsFilterContent({ posts }: PostsFilterProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sp = useSearchParams();

  useEffect(() => {
    const q = sp.get("q") || "";
    setSearch(q);
    if (inputRef.current) inputRef.current.value = q;
  }, [sp]);

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
    <>
      {/* Toolbar */}
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

      {/* Categories */}
      {posts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat as string}
              onClick={() => setActiveCategory(cat as string)}
              className={
                activeCategory === cat
                  ? "rounded-full border border-primary/50 bg-primary/20 px-4 py-1.5 text-xs font-semibold text-white shadow-blue transition-all"
                  : "rounded-full border border-border/80 bg-black/20 px-4 py-1.5 text-xs font-medium text-text-muted transition-all hover:border-primary/40 hover:text-primary"
              }
            >
              {cat as string}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
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
          {displayed.map((post) => (
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
              author={post.author}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function PostsFilter({ posts }: PostsFilterProps) {
  return (
    <Suspense fallback={<div className="h-20 flex items-center justify-center">Loading filters...</div>}>
      <PostsFilterContent posts={posts} />
    </Suspense>
  );
}
