'use strict';

const pool                   = require('../config/db');
const { recordFoodEvent, EVENT_TYPES } = require('./foodEventService');
const { recordAudit }        = require('./auditService');
const {
  notifyAllCustomers,
  notifyInterestedCustomers,
  NOTIFICATION_TYPES,
} = require('./notificationService');
const { haversineKm, travelTimeMinutes } = require('./locationService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function _getCatererName(caterer_id) {
  const { rows } = await pool.query('SELECT name FROM users WHERE id = $1', [caterer_id]);
  return rows[0]?.name || 'Unknown';
}

function _sideEffect(fn) {
  setImmediate(async () => {
    try { await fn(); }
    catch (err) { console.error('[FoodService] Side-effect error:', err.message); }
  });
}

/**
 * Enrich a food row with distanceKm, travelTime, estimatedDeliveryTime, etaRange
 * when the caller supplies customer coordinates.
 */
function _enrichWithETA(row, customerLat, customerLng) {
  if (
    customerLat == null || customerLng == null ||
    row.catererLat == null || row.catererLng == null
  ) return row;

  const distKm   = haversineKm(customerLat, customerLng, Number(row.catererLat), Number(row.catererLng));
  const travel   = travelTimeMinutes(distKm);
  const eta      = (row.preparationTime || 20) + travel;
  const buf      = 5;

  return {
    ...row,
    distanceKm:            parseFloat(distKm.toFixed(2)),
    travelTime:            travel,
    estimatedDeliveryTime: eta,
    etaRange:              `${Math.max(10, eta - buf)}-${eta + buf} mins`,
  };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

async function createFood({
  caterer_id, food_name, description, price,
  image_url, is_available = true, category,
  food_category = 'VEG',
  preparation_time_minutes = 20,
}) {
  const validCategory = ['VEG', 'NON_VEG'].includes(food_category) ? food_category : 'VEG';
  const { rows } = await pool.query(
    `INSERT INTO food_items
       (caterer_id, food_name, description, price, image_url, is_available, category, food_category, preparation_time_minutes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [caterer_id, food_name, description || null, price,
     image_url || null, is_available, category || null, validCategory, preparation_time_minutes]
  );
  const food = rows[0];

  _sideEffect(async () => {
    const catererName = await _getCatererName(caterer_id);
    await Promise.allSettled([
      recordFoodEvent({
        food_id:    food.id,
        event_type: EVENT_TYPES.FOOD_CREATED,
        new_value:  { food_name, description, price, is_available, category, preparation_time_minutes },
      }),
      recordAudit({
        entity_type:  'food_item',
        entity_id:    food.id,
        action:       EVENT_TYPES.FOOD_CREATED,
        performed_by: caterer_id,
        details:      { food_name, price, preparation_time_minutes },
      }),
      ...(is_available ? [notifyAllCustomers({
        notification_type: NOTIFICATION_TYPES.NEW_FOOD_ITEM,
        title:   'New Item Added',
        message: `${food_name} is now available from ${catererName}.`,
      })] : []),
    ]);
  });

  return food;
}

async function updateFood(id, caterer_id, fields) {
  const { rows: existing } = await pool.query(
    'SELECT * FROM food_items WHERE id = $1 AND caterer_id = $2',
    [id, caterer_id]
  );
  if (existing.length === 0) {
    const err = new Error('Food item not found or access denied');
    err.status = 404;
    throw err;
  }
  const before = existing[0];

  const allowed = ['food_name', 'description', 'price', 'image_url', 'is_available', 'category', 'food_category', 'preparation_time_minutes'];
  const sets = [];
  const values = [];
  let idx = 1;
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = $${idx++}`);
      values.push(fields[key]);
    }
  }
  if (sets.length === 0) {
    const err = new Error('No valid fields to update');
    err.status = 400;
    throw err;
  }
  values.push(id, caterer_id);
  const { rows } = await pool.query(
    `UPDATE food_items SET ${sets.join(', ')} WHERE id = $${idx++} AND caterer_id = $${idx} RETURNING *`,
    values
  );
  const after = rows[0];

  _sideEffect(async () => {
    const tasks = [
      recordAudit({
        entity_type:  'food_item',
        entity_id:    id,
        action:       EVENT_TYPES.FOOD_UPDATED,
        performed_by: caterer_id,
        details:      fields,
      }),
    ];

    if (fields.price !== undefined && Number(fields.price) !== Number(before.price)) {
      tasks.push(recordFoodEvent({
        food_id:    id,
        event_type: EVENT_TYPES.PRICE_CHANGED,
        old_value:  { price: before.price },
        new_value:  { price: fields.price },
      }));
      if (Number(fields.price) < Number(before.price)) {
        tasks.push(notifyInterestedCustomers({
          food_id:           id,
          notification_type: NOTIFICATION_TYPES.PRICE_DROP,
          title:   'Price Drop!',
          message: `${before.food_name} dropped from ₹${before.price} to ₹${fields.price}.`,
        }));
      }
    }

    if (fields.is_available !== undefined && fields.is_available !== before.is_available) {
      tasks.push(recordFoodEvent({
        food_id:    id,
        event_type: EVENT_TYPES.AVAILABILITY_CHANGED,
        old_value:  { is_available: before.is_available },
        new_value:  { is_available: fields.is_available },
      }));
      if (fields.is_available === true) {
        tasks.push(notifyInterestedCustomers({
          food_id:           id,
          notification_type: NOTIFICATION_TYPES.BACK_IN_STOCK,
          title:   'Back in Stock!',
          message: `${before.food_name} is available again.`,
        }));
      }
    }

    const otherFields = Object.keys(fields).filter((k) => k !== 'price' && k !== 'is_available');
    if (otherFields.length > 0) {
      tasks.push(recordFoodEvent({
        food_id:    id,
        event_type: EVENT_TYPES.FOOD_UPDATED,
        old_value:  Object.fromEntries(otherFields.map((k) => [k, before[k]])),
        new_value:  Object.fromEntries(otherFields.map((k) => [k, fields[k]])),
      }));
    }

    await Promise.allSettled(tasks);
  });

  return after;
}

