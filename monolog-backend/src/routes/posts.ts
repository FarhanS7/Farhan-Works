import express from "express";
import { z } from "zod";
import { query } from "../lib/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(300)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  is_published: z.boolean().optional().default(false),
});

const updatePostSchema = createPostSchema.partial();

// Public: Get all published posts with counts
router.get("/", async (_req, res) => {
  try {
    const result = await query(`
      SELECT
        p.id, p.title, p.slug, p.excerpt, p.category, p.published_at,
        COALESCE(v.views,    0)::int AS views,
        COALESCE(c.comments, 0)::int AS comments
      FROM posts p
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS views
        FROM   views
        GROUP  BY post_id
      ) v ON v.post_id = p.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS comments
        FROM   comments
        WHERE  is_approved = TRUE
        GROUP  BY post_id
      ) c ON c.post_id = p.id
      WHERE p.is_published = TRUE
      ORDER BY p.published_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Admin: Get all posts (including drafts) — must come before /:id_or_slug
router.get("/admin/list", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, title, slug, excerpt, category, is_published, published_at, created_at FROM posts ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admin posts:", err);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Admin: Get single post by ID (including drafts) — must come before /:id_or_slug
router.get("/admin/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query("SELECT * FROM posts WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Public: Get post by ID or slug
router.get("/:id_or_slug", async (req, res) => {
  const { id_or_slug } = req.params;
  try {
    const result = await query(
      "SELECT * FROM posts WHERE (id::text = $1 OR slug = $1) AND is_published = TRUE",
      [id_or_slug],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Admin: Create post
router.post("/", authenticateToken, async (req, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { title, slug, content, excerpt, category, is_published } = parsed.data;
  try {
    const published_at = is_published ? new Date() : null;
    const result = await query(
      "INSERT INTO posts (title, slug, content, excerpt, category, is_published, published_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, slug, content, excerpt, category, is_published, published_at],
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "A post with this slug already exists" });
    }
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Error creating post" });
  }
});

// Admin: Update post
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { title, slug, content, excerpt, category, is_published } = parsed.data;
  try {
    const published_at = is_published ? new Date() : null;
    const result = await query(
      "UPDATE posts SET title = $1, slug = $2, content = $3, excerpt = $4, category = $5, is_published = $6, published_at = COALESCE(published_at, $7), updated_at = NOW() WHERE id = $8 RETURNING *",
      [title, slug, content, excerpt, category, is_published, published_at, id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "A post with this slug already exists" });
    }
    console.error("Error updating post:", err);
    res.status(500).json({ message: "Error updating post" });
  }
});

// Admin: Delete post
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM posts WHERE id = $1", [id]);
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Error deleting post" });
  }
});

// Admin: Batch reorder posts in a series
router.post("/reorder", authenticateToken, async (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders)) {
    return res.status(400).json({ message: "Orders must be an array" });
  }

  try {
    for (const order of orders) {
      await query("UPDATE posts SET series_order = $1 WHERE id = $2", [
        order.series_order,
        order.id,
      ]);
    }
    res.json({ message: "Posts reordered successfully" });
  } catch (err) {
    console.error("Error reordering posts:", err);
    res.status(500).json({ message: "Error reordering posts" });
  }
});

export default router;
