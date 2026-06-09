'use strict';

const searchService = require('../services/searchService');

async function getSuggestions(req, res, next) {
  try {
    const { q } = req.query;
    const results = await searchService.getSuggestions(q || '');
    res.json(results);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSuggestions };
