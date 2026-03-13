import express from 'express';
import { query } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public: Record a view (IP-based, one unique view per IP per post per 24h)
router.post('/view/:post_id', async (req, res) => {
  const { post_id } = req.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(post_id)) {
    return res.status(400).json({ message: 'Invalid post ID format' });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';

  try {
    const result = await query(
      `WITH attempt AS (
         INSERT INTO views (post_id, ip_address)
         SELECT $1::uuid, $2::text
         WHERE NOT EXISTS (
           SELECT 1 FROM views
           WHERE  post_id    = $1
             AND  ip_address = $2
             AND  viewed_at  > NOW() - INTERVAL '24 hours'
         )
         RETURNING id
       )
       SELECT COUNT(*) AS views FROM views WHERE post_id = $1`,
      [post_id, ip]
    );
    res.json({ views: result.rows[0].views });
  } catch (err) {
    console.error('Error recording view:', err);
    res.status(500).json({ message: 'Error recording view' });
  }
});

// Public: Site-wide stats for landing page
router.get('/public-stats', async (req, res) => {
  try {
    const [
      postCount,
      viewCount,
      uniqueReaderCount,
      approvedCommentCount,
      reactionCount,
      weeklyViews,
      growthStats,
      liveAudience
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM posts WHERE is_published = TRUE'),
      query('SELECT COUNT(*) FROM views'),
      query('SELECT COUNT(DISTINCT ip_address) FROM views'),
      query('SELECT COUNT(*) FROM comments WHERE is_approved = TRUE'),
      query('SELECT COUNT(*) FROM reactions'),
      query(`
        SELECT 
          TO_CHAR(d.day, 'Mon') as label,
          COALESCE(count, 0) as value
        FROM (
          SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS day
        ) d
        LEFT JOIN (
          SELECT DATE_TRUNC('day', viewed_at)::date as day, COUNT(*) as count
          FROM views 
          WHERE viewed_at >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY 1
        ) v ON d.day = v.day
        ORDER BY d.day ASC
      `),
      query(`
        SELECT 
          (SELECT COUNT(*) FROM views WHERE viewed_at >= DATE_TRUNC('month', CURRENT_DATE)) as this_month,
          (SELECT COUNT(*) FROM views WHERE viewed_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND viewed_at < DATE_TRUNC('month', CURRENT_DATE)) as last_month
      `),
      query("SELECT COUNT(DISTINCT ip_address) FROM views WHERE viewed_at > NOW() - INTERVAL '5 minutes'")
    ]);

    const totalViews = parseInt(viewCount.rows[0].count);
    const uniqueReaders = parseInt(uniqueReaderCount.rows[0].count);
    const totalInteractions = parseInt(approvedCommentCount.rows[0].count) + parseInt(reactionCount.rows[0].count);
    const engagementRate = uniqueReaders > 0 ? ((totalInteractions / uniqueReaders) * 100).toFixed(1) : "0.0";

    const thisMonth = parseInt(growthStats.rows[0].this_month);
    const lastMonth = parseInt(growthStats.rows[0].last_month);
    const monthlyGrowth = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(0) : "0";

    res.json({
      totalPosts: parseInt(postCount.rows[0].count),
      totalViews,
      uniqueReaders,
      engagementRate,
      monthlyGrowth,
      liveAudience: parseInt(liveAudience.rows[0].count),
      weeklyViews: weeklyViews.rows.map(r => ({ label: r.label, value: parseInt(r.value) })),
      avgReads: (uniqueReaders / 30).toFixed(1)
    });
  } catch (err) {
    console.error('Error fetching public stats:', err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Admin: Dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [
      postCount,
      viewCount,
      pendingCommentCount,
      approvedCommentCount,
      reactionCount,
      weeklyViews,
      growthStats,
      liveAudience
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM posts WHERE is_published = TRUE'),
      query('SELECT COUNT(*) FROM views'),
      query('SELECT COUNT(*) FROM comments WHERE is_approved = FALSE'),
      query('SELECT COUNT(*) FROM comments WHERE is_approved = TRUE'),
      query('SELECT COUNT(*) FROM reactions'),
      query(`
        SELECT 
          TO_CHAR(d.day, 'Mon') as label,
          COALESCE(count, 0) as value
        FROM (
          SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS day
        ) d
        LEFT JOIN (
          SELECT DATE_TRUNC('day', viewed_at)::date as day, COUNT(*) as count
          FROM views 
          WHERE viewed_at >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY 1
        ) v ON d.day = v.day
        ORDER BY d.day ASC
      `),
      query(`
        SELECT 
          (SELECT COUNT(*) FROM views WHERE viewed_at >= DATE_TRUNC('month', CURRENT_DATE)) as this_month,
          (SELECT COUNT(*) FROM views WHERE viewed_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND viewed_at < DATE_TRUNC('month', CURRENT_DATE)) as last_month
      `),
      query("SELECT COUNT(DISTINCT ip_address) FROM views WHERE viewed_at > NOW() - INTERVAL '5 minutes'")
    ]);

    const totalViews = parseInt(viewCount.rows[0].count);
    const totalInteractions = parseInt(approvedCommentCount.rows[0].count) + parseInt(reactionCount.rows[0].count);
    const engagementRate = totalViews > 0 ? ((totalInteractions / totalViews) * 100).toFixed(1) : "0.0";

    const thisMonth = parseInt(growthStats.rows[0].this_month);
    const lastMonth = parseInt(growthStats.rows[0].last_month);
    const monthlyGrowth = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(0) : "0";

    res.json({
      totalPosts: parseInt(postCount.rows[0].count),
      totalViews,
      pendingComments: parseInt(pendingCommentCount.rows[0].count),
      engagementRate,
      monthlyGrowth,
      liveAudience: parseInt(liveAudience.rows[0].count),
      weeklyViews: weeklyViews.rows.map(r => ({ label: r.label, value: parseInt(r.value) })),
      avgReads: (totalViews / 30).toFixed(1) // Rough monthly average
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

export default router;
