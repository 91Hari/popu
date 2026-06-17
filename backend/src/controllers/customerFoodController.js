'use strict';

const foodService         = require('../services/foodService');
const notificationService = require('../services/notificationService');

function _parseCoords(req) {
  const lat = parseFloat(req.query.customer_lat);
  const lng = parseFloat(req.query.customer_lng);
  return {
    customerLat: isNaN(lat) ? null : lat,
    customerLng: isNaN(lng) ? null : lng,
  };
}

async function getCustomerFoods(req, res, next) {
  try {
    const { customerLat, customerLng } = _parseCoords(req);
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const { food_category } = req.query;
    const foods = await foodService.getCustomerFoods({ customerLat, customerLng, limit, food_category });
    res.json(foods);
  } catch (err) {
    next(err);
  }
}

async function searchCustomerFoods(req, res, next) {
  try {
    const { foodName, category, food_category, catererName, minPrice, maxPrice, available } = req.query;
    const { customerLat, customerLng } = _parseCoords(req);
    const foods = await foodService.searchCustomerFoods({
      foodName, category, food_category, catererName, minPrice, maxPrice, available,
      customerLat, customerLng,
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

async function getLatestFoods(req, res, next) {
  try {
    const page  = req.query.page  ? Number(req.query.page)  : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const result = await foodService.getLatestFoods({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCustomerFoods,
  searchCustomerFoods,
  getLatestFoods,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
