import { query } from './lib/db.js';

async function check() {
  try {
    const series = await query('SELECT * FROM series');
    console.log('--- Series ---');
    console.log(series.rows);

    const posts = await query('SELECT id, title, slug, is_published, series_id FROM posts');
    console.log('--- Posts ---');
    console.log(posts.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
