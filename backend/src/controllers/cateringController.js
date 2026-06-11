'use strict';

const cateringService = require('../services/cateringService');

async function toggleCatering(req, res, next) {
  try {
    res.json(await cateringService.toggleCateringAvailable(req.user.id, Boolean(req.body.available)));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getMyServices(req, res, next) {
  try { res.json(await cateringService.getCateringServicesByCaterer(req.user.id)); }
  catch (err) { next(err); }
}

async function getServicesByCaterer(req, res, next) {
  try { res.json(await cateringService.getCateringServicesByCaterer(req.params.catererId)); }
  catch (err) { next(err); }
}

async function createService(req, res, next) {
  try {
    res.status(201).json(await cateringService.createCateringService(req.user.id, req.body));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function updateService(req, res, next) {
  try {
    res.json(await cateringService.updateCateringService(req.params.id, req.user.id, req.body));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function deleteService(req, res, next) {
  try {
    res.json(await cateringService.deleteCateringService(req.params.id, req.user.id));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function bookCatering(req, res, next) {
  try {
    res.status(201).json(await cateringService.createCateringBooking(req.user.id, req.body));
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const data = req.user.role === 'CATERER'
      ? await cateringService.getCateringBookingsByCaterer(req.user.id)
      : await cateringService.getCateringBookingsByCustomer(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
}

async function updateBookingStatus(req, res, next) {
  try {
    res.json(
      await cateringService.updateCateringBookingStatus(req.params.id, req.user.id, req.body.status)
    );
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = {
  toggleCatering, getMyServices, getServicesByCaterer,
  createService, updateService, deleteService,
  bookCatering, getMyBookings, updateBookingStatus,
};
