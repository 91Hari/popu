const fs = require("fs");
const path = require("path");
const pool = require("./config/db");

async function init() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, "./schema.sql"),
      "utf8"
    );

    await pool.query(sql);

    console.log("Schema created successfully");
    process.exit(0);
  } catch (err) {
    console.error("Schema creation failed:", err);
    process.exit(1);
  }
}

init();
