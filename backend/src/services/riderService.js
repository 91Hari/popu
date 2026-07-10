'use strict';

const pool   = require('../config/db');
const bcrypt = require('bcrypt');
const { notifyUser } = require('./notificationService');

const SALT_ROUNDS = 12;

async function createRider(caterer_id, { name, email, password, phone, vehicle_type, vehicle_number }) {
  if (!name || !email || !password) {
    const e = new Error('name, email, and password are required'); e.status = 400; throw e;
  }
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: existing } = await client.query(
      `SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]
    );
    if (existing[0]) { const e = new Error('Email already in use'); e.status = 409; throw e; }

    const { rows: userRows } = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone, is_active)
       VALUES ($1, $2, $3, 'RIDER', $4, TRUE)
       RETURNING id, name, email, role`,
      [name, email.toLowerCase(), password_hash, phone || null]
    );
    const user = userRows[0];

    const { rows: profileRows } = await client.query(
      `INSERT INTO rider_profiles (user_id, caterer_id, vehicle_type, vehicle_number)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.id, caterer_id, vehicle_type || null, vehicle_number || null]
    );
    await client.query('COMMIT');
    return { ...user, profile: profileRows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getRidersByCaterer(caterer_id) {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.is_active,
            rp.vehicle_type, rp.vehicle_number, rp.created_at AS joined_at
     FROM users u
     JOIN rider_profiles rp ON rp.user_id = u.id
     WHERE rp.caterer_id = $1
     ORDER BY u.name ASC`,
    [caterer_id]
  );
  return rows;
}

async function deleteRider(rider_id, caterer_id) {
  const { rows } = await pool.query(
    `SELECT user_id FROM rider_profiles WHERE user_id = $1 AND caterer_id = $2`,
    [rider_id, caterer_id]
  );
  if (!rows[0]) { const e = new Error('Rider not found or not owned by you'); e.status = 404; throw e; }
  await pool.query(`DELETE FROM users WHERE id = $1`, [rider_id]);
  return { ok: true };
}

async function pushLocation(rider_id, { latitude, longitude, order_id }) {
  await pool.query(
    `INSERT INTO rider_locations (rider_id, latitude, longitude, order_id) VALUES ($1, $2, $3, $4)`,
    [rider_id, latitude, longitude, order_id || null]
  );

  // Trigger "Rider Nearby" notification when within 500 m of customer (async, non-blocking)
  setImmediate(async () => {
    try {
      const { rows } = await pool.query(
        `SELECT co.id, mo.customer_id, mo.customer_lat, mo.customer_lng
         FROM caterer_orders co
         JOIN master_orders mo ON mo.id = co.master_order_id
         WHERE co.rider_id = $1
           AND co.status = 'OUT_FOR_DELIVERY'
           AND co.rider_nearby_notified = FALSE
         LIMIT 1`,
        [rider_id]
      );
      if (!rows[0] || !rows[0].customer_lat || !rows[0].customer_lng) return;

      const order = rows[0];
      const { haversineKm } = require('./locationService');
      const distKm = haversineKm(
        parseFloat(latitude),          parseFloat(longitude),
        parseFloat(order.customer_lat), parseFloat(order.customer_lng)
      );

      if (distKm <= 0.5) {
        await pool.query(
          `UPDATE caterer_orders SET rider_nearby_notified = TRUE WHERE id = $1`,
          [order.id]
        );
        await notifyUser(order.customer_id, {
          notification_type: 'RIDER_NEARBY',
          title:        'Rider Nearby!',
          message:      'Your rider is less than 500 m away. Your food is almost there!',
          reference_id: order.id,
        });
      }
    } catch (err) {
      console.error('[RiderService] Rider nearby notification failed:', err.message);
    }
  });
}

