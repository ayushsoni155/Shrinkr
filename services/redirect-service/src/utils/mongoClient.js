'use strict';

const mongoose = require('mongoose');

// Redirect service uses a read-only, lightweight Mongo connection
let isConnected = false;

async function connectMongo(uri) {
    if (isConnected) return;
    await mongoose.connect(uri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
    });
    isConnected = true;
    console.log('[MongoDB] Connected (read-only mode)');
}

// Lightweight URL schema — only what redirect service needs
const urlSchema = new mongoose.Schema(
    {
        shortId: { type: String, required: true, unique: true, index: true },
        originalUrl: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { collection: 'urls', timestamps: false }
);

const Url = mongoose.model('Url', urlSchema);

module.exports = { connectMongo, Url };
