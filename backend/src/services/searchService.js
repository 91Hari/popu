'use strict';

const pool = require('../config/db');

async function getSuggestions(q) {
  if (!q || q.trim().length < 1) return { foods: [], caterers: [] };
  const term = q.trim();

  const [foodRows, catererRows] = await Promise.all([
    pool.query(
      `SELECT DISTINCT f.id, f.food_name AS label, 'food' AS type,
              f.price, f.category,
              u.name AS caterer_name, u.availability_status
       FROM food_items f
       JOIN users u ON u.id = f.caterer_id
       WHERE f.is_available = TRUE
         AND u.is_active = TRUE
         AND (
           f.food_name ILIKE $1
           OR f.category ILIKE $1
           OR f.description ILIKE $1
         )
       ORDER BY f.food_name
       LIMIT 8`,
      [`%${term}%`]
    ),
    pool.query(
      `SELECT u.id, u.name AS label, 'caterer' AS type,
              u.business_name, u.location, u.availability_status
       FROM users u
       WHERE u.role = 'CATERER'
         AND u.is_active = TRUE
         AND (u.name ILIKE $1 OR u.business_name ILIKE $1 OR u.location ILIKE $1)
       ORDER BY u.name
       LIMIT 4`,
      [`%${term}%`]
    ),
  ]);

  return {
    foods:    foodRows.rows,
    caterers: catererRows.rows,
  };
}

module.exports = { getSuggestions };
