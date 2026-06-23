const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/accountController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/request-delete',  ctrl.requestDelete);
router.post('/request-closure', ctrl.requestClosure);

module.exports = router;
