import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Starting denormalization migration...');
    const sqlPath = path.join(__dirname, '../migrations/denormalize_counts.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration script...');
    await pool.query(sql);
    console.log('Denormalization migration complete.');

    console.log('Denormalization migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
