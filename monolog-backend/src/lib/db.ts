import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Ceiling keeps total connections predictable on Neon's free tier
  max: 10,
  // Release idle connections after 30 s to avoid hitting Neon's soft limit
  idleTimeoutMillis: 30_000,
  // Fail fast if pool is saturated rather than queuing indefinitely
  connectionTimeoutMillis: 5_000,
});

// Log idle-client errors but don't kill the process —
// pg.Pool will attempt to reconnect automatically.
pool.on('error', (err) => {
  console.error('[db] Idle client error:', err.message);
});

/** Thin wrapper so callers never import the pool directly. */
export const query = (text: string, params?: any[]) => pool.query(text, params);

/** Exported for health-check and graceful shutdown. */
export default pool;
