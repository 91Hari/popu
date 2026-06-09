'use strict';

const {
  getNotificationsForUser,
  getUnreadCountForUser,
  markAsRead,
  markAllAsRead,
} = require('../services/notificationService');

async function getNotifications(req, res, next) {
  try {
    const result = await getNotificationsForUser(req.user.id, { limit: 50, offset: 0 });
    res.json(result);
  } catch (err) { next(err); }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await getUnreadCountForUser(req.user.id);
    res.json({ unread_count: count });
  } catch (err) { next(err); }
}

async function markOneRead(req, res, next) {
  try {
    await markAsRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    await markAllAsRead(req.user.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { getNotifications, getUnreadCount, markOneRead, markAllRead };
