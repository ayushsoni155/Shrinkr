'use strict';

const { getRedisClient } = require('../utils/redisClient');
const { publishClickEvent } = require('../utils/kafkaProducer');
const { Url } = require('../utils/mongoClient');

const URL_REDIS_TTL = 60 * 60 * 24 * 7; // 7 days

/**
 * GET /:shortId
 * High-performance redirect — Redis first, Mongo fallback.
 * Analytics published to Kafka asynchronously (non-blocking).
 */
async function redirect(req, res, next) {
    const { shortId } = req.params;
    const redis = getRedisClient();

    try {
        // ── 1. Redis cache lookup ──────────────────────────────────
        let originalUrl = await redis.get(`url:${shortId}`);

        if (!originalUrl) {
            // ── 2. Mongo fallback ────────────────────────────────────
            const doc = await Url.findOne({ shortId, isActive: true }).lean();
            if (!doc) {
                return res.status(404).json({ success: false, message: 'Short URL not found' });
            }
            originalUrl = doc.originalUrl;

            // Back-fill Redis cache
            redis.setex(`url:${shortId}`, URL_REDIS_TTL, originalUrl).catch(() => { });
        }

        // ── 3. Redirect ────────────────────────────────────────────
        res.redirect(301, originalUrl);

        // ── 4. Fire-and-forget analytics event ────────────────────
        // Note: This runs AFTER the response is sent, no blocking.
        const ip =
            (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
            req.socket.remoteAddress ||
            'unknown';

        publishClickEvent({
            shortId,
            ip,
            userAgent: req.headers['user-agent'] || 'unknown',
            timestamp: new Date().toISOString(),
        }); // intentionally not awaited
    } catch (err) {
        next(err);
    }
}

module.exports = { redirect };
