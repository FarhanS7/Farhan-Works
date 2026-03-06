import bcrypt from 'bcrypt';
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

async function migrate() {
  try {
    console.log('Starting migration...');
    const sqlPath = path.join(__dirname, '../migrations/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split into individual statements and run each separately so one failure
    // doesn't abort the rest (e.g. IF NOT EXISTS on indexes/columns).
    // Strip -- comment lines from each chunk BEFORE checking if it's empty,
    // otherwise a chunk like "-- some comment\nALTER TABLE ..." gets discarded.
    const statements = sql
      .split(';')
      .map(s =>
        s
          .split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim()
      )
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (err: any) {
        // Log but continue — most errors here are benign (already exists, etc.)
        console.warn(`  Warning on statement: ${err.message}`);
        console.warn(`  Statement: ${statement.slice(0, 80)}...`);
      }
    }

    console.log('Schema migration complete.');

    // Check for admin
    const adminCheck = await pool.query('SELECT * FROM admins LIMIT 1');
    if (adminCheck.rows.length === 0) {
      console.log('No admin found. Creating default admin...');
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'change-me-later';

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await pool.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', [username, hash]);
      console.log(`Default admin created: ${username}`);
    } else {
      console.log('Admin already exists.');
    }

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
