'use strict';

const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema(
    {
        shortId: { type: String, required: true, index: true },
        ip: { type: String, default: 'unknown' },
        browser: { type: String, default: 'unknown' },
        os: { type: String, default: 'unknown' },
        country: { type: String, default: 'unknown' },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { collection: 'clicks' }
);
clickSchema.index({ shortId: 1, timestamp: -1 });

const Click = mongoose.model('Click', clickSchema);

/**
 * GET /api/analytics/:shortId
 * Returns click analytics for a specific short URL.
 * Authorization: the URL must belong to the requesting user.
 */
async function getAnalytics(req, res, next) {
    try {
        const { shortId } = req.params;
        const userId = req.user.id;

        const Url = require('../models/Url');
        const url = await Url.findOne({ shortId, userId, isActive: true }).lean();
        if (!url) {
            return res.status(404).json({ success: false, message: 'URL not found or not owned by you' });
        }

        // Date range: last 14 days
        const since = new Date();
        since.setDate(since.getDate() - 14);

        const [totalClicks, uniqueIpsResult, countriesResult, browsersResult, clicksOverTimeResult] =
            await Promise.all([
                Click.countDocuments({ shortId }),

                Click.distinct('ip', { shortId }),

                Click.aggregate([
                    { $match: { shortId } },
                    { $group: { _id: '$country', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                    { $project: { _id: 0, country: '$_id', count: 1 } },
                ]),

                Click.aggregate([
                    { $match: { shortId } },
                    { $group: { _id: '$browser', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                    { $project: { _id: 0, browser: '$_id', count: 1 } },
                ]),

                Click.aggregate([
                    { $match: { shortId, timestamp: { $gte: since } } },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
                            },
                            clicks: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                    { $project: { _id: 0, date: '$_id', clicks: 1 } },
                ]),
            ]);

        return res.json({
            success: true,
            data: {
                shortId,
                totalClicks,
                uniqueIps: uniqueIpsResult.length,
                topCountry: countriesResult[0]?.country || '—',
                topBrowser: browsersResult[0]?.browser || '—',
                countries: countriesResult,
                browsers: browsersResult,
                clicksOverTime: clicksOverTimeResult,
            },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAnalytics };
