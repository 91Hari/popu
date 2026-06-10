const fs = require("fs");
const path = require("path");
const pool = require("./config/db");

async function init() {
  try {
    // Existing schema execution
    const sql = fs.readFileSync(
      path.join(__dirname, "./schema.sql"),
      "utf8"
    );

    await pool.query(sql);

    // Migration for existing databases
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

    console.log("Schema and migrations applied successfully");
    process.exit(0);
  } catch (err) {
    console.error("Initialization failed:", err);
    process.exit(1);
  }
}

init();
