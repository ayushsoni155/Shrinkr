'use strict';

const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            required: true,
            index: true,
        },
        ip: {
            type: String,
            default: 'unknown',
        },
        browser: {
            type: String,
            default: 'unknown',
        },
        os: {
            type: String,
            default: 'unknown',
        },
        country: {
            type: String,
            default: 'unknown',
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
    },
    {
        collection: 'clicks',
        // TTL index — auto-delete clicks older than 1 year
        timestamps: false,
    }
);

// Compound index for analytics queries per short URL over time
clickSchema.index({ shortId: 1, timestamp: -1 });

const Click = mongoose.model('Click', clickSchema);
module.exports = Click;
