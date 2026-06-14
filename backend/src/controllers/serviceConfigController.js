'use strict';

const serviceConfigService = require('../services/serviceConfigService');

async function getAllServices(req, res, next) {
  try {
    const services = await serviceConfigService.getAllServices();
    res.json(services);
  } catch (err) {
    next(err);
  }
}

async function updateService(req, res, next) {
  try {
    const { serviceCode } = req.params;
    const { isEnabled } = req.body;
    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({ error: 'isEnabled must be a boolean' });
    }
    const updated = await serviceConfigService.updateService(serviceCode, isEnabled);
    res.json(updated);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { getAllServices, updateService };
