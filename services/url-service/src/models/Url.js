'use strict';

const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
    {
        shortId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },
        originalUrl: {
            type: String,
            required: true,
            trim: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        customAlias: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        clicks: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        collection: 'urls',
    }
);

// Compound index for paginated user URL queries
urlSchema.index({ userId: 1, createdAt: -1 });

const Url = mongoose.model('Url', urlSchema);
module.exports = Url;
