"use client";

import Link from "next/link";
import Image from "next/image";

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
      <div className={`card-image h-[120px] sm:h-[175px] ${imgCls} relative`}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
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
      <div className="p-3 sm:p-5">
        <div className="card-meta-top mb-1">
          <div className="card-author">
            <div className="author-avatar-sm">
              {author.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="author-name-sm text-[10px] sm:text-[11px]">{author}</div>
              <div className="author-date-sm text-[9px] sm:text-[10px]">{date}</div>
            </div>
          </div>
          <div className="card-arrow w-6 h-6 sm:w-7 sm:h-7 text-[10px] sm:text-[12px]">↗</div>
        </div>

        <div className="read-time text-[10px] sm:text-[11px] mb-1">⏱ {readTime}</div>
        <div className="card-title text-[13px] sm:text-base line-clamp-2 leading-tight">{title}</div>
        <div className="card-desc hidden sm:block text-[12px] line-clamp-2 mt-1">{excerpt}</div>

        <div className="card-tags mt-2">
          {displayTags.map((tag) => (
            <span key={tag} className="card-tag py-0.5 px-2 text-[9px] sm:text-[10px]">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
