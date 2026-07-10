'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/complianceController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

// ─── Caterer routes ───────────────────────────────────────────────────────────
router.get ('/caterer/fssai',           authenticate, requireRole('CATERER'), ctrl.catererGetFssai);
router.post('/caterer/fssai',           authenticate, requireRole('CATERER'), ctrl.catererUpsertFssai);
router.get ('/caterer/kyc',             authenticate, requireRole('CATERER'), ctrl.catererGetKyc);
router.post('/caterer/kyc',             authenticate, requireRole('CATERER'), ctrl.catererSubmitKyc);
router.post('/caterer/bank-account',    authenticate, requireRole('CATERER'), ctrl.catererAddBankAccount);
router.get ('/caterer/settlements',     authenticate, requireRole('CATERER'), ctrl.catererSettlements);

// ─── Rider routes ─────────────────────────────────────────────────────────────
router.put('/rider/kyc',                authenticate, requireRole('RIDER'), ctrl.updateRiderKyc);

// ─── Customer routes ──────────────────────────────────────────────────────────
router.post('/grievances',              authenticate, ctrl.submitGrievance);
router.get ('/grievances',              authenticate, ctrl.myGrievances);
router.post('/consent',                 authenticate, ctrl.recordConsent);

// ─── Admin routes ─────────────────────────────────────────────────────────────
const adminAuth = [authenticate, requireRole('ADMIN')];

router.get ('/admin/dashboard',                      ...adminAuth, ctrl.adminComplianceDashboard);
router.get ('/admin/fssai',                          ...adminAuth, ctrl.adminListFssai);
router.patch('/admin/fssai/:id/verify',              ...adminAuth, ctrl.adminVerifyFssai);
router.get ('/admin/kyc',                            ...adminAuth, ctrl.adminListKyc);
router.patch('/admin/kyc/:id/review',                ...adminAuth, ctrl.adminReviewKyc);
router.get ('/admin/grievances',                     ...adminAuth, ctrl.adminListGrievances);
router.patch('/admin/grievances/:id',                ...adminAuth, ctrl.adminUpdateGrievance);
router.get ('/admin/settlements',                    ...adminAuth, ctrl.adminListSettlements);
router.post('/admin/settlements',                    ...adminAuth, ctrl.adminCreateSettlement);
router.patch('/admin/settlements/:id/mark-paid',     ...adminAuth, ctrl.adminMarkSettlementPaid);

module.exports = router;
