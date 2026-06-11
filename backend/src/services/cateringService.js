'use strict';

const pool = require('../config/db');
const { notifyUser } = require('./notificationService');

async function toggleCateringAvailable(caterer_id, available) {
  const { rows } = await pool.query(
    `UPDATE users SET catering_available = $1 WHERE id = $2 AND role = 'CATERER'
     RETURNING id, catering_available`,
    [available, caterer_id]
  );
  if (!rows[0]) { const e = new Error('Caterer not found'); e.status = 404; throw e; }
  return rows[0];
}

async function getCateringServicesByCaterer(caterer_id) {
  const { rows } = await pool.query(
    `SELECT * FROM catering_services WHERE caterer_id = $1 ORDER BY occasion_name ASC`,
    [caterer_id]
  );
  return rows;
}

async function createCateringService(caterer_id, {
  occasion_name, price_per_person,
  minimum_people = 10, maximum_people = 500, advance_booking_days = 7,
  menu_items = null,
}) {
  if (!occasion_name || !price_per_person) {
    const e = new Error('occasion_name and price_per_person are required');
    e.status = 400; throw e;
  }
  const { rows } = await pool.query(
    `INSERT INTO catering_services
       (caterer_id, occasion_name, price_per_person, minimum_people, maximum_people, advance_booking_days, menu_items)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [caterer_id, occasion_name, price_per_person, minimum_people, maximum_people, advance_booking_days, menu_items || null]
  );
  await pool.query(`UPDATE users SET catering_available = TRUE WHERE id = $1`, [caterer_id]);
  return rows[0];
}

async function updateCateringService(id, caterer_id, fields) {
  const { occasion_name, price_per_person, minimum_people, maximum_people, advance_booking_days, status } = fields;
  const params = [
    occasion_name || null, price_per_person || null,
    minimum_people || null, maximum_people || null,
    advance_booking_days || null, status || null,
    id, caterer_id,
  ];
  const menuItemsClause = 'menu_items' in fields
    ? (params.push(fields.menu_items || null), `menu_items = $${params.length},`)
    : '';
  const { rows } = await pool.query(
    `UPDATE catering_services
     SET occasion_name        = COALESCE($1, occasion_name),
         price_per_person     = COALESCE($2, price_per_person),
         minimum_people       = COALESCE($3, minimum_people),
         maximum_people       = COALESCE($4, maximum_people),
         advance_booking_days = COALESCE($5, advance_booking_days),
         status               = COALESCE($6, status),
         ${menuItemsClause}
         updated_at           = NOW()
     WHERE id = $7 AND caterer_id = $8
     RETURNING *`,
    params
  );
  if (!rows[0]) { const e = new Error('Service not found'); e.status = 404; throw e; }
  return rows[0];
}

async function deleteCateringService(id, caterer_id) {
  const { rowCount } = await pool.query(
    `DELETE FROM catering_services WHERE id = $1 AND caterer_id = $2`,
    [id, caterer_id]
  );
  if (rowCount === 0) { const e = new Error('Service not found'); e.status = 404; throw e; }
  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM catering_services WHERE caterer_id = $1`,
    [caterer_id]
  );
  if (Number(rows[0].count) === 0) {
    await pool.query(`UPDATE users SET catering_available = FALSE WHERE id = $1`, [caterer_id]);
  }
  return { ok: true };
}

