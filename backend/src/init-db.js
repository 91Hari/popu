const pool = require('./config/db');

(async () => {
  try {
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS location TEXT;

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS address TEXT;

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);
    `);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
