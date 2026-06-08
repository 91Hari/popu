const pool = require('../config/db');

async function getCart(customer_id) {
  const { rows } = await pool.query(
    `SELECT
       ci.id,
       ci.quantity,
       ci.created_at,
       f.id                          AS food_item_id,
       f.food_name,
       f.price,
       f.image_url,
       f.is_available,
       f.category,
       f.preparation_time_minutes,
       u.id                          AS caterer_id,
       u.name                        AS caterer_name,
       u.latitude                    AS caterer_latitude,
       u.longitude                   AS caterer_longitude
     FROM cart_items ci
     JOIN food_items f ON f.id = ci.food_item_id
     JOIN users u      ON u.id = f.caterer_id
     WHERE ci.customer_id = $1
     ORDER BY ci.created_at ASC`,
    [customer_id]
  );
  const total = rows.reduce((s, r) => s + Number(r.price) * r.quantity, 0);
  return { items: rows, total: Number(total.toFixed(2)) };
}

async function addItem(customer_id, food_item_id, quantity = 1) {
  const { rows: food } = await pool.query(
    'SELECT id, is_available FROM food_items WHERE id = $1',
    [food_item_id]
  );
  if (!food[0]) { const e = new Error('Food item not found'); e.status = 404; throw e; }
  if (!food[0].is_available) { const e = new Error('Food item is not available'); e.status = 400; throw e; }

  const { rows } = await pool.query(
    `INSERT INTO cart_items (customer_id, food_item_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (customer_id, food_item_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [customer_id, food_item_id, quantity]
  );
  return rows[0];
}

async function updateItem(customer_id, cart_item_id, quantity) {
  if (Number(quantity) < 1) return removeItem(customer_id, cart_item_id);

  const { rows } = await pool.query(
    `UPDATE cart_items SET quantity = $1
     WHERE id = $2 AND customer_id = $3
     RETURNING *`,
    [quantity, cart_item_id, customer_id]
  );
  if (!rows[0]) { const e = new Error('Cart item not found'); e.status = 404; throw e; }
  return rows[0];
}

async function removeItem(customer_id, cart_item_id) {
  await pool.query(
    'DELETE FROM cart_items WHERE id = $1 AND customer_id = $2',
    [cart_item_id, customer_id]
  );
}

async function clearCart(customer_id) {
  await pool.query('DELETE FROM cart_items WHERE customer_id = $1', [customer_id]);
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