async function getLocationForOrder(caterer_order_id, user) {
  const { rows } = await pool.query(
    `SELECT co.rider_id, co.status,
            mo.customer_id, mo.customer_lat, mo.customer_lng,
            u.name           AS rider_name,
            u.mobile_number  AS rider_mobile,
            u.phone          AS rider_phone,
            rp.vehicle_type, rp.vehicle_number,
            uc.name          AS caterer_name
     FROM caterer_orders co
     JOIN master_orders mo  ON mo.id  = co.master_order_id
     LEFT JOIN users u            ON u.id   = co.rider_id
     LEFT JOIN rider_profiles rp  ON rp.user_id = co.rider_id
     LEFT JOIN users uc           ON uc.id  = co.caterer_id
     WHERE co.id = $1`,
    [caterer_order_id]
  );
  const order = rows[0];
  if (!order) { const e = new Error('Order not found'); e.status = 404; throw e; }

  if (user.role === 'CUSTOMER' && order.customer_id !== user.id) {
    const e = new Error('Forbidden'); e.status = 403; throw e;
  }

  if (!order.rider_id) {
    return {
      order_id:     caterer_order_id,
      location:     null,
      rider:        null,
      caterer_name: order.caterer_name || null,
      order_status: order.status,
      customer_lat: null,
      customer_lng: null,
    };
  }

  // Prefer order-scoped location if the order_id column is populated, else fall back to rider_id
  const { rows: locRows } = await pool.query(
    `SELECT latitude, longitude, created_at
     FROM rider_locations
     WHERE rider_id = $1
       AND (order_id = $2 OR order_id IS NULL)
     ORDER BY created_at DESC
     LIMIT 1`,
    [order.rider_id, caterer_order_id]
  );

  return {
    order_id:     caterer_order_id,
    location: locRows[0]
      ? {
          latitude:   parseFloat(locRows[0].latitude),
          longitude:  parseFloat(locRows[0].longitude),
          updated_at: locRows[0].created_at,
        }
      : null,
    rider: {
      name:           order.rider_name,
      mobile:         order.rider_mobile || order.rider_phone || null,
      vehicle_type:   order.vehicle_type,
      vehicle_number: order.vehicle_number,
    },
    caterer_name:  order.caterer_name || null,
    order_status:  order.status,
    customer_lat:  order.customer_lat ? parseFloat(order.customer_lat) : null,
    customer_lng:  order.customer_lng ? parseFloat(order.customer_lng) : null,
  };
}

async function getLatestLocation(rider_id) {
  const { rows } = await pool.query(
    `SELECT latitude, longitude, created_at
     FROM rider_locations WHERE rider_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [rider_id]
  );
  return rows[0] || null;
}

async function getAssignedDeliveries(rider_id) {
  const { rows } = await pool.query(
    `SELECT co.id, co.status, co.subtotal, co.delivery_confirmation_code,
            co.payment_method, co.payment_status,
            mo.customer_id,
            u.name  AS customer_name,
            u.email AS customer_email,
            json_agg(
              json_build_object(
                'food_name',  f.food_name,
                'quantity',   coi.quantity,
                'unit_price', coi.unit_price
              ) ORDER BY coi.id
            ) AS items
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     JOIN users u ON u.id = mo.customer_id
     JOIN caterer_order_items coi ON coi.caterer_order_id = co.id
     JOIN food_items f ON f.id = coi.food_item_id
     WHERE co.rider_id = $1
       AND co.status IN ('ASSIGNED_TO_RIDER', 'OUT_FOR_DELIVERY')
     GROUP BY co.id, mo.customer_id, u.name, u.email
     ORDER BY co.created_at DESC`,
    [rider_id]
  );
  return rows;
}

async function lookupOrderForRider(caterer_order_id, rider_id) {
  const { rows: riderRows } = await pool.query(
    `SELECT caterer_id FROM rider_profiles WHERE user_id = $1`,
    [rider_id]
  );
  const caterer_id = riderRows[0]?.caterer_id;

  const { rows } = await pool.query(
    `WITH da AS (
       SELECT DISTINCT ON (user_id)
              user_id, house_no, street, landmark, city, state, pincode, latitude, longitude
       FROM user_addresses
       WHERE is_default = TRUE
       ORDER BY user_id, created_at DESC
     )
     SELECT co.id, co.status, co.subtotal, co.delivery_confirmation_code, co.rider_id,
            co.payment_method, co.payment_status,
            mo.customer_id, mo.customer_lat, mo.customer_lng,
            u.name  AS customer_name,
            u.email AS customer_email,
            u.phone AS customer_phone,
            -- Delivery address: order snapshot → default saved address → user profile (3-tier fallback)
            COALESCE(mo.delivery_house_no, da.house_no)                   AS delivery_house_no,
            COALESCE(mo.delivery_street,   da.street,    u.address)       AS delivery_street,
            COALESCE(mo.delivery_landmark, da.landmark)                   AS delivery_landmark,
            COALESCE(mo.delivery_city,     da.city,      u.city)          AS delivery_city,
            COALESCE(mo.delivery_state,    da.state,     u.state)         AS delivery_state,
            COALESCE(mo.delivery_pincode,  da.pincode,   u.pincode)       AS delivery_pincode,
            COALESCE(da.latitude,          mo.customer_lat)               AS delivery_lat,
            COALESCE(da.longitude,         mo.customer_lng)               AS delivery_lng,
            uc.upi_id            AS caterer_upi_id,
            uc.phonepe_id        AS caterer_phonepe_id,
            uc.payment_name      AS caterer_payment_name,
            uc.qr_code_image_url AS caterer_qr_url,
            json_agg(
              json_build_object(
                'food_name',   f.food_name,
                'quantity',    coi.quantity,
                'unit_price',  coi.unit_price,
                'total_price', coi.total_price
              ) ORDER BY coi.id
            ) AS items
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     JOIN users u  ON u.id  = mo.customer_id
     JOIN users uc ON uc.id = co.caterer_id
     JOIN caterer_order_items coi ON coi.caterer_order_id = co.id
     JOIN food_items f ON f.id = coi.food_item_id
     LEFT JOIN da ON da.user_id = mo.customer_id
     WHERE co.id = $1
       AND (co.caterer_id = $2 OR co.rider_id = $3)
     GROUP BY co.id, mo.customer_id, mo.customer_lat, mo.customer_lng,
              mo.delivery_house_no, mo.delivery_street, mo.delivery_landmark,
              mo.delivery_city, mo.delivery_state, mo.delivery_pincode,
              u.name, u.email, u.phone, u.address, u.city, u.state, u.pincode,
              da.house_no, da.street, da.landmark, da.city, da.state, da.pincode,
              da.latitude, da.longitude,
              uc.upi_id, uc.phonepe_id, uc.payment_name, uc.qr_code_image_url`,
    [caterer_order_id, caterer_id, rider_id]
  );
  if (!rows[0]) { const e = new Error('Order not found'); e.status = 404; throw e; }
  return rows[0];
}

async function startDelivery(caterer_order_id, rider_id) {
  const { rows } = await pool.query(
    `SELECT co.*, mo.customer_id
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     WHERE co.id = $1 AND co.rider_id = $2 AND co.status = 'ASSIGNED_TO_RIDER'`,
    [caterer_order_id, rider_id]
  );
  if (!rows[0]) { const e = new Error('Order not found or not assigned to you'); e.status = 404; throw e; }
  const order = rows[0];

  const { rows: updated } = await pool.query(
    `UPDATE caterer_orders SET status = 'OUT_FOR_DELIVERY', delivery_started_at = NOW()
     WHERE id = $1 RETURNING *`,
    [caterer_order_id]
  );

  setImmediate(async () => {
    try {
      const shortId = caterer_order_id.slice(0, 8).toUpperCase();
      await notifyUser(order.customer_id, {
        notification_type: 'ORDER_OUT_FOR_DELIVERY',
        title:        'Out for Delivery',
        message:      `Your order #${shortId} is out for delivery!`,
        reference_id: order.master_order_id,
      });
    } catch (err) {
      console.error('[RiderService] startDelivery notification failed:', err.message);
    }
  });

  return updated[0];
}

