"use client";

import Link from "next/link";

interface PostCardProps {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  views?: number;
  comments?: number;
  category: string;
  coverImage?: string;
  author?: string;
  tags?: string[];
  mockText?: string;
  imgClass?: string;
}

const defaultMocks = [
  "The Next Generation\nSocial Media App",
  "REVOLUTION\nAI Platform",
  "Analytics Dashboard\nPro Edition",
];

export function PostCard({
  id,
  slug,
  title,
  excerpt,
  date,
  readTime,
  category,
  coverImage,
  author = "Farhan Shahriar",
  tags,
  mockText,
  imgClass,
}: PostCardProps) {
  const displayTags = tags || [category, "Website", "Case Study"].slice(0, 3);
  const idx = Math.abs(id.split("").reduce((s, c) => s + c.charCodeAt(0), 0)) % 3;
  const imgCls = imgClass || `card-img-${(idx % 3) + 1}`;
  const mock = mockText || defaultMocks[idx % 3];

  return (
    <Link href={`/posts/${slug || id}`} className="blog-card" style={{ textDecoration: "none" }}>
      {/* ── Image ── */}
      <div className={`card-image ${imgCls}`}>
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="card-image-inner">
            <div className="card-img-mock">
              <div className="card-img-screen">{mock}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="card-body">
        <div className="card-meta-top">
          <div className="card-author">
            <div className="author-avatar-sm">
              {author.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="author-name-sm">{author}</div>
              <div className="author-date-sm">{date}</div>
            </div>
          </div>
          <div className="card-arrow">↗</div>
        </div>

        <div className="read-time">⏱ {readTime}</div>
        <div className="card-title">{title}</div>
        <div className="card-desc">{excerpt}</div>

        <div className="card-tags">
          {displayTags.map((tag) => (
            <span key={tag} className="card-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
