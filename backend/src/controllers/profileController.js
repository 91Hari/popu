'use strict';

const svc = require('../services/profileService');

function handle(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  };
}

// Profile settings
const getProfile    = handle((req) => svc.getProfile(req.user.id));
const updateProfile = handle((req) => svc.updateProfile(req.user.id, req.body));

// Addresses
const getAddresses       = handle((req) => svc.getAddresses(req.user.id));
const createAddress      = handle((req) => svc.createAddress(req.user.id, req.body));
const updateAddress      = handle((req) => svc.updateAddress(req.user.id, req.params.id, req.body));
const deleteAddress      = handle(async (req) => { await svc.deleteAddress(req.user.id, req.params.id); return { success: true }; });
const setDefaultAddress  = handle((req) => svc.setDefaultAddress(req.user.id, req.params.id));

// UPI VPA live lookup
const lookupVpa = handle(async (req) => {
  const upi = (req.query.upi || '').trim();
  if (!upi) throw Object.assign(new Error('upi query param required'), { status: 400 });
  return svc.lookupVpa(upi);
});

// Payment methods
const getPaymentMethods    = handle((req) => svc.getPaymentMethods(req.user.id));
const savePaymentMethod    = handle((req) => svc.savePaymentMethod(req.user.id, req.body));
const updatePaymentMethod  = handle((req) => svc.updatePaymentMethod(req.user.id, req.params.id, req.body));
const deletePaymentMethod  = handle(async (req) => { await svc.deletePaymentMethod(req.user.id, req.params.id); return { success: true }; });

module.exports = {
  getProfile, updateProfile,
  getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress,
  getPaymentMethods, savePaymentMethod, updatePaymentMethod, deletePaymentMethod,
  lookupVpa,
};
