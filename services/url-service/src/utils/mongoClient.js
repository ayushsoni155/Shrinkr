'use strict';

const mongoose = require('mongoose');

let isConnected = false;

async function connectMongo(uri) {
    if (isConnected) return;
    await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('[MongoDB] Connected');
    mongoose.connection.on('error', (err) =>
        console.error('[MongoDB] Connection error:', err.message)
    );
}

module.exports = { connectMongo };
