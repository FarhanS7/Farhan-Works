import express from "express";
import { z } from "zod";
import { invalidateCache } from "../lib/cache.js";
import { query } from "../lib/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const submitCommentSchema = z.object({
  post_id: z.string().uuid({ message: "Invalid post ID" }),
  author_name: z.string().max(100).optional(),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment is too long"),
});

// IMPORTANT: Specific path routes must be defined before parameterized routes
// so that '/admin/list' is not matched by '/:post_id'

// Admin: List all comments for moderation (with pagination)
router.get("/admin/list", authenticateToken, async (req, res) => {
  try {
    // Parse and validate pagination parameters
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 items per page
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const search = (req.query.search as string) || "";

    if (limit < 1 || limit > 100) {
      return res.status(400).json({ message: "Invalid limit (1-100)" });
    }
    if (offset < 0) {
      return res.status(400).json({ message: "Invalid offset (must be >= 0)" });
    }

    // Get total count for pagination metadata
    const countResult = await query(
      `SELECT COUNT(*) as total FROM comments c
       WHERE $1 = '' OR c.author_name ILIKE $1 OR c.content ILIKE $1`,
      [`%${search}%`],
    );
    const total = parseInt(countResult.rows[0].total);

    // Fetch paginated results
    const result = await query(
      `SELECT c.*, p.title as post_title
       FROM comments c
       JOIN posts p ON c.post_id = p.id
       WHERE $3 = '' OR c.author_name ILIKE $3 OR c.content ILIKE $3
       ORDER BY c.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset, `%${search}%`],
    );

    res.json({
      data: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        pageCount: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching moderation list:", err);
    res.status(500).json({ message: "Error fetching moderation list" });
  }
});

// Public: Get approved comments for a post
router.get("/:post_id", async (req, res) => {
  const { post_id } = req.params;
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      post_id,
    )
  ) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }
  try {
    const result = await query(
      "SELECT id, author_name, content, created_at FROM comments WHERE post_id = $1 AND is_approved = TRUE ORDER BY created_at ASC",
      [post_id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Error fetching comments" });
  }
});

// Public: Submit a comment (anonymous, pending moderation)
router.post("/", async (req, res) => {
  const parsed = submitCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { post_id, author_name, content } = parsed.data;
  try {
    await query(
      "INSERT INTO comments (post_id, author_name, content) VALUES ($1, $2, $3)",
      [post_id, author_name || "Anonymous", content],
    );
    res.status(201).json({ message: "Comment submitted for moderation" });
  } catch (err) {
    console.error("Error submitting comment:", err);
    res.status(500).json({ message: "Error submitting comment" });
  }
});

// Admin: Approve comment
router.patch("/:id/approve", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      "UPDATE comments SET is_approved = TRUE WHERE id = $1 RETURNING id",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Comment not found" });

    // Invalidate analytics and posts cache - engagement/counts changed
    await invalidateCache("analytics:*");
    await invalidateCache("posts:public:*");

    res.json({ message: "Comment approved" });
  } catch (err) {
    console.error("Error approving comment:", err);
    res.status(500).json({ message: "Error approving comment" });
  }
});

// Admin: Delete comment
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM comments WHERE id = $1", [id]);

    // Invalidate analytics and posts cache - counts changed
    await invalidateCache("analytics:*");
    await invalidateCache("posts:public:*");

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Error deleting comment" });
  }
});

export default router;
