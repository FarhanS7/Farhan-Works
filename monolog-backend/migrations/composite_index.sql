-- Add composite index to optimize the 24-hour unique view check
-- This speeds up query: SELECT 1 FROM views WHERE post_id = $1 AND ip_address = $2 AND viewed_at > NOW() - INTERVAL '24 hours'

CREATE INDEX IF NOT EXISTS idx_views_unique_check ON views (post_id, ip_address, viewed_at);
