'use strict';

const refundService = require('../services/refundService');

async function adminListRefunds(req, res) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await refundService.getRefunds({
      page:  parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { adminListRefunds };
