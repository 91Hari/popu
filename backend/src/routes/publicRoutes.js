'use strict';

const express = require('express');
const router  = express.Router();
const svc     = require('../services/publicService');

// No authentication required on any of these routes

router.get('/home',             async (req, res, next) => {
  try { res.json(await svc.getHomeData()); } catch (e) { next(e); }
});

router.get('/statistics',       async (req, res, next) => {
  try { res.json(await svc.getStats()); } catch (e) { next(e); }
});

router.get('/popular-foods',    async (req, res, next) => {
  try { res.json(await svc.getPopularFoods(parseInt(req.query.limit) || 10)); } catch (e) { next(e); }
});

router.get('/featured-caterers', async (req, res, next) => {
  try { res.json(await svc.getFeaturedCaterers(parseInt(req.query.limit) || 6)); } catch (e) { next(e); }
});

router.get('/services',         async (req, res, next) => {
  try { res.json(await svc.getEnabledServices()); } catch (e) { next(e); }
});

router.get('/locations',        async (req, res, next) => {
  try { res.json(await svc.getLocations()); } catch (e) { next(e); }
});

router.get('/reviews',          async (req, res, next) => {
  try { res.json(await svc.getPublicReviews(parseInt(req.query.limit) || 6)); } catch (e) { next(e); }
});

module.exports = router;
