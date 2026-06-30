'use strict';

const fssaiSvc      = require('../services/fssaiService');
const kycSvc        = require('../services/kycService');
const grievanceSvc  = require('../services/grievanceService');
const settlementSvc = require('../services/settlementService');
const pool          = require('../config/db');

// ─── FSSAI ───────────────────────────────────────────────────────────────────

exports.catererGetFssai = async (req, res, next) => {
  try {
    const data = await fssaiSvc.getFssaiForCaterer(req.user.id);
    res.json({ fssai: data });
  } catch (err) { next(err); }
};

exports.catererUpsertFssai = async (req, res, next) => {
  try {
    const data = await fssaiSvc.upsertFssai(req.user.id, req.body);
    res.json({ fssai: data, message: 'FSSAI details submitted for verification' });
  } catch (err) { next(err); }
};

exports.adminListFssai = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const data = await fssaiSvc.adminListFssai({ status, page: +page, limit: +limit });
    res.json(data);
  } catch (err) { next(err); }
};

exports.adminVerifyFssai = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved, rejection_reason } = req.body;
    const data = await fssaiSvc.adminVerifyFssai(id, req.user.id, { approved: !!approved, rejection_reason });
    res.json({ fssai: data, message: approved ? 'FSSAI approved' : 'FSSAI rejected' });
  } catch (err) { next(err); }
};

// ─── KYC ─────────────────────────────────────────────────────────────────────

exports.catererGetKyc = async (req, res, next) => {
  try {
    const data = await kycSvc.getKycForCaterer(req.user.id);
    res.json({ kyc: data });
  } catch (err) { next(err); }
};

exports.catererSubmitKyc = async (req, res, next) => {
  try {
    const data = await kycSvc.upsertCatererKyc(req.user.id, req.body);
    res.json({ kyc: data, message: 'KYC submitted for review' });
  } catch (err) { next(err); }
};

exports.catererAddBankAccount = async (req, res, next) => {
  try {
    const data = await kycSvc.addBankAccount(req.user.id, req.body);
    res.json({ bank_account: data });
  } catch (err) { next(err); }
};

exports.adminListKyc = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const data = await kycSvc.adminListKyc({ status, page: +page, limit: +limit });
    res.json(data);
  } catch (err) { next(err); }
};

exports.adminReviewKyc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved, rejection_reason } = req.body;
    const data = await kycSvc.adminReviewKyc(id, req.user.id, { approved: !!approved, rejection_reason });
    res.json({ kyc: data, message: approved ? 'KYC approved' : 'KYC rejected' });
  } catch (err) { next(err); }
};

// ─── GRIEVANCES ───────────────────────────────────────────────────────────────

exports.submitGrievance = async (req, res, next) => {
  try {
    const data = await grievanceSvc.submitGrievance(req.user.id, req.body);
    res.status(201).json({ grievance: data, message: `Grievance submitted. Ticket: ${data.ticket_number}` });
  } catch (err) { next(err); }
};

exports.myGrievances = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await grievanceSvc.getMyGrievances(req.user.id, { page: +page, limit: +limit });
    res.json(data);
  } catch (err) { next(err); }
};

exports.adminListGrievances = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const [data, summary] = await Promise.all([
      grievanceSvc.adminListGrievances({ status, page: +page, limit: +limit }),
      grievanceSvc.getGrievanceSummary(),
    ]);
    res.json({ ...data, summary });
  } catch (err) { next(err); }
};

exports.adminUpdateGrievance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await grievanceSvc.adminUpdateGrievance(id, req.user.id, req.body);
    res.json({ grievance: data });
  } catch (err) { next(err); }
};

// ─── SETTLEMENTS ──────────────────────────────────────────────────────────────

exports.adminListSettlements = async (req, res, next) => {
  try {
    const { caterer_id, status = 'all', page = 1, limit = 20 } = req.query;
    const [data, summary] = await Promise.all([
      settlementSvc.adminListSettlements({ caterer_id, status, page: +page, limit: +limit }),
      settlementSvc.getSettlementSummary(),
    ]);
    res.json({ ...data, summary });
  } catch (err) { next(err); }
};

