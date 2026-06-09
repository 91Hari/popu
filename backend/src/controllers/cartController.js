const cartService = require('../services/cartService');

async function getCart(req, res, next) {
  try {
    const data = await cartService.getCart(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
}

async function addItem(req, res, next) {
  try {
    const { food_item_id, quantity = 1 } = req.body;
    if (!food_item_id) return res.status(400).json({ error: 'food_item_id required' });
    const item = await cartService.addItem(req.user.id, food_item_id, Number(quantity));
    const cart = await cartService.getCart(req.user.id);
    res.status(201).json({ item, cart });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const { quantity } = req.body;
    if (quantity == null) return res.status(400).json({ error: 'quantity required' });
    await cartService.updateItem(req.user.id, req.params.id, Number(quantity));
    const cart = await cartService.getCart(req.user.id);
    res.json({ cart });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    await cartService.removeItem(req.user.id, req.params.id);
    const cart = await cartService.getCart(req.user.id);
    res.json({ cart });
  } catch (err) { next(err); }
}

async function clearCart(req, res, next) {
  try {
    await cartService.clearCart(req.user.id);
    res.json({ cart: { items: [], total: 0 } });
  } catch (err) { next(err); }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