async function deleteFood(id, caterer_id) {
  const { rows: existing } = await pool.query(
    'SELECT * FROM food_items WHERE id = $1 AND caterer_id = $2',
    [id, caterer_id]
  );
  if (existing.length === 0) {
    const err = new Error('Food item not found or access denied');
    err.status = 404;
    throw err;
  }
  const food = existing[0];

  try {
    await pool.query('DELETE FROM food_items WHERE id = $1 AND caterer_id = $2', [id, caterer_id]);
  } catch (pgErr) {
    if (pgErr.code === '23503') {
      const err = new Error('Cannot delete food item with existing orders');
      err.status = 409;
      throw err;
    }
    throw pgErr;
  }

  _sideEffect(async () => {
    await Promise.allSettled([
      recordFoodEvent({ food_id: id, event_type: EVENT_TYPES.FOOD_DELETED, old_value: food }),
      recordAudit({
        entity_type:  'food_item',
        entity_id:    id,
        action:       EVENT_TYPES.FOOD_DELETED,
        performed_by: caterer_id,
        details:      { food_name: food.food_name },
      }),
    ]);
  });
}

async function changeAvailability(id, caterer_id, is_available) {
  return updateFood(id, caterer_id, { is_available });
}

async function changePrice(id, caterer_id, price) {
  return updateFood(id, caterer_id, { price });
}

// ─── Queries – Caterer ────────────────────────────────────────────────────────

async function getAllFoods() {
  const { rows } = await pool.query(
    `SELECT f.*, f.image_url AS "imageUrl", u.name AS caterer_name,
            ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
            COUNT(r.id)::int                 AS review_count
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     LEFT JOIN reviews r ON r.subject_type = 'food' AND r.subject_id = f.id
     GROUP BY f.id, u.name
     ORDER BY f.created_at DESC`
  );
  return rows;
}

async function searchFoods(q) {
  const { rows } = await pool.query(
    `SELECT f.*, f.image_url AS "imageUrl", u.name AS caterer_name
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     WHERE to_tsvector('english', f.food_name) @@ plainto_tsquery('english', $1)
     ORDER BY f.created_at DESC`,
    [q]
  );
  return rows;
}

async function getFoodById(id, { customerLat, customerLng } = {}) {
  const { rows } = await pool.query(
    `SELECT f.*,
            f.image_url AS "imageUrl",
            u.name      AS caterer_name,
            u.latitude  AS caterer_lat,
            u.longitude AS caterer_lng
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     WHERE f.id = $1`,
    [id]
  );
  const food = rows[0] || null;
  if (!food) return null;

  if (customerLat != null && customerLng != null && food.caterer_lat != null && food.caterer_lng != null) {
    const distKm = haversineKm(customerLat, customerLng, Number(food.caterer_lat), Number(food.caterer_lng));
    const travel = travelTimeMinutes(distKm);
    const prep   = food.preparation_time_minutes || 20;
    const eta    = prep + travel;
    const buf    = 5;
    food.distanceKm            = parseFloat(distKm.toFixed(2));
    food.travelTime            = travel;
    food.estimatedDeliveryTime = eta;
    food.etaRange              = `${Math.max(10, eta - buf)}-${eta + buf} mins`;
  }

  return food;
}

