const pool = require('../config/db');

async function getCaterers({ search, location, page = 1, limit = 20 } = {}) {
  const conditions = ["u.role = 'CATERER'", 'u.is_active = TRUE'];
  const params = [];
  let idx = 1;

  if (search)   { conditions.push(`u.name ILIKE $${idx++}`);          params.push(`%${search}%`); }
  if (location) { conditions.push(`u.location ILIKE $${idx++}`);      params.push(`%${location}%`); }

  const where = conditions.join(' AND ');

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(DISTINCT u.id) FROM users u WHERE ${where}`,
    params
  );
  const total = Number(countRows[0].count);

  const pageNum   = Math.max(1, Number(page));
  const limitNum  = Math.min(100, Math.max(1, Number(limit)));
  const offset    = (pageNum - 1) * limitNum;

  params.push(limitNum, offset);

  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.name                AS "catererName",
       u.business_name       AS "businessName",
       u.location,
       u.address,
       u.latitude,
       u.longitude,
       u.email,
       u.availability_status AS "availabilityStatus",
       COUNT(f.id)::int      AS "foodCount"
     FROM users u
     LEFT JOIN food_items f ON f.caterer_id = u.id AND f.is_available = TRUE
     WHERE ${where}
     GROUP BY u.id, u.name, u.business_name, u.location, u.address, u.latitude, u.longitude, u.email, u.availability_status
     ORDER BY u.name ASC
     LIMIT $${idx++} OFFSET $${idx}`,
    params
  );

  return { caterers: rows, total, page: pageNum, limit: limitNum };
}

async function getCatererById(id) {
  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.name                AS "catererName",
       u.business_name       AS "businessName",
       u.location,
       u.address,
       u.latitude,
       u.longitude,
       u.email,
       u.availability_status AS "availabilityStatus",
       u.upi_id,
       u.payment_name,
       u.qr_code_image_url,
       u.bank_account_name,
       COUNT(f.id)::int      AS "foodCount"
     FROM users u
     LEFT JOIN food_items f ON f.caterer_id = u.id AND f.is_available = TRUE
     WHERE u.id = $1 AND u.role = 'CATERER' AND u.is_active = TRUE
     GROUP BY u.id, u.name, u.business_name, u.location, u.address, u.latitude, u.longitude,
              u.email, u.availability_status, u.upi_id, u.payment_name, u.qr_code_image_url, u.bank_account_name`,
    [id]
  );
  return rows[0] || null;
}

async function updatePaymentProfile(caterer_id, { upi_id, payment_name, qr_code_image_url, bank_account_name }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET upi_id            = COALESCE($1, upi_id),
         payment_name      = COALESCE($2, payment_name),
         qr_code_image_url = COALESCE($3, qr_code_image_url),
         bank_account_name = COALESCE($4, bank_account_name)
     WHERE id = $5 AND role = 'CATERER'
     RETURNING upi_id, payment_name, qr_code_image_url, bank_account_name`,
    [upi_id || null, payment_name || null, qr_code_image_url || null, bank_account_name || null, caterer_id]
  );
  if (!rows[0]) { const e = new Error('Caterer not found'); e.status = 404; throw e; }
  return rows[0];
}

async function getCatererFoods(caterer_id) {
  const { rows: catererRows } = await pool.query(
    `SELECT id, name AS "catererName", business_name AS "businessName", location, address, latitude, longitude, email
     FROM users WHERE id = $1 AND role = 'CATERER' AND is_active = TRUE`,
    [caterer_id]
  );
  if (!catererRows[0]) {
    const e = new Error('Caterer not found');
    e.status = 404;
    throw e;
  }
  const { rows: foods } = await pool.query(
    `SELECT id, food_name, description, price, image_url, is_available, category, created_at
     FROM food_items
     WHERE caterer_id = $1
     ORDER BY is_available DESC, food_name ASC`,
    [caterer_id]
  );
  return { caterer: catererRows[0], foods };
}

module.exports = { getCaterers, getCatererById, getCatererFoods, updatePaymentProfile };
