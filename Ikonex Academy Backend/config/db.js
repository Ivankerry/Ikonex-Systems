// config/db.js
// PostgreSQL connection pool using node-postgres.
// All database queries in db/queries/ use this pool - never create a new Pool elsewhere.

const { Pool } = require('pg');

// Allow optional SSL for cloud DBs (set DB_SSL=true in .env for Supabase)
const sslOption = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslOption,
  // Max connections in pool. Tune for your VPS memory.
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
  console.log('PostgreSQL connected');
  release();
});

module.exports = pool;
