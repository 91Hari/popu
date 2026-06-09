'use strict';

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/catererNotificationController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

const guard = [authenticate, requireRole('CATERER')];

// read-all must be before /:id to prevent Express matching "read-all" as an id
router.patch('/read-all',   ...guard, ctrl.markAllRead);
router.get('/unread-count', ...guard, ctrl.getUnreadCount);
router.get('/',             ...guard, ctrl.getNotifications);
router.patch('/:id/read',   ...guard, ctrl.markOneRead);

module.exports = router;
