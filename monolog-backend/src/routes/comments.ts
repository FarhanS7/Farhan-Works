import express from 'express';
import { z } from 'zod';
import { query } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const submitCommentSchema = z.object({
  post_id: z.string().uuid({ message: 'Invalid post ID' }),
  author_name: z.string().max(100).optional(),
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
});

// IMPORTANT: Specific path routes must be defined before parameterized routes
// so that '/admin/list' is not matched by '/:post_id'

// Admin: List all comments for moderation
router.get('/admin/list', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT c.*, p.title as post_title FROM comments c JOIN posts p ON c.post_id = p.id ORDER BY c.created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching moderation list:', err);
    res.status(500).json({ message: 'Error fetching moderation list' });
  }
});

// Public: Get approved comments for a post
router.get('/:post_id', async (req, res) => {
  const { post_id } = req.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(post_id)) {
    return res.status(400).json({ message: 'Invalid post ID format' });
  }
  try {
    const result = await query(
      'SELECT id, author_name, content, created_at FROM comments WHERE post_id = $1 AND is_approved = TRUE ORDER BY created_at ASC',
      [post_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Public: Submit a comment (anonymous, pending moderation)
router.post('/', async (req, res) => {
  const parsed = submitCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0].message });
  }

  const { post_id, author_name, content } = parsed.data;
  try {
    await query(
      'INSERT INTO comments (post_id, author_name, content) VALUES ($1, $2, $3)',
      [post_id, author_name || 'Anonymous', content]
    );
    res.status(201).json({ message: 'Comment submitted for moderation' });
  } catch (err) {
    console.error('Error submitting comment:', err);
    res.status(500).json({ message: 'Error submitting comment' });
  }
});

// Admin: Approve comment
router.patch('/:id/approve', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      'UPDATE comments SET is_approved = TRUE WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment approved' });
  } catch (err) {
    console.error('Error approving comment:', err);
    res.status(500).json({ message: 'Error approving comment' });
  }
});

// Admin: Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

export default router;