// ─── Queries – Customer (ETA-enriched) ───────────────────────────────────────

const CUSTOMER_FOOD_SELECT = `
  SELECT
    f.id                          AS "foodId",
    f.food_name                   AS "foodName",
    f.description,
    f.price,
    f.is_available                AS available,
    f.image_url                   AS "imageUrl",
    f.category,
    f.food_category               AS "foodCategory",
    f.preparation_time_minutes    AS "preparationTime",
    u.id                          AS "catererId",
    u.name                        AS "catererName",
    u.latitude                    AS "catererLat",
    u.longitude                   AS "catererLng",
    ROUND(AVG(r.rating)::numeric, 1) AS "avgRating",
    COUNT(r.id)::int              AS "reviewCount"
  FROM food_items f
  JOIN users u ON u.id = f.caterer_id
  LEFT JOIN reviews r ON r.subject_type = 'food' AND r.subject_id = f.id
`;

async function getCustomerFoods({ customerLat, customerLng, limit, food_category } = {}) {
  const limitClause = limit ? ` LIMIT ${Math.min(100, Math.max(1, parseInt(limit, 10)))}` : '';
  const conditions = ['u.is_active = TRUE'];
  const params = [];
  let idx = 1;
  if (food_category && ['VEG', 'NON_VEG'].includes(food_category.toUpperCase())) {
    conditions.push(`f.food_category = $${idx++}`);
    params.push(food_category.toUpperCase());
  }
  const { rows } = await pool.query(
    CUSTOMER_FOOD_SELECT +
    `WHERE ${conditions.join(' AND ')}
     GROUP BY f.id, u.id, u.name, u.latitude, u.longitude
     ORDER BY f.created_at DESC` + limitClause,
    params
  );
  return rows.map((r) => _enrichWithETA(r, customerLat, customerLng));
}

async function searchCustomerFoods({
  foodName, category, food_category, catererName, minPrice, maxPrice, available,
  customerLat, customerLng,
}) {
  const conditions = ['u.is_active = TRUE'];
  const params = [];
  let idx = 1;

  if (foodName)    { conditions.push(`f.food_name ILIKE $${idx++}`);  params.push(`%${foodName}%`); }
  if (category)    { conditions.push(`f.category  ILIKE $${idx++}`);  params.push(`%${category}%`); }
  if (food_category && ['VEG', 'NON_VEG'].includes(food_category.toUpperCase())) {
    conditions.push(`f.food_category = $${idx++}`);
    params.push(food_category.toUpperCase());
  }
  if (catererName) { conditions.push(`u.name       ILIKE $${idx++}`); params.push(`%${catererName}%`); }
  if (minPrice != null && minPrice !== '') { conditions.push(`f.price >= $${idx++}`); params.push(Number(minPrice)); }
  if (maxPrice != null && maxPrice !== '') { conditions.push(`f.price <= $${idx++}`); params.push(Number(maxPrice)); }
  if (available != null && available !== '') {
    conditions.push(`f.is_available = $${idx++}`);
    params.push(available === 'true' || available === true);
  }

  const { rows } = await pool.query(
    CUSTOMER_FOOD_SELECT +
    `WHERE ${conditions.join(' AND ')}
     GROUP BY f.id, u.id, u.name, u.latitude, u.longitude
     ORDER BY f.created_at DESC`,
    params
  );
  return rows.map((r) => _enrichWithETA(r, customerLat, customerLng));
}

async function getLatestFoods({ page = 1, limit = 5 } = {}) {
  const pageNum  = Math.max(1, Number(page));
  const limitNum = Math.min(20, Math.max(1, Number(limit)));
  const offset   = (pageNum - 1) * limitNum;

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(DISTINCT f.id)
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     WHERE f.is_available = TRUE AND u.is_active = TRUE`
  );
  const total      = Number(countRows[0].count);
  const totalPages = Math.ceil(total / limitNum) || 1;

  const { rows } = await pool.query(
    CUSTOMER_FOOD_SELECT +
    `WHERE f.is_available = TRUE AND u.is_active = TRUE
     GROUP BY f.id, u.id, u.name, u.latitude, u.longitude
     ORDER BY f.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limitNum, offset]
  );

  return {
    foods:       rows,
    total,
    totalPages,
    currentPage: pageNum,
    hasMore:     pageNum < totalPages,
  };
}

module.exports = {
  createFood,
  updateFood,
  deleteFood,
  changeAvailability,
  changePrice,
  getAllFoods,
  searchFoods,
  getFoodById,
  getCustomerFoods,
  searchCustomerFoods,
  getLatestFoods,
};
