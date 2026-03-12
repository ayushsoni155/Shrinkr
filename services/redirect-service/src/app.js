'use strict';

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectMongo } = require('./utils/mongoClient');
const { redirect } = require('./controllers/redirectController');

const app = express();
const PORT = process.env.PORT || 4003;

// Minimal middleware for max performance
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('tiny'));

// Health check
app.get('/health', (_req, res) =>
    res.json({ status: 'ok', service: 'redirect-service', pid: process.pid })
);

// The only real route — must be last
app.get('/:shortId', redirect);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Not found' }));

app.use((err, _req, res, _next) => {
    console.error('[Error]', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

async function start() {
    await connectMongo(process.env.MONGODB_URI);
    app.listen(PORT, () =>
        console.log(`[Redirect Service] Worker ${process.pid} listening on port ${PORT}`)
    );
}

start().catch((err) => {
    console.error('[Redirect Service] Failed to start:', err.message);
    process.exit(1);
});

module.exports = app;
