'use strict';

const pool = require('../config/db');

async function getAllServices() {
  const { rows } = await pool.query(
    `SELECT service_code AS "serviceCode",
            service_name AS "serviceName",
            is_enabled   AS "isEnabled",
            created_at   AS "createdAt",
            updated_at   AS "updatedAt"
     FROM service_config
     ORDER BY created_at ASC`
  );
  return rows;
}

async function updateService(serviceCode, isEnabled) {
  const { rows } = await pool.query(
    `UPDATE service_config
     SET is_enabled = $1, updated_at = NOW()
     WHERE service_code = $2
     RETURNING service_code AS "serviceCode",
               service_name AS "serviceName",
               is_enabled   AS "isEnabled",
               updated_at   AS "updatedAt"`,
    [isEnabled, serviceCode.toUpperCase()]
  );
  if (rows.length === 0) {
    const err = new Error(`Service '${serviceCode}' not found`);
    err.status = 404;
    throw err;
  }
  return rows[0];
}

module.exports = { getAllServices, updateService };
