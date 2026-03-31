"use client"

import React from 'react'
import Link from 'next/link'
import '@/styles/Hero.css'

interface FeaturedPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  cover_image_url: string;
  published_at: string;
  series_slug?: string;
  type: string;
}

interface HeroProps {
  featuredPosts: FeaturedPost[];
  stats: any;
}

const Hero: React.FC<HeroProps> = ({ featuredPosts, stats }) => {
  const p1 = featuredPosts[0];
  const p2 = featuredPosts[1];
  const p3 = featuredPosts[2];

  const getUrl = (post: FeaturedPost) => {
    if (post.series_slug) return `/blog/${post.series_slug}/${post.slug}`;
    return `/blog/${post.slug}`;
  }

  return (
    <section className="hero-section">
      <div className="hero-grid">
        <div className="title-block">
          <h1 className="main-title">
            <span>The code that</span><br />
            <span className="title-muted">shapes the void.</span>
          </h1>
          <div className="title-side">
            <div className="title-tag">★ Featured Publication</div>
            <p className="title-desc">Deep dives into modern engineering, distributed systems, and the artistic layer of software development.</p>
          </div>
        </div>

        <div className="cards-row">
          {/* Card 1 */}
          <Link href={p1 ? getUrl(p1) : "/posts"} className="card card-1">
            <div className="card-1-bg"></div>
            <svg className="card-1-lines" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <line x1="0" y1="80" x2="200" y2="80" stroke="white" strokeWidth="0.5" />
              <line x1="0" y1="160" x2="200" y2="160" stroke="white" strokeWidth="0.5" />
              <line x1="0" y1="240" x2="200" y2="240" stroke="white" strokeWidth="0.5" />
              <line x1="66" y1="0" x2="66" y2="300" stroke="white" strokeWidth="0.5" />
              <line x1="133" y1="0" x2="133" y2="300" stroke="white" strokeWidth="0.5" />
              <circle cx="100" cy="150" r="50" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
            <span className="card-1-tag">New</span>
            <div className="card-1-content">
              <div className="card-1-label">{p1?.category || 'Distributed Systems'}</div>
              <div className="card-1-title">{p1?.title || 'Consensus Without Clocks'}</div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href={p2 ? getUrl(p2) : "/posts"} className="card card-2">
            <div className="card-2-left">
              {p2?.cover_image_url ? (
                <img src={p2.cover_image_url} alt={p2.title} />
              ) : (
                <svg viewBox="0 0 200 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                  <rect width="200" height="300" fill="#c4b89a" />
                  <ellipse cx="100" cy="220" rx="60" ry="90" fill="#8a7a60" opacity="0.5" />
                  <ellipse cx="100" cy="260" rx="45" ry="60" fill="#6b5c42" opacity="0.6" />
                  <rect x="60" y="80" width="80" height="200" rx="40" fill="#5c4e38" opacity="0.3" />
                  <circle cx="100" cy="70" r="28" fill="#4a3d2a" opacity="0.25" />
                </svg>
              )}
            </div>
            <div className="card-2-right">
              <div className="card-2-eyebrow">{p2?.category || 'Engineering'} · {p2 ? new Date(p2.published_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Mar 2025'}</div>
              <div className="card-2-title">{p2?.title || 'Real talk in a post-AI engineering world'}</div>
              <div>
                <div className="card-2-meta">8 min read · Editorial</div>
                <div className="read-btn">Read now ↗</div>
              </div>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href={p3 ? getUrl(p3) : "/posts"} className="card card-3">
            <div className="card-3-img">
              {p3?.cover_image_url ? (
                <img src={p3.cover_image_url} alt={p3.title} />
              ) : (
                <svg viewBox="0 0 160 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
                  <rect width="160" height="300" fill="#b5a898" />
                  <ellipse cx="80" cy="180" rx="45" ry="70" fill="#7a6a58" opacity="0.6" />
                  <circle cx="80" cy="80" r="32" fill="#5a4e40" opacity="0.4" />
                </svg>
              )}
              <div className="card-3-overlay"></div>
            </div>
            <div className="card-3-content">
              <div className="card-3-label">{p3?.category || 'Systems Design'}</div>
              <div className="card-3-title">{p3?.title || 'How abstractions shape the vision'}</div>
            </div>
          </Link>
        </div>

        <div className="stats-strip">
          <div className="stat-item">
            <div className="stat-label">Unique Readers</div>
            <div className="stat-value">{(stats?.uniqueReaders || 0).toLocaleString()}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Reader Synergy</div>
            <div className="stat-value">{stats?.engagementRate || "0.0"}<span className="stat-unit">%</span></div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Published Works</div>
            <div className="stat-value">{stats?.totalPosts || 0}<span className="stat-unit">+</span></div>
          </div>
          <div className="notif-dot">N</div>
        </div>
      </div>
    </section>
  )
}

export default Hero
