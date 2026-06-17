'use strict';

const accountService = require('../services/accountService');

async function requestDelete(req, res, next) {
  try {
    const result = await accountService.requestDelete(req.user.id, req.user.role);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function requestClosure(req, res, next) {
  try {
    const { reason } = req.body;
    const result = await accountService.requestClosure(req.user.id, reason);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { requestDelete, requestClosure };
