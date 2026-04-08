"use client";

import { PostCard } from "@/components/post-card";
import { api } from "@/lib/api";
import { useState } from "react";

function SkeletonCard() {
  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ height: 175 }} className="skeleton" />
      <div style={{ padding: 15, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 12, width: "40%" }} />
        <div className="skeleton" style={{ height: 14, width: "85%" }} />
        <div className="skeleton" style={{ height: 14, width: "65%" }} />
        <div className="skeleton" style={{ height: 12, width: "100%" }} />
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}

import { BlogPost } from "@/types";

export function HomePostGrid({ initialPosts, totalPosts }: { initialPosts: BlogPost[], totalPosts: number }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length < totalPosts);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await api.posts.getAll(nextPage, 6);
      const newPosts = data.posts || [];
      setPosts((prev) => [...prev, ...newPosts]);
      setPage(nextPage);
      setHasMore(posts.length + newPosts.length < totalPosts);
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <div className="blog-grid">
        {posts.map((post, i) => (
          <PostCard
            key={post.id}
            id={post.id}
            slug={post.slug}
            title={post.title}
            excerpt={post.excerpt || "Discover how blogging can boost your business growth."}
            date={new Date(post.published_at || post.created_at || Date.now()).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            readTime={`${Math.max(1, Math.ceil((post.content || post.excerpt || "").split(" ").length / 200))} min read`}
            category={post.category || "Uncategorized"}
            coverImage={post.cover_image_url}
            author={post.author || "Farhan S."}
            imgClass={`card-img-${(i % 3) + 1}`}
          />
        ))}
        {loadingMore && [1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>

      <div className="load-more-wrap">
        {hasMore ? (
          <button 
            className="btn-orange" 
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"} <span className="arrow-c">↗</span>
          </button>
        ) : (
          <p className="text-tm text-sm">No more posts to show.</p>
        )}
      </div>
    </>
  );
}
