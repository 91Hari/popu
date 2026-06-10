// backend/src/init-db.js

const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const sql = fs.readFileSync("./schema.sql", "utf8");
    await pool.query(sql);
    console.log("Schema created successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
