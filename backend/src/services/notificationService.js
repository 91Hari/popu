const pool = require('../config/db');

const NOTIFICATION_TYPES = {
  NEW_FOOD_ITEM:     'NEW_FOOD_ITEM',
  PRICE_DROP:        'PRICE_DROP',
  BACK_IN_STOCK:     'BACK_IN_STOCK',
  POPULAR_ITEM:      'POPULAR_ITEM',
  SPECIAL_OFFER:     'SPECIAL_OFFER',
  ORDER_CANCELLED:   'ORDER_CANCELLED',
  ORDER_ACCEPTED:    'ORDER_ACCEPTED',
  ORDER_PREPARING:   'ORDER_PREPARING',
  ORDER_DELIVERED:   'ORDER_DELIVERED',
};

const BATCH_SIZE = 500;

async function _bulkInsert(userIds, notification_type, title, message) {
  if (userIds.length === 0) return;
  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);
    const values = batch.map((_, j) => `($${j * 4 + 1}, $${j * 4 + 2}, $${j * 4 + 3}, $${j * 4 + 4})`).join(', ');
    const params = batch.flatMap((id) => [id, notification_type, title, message]);
    await pool.query(
      `INSERT INTO notifications (user_id, notification_type, title, message) VALUES ${values}`,
      params
    );
  }
}

async function notifyAllCustomers({ notification_type, title, message }) {
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE role = 'CUSTOMER' AND is_active = TRUE`
  );
  const userIds = rows.map((r) => r.id);
  await _bulkInsert(userIds, notification_type, title, message);
  _dispatch(userIds, { notification_type, title, message });
}

async function notifyInterestedCustomers({ food_id, notification_type, title, message }) {
  const { rows } = await pool.query(
    `SELECT cf.customer_id AS id
     FROM customer_favorites cf
     JOIN users u ON u.id = cf.customer_id
     WHERE cf.food_id = $1 AND u.is_active = TRUE`,
    [food_id]
  );
  const userIds = rows.map((r) => r.id);
  await _bulkInsert(userIds, notification_type, title, message);
  _dispatch(userIds, { notification_type, title, message });
}

async function getNotificationsForUser(user_id, { limit = 50, offset = 0 } = {}) {
  const [{ rows: notifications }, { rows: [{ count }] }] = await Promise.all([
    pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    ),
    pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [user_id]
    ),
  ]);
  return { notifications, unread_count: parseInt(count, 10) };
}

async function markAsRead(id, user_id) {
  const { rowCount } = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
    [id, user_id]
  );
  if (rowCount === 0) {
    const err = new Error('Notification not found');
    err.status = 404;
    throw err;
  }
}

async function markAllAsRead(user_id) {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
    [user_id]
  );
}

// Extensible dispatch interface — plug in WebSocket / Push / Email providers here
function _dispatch(userIds, payload) {
  // Phase 2: websocketGateway.broadcast(userIds, payload)
  //          pushNotificationService.send(userIds, payload)
  //          emailQueue.enqueue(userIds, payload)
}

async function notifyUser(user_id, { notification_type, title, message }) {
  await pool.query(
    `INSERT INTO notifications (user_id, notification_type, title, message)
     VALUES ($1, $2, $3, $4)`,
    [user_id, notification_type, title, message]
  );
}

module.exports = {
  NOTIFICATION_TYPES,
  notifyAllCustomers,
  notifyInterestedCustomers,
  notifyUser,
  getNotificationsForUser,
  markAsRead,
  markAllAsRead,
};
