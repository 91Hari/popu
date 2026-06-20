'use strict';

const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }
    const result = await authService.login({ username, password });
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const {
      name, mobileNumber, email, password, role,
      address, city, state, pincode, latitude, longitude,
    } = req.body;
    if (!name?.trim() || !mobileNumber || !password) {
      return res.status(400).json({ error: 'name, mobileNumber, and password are required' });
    }
    const result = await authService.register({
      name, mobileNumber, email, password, role,
      address, city, state, pincode, latitude, longitude,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    // Accept both "identifier" (new) and "username" (legacy) field names
    const identifier = req.body.identifier || req.body.username;
    if (!identifier) {
      return res.status(400).json({ error: 'Email address or mobile number is required' });
    }
    const result = await authService.forgotPassword({ identifier });
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }
    const result = await authService.verifyOtp({ identifier, otp: String(otp) });
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'token and newPassword are required' });
    }
    const result = await authService.resetPassword({ token, newPassword });
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    const result = await authService.changePassword({
      userId:          req.user.id,
      currentPassword,
      newPassword,
    });
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { login, register, forgotPassword, verifyOtp, resetPassword, changePassword };
