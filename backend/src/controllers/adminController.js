'use strict';

const adminService = require('../services/adminService');

async function getDashboard(req, res, next) {
  try { res.json(await adminService.getDashboardStats()); }
  catch (err) { next(err); }
}

async function getCustomers(req, res, next) {
  try {
    const { search, page, limit, date_from, date_to, sort } = req.query;
    res.json(await adminService.getCustomers({ search, page, limit, date_from, date_to, sort }));
  } catch (err) { next(err); }
}

async function getCaterers(req, res, next) {
  try {
    const { search, page, limit, date_from, date_to, sort } = req.query;
    res.json(await adminService.getCaterers({ search, page, limit, date_from, date_to, sort }));
  } catch (err) { next(err); }
}

async function getFoods(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    res.json(await adminService.getFoods({ search, page, limit }));
  } catch (err) { next(err); }
}

async function getOrders(req, res, next) {
  try {
    const { status, page, limit } = req.query;
    res.json(await adminService.getOrders({ status, page, limit }));
  } catch (err) { next(err); }
}

async function setCustomerStatus(req, res, next) {
  try {
    const { active } = req.body;
    res.json(await adminService.setUserStatus(req.params.id, Boolean(active)));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function setCatererStatus(req, res, next) {
  try {
    const { active } = req.body;
    res.json(await adminService.setUserStatus(req.params.id, Boolean(active)));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function setFoodStatus(req, res, next) {
  try {
    const { available } = req.body;
    res.json(await adminService.setFoodStatus(req.params.id, Boolean(available)));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    res.json(await adminService.updateOrderStatus(req.params.id, req.body.status));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function broadcastNotification(req, res, next) {
  try {
    const { title, message, target_role } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'title and message required' });
    res.json(await adminService.broadcastNotification({ title, message, target_role, admin_id: req.user.id }));
  } catch (err) { next(err); }
}

async function createUser(req, res, next) {
  try {
    res.status(201).json(await adminService.createUser(req.body));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    res.json(await adminService.deleteUser(req.params.id));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getCateringBookings(req, res, next) {
  try {
    const { page, limit, status } = req.query;
    res.json(await adminService.getCateringBookings({ page, limit, status }));
  } catch (err) { next(err); }
}

async function getAllRiders(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    res.json(await adminService.getAllRiders({ search, page, limit }));
  } catch (err) { next(err); }
}

module.exports = {
  getDashboard, getCustomers, getCaterers, getFoods, getOrders,
  setCustomerStatus, setCatererStatus, setFoodStatus, updateOrderStatus, broadcastNotification,
  createUser, deleteUser, getCateringBookings, getAllRiders,
};
