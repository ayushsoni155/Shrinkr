'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4001;

// ── Security & Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('combined'));

// ── Rate Limiting ──────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service', pid: process.pid }));

// ── 404 ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Global Error Handler ───────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`[Auth Service] Worker ${process.pid} listening on port ${PORT}`);
});

module.exports = app;
