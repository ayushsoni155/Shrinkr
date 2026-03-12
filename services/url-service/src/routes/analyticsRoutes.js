'use strict';

const { Router } = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

const router = Router();

// Protected — user must own the URL
router.get('/:shortId', authenticate, getAnalytics);

module.exports = router;
