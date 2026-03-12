'use strict';

const { UAParser } = require('ua-parser-js');
const { Kafka, logLevel } = require('kafkajs');
const mongoose = require('mongoose');
const Click = require('./models/Click');
require('dotenv').config();

// ── MongoDB Connection ─────────────────────────────────────────────
async function connectMongo() {
    await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
    });
    console.log('[Analytics Worker] MongoDB connected');
}

// ── Kafka Consumer Setup ───────────────────────────────────────────
const kafka = new Kafka({
    clientId: 'analytics-worker',
    brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
    logLevel: logLevel.WARN,
    retry: { initialRetryTime: 1000, retries: 15 },
});

const consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID || 'analytics-group',
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    maxBytesPerPartition: 1048576, // 1MB
});

// ── Country Mock (no GeoIP API needed) ────────────────────────────
const COUNTRY_POOL = ['United States', 'India', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia', 'Brazil', 'Japan', 'Singapore'];

function mockCountryFromIp(ip) {
    if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
        return 'localhost';
    }
    // Deterministic mock from last octet
    const lastOctet = parseInt(ip.split('.').pop(), 10) || 0;
    return COUNTRY_POOL[lastOctet % COUNTRY_POOL.length];
}

// ── Batch Processing ───────────────────────────────────────────────
const BATCH_SIZE = 100;
const BATCH_FLUSH_INTERVAL_MS = 2000;
let batch = [];
let flushTimer = null;

async function flushBatch() {
    if (batch.length === 0) return;

    const toInsert = batch.splice(0, batch.length);
    try {
        await Click.insertMany(toInsert, { ordered: false });
        console.log(`[Analytics Worker] Batch flushed: ${toInsert.length} clicks`);
    } catch (err) {
        console.error('[Analytics Worker] insertMany error:', err.message);
    }
}

function scheduleFlush() {
    if (!flushTimer) {
        flushTimer = setTimeout(async () => {
            flushTimer = null;
            await flushBatch();
        }, BATCH_FLUSH_INTERVAL_MS);
    }
}

function parseMessage(rawValue) {
    try {
        const payload = JSON.parse(rawValue);
        const parser = new UAParser(payload.userAgent || '');
        const ua = parser.getResult();

        return {
            shortId: payload.shortId || 'unknown',
            ip: payload.ip || 'unknown',
            browser: ua.browser.name || 'unknown',
            os: ua.os.name || 'unknown',
            country: mockCountryFromIp(payload.ip),
            timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        };
    } catch {
        return null;
    }
}

// ── Main Worker ────────────────────────────────────────────────────
async function run() {
    await connectMongo();
    await consumer.connect();
    console.log('[Analytics Worker] Kafka consumer connected');

    await consumer.subscribe({ topic: 'url_clicks', fromBeginning: false });

    await consumer.run({
        eachBatch: async ({ batch: kafkaBatch, resolveOffset, heartbeat, isRunning }) => {
            for (const message of kafkaBatch.messages) {
                if (!isRunning()) break;

                const parsed = parseMessage(message.value?.toString());
                if (parsed) {
                    batch.push(parsed);
                    if (batch.length >= BATCH_SIZE) {
                        if (flushTimer) {
                            clearTimeout(flushTimer);
                            flushTimer = null;
                        }
                        await flushBatch();
                    } else {
                        scheduleFlush();
                    }
                }

                resolveOffset(message.offset);
                await heartbeat();
            }
        },
    });
}

// ── Graceful Shutdown ──────────────────────────────────────────────
async function shutdown() {
    console.log('[Analytics Worker] Shutting down...');
    if (flushTimer) clearTimeout(flushTimer);
    await flushBatch();
    await consumer.disconnect();
    await mongoose.disconnect();
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

run().catch((err) => {
    console.error('[Analytics Worker] Fatal error:', err.message);
    process.exit(1);
});
