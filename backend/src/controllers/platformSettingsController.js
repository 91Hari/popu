'use strict';

const pool = require('../config/db');
const { invalidateCache }   = require('../services/paymentCalculationService');
const { clearConfigCache }  = require('../services/phonePeService');

async function getSettings(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, commission_enabled, commission_percentage,
              platform_fee_enabled, platform_fee_amount,
              phonepe_client_id, phonepe_env, phonepe_client_version,
              CASE WHEN phonepe_client_secret IS NOT NULL AND phonepe_client_secret <> ''
                   THEN TRUE ELSE FALSE END AS phonepe_secret_set,
              updated_by, updated_at
       FROM platform_settings ORDER BY created_at ASC LIMIT 1`
    );
    res.json(rows[0] || {
      commission_enabled:    false,
      commission_percentage: 0,
      platform_fee_enabled:  false,
      platform_fee_amount:   0,
      phonepe_client_id:     null,
      phonepe_secret_set:    false,
      phonepe_env:           'uat',
      phonepe_client_version:'1',
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
    phonepe_client_id,
    phonepe_client_secret,
    phonepe_env,
    phonepe_client_version,
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
             phonepe_client_id     = COALESCE($5, phonepe_client_id),
             phonepe_client_secret = CASE WHEN $6::text IS NOT NULL AND $6 <> ''
                                          THEN $6 ELSE phonepe_client_secret END,
             phonepe_env           = COALESCE($7, phonepe_env),
             phonepe_client_version= COALESCE($8, phonepe_client_version),
             updated_by            = $9,
             updated_at            = NOW()
         WHERE id = $10
         RETURNING *`,
        [
          commission_enabled    ?? null,
          commission_percentage ?? null,
          platform_fee_enabled  ?? null,
          platform_fee_amount   ?? null,
          phonepe_client_id     || null,
          phonepe_client_secret || null,
          phonepe_env           || null,
          phonepe_client_version|| null,
          req.user.id,
          existing[0].id,
        ]
      );
      result = rows[0];
    } else {
      const { rows } = await pool.query(
        `INSERT INTO platform_settings
           (commission_enabled, commission_percentage, platform_fee_enabled, platform_fee_amount,
            phonepe_client_id, phonepe_client_secret, phonepe_env, phonepe_client_version, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          commission_enabled    ?? false,
          commission_percentage ?? 0,
          platform_fee_enabled  ?? false,
          platform_fee_amount   ?? 0,
          phonepe_client_id     || null,
          phonepe_client_secret || null,
          phonepe_env           || 'uat',
          phonepe_client_version|| '1',
          req.user.id,
        ]
      );
      result = rows[0];
    }

    invalidateCache();
    clearConfigCache(); // force phonePeService to re-read new credentials from DB
    res.json({ ...result, phonepe_client_secret: undefined, phonepe_secret_set: !!result.phonepe_client_secret });
  } catch (err) {
    console.error('[PlatformSettings] updateSettings:', err.message);
    res.status(500).json({ message: 'Failed to update platform settings.' });
  }
}

module.exports = { getSettings, updateSettings };
