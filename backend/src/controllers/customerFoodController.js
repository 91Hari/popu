const foodService         = require('../services/foodService');
const notificationService = require('../services/notificationService');

async function getCustomerFoods(req, res, next) {
  try {
    const foods = await foodService.getCustomerFoods();
    res.json(foods);
  } catch (err) {
    next(err);
  }
}

async function searchCustomerFoods(req, res, next) {
  try {
    const { foodName, category, catererName, minPrice, maxPrice, available } = req.query;
    const foods = await foodService.searchCustomerFoods({
      foodName, category, catererName, minPrice, maxPrice, available,
    });
    res.json(foods);
  } catch (err) {
    next(err);
  }
}

async function getNotifications(req, res, next) {
  try {
    const result = await notificationService.getNotificationsForUser(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function markAllNotificationsRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCustomerFoods,
  searchCustomerFoods,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
