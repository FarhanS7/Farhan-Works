import express from "express";
import { query } from "../lib/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public: Record a view (IP-based, one unique view per IP per post per 24h)
router.post("/view/:post_id", async (req, res) => {
  const { post_id } = req.params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      post_id,
    )
  ) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip ||
    "unknown";

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
      [post_id, ip],
    );
    res.json({ views: result.rows[0].views });
  } catch (err) {
    console.error("Error recording view:", err);
    res.status(500).json({ message: "Error recording view" });
  }
});

// Admin: Dashboard stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const [postCount, viewCount, commentCount] = await Promise.all([
      query("SELECT COUNT(*) FROM posts WHERE is_published = TRUE"),
      query("SELECT COUNT(*) FROM views"),
      query("SELECT COUNT(*) FROM comments WHERE is_approved = FALSE"),
    ]);

    res.json({
      totalPosts: postCount.rows[0].count,
      totalViews: viewCount.rows[0].count,
      pendingComments: commentCount.rows[0].count,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

export default router;
