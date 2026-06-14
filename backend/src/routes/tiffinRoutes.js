'use strict';

const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const svc = require('../services/tiffinService');

// ─── Customer ─────────────────────────────────────────────────────────────────

router.get('/caterers', authenticate, requireRole('CUSTOMER'), async (req, res) => {
  try {
    res.json({ caterers: await svc.getTiffinCaterers() });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/caterers/:id/settings', authenticate, async (req, res) => {
  try {
    res.json({ settings: await svc.getCatererTiffinSettings(req.params.id) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/caterers/:id/items', authenticate, requireRole('CUSTOMER'), async (req, res) => {
  try {
    res.json({ items: await svc.getTiffinFoods(req.params.id) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/orders', authenticate, requireRole('CUSTOMER'), async (req, res) => {
  try {
    const order = await svc.createTiffinOrder({ customer_id: req.user.id, ...req.body });
    res.status(201).json({ order });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// /orders/my must be registered BEFORE /orders/:id to avoid route shadowing
router.get('/orders/my', authenticate, requireRole('CUSTOMER'), async (req, res) => {
  try {
    res.json({ orders: await svc.getMyTiffinOrders(req.user.id) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/orders/:id', authenticate, async (req, res) => {
  try {
    res.json({ order: await svc.getTiffinOrderById(req.params.id) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Caterer ──────────────────────────────────────────────────────────────────

router.get('/caterer/settings', authenticate, requireRole('CATERER'), async (req, res) => {
  try {
    res.json({ settings: await svc.getCatererTiffinSettings(req.user.id) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.put('/caterer/settings', authenticate, requireRole('CATERER'), async (req, res) => {
  try {
    res.json({ settings: await svc.saveTiffinSettings(req.user.id, req.body) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/caterer/foods', authenticate, requireRole('CATERER'), async (req, res) => {
  try {
    res.json({ foods: await svc.getAllCatererFoodsForMapping(req.user.id) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.put('/caterer/food-mapping', authenticate, requireRole('CATERER'), async (req, res) => {
  try {
    await svc.saveTiffinFoodMapping(req.user.id, req.body.mappings || []);
    res.json({ success: true });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Admin ────────────────────────────────────────────────────────────────────

router.get('/admin/metrics', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    res.json({ metrics: await svc.getTiffinMetrics() });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
