'use strict';

const pool = require('../config/db');

// Cache simple stats for 5 minutes to avoid hammering DB on every page load
let _statsCache = null;
let _statsCacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function getStats() {
  if (_statsCache && Date.now() - _statsCacheAt < CACHE_TTL) return _statsCache;

  const [customers, caterers, foods, delivered, riders] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER' AND is_active = TRUE`),
    pool.query(`SELECT COUNT(*) FROM users WHERE role = 'CATERER'  AND is_active = TRUE`),
    pool.query(`SELECT COUNT(*) FROM food_items WHERE is_available = TRUE`),
    pool.query(`SELECT COUNT(*) FROM caterer_orders WHERE status IN ('DELIVERED','COLLECTED')`),
    pool.query(`SELECT COUNT(*) FROM rider_profiles WHERE delivery_status = 'AVAILABLE'`),
  ]);

  _statsCache = {
    total_customers:        parseInt(customers.rows[0].count),
    total_caterers:         parseInt(caterers.rows[0].count),
    total_food_items:       parseInt(foods.rows[0].count),
    total_orders_delivered: parseInt(delivered.rows[0].count),
    active_riders:          parseInt(riders.rows[0].count),
  };
  _statsCacheAt = Date.now();
  return _statsCache;
}

async function getPopularFoods(limit = 10) {
  const { rows } = await pool.query(
    `SELECT
       f.id,
       f.food_name,
       f.image_url,
       f.price,
       f.food_category,
       f.category,
       f.serves_count,
       f.is_veg,
       u.name          AS caterer_name,
       u.business_name AS caterer_business,
       u.city          AS caterer_city,
       COALESCE(AVG(r.rating), 0)::numeric(3,1)  AS avg_rating,
       COUNT(DISTINCT r.id)::int                  AS review_count,
       COALESCE(SUM(oi.quantity), 0)::int         AS order_count
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     LEFT JOIN caterer_order_items oi ON oi.food_item_id = f.id
     LEFT JOIN caterer_orders co ON co.id = oi.caterer_order_id
       AND co.status IN ('DELIVERED','COLLECTED')
     LEFT JOIN reviews r ON r.subject_id = f.id AND r.subject_type = 'food'
     WHERE f.is_available = TRUE
       AND u.is_active    = TRUE
     GROUP BY f.id, u.name, u.business_name, u.city
     ORDER BY order_count DESC, avg_rating DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

async function getFeaturedCaterers(limit = 6) {
  const { rows } = await pool.query(
    `SELECT
       u.id,
       COALESCE(u.business_name, u.name)  AS business_name,
       u.name,
       u.city,
       u.location,
       u.profile_image_url                AS photo,
       COALESCE(AVG(r.rating), 0)::numeric(3,1) AS avg_rating,
       COUNT(DISTINCT r.id)::int          AS review_count,
       COUNT(DISTINCT co.id)::int         AS orders_completed,
       COUNT(DISTINCT fi.id)::int         AS food_count
     FROM users u
     LEFT JOIN caterer_orders co ON co.caterer_id = u.id
       AND co.status IN ('DELIVERED','COLLECTED')
     LEFT JOIN reviews r ON r.subject_id = u.id AND r.subject_type = 'caterer'
     LEFT JOIN food_items fi ON fi.caterer_id = u.id AND fi.is_available = TRUE
     WHERE u.role      = 'CATERER'
       AND u.is_active = TRUE
     GROUP BY u.id
     HAVING COUNT(DISTINCT fi.id) > 0
     ORDER BY orders_completed DESC, avg_rating DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

async function getEnabledServices() {
  const { rows } = await pool.query(
    `SELECT service_code, service_name FROM service_config WHERE is_enabled = TRUE ORDER BY service_name`
  );
  return rows;
}

async function getLocations() {
  const { rows } = await pool.query(
    `SELECT DISTINCT
       COALESCE(NULLIF(TRIM(city), ''), NULLIF(TRIM(location), '')) AS city,
       COUNT(*)::int AS caterer_count
     FROM users
     WHERE role = 'CATERER'
       AND is_active = TRUE
       AND (TRIM(city) <> '' OR TRIM(location) <> '')
     GROUP BY city
     HAVING COALESCE(NULLIF(TRIM(city), ''), NULLIF(TRIM(location), '')) IS NOT NULL
     ORDER BY caterer_count DESC
     LIMIT 12`
  );
  return rows.filter(r => r.city);
}

async function getPublicReviews(limit = 6) {
  const { rows } = await pool.query(
    `SELECT
       r.id,
       r.rating,
       r.comment,
       r.subject_type,
       r.created_at,
       SPLIT_PART(u.name, ' ', 1) AS reviewer_first_name,
       CASE r.subject_type
         WHEN 'food'    THEN f.food_name
         WHEN 'caterer' THEN COALESCE(cu.business_name, cu.name)
         ELSE NULL
       END AS subject_name
     FROM reviews r
     JOIN users u ON u.id = r.reviewer_id
     LEFT JOIN food_items fi ON fi.id = r.subject_id AND r.subject_type = 'food'
     LEFT JOIN food_items f  ON f.id  = r.subject_id AND r.subject_type = 'food'
     LEFT JOIN users cu ON cu.id = r.subject_id AND r.subject_type = 'caterer'
     WHERE r.comment IS NOT NULL
       AND LENGTH(TRIM(r.comment)) > 10
       AND r.rating >= 4
     ORDER BY r.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

async function getHomeData() {
  const [stats, popularFoods, featuredCaterers, services, locations, reviews] = await Promise.all([
    getStats(),
    getPopularFoods(10),
    getFeaturedCaterers(6),
    getEnabledServices(),
    getLocations(),
    getPublicReviews(6),
  ]);
  return { stats, popularFoods, featuredCaterers, services, locations, reviews };
}

module.exports = {
  getStats, getPopularFoods, getFeaturedCaterers,
  getEnabledServices, getLocations, getPublicReviews, getHomeData,
};
