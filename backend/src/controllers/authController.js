const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { name, email, password, role, business_name, address, latitude, longitude } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    const validRoles = ['CUSTOMER', 'CATERER'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'role must be CUSTOMER or CATERER' });
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

    const user = await authService.register({ name, email, password, role, business_name, address, latitude, longitude });
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

module.exports = { register, login };
