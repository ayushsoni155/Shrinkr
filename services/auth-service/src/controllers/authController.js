'use strict';

const bcrypt = require('bcryptjs');
const { getPrismaClient } = require('../utils/prismaClient');
const { getRedisClient } = require('../utils/redisClient');
const { sendOtpEmail } = require('../utils/mailer');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

const OTP_TTL = 300; // 5 minutes

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/auth/signup
 */
async function signup(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;
        const prisma = getPrismaClient();
        const redis = getRedisClient();

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await prisma.user.create({ data: { email, passwordHash } });

        // Generate OTP and store in Redis
        const otp = generateOtp();
        await redis.setex(`otp:${email}`, OTP_TTL, otp);

        // Send OTP email (don't block response on this)
        sendOtpEmail(email, otp).catch((err) =>
            console.error('[Mailer] Failed to send OTP:', err.message)
        );

        return res.status(201).json({
            success: true,
            message: 'Account created. Check your email for the OTP.',
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/auth/verify-otp
 */
async function verifyOtp(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ success: false, errors: errors.array() });
        }

        const { email, otp } = req.body;
        const prisma = getPrismaClient();
        const redis = getRedisClient();

        const storedOtp = await redis.get(`otp:${email}`);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Remove OTP from Redis
        await redis.del(`otp:${email}`);

        const user = await prisma.user.update({
            where: { email },
            data: { isVerified: true },
        });

        const payload = { sub: user.id, email: user.email };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

        return res.json({
            success: true,
            message: 'Email verified successfully.',
            data: { accessToken, refreshToken, user: { id: user.id, email: user.email } },
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;
        const prisma = getPrismaClient();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: 'Please verify your email first' });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const payload = { sub: user.id, email: user.email };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

        return res.json({
            success: true,
            message: 'Login successful.',
            data: { accessToken, refreshToken, user: { id: user.id, email: user.email } },
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/auth/refresh
 */
async function refresh(req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token required' });
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token revoked' });
        }

        const payload = { sub: user.id, email: user.email };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

        return res.json({
            success: true,
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/auth/resend-otp
 */
async function resendOtp(req, res, next) {
    try {
        const { email } = req.body;
        const prisma = getPrismaClient();
        const redis = getRedisClient();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }

        const otp = generateOtp();
        await redis.setex(`otp:${email}`, OTP_TTL, otp);
        sendOtpEmail(email, otp).catch((err) =>
            console.error('[Mailer] Failed to send OTP:', err.message)
        );

        return res.json({ success: true, message: 'OTP resent successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = { signup, verifyOtp, login, refresh, resendOtp };
