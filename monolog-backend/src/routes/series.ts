import express from 'express';
import { z } from 'zod';
import { query } from '../lib/db.js';
import { getCache, setCache, invalidateCache } from "../lib/cache.js";
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const seriesSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  slug: z.string().min(1, 'Slug is required').max(300).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  cover_image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  seo_title: z.string().max(200).optional(),
  seo_description: z.string().max(500).optional(),
  seo_keywords: z.string().max(500).optional(),
});

// Public: Get all series
router.get('/', async (_req, res) => {
  try {
    const cacheKey = "series:public:list";
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const result = await query(`
      SELECT s.*, count(p.id)::int as post_count
      FROM series s
      LEFT JOIN posts p ON p.series_id = s.id AND p.is_published = TRUE
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    
    await setCache(cacheKey, result.rows, 600); // 10 minutes
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching series:', err);
    res.status(500).json({ message: 'Error fetching series' });
  }
});

// Admin: Get all series (for selection in post editor)
router.get('/admin/list', authenticateToken, async (_req, res) => {
  try {
    const result = await query('SELECT id, title, slug FROM series ORDER BY title ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin series list:', err);
    res.status(500).json({ message: 'Error fetching series' });
  }
});

// Public: Get single series by ID or slug with its posts
router.get('/:id_or_slug', async (req, res) => {
  const { id_or_slug } = req.params;
  try {
    const cacheKey = `series:public:detail:${id_or_slug}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const seriesResult = await query(
      'SELECT * FROM series WHERE id::text = $1 OR slug = $1',
      [id_or_slug]
    );
    if (seriesResult.rows.length === 0) return res.status(404).json({ message: 'Series not found' });
    
    const series = seriesResult.rows[0];
    const postsResult = await query(
      'SELECT id, title, slug, excerpt, cover_image_url, series_order, published_at FROM posts WHERE series_id = $1 AND is_published = TRUE ORDER BY series_order ASC, published_at ASC',
      [series.id]
    );
    
    const response = { ...series, posts: postsResult.rows };
    await setCache(cacheKey, response, 600); // 10 minutes
    res.json(response);
  } catch (err) {
    console.error('Error fetching series detail:', err);
    res.status(500).json({ message: 'Error fetching series' });
  }
});

// Admin: Create series
router.post('/', authenticateToken, async (req, res) => {
  const parsed = seriesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { title, slug, description, cover_image_url, seo_title, seo_description, seo_keywords } = parsed.data;
  try {
    const result = await query(
      'INSERT INTO series (title, slug, description, cover_image_url, seo_title, seo_description, seo_keywords) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, slug, description, cover_image_url || null, seo_title || null, seo_description || null, seo_keywords || null]
    );

    // Invalidate caches
    await invalidateCache("series:public:*");

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'A series with this slug already exists' });
    }
    console.error('Error creating series:', err);
    res.status(500).json({ message: 'Error creating series' });
  }
});

// Admin: Update series
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const parsed = seriesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { title, slug, description, cover_image_url, seo_title, seo_description, seo_keywords } = parsed.data;
  try {
    const result = await query(
      'UPDATE series SET title = $1, slug = $2, description = $3, cover_image_url = $4, seo_title = $5, seo_description = $6, seo_keywords = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [title, slug, description, cover_image_url || null, seo_title || null, seo_description || null, seo_keywords || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Series not found' });

    // Invalidate caches
    await invalidateCache("series:public:*");

    res.json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'A series with this slug already exists' });
    }
    console.error('Error updating series:', err);
    res.status(500).json({ message: 'Error updating series' });
  }
});

// Admin: Delete series
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM series WHERE id = $1', [id]);

    // Invalidate caches
    await invalidateCache("series:public:*");

    res.json({ message: 'Series deleted' });
  } catch (err) {
    console.error('Error deleting series:', err);
    res.status(500).json({ message: 'Error deleting series' });
  }
});

export default router;
