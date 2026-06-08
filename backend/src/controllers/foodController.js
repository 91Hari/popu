'use strict';

const foodService = require('../services/foodService');

async function createFood(req, res, next) {
  try {
    const {
      food_name, description, price, image_url,
      is_available, category, preparation_time_minutes,
    } = req.body;

    if (!food_name || price === undefined) {
      return res.status(400).json({ error: 'food_name and price are required' });
    }

    const prepTime = preparation_time_minutes != null
      ? Math.max(1, parseInt(preparation_time_minutes, 10))
      : 20;

    const food = await foodService.createFood({
      caterer_id: req.user.id,
      food_name,
      description,
      price,
      image_url,
      is_available,
      category,
      preparation_time_minutes: prepTime,
    });
    res.status(201).json({ food });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getAllFoods(req, res, next) {
  try {
    const foods = await foodService.getAllFoods();
    res.json({ foods });
  } catch (err) {
    next(err);
  }
}

async function searchFoods(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'q query parameter is required' });
    }
    const foods = await foodService.searchFoods(q.trim());
    res.json({ foods });
  } catch (err) {
    next(err);
  }
}

async function getFoodById(req, res, next) {
  try {
    const customerLat = parseFloat(req.query.customer_lat);
    const customerLng = parseFloat(req.query.customer_lng);
    const food = await foodService.getFoodById(req.params.id, {
      customerLat: isNaN(customerLat) ? null : customerLat,
      customerLng: isNaN(customerLng) ? null : customerLng,
    });
    if (!food) return res.status(404).json({ error: 'Food item not found' });
    res.json({ food });
  } catch (err) {
    next(err);
  }
}

async function updateFood(req, res, next) {
  try {
    const food = await foodService.updateFood(req.params.id, req.user.id, req.body);
    res.json({ food });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function deleteFood(req, res, next) {
  try {
    await foodService.deleteFood(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { createFood, getAllFoods, searchFoods, getFoodById, updateFood, deleteFood };
