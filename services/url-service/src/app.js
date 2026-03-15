'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { connectMongo } = require('./utils/mongoClient');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 4002;

// ── Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(morgan('combined'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (_req, res) =>
    res.json({ status: 'ok', service: 'url-service', pid: process.pid })
);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((err, _req, res, _next) => {
    console.error('[Error]', err.message);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ── Start ──────────────────────────────────────────────────────────
async function start() {
    await connectMongo(process.env.MONGODB_URI);
    app.listen(PORT, () =>
        console.log(`[URL Service] Worker ${process.pid} listening on port ${PORT}`)
    );
}

start().catch((err) => {
    console.error('[URL Service] Failed to start:', err.message);
    process.exit(1);
});

module.exports = app;
