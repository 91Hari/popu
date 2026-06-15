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
    const { isEnabled, isComingSoon, displayOrder } = req.body;

    const patch = {};
    if (typeof isEnabled    === 'boolean') patch.isEnabled    = isEnabled;
    if (typeof isComingSoon === 'boolean') patch.isComingSoon = isComingSoon;
    if (typeof displayOrder === 'number')  patch.displayOrder = displayOrder;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'Provide at least one of: isEnabled, isComingSoon, displayOrder' });
    }

    const updated = await serviceConfigService.updateService(serviceCode, patch);
    res.json(updated);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { getAllServices, updateService };
