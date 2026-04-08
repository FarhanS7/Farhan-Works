import { query } from './lib/db.js';

async function verify() {
  try {
    // 1. Get a post
    const postRes = await query('SELECT id, view_count, comment_count FROM posts LIMIT 1');
    if (postRes.rows.length === 0) {
      console.log('No posts found to verify.');
      return;
    }
    const post = postRes.rows[0];
    console.log(`Initial post stats for ${post.id}: Views=${post.view_count}, Comments=${post.comment_count}`);

    // 2. Insert a view
    console.log('Inserting a new view...');
    const ip = `test-ip-${Date.now()}`;
    await query('INSERT INTO views (post_id, ip_address) VALUES ($1, $2)', [post.id, ip]);

    // 3. Verify view_count incremented
    const postAfterView = await query('SELECT view_count FROM posts WHERE id = $1', [post.id]);
    console.log(`Post views after insert: ${postAfterView.rows[0].view_count} (Expected: ${post.view_count + 1})`);

    // 4. Insert a comment (not approved)
    console.log('Inserting a pending comment...');
    const commentRes = await query(
      'INSERT INTO comments (post_id, content, is_approved) VALUES ($1, $2, $3) RETURNING id',
      [post.id, 'Test comment', false]
    );
    const commentId = commentRes.rows[0].id;

    // 5. Verify comment_count NOT incremented
    const postAfterPending = await query('SELECT comment_count FROM posts WHERE id = $1', [post.id]);
    console.log(`Post comments after pending: ${postAfterPending.rows[0].comment_count} (Expected: ${post.comment_count})`);

    // 6. Approve comment
    console.log('Approve comment...');
    await query('UPDATE comments SET is_approved = TRUE WHERE id = $1', [commentId]);

    // 7. Verify comment_count incremented
    const postAfterApproved = await query('SELECT comment_count FROM posts WHERE id = $1', [post.id]);
    console.log(`Post comments after approval: ${postAfterApproved.rows[0].comment_count} (Expected: ${post.comment_count + 1})`);

    // 8. Cleanup
    console.log('Cleaning up...');
    await query('DELETE FROM views WHERE ip_address = $1', [ip]);
    await query('DELETE FROM comments WHERE id = $1', [commentId]);

    // 9. Final check (should be back to initial)
    const postFinal = await query('SELECT view_count, comment_count FROM posts WHERE id = $1', [post.id]);
    console.log(`Post stats after cleanup: Views=${postFinal.rows[0].view_count}, Comments=${postFinal.rows[0].comment_count}`);

  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    process.exit();
  }
}

verify();
