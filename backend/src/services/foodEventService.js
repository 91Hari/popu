const pool = require('../config/db');

const EVENT_TYPES = {
  FOOD_CREATED:         'FOOD_CREATED',
  FOOD_UPDATED:         'FOOD_UPDATED',
  PRICE_CHANGED:        'PRICE_CHANGED',
  AVAILABILITY_CHANGED: 'AVAILABILITY_CHANGED',
  FOOD_DELETED:         'FOOD_DELETED',
};

async function recordFoodEvent({ food_id, event_type, old_value = null, new_value = null }) {
  try {
    await pool.query(
      `INSERT INTO food_events (food_id, event_type, old_value, new_value)
       VALUES ($1, $2, $3, $4)`,
      [
        food_id,
        event_type,
        old_value ? JSON.stringify(old_value) : null,
        new_value ? JSON.stringify(new_value) : null,
      ]
    );
  } catch (err) {
    console.error('[FoodEventService] Failed to record event:', err.message);
  }
}

async function getFoodEvents(food_id, { limit = 20, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT * FROM food_events WHERE food_id = $1
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [food_id, limit, offset]
  );
  return rows;
}

module.exports = { EVENT_TYPES, recordFoodEvent, getFoodEvents };
