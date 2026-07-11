'use strict';

const masterOrderService = require('../services/masterOrderService');
const cartService        = require('../services/cartService');

async function createSplitOrder(req, res, next) {
  try {
    const {
      items, customer_lat, customer_lng, payment_proofs, payment_method,
      delivery_house_no, delivery_street, delivery_landmark,
      delivery_city, delivery_state, delivery_pincode,
      fulfillment_type,
    } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'items are required' });
    }
    const method = (payment_method || 'ONLINE').toUpperCase();
    if (!['ONLINE', 'COD', 'RAZORPAY'].includes(method)) {
      return res.status(400).json({ error: 'payment_method must be ONLINE, COD, or RAZORPAY' });
    }
    const fType = ['SELF_PICKUP', 'DELIVERY'].includes((fulfillment_type || '').toUpperCase())
      ? fulfillment_type.toUpperCase()
      : 'DELIVERY';
    if (fType === 'SELF_PICKUP' && method === 'COD') {
      return res.status(400).json({ error: 'Self pickup requires advance payment. Cash on delivery is not available for self pickup orders.' });
    }
    const masterOrder = await masterOrderService.createSplitOrder({
      customer_id:        req.user.id,
      items,
      customer_lat,
      customer_lng,
      delivery_house_no,
      delivery_street,
      delivery_landmark,
      delivery_city,
      delivery_state,
      delivery_pincode,
      payment_proofs:     payment_proofs || [],
      payment_method:     method,
      fulfillment_type:   fType,
    });
    await cartService.clearCart(req.user.id);
    res.status(201).json({ masterOrder });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getMasterOrders(req, res, next) {
  try {
    const orders = await masterOrderService.getMasterOrders(req.user);
    res.json({ orders });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getMasterOrderById(req, res, next) {
  try {
    const order = await masterOrderService.getMasterOrderById(req.params.id, req.user);
    res.json({ order });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getCatererSubOrders(req, res, next) {
  try {
    const orders = await masterOrderService.getCatererSubOrders(req.user.id);
    res.json({ orders });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function updateCatererOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const updated = await masterOrderService.updateCatererOrderStatus(req.params.id, status, req.user);
    res.json({ catererOrder: updated });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function cancelCatererOrder(req, res, next) {
  try {
    const { cancel_reason } = req.body;
    const updated = await masterOrderService.cancelCatererOrder(req.params.id, req.user, cancel_reason);
    res.json({ catererOrder: updated });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = {
  createSplitOrder,
  getMasterOrders,
  getMasterOrderById,
  getCatererSubOrders,
  updateCatererOrderStatus,
  cancelCatererOrder,
};
