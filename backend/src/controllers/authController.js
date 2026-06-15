'use strict';

const authService = require('../services/authService');

// ─── Legacy email/password handlers (kept for backwards compatibility) ────────

async function register(req, res, next) {
  try {
    const {
      name, email, password, role, phone, business_name, address, latitude, longitude,
      upi_id, upi_name, qr_code_image_url,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    const validRoles = ['CUSTOMER', 'CATERER'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'role must be CUSTOMER or CATERER' });
    }
    if (role.toUpperCase() === 'RIDER') {
      return res.status(400).json({ error: 'Rider accounts must be created by a caterer' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }

    if (role.toUpperCase() === 'CATERER') {
      if (!business_name || !business_name.trim()) {
        return res.status(400).json({ error: 'business_name is required for caterers' });
      }
      if (!address || !address.trim()) {
        return res.status(400).json({ error: 'address is required for caterers' });
      }
    }

    const user = await authService.register({
      name, email, password, role, phone, business_name, address, latitude, longitude,
      upi_id, upi_name, qr_code_image_url,
    });
    res.status(201).json({ user });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

// ─── Mobile OTP handlers ──────────────────────────────────────────────────────

async function sendOtp(req, res, next) {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber || !/^\d{10}$/.test(String(mobileNumber))) {
      return res.status(400).json({ success: false, message: 'mobileNumber must be exactly 10 digits' });
    }
    const result = await authService.sendOtp(String(mobileNumber));
    res.json(result); // { success: true, message: 'OTP sent successfully' }
  } catch (err) {
    // Rate-limit / validation errors have a .status set by the service layer
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    // SMS / Fast2SMS errors — return the exact error so it's visible in the network tab
    console.error('[AuthController] sendOtp error:', err.message);
    return res.status(502).json({ success: false, message: err.message });
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { mobileNumber, otp } = req.body;
    if (!mobileNumber || !otp) {
      return res.status(400).json({ error: 'mobileNumber and otp are required' });
    }
    if (!/^\d{10}$/.test(String(mobileNumber))) {
      return res.status(400).json({ error: 'mobileNumber must be exactly 10 digits' });
    }
    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({ error: 'otp must be exactly 6 digits' });
    }
    const result = await authService.verifyOtp(String(mobileNumber), String(otp));
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { register, login, sendOtp, verifyOtp };
