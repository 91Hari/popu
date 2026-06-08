const orderService = require('../services/orderService');

async function createOrder(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'items must be a non-empty array' });
    for (const item of items) {
      if (!item.food_item_id || !item.quantity || item.quantity < 1)
        return res.status(400).json({ error: 'Each item requires food_item_id and quantity >= 1' });
    }
    const order = await orderService.createOrder({ customer_id: req.user.id, items });
    res.status(201).json({ order });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getOrders(req, res, next) {
  try {
    const orders = await orderService.getOrders(req.user);
    res.json({ orders });
  } catch (err) { next(err); }
}

async function getOrderById(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user);
    res.json({ order });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['ACCEPTED', 'PREPARING', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status))
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    const order = await orderService.updateOrderStatus(req.params.id, status, req.user);
    res.json({ order });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const { cancel_reason } = req.body;
    const order = await orderService.cancelOrder(req.params.id, req.user.id, cancel_reason);
    res.json({ order });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder };
