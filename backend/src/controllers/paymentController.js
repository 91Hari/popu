'use strict';

const paymentService = require('../services/paymentService');

async function initiatePayment(req, res) {
  try {
    const { items, customer_lat, customer_lng } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array required' });
    }
    const result = await paymentService.initiatePayment({
      customerId:  req.user.id,
      items,
      customerLat: customer_lat,
      customerLng: customer_lng,
    });
    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
}

async function verifyPayment(req, res) {
  try {
    const { merchantOrderId } = req.params;
    const result = await paymentService.verifyAndFulfill(merchantOrderId, req.user.id);
    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
}

async function getMyPayments(req, res) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await paymentService.getPayments({
      customerId: req.user.id,
      page:  parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Admin
async function adminListPayments(req, res) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await paymentService.getPayments({
      page:  parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { initiatePayment, verifyPayment, getMyPayments, adminListPayments };
