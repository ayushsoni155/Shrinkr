'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const { signup, verifyOtp, login, refresh, resendOtp } = require('../controllers/authController');

const router = Router();

const signupValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const otpValidation = [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
];

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/verify-otp', otpValidation, verifyOtp);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.post('/resend-otp', [body('email').isEmail().normalizeEmail()], resendOtp);

module.exports = router;
