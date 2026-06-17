'use strict';

const accountService = require('../services/accountService');

async function getAccountRequests(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const requests = await accountService.getAccountRequests({ page: +page, limit: +limit, status });
    res.json({ requests });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getDeletedUsers(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await accountService.getDeletedUsers({ page: +page, limit: +limit });
    res.json({ users });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function approveClosure(req, res, next) {
  try {
    const result = await accountService.approveClosure(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function rejectClosure(req, res, next) {
  try {
    const { notes } = req.body;
    const result = await accountService.rejectClosure(req.params.id, req.user.id, notes);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function restoreAccount(req, res, next) {
  try {
    const result = await accountService.restoreAccount(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function runAnonymization(req, res, next) {
  try {
    const result = await accountService.runAnonymization();
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = {
  getAccountRequests,
  getDeletedUsers,
  approveClosure,
  rejectClosure,
  restoreAccount,
  runAnonymization,
};
