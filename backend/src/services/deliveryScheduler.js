'use strict';

const { runPoolingJob, expireStalePoolEntries } = require('./deliveryPoolingService');
const { runRiderAssignmentJob }                 = require('./riderAssignmentService');
const { runETARefreshJob }                      = require('./deliveryETAService');

const POOL_INTERVAL_MS       = 5 * 60 * 1000;  // 5 minutes
const ASSIGNMENT_INTERVAL_MS = 2 * 60 * 1000;  // 2 minutes
const ETA_INTERVAL_MS        = 5 * 60 * 1000;  // 5 minutes
const INITIAL_DELAY_MS       = 15 * 1000;       // 15 s after server start

async function _safeRun(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.error(`[DeliveryScheduler] ${name} error:`, err.message);
  }
}

function start() {
  // Staggered initial run (give DB connection pool time to warm up)
  setTimeout(async () => {
    await _safeRun('initial pool+assign', async () => {
      await expireStalePoolEntries();
      await runPoolingJob();
      await runRiderAssignmentJob();
    });
  }, INITIAL_DELAY_MS);

  // Pool creation: every 5 min
  setInterval(async () => {
    await _safeRun('poolingJob', async () => {
      await expireStalePoolEntries();
      await runPoolingJob();
    });
  }, POOL_INTERVAL_MS);

  // Rider assignment: every 2 min
  setInterval(async () => {
    await _safeRun('assignmentJob', runRiderAssignmentJob);
  }, ASSIGNMENT_INTERVAL_MS);

  // ETA refresh: every 5 min
  setInterval(async () => {
    await _safeRun('etaRefreshJob', runETARefreshJob);
  }, ETA_INTERVAL_MS);

  console.log(
    '[DeliveryScheduler] Started — pool=5m, assignment=2m, eta-refresh=5m, initial-run=15s.'
  );
}

module.exports = { start };
