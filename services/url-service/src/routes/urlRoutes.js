'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { createUrl, getUserUrls, deleteUrl } = require('../controllers/urlController');

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
    '/',
    [body('originalUrl').notEmpty().withMessage('originalUrl is required')],
    createUrl
);

router.get('/', getUserUrls);

router.delete('/:shortId', deleteUrl);

module.exports = router;
