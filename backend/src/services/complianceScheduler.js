'use strict';

const pool = require('../config/db');
const { getExpiringFssai } = require('./fssaiService');
const { notifyUser, NOTIFICATION_TYPES } = require('./notificationService');

// Purge rider GPS breadcrumbs older than 90 days (DPDPA data minimisation)
async function purgeOldRiderLocations() {
  const { rowCount } = await pool.query(
    `DELETE FROM rider_locations WHERE created_at < NOW() - INTERVAL '90 days'`
  );
  if (rowCount > 0) console.log(`[ComplianceScheduler] Purged ${rowCount} old rider location records`);
}

// Notify caterers whose FSSAI is expiring in 60, 30, or 7 days
async function sendFssaiExpiryAlerts() {
  const expiring = await getExpiringFssai(60);
  const today    = new Date();

  for (const f of expiring) {
    const daysLeft = Math.ceil((new Date(f.expiry_date) - today) / (1000 * 60 * 60 * 24));
    if (![60, 30, 7].includes(daysLeft)) continue;

    await notifyUser(f.caterer_id, {
      type:    NOTIFICATION_TYPES.SYSTEM,
      title:   `FSSAI License Expiring in ${daysLeft} Days`,
      message: `Your FSSAI license ${f.fssai_number} expires on ${new Date(f.expiry_date).toLocaleDateString('en-IN')}. Please renew it to continue operating on PO.PU.`,
    }).catch(() => {});
  }
}

// Auto-suspend caterers with expired FSSAI (7-day grace period)
async function suspendExpiredFssaiCaterers() {
  const { rows } = await pool.query(
    `SELECT f.caterer_id, u.name
     FROM fssai_details f
     JOIN users u ON u.id = f.caterer_id
     WHERE f.verified = TRUE
       AND f.expiry_date < CURRENT_DATE - INTERVAL '7 days'
       AND u.is_active = TRUE`
  );

  for (const caterer of rows) {
    await pool.query(`UPDATE users SET is_active = FALSE WHERE id = $1`, [caterer.caterer_id]);
    console.log(`[ComplianceScheduler] Suspended caterer ${caterer.name} — FSSAI expired`);
  }
}

// Run all compliance checks (call from a daily cron or server startup scheduler)
async function runDailyComplianceChecks() {
  console.log('[ComplianceScheduler] Running daily compliance checks...');
  await Promise.allSettled([
    purgeOldRiderLocations(),
    sendFssaiExpiryAlerts(),
    suspendExpiredFssaiCaterers(),
  ]);
  console.log('[ComplianceScheduler] Done.');
}

module.exports = { runDailyComplianceChecks, purgeOldRiderLocations, sendFssaiExpiryAlerts, suspendExpiredFssaiCaterers };
