'use strict';

const riderService = require('../services/riderService');

async function createRider(req, res, next) {
  try {
    res.status(201).json(await riderService.createRider(req.user.id, req.body));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function listRiders(req, res, next) {
  try { res.json(await riderService.getRidersByCaterer(req.user.id)); }
  catch (err) { next(err); }
}

async function deleteRider(req, res, next) {
  try {
    res.json(await riderService.deleteRider(req.params.id, req.user.id));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function pushLocation(req, res, next) {
  try {
    const { latitude, longitude, order_id } = req.body;
    if (!latitude || !longitude) return res.status(400).json({ error: 'latitude and longitude required' });
    await riderService.pushLocation(req.user.id, { latitude, longitude, order_id: order_id || null });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

async function getLocation(req, res, next) {
  try {
    res.json(await riderService.getLatestLocation(req.params.rider_id));
  } catch (err) { next(err); }
}

async function getOrderRiderLocation(req, res, next) {
  try {
    res.json(await riderService.getLocationForOrder(req.params.id, req.user));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getAssignedDeliveries(req, res, next) {
  try { res.json(await riderService.getAssignedDeliveries(req.user.id)); }
  catch (err) { next(err); }
}

async function lookupOrder(req, res, next) {
  try {
    res.json(await riderService.lookupOrderForRider(req.params.id, req.user.id));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function startDelivery(req, res, next) {
  try {
    res.json(await riderService.startDelivery(req.params.id, req.user.id));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function confirmCodPayment(req, res, next) {
  try {
    res.json(await riderService.confirmCodPayment(req.params.id, req.user.id));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function confirmDelivery(req, res, next) {
  try {
    res.json(await riderService.confirmDelivery(req.params.id, req.user.id, req.body.code));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function assignRider(req, res, next) {
  try {
    res.json(
      await riderService.assignRiderToOrder(req.params.orderId, req.body.rider_id, req.user.id)
    );
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = {
  createRider, listRiders, deleteRider,
  pushLocation, getLocation, getOrderRiderLocation,
  getAssignedDeliveries, lookupOrder,
  startDelivery, confirmCodPayment, confirmDelivery, assignRider,
};
