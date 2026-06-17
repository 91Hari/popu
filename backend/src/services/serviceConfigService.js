'use strict';

const pool = require('../config/db');

async function getAllServices() {
  const { rows } = await pool.query(
    `SELECT service_code    AS "serviceCode",
            service_name    AS "serviceName",
            is_enabled      AS "isEnabled",
            is_coming_soon  AS "isComingSoon",
            display_order   AS "displayOrder",
            created_at      AS "createdAt",
            updated_at      AS "updatedAt"
     FROM service_config
     ORDER BY display_order ASC, created_at ASC`
  );
  return rows;
}

async function updateService(serviceCode, patch = {}) {
  const { isEnabled, isComingSoon, displayOrder } = patch;

  const sets = [];
  const params = [];
  let idx = 1;

  if (typeof isEnabled === 'boolean')   { sets.push(`is_enabled = $${idx++}`);     params.push(isEnabled); }
  if (typeof isComingSoon === 'boolean') { sets.push(`is_coming_soon = $${idx++}`); params.push(isComingSoon); }
  if (typeof displayOrder === 'number')  { sets.push(`display_order = $${idx++}`);  params.push(displayOrder); }

  if (sets.length === 0) {
    const err = new Error('No valid fields to update');
    err.status = 400;
    throw err;
  }

  sets.push(`updated_at = NOW()`);
  params.push(serviceCode.toUpperCase());

  const { rows } = await pool.query(
    `UPDATE service_config
     SET ${sets.join(', ')}
     WHERE service_code = $${idx}
     RETURNING service_code    AS "serviceCode",
               service_name    AS "serviceName",
               is_enabled      AS "isEnabled",
               is_coming_soon  AS "isComingSoon",
               display_order   AS "displayOrder",
               updated_at      AS "updatedAt"`,
    params
  );

  if (rows.length === 0) {
    const err = new Error(`Service '${serviceCode}' not found`);
    err.status = 404;
    throw err;
  }
  return rows[0];
}

module.exports = { getAllServices, updateService };
