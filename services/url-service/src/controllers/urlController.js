'use strict';

const { validationResult } = require('express-validator');
const Url = require('../models/Url');
const { getRedisClient } = require('../utils/redisClient');
const { generateUniqueShortId } = require('../utils/shortId');

const URL_REDIS_TTL = 60 * 60 * 24 * 7; // 7 days cache TTL

function isValidUrl(str) {
    try {
        const url = new URL(str);
        return ['http:', 'https:'].includes(url.protocol);
    } catch {
        return false;
    }
}

/**
 * POST /api/urls
 * Create a new short URL
 */
async function createUrl(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ success: false, errors: errors.array() });
        }

        const { originalUrl, alias } = req.body;
        const userId = req.user.id;
        const redis = getRedisClient();

        if (!isValidUrl(originalUrl)) {
            return res.status(400).json({ success: false, message: 'Invalid URL. Must be http/https.' });
        }

        let shortId;
        let customAlias = false;

        if (alias) {
            // Custom alias validation
            if (!/^[a-zA-Z0-9_-]{3,30}$/.test(alias)) {
                return res.status(400).json({
                    success: false,
                    message: 'Alias must be 3-30 alphanumeric characters (hyphens/underscores allowed)',
                });
            }
            const exists = await Url.findOne({ shortId: alias }).lean();
            if (exists) {
                return res.status(409).json({ success: false, message: 'This alias is already taken' });
            }
            shortId = alias;
            customAlias = true;
        } else {
            shortId = await generateUniqueShortId(Url);
        }

        const url = await Url.create({ shortId, originalUrl, userId, customAlias });

        // Pre-warm Redis cache for Redirect Service
        redis.setex(`url:${shortId}`, URL_REDIS_TTL, originalUrl).catch((err) =>
            console.error('[Redis] Failed to pre-warm cache:', err.message)
        );

        return res.status(201).json({
            success: true,
            data: {
                shortId: url.shortId,
                originalUrl: url.originalUrl,
                shortUrl: `${process.env.BASE_SHORT_URL || 'http://localhost:4003'}/${url.shortId}`,
                createdAt: url.createdAt,
            },
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/urls
 * Get paginated list of URLs for the authenticated user
 */
async function getUserUrls(req, res, next) {
    try {
        const userId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;

        const [urls, total] = await Promise.all([
            Url.find({ userId, isActive: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Url.countDocuments({ userId, isActive: true }),
        ]);

        return res.json({
            success: true,
            data: {
                urls: urls.map((u) => ({
                    shortId: u.shortId,
                    originalUrl: u.originalUrl,
                    shortUrl: `${process.env.BASE_SHORT_URL || 'http://localhost:4003'}/${u.shortId}`,
                    clicks: u.clicks,
                    customAlias: u.customAlias,
                    createdAt: u.createdAt,
                })),
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            },
        });
    } catch (err) {
        next(err);
    }
}

/**
 * DELETE /api/urls/:shortId
 * Soft-delete a URL (owner only)
 */
async function deleteUrl(req, res, next) {
    try {
        const { shortId } = req.params;
        const userId = req.user.id;

        const url = await Url.findOne({ shortId, userId }).lean();
        if (!url) {
            return res.status(404).json({ success: false, message: 'URL not found or not owned by you' });
        }

        await Url.updateOne({ shortId }, { isActive: false });

        // Remove from Redis cache
        const redis = getRedisClient();
        redis.del(`url:${shortId}`).catch(() => { });

        return res.json({ success: true, message: 'URL deleted successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = { createUrl, getUserUrls, deleteUrl };
