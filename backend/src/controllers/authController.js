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
    const { name, mobileNumber, email, password } = req.body;
    if (!name?.trim() || !mobileNumber || !password) {
      return res.status(400).json({ error: 'name, mobileNumber, and password are required' });
    }
    const result = await authService.register({ name, mobileNumber, email, password });
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'username (email or mobile number) is required' });
    }
    const result = await authService.forgotPassword({ username });
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

module.exports = { login, register, forgotPassword, resetPassword };
