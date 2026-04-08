import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runSQL(filepath: string) {
  const sql = fs.readFileSync(filepath, 'utf8');
  console.log(`Executing ${filepath}...`);
  await pool.query(sql);
  console.log(`Finished ${filepath}...`);
}

async function run() {
  try {
    await runSQL(path.join(__dirname, '../migrations/composite_index.sql'));
    await runSQL(path.join(__dirname, '../migrations/series_post_count.sql'));
    
    console.log('Phase 2 migrations complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

run();
