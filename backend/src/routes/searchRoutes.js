const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/searchController');

router.get('/suggestions', ctrl.getSuggestions);

module.exports = router;