async function createCateringBooking(customer_id, {
  catering_service_id, event_date, number_of_people,
  special_food_request, special_instructions,
}) {
  const { rows: svc } = await pool.query(
    `SELECT cs.*, u.name AS caterer_name
     FROM catering_services cs
     JOIN users u ON u.id = cs.caterer_id
     WHERE cs.id = $1 AND cs.status = 'ACTIVE'`,
    [catering_service_id]
  );
  const service = svc[0];
  if (!service) { const e = new Error('Catering service not found or inactive'); e.status = 404; throw e; }

  const diffDays = Math.floor((new Date(event_date) - new Date()) / 864e5);
  if (diffDays < service.advance_booking_days) {
    const e = new Error(`This service requires at least ${service.advance_booking_days} days advance notice`);
    e.status = 400; throw e;
  }
  if (number_of_people < service.minimum_people || number_of_people > service.maximum_people) {
    const e = new Error(
      `Number of people must be between ${service.minimum_people} and ${service.maximum_people}`
    );
    e.status = 400; throw e;
  }

  const total_amount = parseFloat(service.price_per_person) * number_of_people;

  const { rows } = await pool.query(
    `INSERT INTO catering_bookings
       (customer_id, caterer_id, catering_service_id, occasion_name, event_date,
        number_of_people, price_per_person, total_amount, special_food_request, special_instructions)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      customer_id, service.caterer_id, catering_service_id, service.occasion_name,
      event_date, number_of_people, service.price_per_person, total_amount,
      special_food_request || null, special_instructions || null,
    ]
  );
  const booking = rows[0];

  setImmediate(async () => {
    try {
      await notifyUser(service.caterer_id, {
        notification_type: 'NEW_CATERING_BOOKING',
        title:        'New Catering Booking',
        message:      `New catering request for ${service.occasion_name} on ${event_date} (${number_of_people} people).`,
        reference_id: booking.id,
      });
    } catch (err) {
      console.error('[CateringService] Notification failed:', err.message);
    }
  });

  return booking;
}

async function getCateringBookingsByCustomer(customer_id) {
  const { rows } = await pool.query(
    `SELECT cb.*,
            uc.name          AS caterer_name,
            uc.business_name AS caterer_business_name,
            uc.phone         AS caterer_phone
     FROM catering_bookings cb
     JOIN users uc ON uc.id = cb.caterer_id
     WHERE cb.customer_id = $1
     ORDER BY cb.created_at DESC`,
    [customer_id]
  );
  return rows;
}

async function getCateringBookingsByCaterer(caterer_id) {
  const { rows } = await pool.query(
    `SELECT cb.*,
            uu.name  AS customer_name,
            uu.email AS customer_email,
            uu.phone AS customer_phone
     FROM catering_bookings cb
     JOIN users uu ON uu.id = cb.customer_id
     WHERE cb.caterer_id = $1
     ORDER BY cb.event_date ASC`,
    [caterer_id]
  );
  return rows;
}

async function updateCateringBookingStatus(id, caterer_id, status) {
  const valid = ['CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
  if (!valid.includes(status)) { const e = new Error('Invalid status'); e.status = 400; throw e; }
  const { rows } = await pool.query(
    `UPDATE catering_bookings SET status = $1, updated_at = NOW()
     WHERE id = $2 AND caterer_id = $3 RETURNING *`,
    [status, id, caterer_id]
  );
  if (!rows[0]) { const e = new Error('Booking not found'); e.status = 404; throw e; }

  setImmediate(async () => {
    try {
      let confirmedPhone = null;
      if (status === 'CONFIRMED') {
        const { rows: phoneRows } = await pool.query(
          `SELECT phone FROM users WHERE id = $1`, [caterer_id]
        );
        confirmedPhone = phoneRows[0]?.phone || null;
      }
      const notifMsg = {
        CONFIRMED: {
          title:   'Catering Confirmed',
          message: confirmedPhone
            ? `Your catering booking has been confirmed! Reach the caterer at: ${confirmedPhone}`
            : 'Your catering booking has been confirmed by the caterer.',
        },
        REJECTED:  { title: 'Catering Rejected',  message: 'Your catering booking was rejected. Please try another caterer.' },
        CANCELLED: { title: 'Catering Cancelled',  message: 'Your catering booking has been cancelled.' },
        COMPLETED: { title: 'Catering Completed',  message: 'Your catering event has been marked as completed.' },
      }[status];
      if (notifMsg) {
        await notifyUser(rows[0].customer_id, {
          notification_type: `CATERING_${status}`,
          ...notifMsg,
          reference_id: id,
        });
      }
    } catch (err) {
      console.error('[CateringService] Booking notification failed:', err.message);
    }
  });

  return rows[0];
}

async function getAllCateringBookings({ page = 1, limit = 20, status } = {}) {
  const params = [];
  let idx = 1;
  const conds = [];
  if (status) { conds.push(`cb.status = $${idx++}`); params.push(status.toUpperCase()); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const { rows: cnt } = await pool.query(
    `SELECT COUNT(*) FROM catering_bookings cb ${where}`, params
  );
  const total  = Number(cnt[0].count);
  const offset = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  params.push(Number(limit), offset);
  const { rows } = await pool.query(
    `SELECT cb.*, uu.name AS customer_name, uc.name AS caterer_name
     FROM catering_bookings cb
     JOIN users uu ON uu.id = cb.customer_id
     JOIN users uc ON uc.id = cb.caterer_id
     ${where}
     ORDER BY cb.created_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    params
  );
  return { bookings: rows, total, page: Number(page), limit: Number(limit) };
}

module.exports = {
  toggleCateringAvailable,
  getCateringServicesByCaterer,
  createCateringService,
  updateCateringService,
  deleteCateringService,
  createCateringBooking,
  getCateringBookingsByCustomer,
  getCateringBookingsByCaterer,
  updateCateringBookingStatus,
  getAllCateringBookings,
};
