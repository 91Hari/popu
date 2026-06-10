const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/paymentProofController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Customer: submit proof
router.post('/', requireRole('CUSTOMER'), ctrl.submitProof);

// Customer: view their proofs
router.get('/my', requireRole('CUSTOMER'), ctrl.getProofsForCustomer);

// Caterer: view proofs to review + review
router.get('/',          requireRole('CATERER'), ctrl.getProofsForCaterer);
router.patch('/:id/review', requireRole('CATERER'), ctrl.reviewProof);

module.exports = router;