async function confirmCodPayment(caterer_order_id, rider_id) {
  const { rows } = await pool.query(
    `SELECT co.*, mo.customer_id
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     WHERE co.id = $1 AND co.rider_id = $2 AND co.payment_method = 'COD' AND co.status = 'OUT_FOR_DELIVERY'`,
    [caterer_order_id, rider_id]
  );
  if (!rows[0]) { const e = new Error('Order not found, not COD, or not out for delivery'); e.status = 404; throw e; }
  const order = rows[0];

  if (order.payment_status === 'PAID') {
    const e = new Error('Payment already confirmed'); e.status = 400; throw e;
  }

  const { rows: updated } = await pool.query(
    `UPDATE caterer_orders
     SET payment_status = 'PAID', payment_collected_at = NOW(), payment_collected_by_rider = $1
     WHERE id = $2 RETURNING *`,
    [rider_id, caterer_order_id]
  );

  setImmediate(async () => {
    try {
      const shortId = caterer_order_id.slice(0, 8).toUpperCase();
      await notifyUser(order.customer_id, {
        notification_type: 'COD_PAYMENT_RECEIVED',
        title:        'Payment Received',
        message:      `Cash payment for order #${shortId} has been confirmed by your rider.`,
        reference_id: order.master_order_id,
      });
    } catch (err) {
      console.error('[RiderService] confirmCodPayment notification failed:', err.message);
    }
  });

  return updated[0];
}

