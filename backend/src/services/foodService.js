const pool                   = require('../config/db');
const { recordFoodEvent, EVENT_TYPES } = require('./foodEventService');
const { recordAudit }        = require('./auditService');
const {
  notifyAllCustomers,
  notifyInterestedCustomers,
  NOTIFICATION_TYPES,
} = require('./notificationService');

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Mutations ────────────────────────────────────────────────────────────────

async function createFood({ caterer_id, food_name, description, price, image_url, is_available = true, category }) {
  const { rows } = await pool.query(
    `INSERT INTO food_items (caterer_id, food_name, description, price, image_url, is_available, category)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [caterer_id, food_name, description || null, price, image_url || null, is_available, category || null]
  );
  const food = rows[0];

  _sideEffect(async () => {
    const catererName = await _getCatererName(caterer_id);
    await Promise.allSettled([
      recordFoodEvent({
        food_id: food.id,
        event_type: EVENT_TYPES.FOOD_CREATED,
        new_value: { food_name, description, price, is_available, category },
      }),
      recordAudit({
        entity_type:  'food_item',
        entity_id:    food.id,
        action:       EVENT_TYPES.FOOD_CREATED,
        performed_by: caterer_id,
        details:      { food_name, price },
      }),
      ...(is_available ? [notifyAllCustomers({
        notification_type: NOTIFICATION_TYPES.NEW_FOOD_ITEM,
        title:   'New Item Added 🍽️',
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

  const allowed = ['food_name', 'description', 'price', 'image_url', 'is_available', 'category'];
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
          title:   'Price Drop! 🎉',
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
          title:   'Back in Stock! ✅',
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
      recordFoodEvent({
        food_id:    id,
        event_type: EVENT_TYPES.FOOD_DELETED,
        old_value:  food,
      }),
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
    `SELECT f.*, u.name AS caterer_name
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     WHERE f.is_available = TRUE
     ORDER BY f.created_at DESC`
  );
  return rows;
}

async function searchFoods(q) {
  const { rows } = await pool.query(
    `SELECT f.*, u.name AS caterer_name
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     WHERE f.is_available = TRUE
       AND to_tsvector('english', f.food_name) @@ plainto_tsquery('english', $1)
     ORDER BY f.created_at DESC`,
    [q]
  );
  return rows;
}

async function getFoodById(id) {
  const { rows } = await pool.query(
    `SELECT f.*, u.name AS caterer_name
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     WHERE f.id = $1`,
    [id]
  );
  return rows[0] || null;
}

// ─── Queries – Customer ───────────────────────────────────────────────────────

async function getCustomerFoods() {
  const { rows } = await pool.query(
    `SELECT
       f.id            AS "foodId",
       f.food_name     AS "foodName",
       f.description,
       f.price,
       f.is_available  AS available,
       f.image_url     AS "imageUrl",
       f.category,
       u.id            AS "catererId",
       u.name          AS "catererName"
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     WHERE f.is_available = TRUE AND u.is_active = TRUE
     ORDER BY f.created_at DESC`
  );
  return rows;
}

async function searchCustomerFoods({ foodName, category, catererName, minPrice, maxPrice, available }) {
  const conditions = ['u.is_active = TRUE'];
  const params = [];
  let idx = 1;

  if (foodName)    { conditions.push(`f.food_name ILIKE $${idx++}`);   params.push(`%${foodName}%`); }
  if (category)    { conditions.push(`f.category  ILIKE $${idx++}`);   params.push(`%${category}%`); }
  if (catererName) { conditions.push(`u.name       ILIKE $${idx++}`);  params.push(`%${catererName}%`); }
  if (minPrice != null && minPrice !== '') { conditions.push(`f.price >= $${idx++}`); params.push(Number(minPrice)); }
  if (maxPrice != null && maxPrice !== '') { conditions.push(`f.price <= $${idx++}`); params.push(Number(maxPrice)); }
  if (available != null && available !== '') {
    conditions.push(`f.is_available = $${idx++}`);
    params.push(available === 'true' || available === true);
  }

  const { rows } = await pool.query(
    `SELECT
       f.id            AS "foodId",
       f.food_name     AS "foodName",
       f.description,
       f.price,
       f.is_available  AS available,
       f.image_url     AS "imageUrl",
       f.category,
       u.id            AS "catererId",
       u.name          AS "catererName"
     FROM food_items f
     JOIN users u ON u.id = f.caterer_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY f.created_at DESC`,
    params
  );
  return rows;
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
};
