'use strict';

const selfPickupService = require('../services/selfPickupService');

// GET /api/pickup/recommendation
// Query: caterer_id, customer_lat, customer_lng, food_item_ids (comma-separated)
async function getRecommendation(req, res, next) {
  try {
    const { caterer_id, customer_lat, customer_lng, food_item_ids } = req.query;
    if (!caterer_id) return res.status(400).json({ error: 'caterer_id is required' });

    const ids = food_item_ids
      ? food_item_ids.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const result = await selfPickupService.getRecommendation({
      caterer_id,
      customer_lat: parseFloat(customer_lat),
      customer_lng: parseFloat(customer_lng),
      food_item_ids: ids,
    });
    res.json(result);
  } catch (err) { next(err); }
}

// POST /api/pickup/track
async function trackEvent(req, res, next) {
  try {
    const { caterer_id, event, distance_km, saving_amount } = req.body;
    if (!caterer_id || !event) return res.status(400).json({ error: 'caterer_id and event are required' });
    await selfPickupService.trackEvent({
      customer_id:   req.user.id,
      caterer_id,
      event,
      distance_km:   distance_km   ?? null,
      saving_amount: saving_amount ?? null,
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// PATCH /api/pickup/confirm/:caterer_order_id
async function confirmPickup(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });
    const order = await selfPickupService.confirmPickupCollection(
      req.params.caterer_order_id, code, req.user.id
    );
    res.json({ ok: true, order });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { getRecommendation, trackEvent, confirmPickup };
