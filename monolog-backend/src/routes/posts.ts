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
  excerpt: z.string().max(1000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  is_published: z.boolean().optional().default(false),
  cover_image_url: z.string().url("Invalid image URL").optional().nullable().or(z.literal("")),
  series_id: z.string().uuid("Invalid series ID").optional().nullable().or(z.literal("")),
  series_order: z.number().int().optional().default(0),
  seo_title: z.string().max(300).optional().nullable(),
  seo_description: z.string().max(1000).optional().nullable(),
  seo_keywords: z.string().max(1000).optional().nullable(),
});

const updatePostSchema = createPostSchema.partial();

// Public: Get all published posts with counts
router.get("/", async (_req, res) => {
  try {
    const result = await query(`
      SELECT
        p.id, p.title, p.slug, p.excerpt, p.category, p.published_at, p.cover_image_url,
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
      "SELECT id, title, slug, excerpt, category, is_published, published_at, created_at, cover_image_url, series_id, series_order FROM posts ORDER BY created_at DESC",
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
      `SELECT p.*, s.title as series_title, s.slug as series_slug 
       FROM posts p 
       LEFT JOIN series s ON s.id = p.series_id 
       WHERE (p.id::text = $1 OR p.slug = $1) AND p.is_published = TRUE`,
      [id_or_slug],
    );
    
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
    
    const post = result.rows[0];
    
    // If post is part of a series, fetch neighboring posts for navigation
    if (post.series_id) {
      const seriesPosts = await query(
        `SELECT id, title, slug FROM posts 
         WHERE series_id = $1 AND is_published = TRUE 
         ORDER BY series_order ASC, published_at ASC`,
        [post.series_id]
      );
      
      const all = seriesPosts.rows;
      const currentIndex = all.findIndex(p => p.id === post.id);
      
      post.series_nav = {
        all,
        prev: currentIndex > 0 ? all[currentIndex - 1] : null,
        next: currentIndex < all.length - 1 ? all[currentIndex + 1] : null
      };
    }
    
    res.json(post);
  } catch (err) {
    console.error("Error fetching post detail:", err);
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Admin: Create post
router.post("/", authenticateToken, async (req, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { 
    title, slug, content, excerpt, category, is_published, 
    cover_image_url, series_id, series_order, 
    seo_title, seo_description, seo_keywords 
  } = parsed.data;

  try {
    const published_at = is_published ? new Date() : null;
    const result = await query(
      `INSERT INTO posts (
        title, slug, content, excerpt, category, is_published, published_at,
        cover_image_url, series_id, series_order, 
        seo_title, seo_description, seo_keywords
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        title, slug, content, excerpt || null, category || null, is_published, published_at,
        cover_image_url || null, series_id || null, series_order || 0,
        seo_title || null, seo_description || null, seo_keywords || null
      ],
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

  const { 
    title, slug, content, excerpt, category, is_published,
    cover_image_url, series_id, series_order,
    seo_title, seo_description, seo_keywords
  } = parsed.data;

  try {
    const published_at = is_published ? new Date() : null;
    const result = await query(
      `UPDATE posts SET 
        title = $1, slug = $2, content = $3, excerpt = $4, category = $5, 
        is_published = $6, published_at = COALESCE(published_at, $7), 
        cover_image_url = $8, series_id = $9, series_order = $10,
        seo_title = $11, seo_description = $12, seo_keywords = $13,
        updated_at = NOW() 
      WHERE id = $14 RETURNING *`,
      [
        title, slug, content, excerpt || null, category || null, 
        is_published, published_at,
        cover_image_url || null, series_id || null, series_order || 0,
        seo_title || null, seo_description || null, seo_keywords || null,
        id
      ],
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
