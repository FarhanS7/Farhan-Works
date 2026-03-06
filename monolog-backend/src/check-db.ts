import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDb() {
  try {
    console.log('Checking database connection...');
    const now = await pool.query('SELECT NOW()');
    console.log('Connection successful:', now.rows[0]);

    console.log('Checking tables...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', tables.rows.map(r => r.table_name));

    if (tables.rows.some(r => r.table_name === 'admins')) {
      const admins = await pool.query('SELECT id, username FROM admins');
      console.log('Admins found:', admins.rows);
    } else {
      console.log('CRITICAL: admins table not found!');
    }

  } catch (err) {
    console.error('Database check failed:', err);
  } finally {
    await pool.end();
  }
}

checkDb();
