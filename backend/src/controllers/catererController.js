const catererService = require('../services/catererService');

async function getCaterers(req, res, next) {
  try {
    const { search, location, page = 1, limit = 20 } = req.query;
    const result = await catererService.getCaterers({ search, location, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getCatererById(req, res, next) {
  try {
    const caterer = await catererService.getCatererById(req.params.id);
    if (!caterer) return res.status(404).json({ error: 'Caterer not found' });
    res.json({ caterer });
  } catch (err) {
    next(err);
  }
}

async function getCatererFoods(req, res, next) {
  try {
    const data = await catererService.getCatererFoods(req.params.id);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getMyProfile(req, res, next) {
  try {
    const profile = await catererService.getMyCatererProfile(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Caterer not found' });
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

async function updatePaymentProfile(req, res, next) {
  try {
    const { upi_id, phonepe_id, payment_name, qr_code_image_url, bank_account_name } = req.body;
    const profile = await catererService.updatePaymentProfile(req.user.id, {
      upi_id, phonepe_id, payment_name, qr_code_image_url, bank_account_name,
    });
    res.json({ profile });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { getCaterers, getCatererById, getMyProfile, getCatererFoods, updatePaymentProfile };