async function confirmDelivery(caterer_order_id, rider_id, code) {
  const { rows } = await pool.query(
    `SELECT co.*, mo.customer_id
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     WHERE co.id = $1 AND co.rider_id = $2 AND co.status = 'OUT_FOR_DELIVERY'`,
    [caterer_order_id, rider_id]
  );
  if (!rows[0]) { const e = new Error('Order not found or not out for delivery'); e.status = 404; throw e; }
  const order = rows[0];

  if (!order.delivery_confirmation_code || order.delivery_confirmation_code !== String(code)) {
    const e = new Error('Invalid confirmation code'); e.status = 400; throw e;
  }

  // COD orders must have payment confirmed before delivery
  if (order.payment_method === 'COD' && order.payment_status !== 'PAID') {
    const e = new Error('Please confirm cash payment collection before marking as delivered');
    e.status = 400; throw e;
  }

  const { rows: updated } = await pool.query(
    `UPDATE caterer_orders SET status = 'DELIVERED', delivered_at = NOW()
     WHERE id = $1 RETURNING *`,
    [caterer_order_id]
  );

  setImmediate(async () => {
    try {
      const shortId = caterer_order_id.slice(0, 8).toUpperCase();
      await notifyUser(order.customer_id, {
        notification_type: 'ORDER_DELIVERED',
        title:        'Order Delivered',
        message:      `Your order #${shortId} has been delivered!`,
        reference_id: order.master_order_id,
      });
      await notifyUser(order.caterer_id, {
        notification_type: 'ORDER_DELIVERED',
        title:        'Order Delivered',
        message:      `Order #${shortId} has been delivered by your rider.`,
        reference_id: order.master_order_id,
      });
    } catch (err) {
      console.error('[RiderService] confirmDelivery notification failed:', err.message);
    }
  });

  return updated[0];
}

async function assignRiderToOrder(caterer_order_id, rider_id, caterer_id) {
  const { rows: profileRows } = await pool.query(
    `SELECT user_id FROM rider_profiles WHERE user_id = $1 AND caterer_id = $2`,
    [rider_id, caterer_id]
  );
  if (!profileRows[0]) { const e = new Error('Rider not found or not owned by you'); e.status = 404; throw e; }

  const { rows } = await pool.query(
    `SELECT co.*, mo.customer_id
     FROM caterer_orders co
     JOIN master_orders mo ON mo.id = co.master_order_id
     WHERE co.id = $1 AND co.caterer_id = $2 AND co.status = 'READY'`,
    [caterer_order_id, caterer_id]
  );
  if (!rows[0]) { const e = new Error('Order not found or not ready for assignment'); e.status = 404; throw e; }
  const order = rows[0];

  let code = order.delivery_confirmation_code;
  if (!code) {
    code = String(Math.floor(100000 + Math.random() * 900000));
    await pool.query(
      `UPDATE caterer_orders SET delivery_confirmation_code = $1 WHERE id = $2`,
      [code, caterer_order_id]
    );
  }

  const { rows: updated } = await pool.query(
    `UPDATE caterer_orders SET rider_id = $1, status = 'ASSIGNED_TO_RIDER'
     WHERE id = $2 RETURNING *`,
    [rider_id, caterer_order_id]
  );

  setImmediate(async () => {
    try {
      const shortId = caterer_order_id.slice(0, 8).toUpperCase();
      await notifyUser(rider_id, {
        notification_type: 'ORDER_ASSIGNED',
        title:        'Delivery Assigned',
        message:      `You have been assigned order #${shortId} for delivery.`,
        reference_id: caterer_order_id,
      });
      await notifyUser(order.customer_id, {
        notification_type: 'ORDER_ASSIGNED_TO_RIDER',
        title:        'Rider Assigned',
        message:      `A rider has been assigned to deliver your order #${shortId}.`,
        reference_id: order.master_order_id,
      });
    } catch (err) {
      console.error('[RiderService] assignRider notification failed:', err.message);
    }
  });

  return { ...updated[0], delivery_confirmation_code: code };
}

async function getAllRiders({ search, page = 1, limit = 20 } = {}) {
  const params = [];
  let idx = 1;
  const conds = [`u.role = 'RIDER'`];
  if (search) { conds.push(`(u.name ILIKE $${idx} OR u.email ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
  const where = conds.join(' AND ');
  const { rows: cnt } = await pool.query(`SELECT COUNT(*) FROM users u WHERE ${where}`, params);
  const total  = Number(cnt[0].count);
  const offset = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  params.push(Number(limit), offset);
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
            rp.vehicle_type, rp.vehicle_number, rp.caterer_id,
            uc.name AS caterer_name,
            ROUND(AVG(rv.rating)::numeric, 1) AS avg_rating,
            COUNT(rv.id)::int AS review_count
     FROM users u
     LEFT JOIN rider_profiles rp ON rp.user_id = u.id
     LEFT JOIN users uc ON uc.id = rp.caterer_id
     LEFT JOIN reviews rv ON rv.subject_type = 'rider' AND rv.subject_id = u.id
     WHERE ${where}
     GROUP BY u.id, rp.vehicle_type, rp.vehicle_number, rp.caterer_id, uc.name
     ORDER BY u.created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    params
  );
  return { riders: rows, total, page: Number(page), limit: Number(limit) };
}

module.exports = {
  createRider,
  getRidersByCaterer,
  deleteRider,
  pushLocation,
  getLatestLocation,
  getLocationForOrder,
  getAssignedDeliveries,
  lookupOrderForRider,
  startDelivery,
  confirmCodPayment,
  confirmDelivery,
  assignRiderToOrder,
  getAllRiders,
};