exports.adminCreateSettlement = async (req, res, next) => {
  try {
    const { caterer_id, period_from, period_to } = req.body;
    if (!caterer_id || !period_from || !period_to) {
      return res.status(400).json({ error: 'caterer_id, period_from, period_to are required' });
    }
    const data = await settlementSvc.createSettlement(req.user.id, caterer_id, period_from, period_to);
    res.status(201).json({ settlement: data });
  } catch (err) { next(err); }
};

exports.adminMarkSettlementPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await settlementSvc.markSettlementPaid(id, req.user.id, req.body);
    res.json({ settlement: data });
  } catch (err) { next(err); }
};

exports.catererSettlements = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await settlementSvc.getCatererSettlements(req.user.id, { page: +page, limit: +limit });
    res.json(data);
  } catch (err) { next(err); }
};

// ─── COMPLIANCE DASHBOARD ─────────────────────────────────────────────────────

exports.adminComplianceDashboard = async (req, res, next) => {
  try {
    const [fssaiExpiring, fssaiPending, kycPending, grievanceSummary, settlementSummary] = await Promise.all([
      fssaiSvc.getExpiringFssai(60),
      pool.query(`SELECT COUNT(*) FROM fssai_details WHERE verified = FALSE AND rejection_reason IS NULL`),
      pool.query(`SELECT COUNT(*) FROM caterer_kyc WHERE kyc_status = 'SUBMITTED'`),
      grievanceSvc.getGrievanceSummary(),
      settlementSvc.getSettlementSummary(),
    ]);

    res.json({
      fssai: {
        expiring_soon:   fssaiExpiring.length,
        pending_review:  parseInt(fssaiPending.rows[0].count),
        expiring_details: fssaiExpiring.slice(0, 10),
      },
      kyc: {
        pending_review: parseInt(kycPending.rows[0].count),
      },
      grievances: grievanceSummary,
      settlements: settlementSummary,
    });
  } catch (err) { next(err); }
};

// ─── CONSENT ─────────────────────────────────────────────────────────────────

exports.recordConsent = async (req, res, next) => {
  try {
    const { consents } = req.body; // array of { consent_type, accepted, document_version }
    if (!Array.isArray(consents) || !consents.length) {
      return res.status(400).json({ error: 'consents array is required' });
    }
    const ip = req.ip || req.headers['x-forwarded-for'];
    const ua = req.headers['user-agent'];

    await Promise.all(consents.map(c =>
      pool.query(
        `INSERT INTO legal_consents (user_id, consent_type, document_version, accepted, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.user.id, c.consent_type, c.document_version || '1.0', c.accepted, ip, ua]
      )
    ));

    res.json({ message: 'Consents recorded' });
  } catch (err) { next(err); }
};

// ─── RIDER KYC ───────────────────────────────────────────────────────────────

exports.updateRiderKyc = async (req, res, next) => {
  try {
    const {
      govt_id_type, govt_id_number, govt_id_url,
      driving_license, dl_category, dl_expiry, dl_url,
      vehicle_rc_number, insurance_number, insurance_expiry, insurance_url,
      gps_consent_given,
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE rider_profiles SET
         govt_id_type            = COALESCE($1, govt_id_type),
         govt_id_number          = COALESCE($2, govt_id_number),
         govt_id_url             = COALESCE($3, govt_id_url),
         driving_license         = COALESCE($4, driving_license),
         dl_category             = COALESCE($5, dl_category),
         dl_expiry               = COALESCE($6, dl_expiry),
         dl_url                  = COALESCE($7, dl_url),
         vehicle_rc_number       = COALESCE($8, vehicle_rc_number),
         insurance_number        = COALESCE($9, insurance_number),
         insurance_expiry        = COALESCE($10, insurance_expiry),
         insurance_url           = COALESCE($11, insurance_url),
         gps_consent_given       = COALESCE($12, gps_consent_given),
         gps_consent_at          = CASE WHEN $12 = TRUE AND gps_consent_given = FALSE THEN NOW() ELSE gps_consent_at END
       WHERE user_id = $13
       RETURNING *`,
      [govt_id_type, govt_id_number, govt_id_url,
       driving_license, dl_category, dl_expiry || null, dl_url,
       vehicle_rc_number, insurance_number, insurance_expiry || null, insurance_url,
       gps_consent_given, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Rider profile not found' });
    res.json({ rider: rows[0] });
  } catch (err) { next(err); }
};
