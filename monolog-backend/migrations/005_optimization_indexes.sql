-- MonoLog PostgreSQL Performance Optimizations (Batch 005)

-- 1. Optimize the main article feed (Public)
-- Combines filtering by published status and ordering by date into a single index
CREATE INDEX IF NOT EXISTS idx_posts_is_published_date 
ON posts (is_published, published_at DESC)
WHERE is_published = TRUE;

-- 2. Optimize counts sorting (Popular / Trending)
-- These allow for instant sorting by pre-aggregated counts
CREATE INDEX IF NOT EXISTS idx_posts_views_published ON posts (view_count DESC, is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_comments_published ON posts (comment_count DESC, is_published) WHERE is_published = TRUE;

-- 3. Optimize Series & Chapter Navigation
-- Speeds up picking up a series by slug and finding its chapters
CREATE INDEX IF NOT EXISTS idx_series_slug_lookup ON series (slug);
CREATE INDEX IF NOT EXISTS idx_posts_series_lookup ON posts (series_id, series_order) WHERE series_id IS NOT NULL;

-- 4. Optimize Admin Moderation Dashboard
-- Combined index for filtering by approval status and sorting by date
CREATE INDEX IF NOT EXISTS idx_comments_admin_moderation ON comments (is_approved, created_at DESC);

-- 5. Analytics Consolidation
-- Ensure the unique view check is as fast as possible across millions of rows
-- Covering index pattern: (post_id, ip_address) while including viewed_at for the 24h check
CREATE INDEX IF NOT EXISTS idx_views_unique_dedupe 
ON views (post_id, ip_address, viewed_at DESC);

-- 6. Clean up redundant/overlapping indexes from previous migrations if they exist
-- (Only if we are sure they are strictly less efficient than the new ones)
-- DROP INDEX IF EXISTS idx_views_24h; 
-- DROP INDEX IF EXISTS idx_views_recent;
-- DROP INDEX IF EXISTS idx_posts_published_at;
