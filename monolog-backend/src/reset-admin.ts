import { query } from './lib/db.js';

async function resetAdmin() {
  try {
    console.log('Clearing existing admins...');
    await query('TRUNCATE TABLE admins');
    console.log('Admins cleared. You can now run `npm run migrate` to recreate the admin from .env passwords.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

resetAdmin();
