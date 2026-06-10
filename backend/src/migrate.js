/**
 * Migration runner.
 *
 * Usage:
 *   node src/migrate.js              — runs all pending migrations
 *
 * Render pre-deploy command:
 *   node src/migrate.js
 *
 * Tracks applied migrations in the `schema_migrations` table.
 * Every migration runs inside a transaction; a failure rolls back and
 * exits with code 1 so Render aborts the deploy.
 */

require('dotenv').config();

const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../database/migrations');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME     || 'popu',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  connectionTimeoutMillis: 10000,
});

async function run() {
  const client = await pool.connect();
  try {
    // Bootstrap tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Collect already-applied migrations
    const { rows: applied } = await client.query(
      'SELECT filename FROM schema_migrations'
    );
    const appliedSet = new Set(applied.map((r) => r.filename));

    // Read migration files in lexicographic order
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let ran = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`[skip]  ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`[apply] ${file}`);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[FAIL]  ${file}: ${err.message}`);
        throw err;
      }
    }

    if (ran === 0) {
      console.log('No pending migrations.');
    } else {
      console.log(`Applied ${ran} migration(s) successfully.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
