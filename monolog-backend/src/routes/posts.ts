import express from 'express';
import { z } from 'zod';
import { query } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  slug: z.string().min(1, 'Slug is required').max(300).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  cover_image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  seo_title: z.string().max(200).optional(),
  seo_description: z.string().max(500).optional(),
  seo_keywords: z.string().max(500).optional(),
  series_id: z.string().uuid('Invalid series ID').optional().nullable(),
  series_order: z.number().int().optional().nullable(),
  is_published: z.boolean().optional().default(false),
  is_featured: z.boolean().optional().default(false),
});

const updatePostSchema = createPostSchema.partial();

// Public: Get all published posts with counts
router.get('/', async (_req, res) => {
  try {
    const result = await query(`
      SELECT
        p.id, p.title, p.slug, p.excerpt, p.category, p.cover_image_url, p.published_at,
        p.series_id, p.series_order, s.title as series_title, s.slug as series_slug,
        COALESCE(v.views,    0)::int AS views,
        COALESCE(c.comments, 0)::int AS comments
      FROM posts p
      LEFT JOIN series s ON s.id = p.series_id
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
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Public: Get featured posts
router.get('/featured', async (_req, res) => {
  try {
    const result = await query(`
      SELECT
        p.id, p.title, p.slug, p.excerpt, p.category, p.cover_image_url, p.published_at,
        p.series_id, p.series_order, s.title as series_title, s.slug as series_slug,
        COALESCE(v.views,    0)::int AS views,
        COALESCE(c.comments, 0)::int AS comments
      FROM posts p
      LEFT JOIN series s ON s.id = p.series_id
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
      WHERE p.is_published = TRUE AND p.is_featured = TRUE
      ORDER BY p.published_at DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching featured posts:', err);
    res.status(500).json({ message: 'Error fetching featured posts' });
  }
});

// Admin: Get all posts (including drafts) — must come before /:id_or_slug
router.get('/admin/list', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id, p.title, p.slug, p.excerpt, p.category, p.is_published, p.is_featured, p.published_at, p.created_at,
        p.series_id, s.title as series_title
      FROM posts p
      LEFT JOIN series s ON s.id = p.series_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin posts:', err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Admin: Get single post by ID (including drafts) — must come before /:id_or_slug
router.get('/admin/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(`
      SELECT p.*, s.title as series_title, s.slug as series_slug
      FROM posts p
      LEFT JOIN series s ON s.id = p.series_id
      WHERE p.id = $1
    `, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Public: Get post by series slug and chapter slug
router.get('/:series_slug/:chapter_slug', async (req, res) => {
  const { series_slug, chapter_slug } = req.params;
  try {
    const result = await query(`
      SELECT p.*, s.title as series_title, s.slug as series_slug
      FROM posts p
      JOIN series s ON s.id = p.series_id
      WHERE s.slug = $1 AND p.slug = $2 AND p.is_published = TRUE
    `, [series_slug, chapter_slug]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Chapter not found' });
    
    const post = result.rows[0];
    
    // Get adjacent posts and full list for navigation
    const adjacent = await query(`
      (SELECT id, title, slug, series_order FROM posts 
       WHERE series_id = $1 AND is_published = TRUE AND series_order < $2
       ORDER BY series_order DESC LIMIT 1)
      UNION ALL
      (SELECT id, title, slug, series_order FROM posts 
       WHERE series_id = $1 AND is_published = TRUE AND series_order > $2
       ORDER BY series_order ASC LIMIT 1)
    `, [post.series_id, post.series_order]);
    
    const seriesPosts = await query(`
      SELECT id, title, slug, series_order 
      FROM posts 
      WHERE series_id = $1 AND is_published = TRUE 
      ORDER BY series_order ASC, published_at ASC
    `, [post.series_id]);

    const prev = adjacent.rows.find(r => r.series_order < post.series_order);
    const next = adjacent.rows.find(r => r.series_order > post.series_order);
    
    post.series_nav = { 
      prev, 
      next,
      all: seriesPosts.rows
    };
    
    res.json(post);
  } catch (err) {
    console.error('Error fetching chapter:', err);
    res.status(500).json({ message: 'Error fetching chapter' });
  }
});

// Public: Get post by ID or slug (Original, kept for single posts and backward compatibility)
router.get('/:id_or_slug', async (req, res) => {
  const { id_or_slug } = req.params;
  try {
    const result = await query(`
      SELECT p.*, s.title as series_title, s.slug as series_slug
      FROM posts p
      LEFT JOIN series s ON s.id = p.series_id
      WHERE (p.id::text = $1 OR p.slug = $1) AND p.is_published = TRUE
    `, [id_or_slug]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    
    const post = result.rows[0];
    
    // If part of a series, get adjacent posts
    if (post.series_id) {
      const adjacent = await query(`
        (SELECT id, title, slug, series_order FROM posts 
         WHERE series_id = $1 AND is_published = TRUE AND (series_order < $2 OR (series_order = $2 AND published_at < $3))
         ORDER BY series_order DESC, published_at DESC LIMIT 1)
        UNION ALL
        (SELECT id, title, slug, series_order FROM posts 
         WHERE series_id = $1 AND is_published = TRUE AND (series_order > $2 OR (series_order = $2 AND published_at > $3))
         ORDER BY series_order ASC, published_at ASC LIMIT 1)
      `, [post.series_id, post.series_order, post.published_at]);
      
      // Determine which is previous and which is next
      // Get full list of posts in this series for navigation/TOC
      const seriesPosts = await query(`
        SELECT id, title, slug, series_order 
        FROM posts 
        WHERE series_id = $1 AND is_published = TRUE 
        ORDER BY series_order ASC, published_at ASC
      `, [post.series_id]);
      
      const prev = adjacent.rows.find(r => r.series_order < post.series_order || (r.series_order === post.series_order && new Date(r.published_at) < new Date(post.published_at)));
      const next = adjacent.rows.find(r => r.series_order > post.series_order || (r.series_order === post.series_order && new Date(r.published_at) > new Date(post.published_at)));
      
      post.series_nav = { 
        prev, 
        next,
        all: seriesPosts.rows
      };
    }
    
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Admin: Create post
router.post('/', authenticateToken, async (req, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { title, slug, content, excerpt, category, cover_image_url, seo_title, seo_description, seo_keywords, series_id, series_order, is_published, is_featured } = parsed.data;
  try {
    const published_at = is_published ? new Date() : null;
    const result = await query(
      `INSERT INTO posts 
        (title, slug, content, excerpt, category, cover_image_url, seo_title, seo_description, seo_keywords, series_id, series_order, is_published, published_at, is_featured) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [title, slug, content, excerpt, category, cover_image_url || null, seo_title || null, seo_description || null, seo_keywords || null, series_id || null, series_order || null, is_published, published_at, is_featured]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'A post with this slug already exists' });
    }
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Admin: Update post
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { title, slug, content, excerpt, category, cover_image_url, seo_title, seo_description, seo_keywords, series_id, series_order, is_published, is_featured } = parsed.data;
  try {
    const published_at = is_published ? new Date() : null;
    const result = await query(
      `UPDATE posts SET 
        title = $1, slug = $2, content = $3, excerpt = $4, category = $5, 
        cover_image_url = $6, seo_title = $7, seo_description = $8, seo_keywords = $9, 
        series_id = $10, series_order = $11, is_published = $12, 
        published_at = COALESCE(published_at, $13), is_featured = $14, updated_at = NOW() 
       WHERE id = $15 RETURNING *`,
      [title, slug, content, excerpt, category, cover_image_url || null, seo_title || null, seo_description || null, seo_keywords || null, series_id || null, series_order || null, is_published, published_at, is_featured, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    res.json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'A post with this slug already exists' });
    }
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Admin: Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Admin: Reorder posts in a series
router.put('/admin/reorder', authenticateToken, async (req, res) => {
  const schema = z.object({
    orders: z.array(z.object({
      id: z.string().uuid(),
      series_order: z.number().int()
    }))
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

  try {
    // Perform updates in a transaction-like manner (serialized queries here for simplicity)
    for (const item of parsed.data.orders) {
      await query('UPDATE posts SET series_order = $1 WHERE id = $2', [item.series_order, item.id]);
    }
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    console.error('Error reordering posts:', err);
    res.status(500).json({ message: 'Error reordering posts' });
  }
});

export default router;
