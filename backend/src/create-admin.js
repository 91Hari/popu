// One-time script to create an admin user
// Usage: node src/create-admin.js <email> <password>
// Example: node src/create-admin.js admin@popu.com Admin@123
const bcrypt = require('bcrypt');
const pool   = require('./config/db');

async function createAdmin() {
  const email    = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node src/create-admin.js <email> <password>');
    process.exit(1);
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log(`User with email "${email}" already exists.`);
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, is_active)
     VALUES ('Admin', $1, $2, 'ADMIN', true)
     RETURNING id, name, email, role`,
    [email, hash]
  );
  console.log('Admin user created:', rows[0]);
  process.exit(0);
}

createAdmin().catch((err) => { console.error(err); process.exit(1); });
