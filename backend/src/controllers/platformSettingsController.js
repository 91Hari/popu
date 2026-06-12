'use strict';

const pool = require('../config/db');
const { invalidateCache } = require('../services/paymentCalculationService');

async function getSettings(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, commission_enabled, commission_percentage,
              platform_fee_enabled, platform_fee_amount,
              updated_by, updated_at
       FROM platform_settings ORDER BY created_at ASC LIMIT 1`
    );
    res.json(rows[0] || {
      commission_enabled:    false,
      commission_percentage: 0,
      platform_fee_enabled:  false,
      platform_fee_amount:   0,
    });
  } catch (err) {
    console.error('[PlatformSettings] getSettings:', err.message);
    res.status(500).json({ message: 'Failed to load platform settings.' });
  }
}

async function updateSettings(req, res) {
  const {
    commission_enabled,
    commission_percentage,
    platform_fee_enabled,
    platform_fee_amount,
  } = req.body;

  if (commission_percentage != null) {
    const pct = Number(commission_percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return res.status(400).json({ message: 'commission_percentage must be 0–100.' });
    }
  }
  if (platform_fee_amount != null) {
    const fee = Number(platform_fee_amount);
    if (isNaN(fee) || fee < 0) {
      return res.status(400).json({ message: 'platform_fee_amount must be ≥ 0.' });
    }
  }

  try {
    const { rows: existing } = await pool.query(
      `SELECT id FROM platform_settings ORDER BY created_at ASC LIMIT 1`
    );

    let result;
    if (existing.length > 0) {
      const { rows } = await pool.query(
        `UPDATE platform_settings
         SET commission_enabled    = COALESCE($1, commission_enabled),
             commission_percentage = COALESCE($2, commission_percentage),
             platform_fee_enabled  = COALESCE($3, platform_fee_enabled),
             platform_fee_amount   = COALESCE($4, platform_fee_amount),
             updated_by            = $5,
             updated_at            = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          commission_enabled    ?? null,
          commission_percentage ?? null,
          platform_fee_enabled  ?? null,
          platform_fee_amount   ?? null,
          req.user.id,
          existing[0].id,
        ]
      );
      result = rows[0];
    } else {
      const { rows } = await pool.query(
        `INSERT INTO platform_settings
           (commission_enabled, commission_percentage, platform_fee_enabled, platform_fee_amount, updated_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          commission_enabled    ?? false,
          commission_percentage ?? 0,
          platform_fee_enabled  ?? false,
          platform_fee_amount   ?? 0,
          req.user.id,
        ]
      );
      result = rows[0];
    }

    invalidateCache();
    res.json(result);
  } catch (err) {
    console.error('[PlatformSettings] updateSettings:', err.message);
    res.status(500).json({ message: 'Failed to update platform settings.' });
  }
}

module.exports = { getSettings, updateSettings };
