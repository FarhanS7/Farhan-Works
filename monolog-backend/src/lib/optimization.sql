-- Performance Optimization Indexes for Monolog Backend
-- Run this script in your PostgreSQL database to improve query performance.

-- 1. Indexing slugs for fast lookups in public detail pages
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_series_slug ON series (slug);

-- 2. Indexing foreign keys to speed up joins and counts
CREATE INDEX IF NOT EXISTS idx_posts_series_id ON posts (series_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_views_post_id ON views (post_id);

-- 3. Composite indexes for common filtering/sorting
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at DESC) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_comments_approved_date ON comments (created_at DESC) WHERE is_approved = TRUE;

-- 4. Indexing for moderation search
CREATE INDEX IF NOT EXISTS idx_comments_search ON comments USING gin (author_name gin_trgm_ops, content gin_trgm_ops);
-- Note: Requires pg_trgm extension. If it fails, run: CREATE EXTENSION IF NOT EXISTS pg_trgm;
